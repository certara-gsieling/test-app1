import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const url = process.env.SCREENSHOT_URL || 'http://localhost:11000'
const outDir = path.resolve('screenshots')
await fs.promises.mkdir(outDir, { recursive: true })

// Wait for server to be up
async function waitForServer(maxMs = 20000, intervalMs = 500) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.ok || res.status === 404) {
        return true
      }
    } catch {}
    await new Promise(r => setTimeout(r, intervalMs))
  }
  return false
}

if (!(await waitForServer())) {
  console.error(`Server not reachable at ${url}`)
  process.exit(1)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(url, { waitUntil: 'domcontentloaded' })
// Try to wait for React root if present; ignore errors
try { await page.waitForSelector('#root', { timeout: 3000 }) } catch {}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const filePath = path.join(outDir, `screenshot-${timestamp}.png`)
await page.screenshot({ path: filePath, fullPage: true })

// Also update a stable latest.png for easy viewing
await page.screenshot({ path: path.join(outDir, 'latest.png'), fullPage: true })

process.stdout.write(`Saved screenshot: ${filePath}\n`)
await browser.close()


