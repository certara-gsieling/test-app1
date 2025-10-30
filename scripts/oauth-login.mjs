import { chromium } from 'playwright'
import fs from 'node:fs'

function loadDotEnv(path) {
  const out = {}
  if (!fs.existsSync(path)) return out
  const lines = fs.readFileSync(path, 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i > 0) out[t.slice(0, i)] = t.slice(i + 1)
  }
  return out
}

const env = { ...loadDotEnv('.env.oauth.local'), ...process.env }
const baseUrl = 'http://localhost:11000'
const username = env.OAUTH_TEST_USERNAME
const password = env.OAUTH_TEST_PASSWORD

if (!username || !password) {
  console.error('Missing OAUTH_TEST_USERNAME / OAUTH_TEST_PASSWORD in .env.oauth.local')
  process.exit(1)
}

const outDir = 'screenshots/auth'
const videoDir = `${outDir}/video`
fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(videoDir, { recursive: true })

// Hard timeout to prevent hanging
const killTimer = setTimeout(() => {
  console.error('Playwright script timeout. Forcing exit.')
  process.exit(3)
}, 120000)

const browser = await chromium.launch()
const context = await browser.newContext({
  recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } }
})
const page = await context.newPage()
page.setDefaultTimeout(30000)
page.setDefaultNavigationTimeout(30000)
await page.goto(`${baseUrl}/auth/login`)
await page.screenshot({ path: `${outDir}/01-login-redirect.png` })

// Prefer accessible locators
try {
  await page.getByLabel('Email').fill(username)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /Continue/i }).click()
} catch (e) {
  // Fallback heuristics
  const userSelectors = [ 'input[name="username"]', 'input[name="email"]', 'input[type="email"]', 'input#username' ]
  const passSelectors = [ 'input[name="password"]', 'input[type="password"]', 'input#password' ]
  let userFilled = false
  for (const sel of userSelectors) { const el = await page.$(sel); if (el) { await el.fill(username); userFilled = true; break } }
  let passFilled = false
  for (const sel of passSelectors) { const el = await page.$(sel); if (el) { await el.fill(password); passFilled = true; break } }
  const submitSelectors = [ 'button[type="submit"]', 'button:has-text("Continue")', 'button:has-text("Sign in")', 'button:has-text("Log in")', 'input[type="submit"]' ]
  for (const sel of submitSelectors) { const el = await page.$(sel); if (el) { await el.click(); break } }
}

// Wait for redirect back to our app
await page.waitForLoadState('networkidle', { timeout: 45000 })
await page.screenshot({ path: `${outDir}/02-after-login.png` })

// Validate session via /api/me
const me = await page.request.get(`${baseUrl}/api/me`)
const meJson = await me.json()
await fs.promises.writeFile(`${outDir}/me.json`, JSON.stringify(meJson, null, 2))

if (!meJson.loggedIn) {
  console.error('Not logged in according to /api/me:', meJson)
  // fallthrough to close and save video, then exit non-zero
}

// Finalize video and save a friendly name
const ts = new Date().toISOString().replace(/[:.]/g, '-')
const video = page.video ? page.video() : null
let exitCode = 0
if (!meJson.loggedIn) exitCode = 2

try {
  const target = `${videoDir}/oauth-login-${ts}.webm`
  if (video) {
    // Per API, path() is available after page is closed
    await page.close()
    const p = await video.path()
    fs.copyFileSync(p, target)
    console.log(`Saved video: ${target}`)
  }
} catch (e) {
  console.warn('Video save issue:', e?.message || e)
}

try { await context.close() } catch {}
try { await browser.close() } catch {}

clearTimeout(killTimer)
if (exitCode === 0) {
  console.log('Authenticated as:', meJson.email)
}
process.exit(exitCode)



