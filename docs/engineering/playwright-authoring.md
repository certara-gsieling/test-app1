# Playwright Authoring Guide

## Folder structure

```
tests/
  pages/        # Page Objects (encapsulate locators and actions)
    LoginPage.ts
  specs/        # Test scripts (.spec.ts/.spec.js)
    login.spec.ts
```

- Put reusable UI behavior in page objects, not in specs.
- Keep specs short, declarative, and focused on assertions.

## Page Object pattern

- Prefer accessible locators: `getByRole`, `getByLabel`, `getByPlaceholder`.
- Add resilient fallbacks only when necessary.
- Encapsulate actions (e.g., `login(username, password)`) and avoid leaking selectors to specs.

Example `LoginPage` snippet:
```ts
import { Page } from '@playwright/test'
export class LoginPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/auth/login') }
  async login(username: string, password: string) {
    await this.page.getByLabel('Email').fill(username)
    await this.page.getByLabel('Password').fill(password)
    await this.page.getByRole('button', { name: /Continue/i }).click()
  }
}
```

Spec usage:
```ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test('user can login', async ({ page }) => {
  const lp = new LoginPage(page)
  await lp.goto()
  await lp.login(process.env.OAUTH_TEST_USERNAME!, process.env.OAUTH_TEST_PASSWORD!)
  // assertions...
})
```

## Configuration & environment

- Base URL is resolved from env: `PLAYWRIGHT_BASE_URL`, `BASE_URL`, fallback `http://localhost:11000`.
- OAuth creds are auto-loaded from `.env.oauth.local` if present (`OAUTH_TEST_USERNAME`, `OAUTH_TEST_PASSWORD`).
  Shell environment vars override file values.

## Artifacts & reporting

- HTML report: `playwright-report/` (open with `npm run report`).
- Allure results: `test-reports/allure-results/` → HTML `test-reports/allure-report/`.
- Videos, screenshots, traces captured on failure/first-retry per config.

## Best practices

- One clear assertion per test scenario; avoid overly broad assertions.
- Use `test.step` for logical grouping if a spec grows.
- Prefer `page.getBy*` queries; avoid brittle CSS/XPath.
- Add timeouts intentionally; avoid global `waitForTimeout`.
- Use `request` fixture to validate API state (e.g., `/api/me`).
- Skip tests gracefully if required env or services are missing.

## Running

- Install browsers once: `npx playwright install --with-deps`
- Run: `npm run test:pw`
- View Playwright HTML: `npm run report`
- Generate Allure: `npm run allure:generate`
- Open Allure HTML: `npm run allure:open`
