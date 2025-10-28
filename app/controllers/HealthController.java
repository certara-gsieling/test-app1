package controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

public class HealthController extends Controller {
    public Result health() {
        ObjectNode response = Json.newObject();
        response.put("status", "ok");
        return ok(response);
    }
}


