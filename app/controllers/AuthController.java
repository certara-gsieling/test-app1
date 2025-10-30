package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class AuthController extends Controller {
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final SecureRandom random = new SecureRandom();

    private static class OidcConfig {
        final String issuer;
        final String clientId;
        final String clientSecret;
        final String redirectUri;
        final String scope;
        OidcConfig(String issuer, String clientId, String clientSecret, String redirectUri, String scope) {
            this.issuer = issuer;
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.redirectUri = redirectUri;
            this.scope = scope;
        }
    }

    private OidcConfig loadConfig() {
        // Load from Play config for non-secrets
        Config cfg = ConfigFactory.load();
        String issuer = cfg.getString("oidc.issuer");
        String redirectUri = cfg.getString("oidc.redirectUri");
        String scope = cfg.getString("oidc.scope");

        // Secrets: environment variables take precedence, otherwise .env.oauth.local
        String clientId = System.getenv("OIDC_CLIENT_ID");
        String clientSecret = System.getenv("OIDC_CLIENT_SECRET");
        String envRedirect = System.getenv("OIDC_REDIRECT_URI");
        if (envRedirect != null && !envRedirect.isBlank()) {
            redirectUri = envRedirect;
        }

        if (clientId == null || clientSecret == null) {
            Properties p = new Properties();
            Path pth = Path.of(".env.oauth.local");
            if (Files.exists(pth)) {
                try {
                    for (String line : Files.readAllLines(pth)) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int eq = trimmed.indexOf('=');
                        if (eq > 0) {
                            String k = trimmed.substring(0, eq).trim();
                            String v = trimmed.substring(eq + 1).trim();
                            p.setProperty(k, v);
                        }
                    }
                    if (clientId == null) {
                        clientId = p.getProperty("OIDC_CLIENT_ID");
                    }
                    if (clientSecret == null) {
                        clientSecret = p.getProperty("OIDC_CLIENT_SECRET");
                    }
                    String fileRedirect = p.getProperty("OIDC_REDIRECT_URI");
                    if (fileRedirect != null && !fileRedirect.isBlank()) {
                        redirectUri = fileRedirect;
                    }
                } catch (IOException ignored) {}
            }
        }

        return new OidcConfig(issuer, clientId, clientSecret, redirectUri, scope);
    }

    private static String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private record ProviderMeta(String authorizationEndpoint, String tokenEndpoint, String userInfoEndpoint) {}

    private ProviderMeta discover(String issuer) throws IOException, InterruptedException {
        String url = issuer.endsWith("/") ? issuer + ".well-known/openid-configuration" : issuer + "/.well-known/openid-configuration";
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest req = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(10)).GET().build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) {
            throw new IOException("OIDC discovery failed: " + res.statusCode());
        }
        JsonNode node = mapper.readTree(res.body());
        return new ProviderMeta(node.get("authorization_endpoint").asText(), node.get("token_endpoint").asText(), node.path("userinfo_endpoint").asText(null));
    }

    public Result login(Http.Request request) {
        OidcConfig config = loadConfig();
        if (config.clientId == null || config.clientSecret == null) {
            return internalServerError("OIDC client not configured");
        }
        String state = base64Url(random.generateSeed(24));
        String nonce = base64Url(random.generateSeed(24));
        try {
            ProviderMeta meta = discover(config.issuer);
            String url = meta.authorizationEndpoint +
                    "?response_type=code" +
                    "&client_id=" + URLEncoder.encode(config.clientId, StandardCharsets.UTF_8) +
                    "&redirect_uri=" + URLEncoder.encode(config.redirectUri, StandardCharsets.UTF_8) +
                    "&scope=" + URLEncoder.encode(config.scope, StandardCharsets.UTF_8) +
                    "&state=" + state +
                    "&nonce=" + nonce;
            return redirect(url).addingToSession(request, Map.of("oauth.state", state, "oauth.nonce", nonce));
        } catch (Exception e) {
            return internalServerError("OIDC login error: " + e.getMessage());
        }
    }

    public Result callback(String code, String state, Http.Request request) {
        OidcConfig config = loadConfig();
        if (config.clientId == null || config.clientSecret == null) {
            return internalServerError("OIDC client not configured");
        }
        String expectedState = request.session().get("oauth.state").orElse(null);
        if (expectedState == null || !expectedState.equals(state)) {
            return unauthorized("Invalid state");
        }
        try {
            ProviderMeta meta = discover(config.issuer);
            String body = "grant_type=authorization_code" +
                    "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8) +
                    "&redirect_uri=" + URLEncoder.encode(config.redirectUri, StandardCharsets.UTF_8) +
                    "&client_id=" + URLEncoder.encode(config.clientId, StandardCharsets.UTF_8) +
                    "&client_secret=" + URLEncoder.encode(config.clientSecret, StandardCharsets.UTF_8);
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest req = HttpRequest.newBuilder(URI.create(meta.tokenEndpoint))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200) {
                return unauthorized("Token exchange failed: " + res.statusCode() + " " + res.body());
            }
            JsonNode tokenJson = mapper.readTree(res.body());
            String accessToken = tokenJson.path("access_token").asText(null);
            String email = null;
            // Try userinfo if available
            if (accessToken != null) {
                try {
                    ProviderMeta meta2 = discover(config.issuer);
                    if (meta2.userInfoEndpoint != null && !meta2.userInfoEndpoint.isBlank()) {
                        HttpClient client2 = HttpClient.newHttpClient();
                        HttpRequest reqInfo = HttpRequest.newBuilder(URI.create(meta2.userInfoEndpoint))
                                .timeout(Duration.ofSeconds(15))
                                .header("Authorization", "Bearer " + accessToken)
                                .GET().build();
                        HttpResponse<String> resInfo = client2.send(reqInfo, HttpResponse.BodyHandlers.ofString());
                        if (resInfo.statusCode() == 200) {
                            JsonNode info = mapper.readTree(resInfo.body());
                            if (info.hasNonNull("email")) {
                                email = info.get("email").asText();
                            } else if (info.hasNonNull("preferred_username")) {
                                email = info.get("preferred_username").asText();
                            } else if (info.hasNonNull("sub")) {
                                email = info.get("sub").asText();
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }
            Map<String, String> sess = new HashMap<>();
            sess.put("auth.loggedIn", "true");
            if (email != null) {
                sess.put("auth.email", email);
            }
            if (accessToken != null) {
                sess.put("auth.access", accessToken);
            }
            return redirect("/").addingToSession(request, sess);
        } catch (Exception e) {
            return internalServerError("Callback error: " + e.getMessage());
        }
    }

    public Result logout(Http.Request request) {
        return redirect("/").removingFromSession(request, "auth.loggedIn", "auth.email", "auth.access", "oauth.state", "oauth.nonce");
    }

    public Result me(Http.Request request) {
        boolean logged = request.session().get("auth.loggedIn").orElse("false").equals("true");
        Map<String, Object> info = new HashMap<>();
        info.put("loggedIn", logged);
        info.put("email", request.session().get("auth.email").orElse(null));
        // Expose the access token for client-side JWT claim display (dev convenience)
        info.put("token", request.session().get("auth.access").orElse(null));
        return ok(Json.toJson(info));
    }

    public Result secure(Http.Request request) {
        boolean logged = request.session().get("auth.loggedIn").orElse("false").equals("true");
        if (!logged) {
            return unauthorized("Not authenticated");
        }
        return ok("secret ok");
    }
}


