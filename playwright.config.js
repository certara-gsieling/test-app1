import { defineConfig } from '@playwright/test';
import fs from 'node:fs';

function loadDotEnv(path) {
  try {
    if (!fs.existsSync(path)) {
      return {};
    }
    const lines = fs.readFileSync(path, 'utf-8').split(/\r?\n/);
    const out = {};
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) {
        continue;
      }
      const i = t.indexOf('=');
      if (i > 0) {
        out[t.slice(0, i)] = t.slice(i + 1);
      }
    }
    return out;
  } catch {
    return {};
  }
}

// Load oauth creds if present, but do not override existing env vars
const oauthEnv = loadDotEnv('.env.oauth.local');
for (const [k, v] of Object.entries(oauthEnv)) {
  if (!(k in process.env)) {
    process.env[k] = v;
  }
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost:11000';

export default defineConfig({
  testDir: 'tests/specs',
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'test-reports/allure-results' }],
  ],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    video: 'on',
    trace: 'on-first-retry',
  },
});


