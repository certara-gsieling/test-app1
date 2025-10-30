import { Page, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/auth/login')
  }

  async fillUsername(username: string) {
    try {
      await this.page.getByLabel('Email').fill(username)
      return
    } catch {}
    const selectors = [
      'input[name="username"]',
      'input[name="email"]',
      'input[type="email"]',
      '#username',
    ]
    for (const sel of selectors) {
      const el = await this.page.$(sel)
      if (el) { await el.fill(username); return }
    }
    expect(false, 'Username field not found').toBeTruthy()
  }

  async fillPassword(password: string) {
    try {
      await this.page.getByLabel('Password').fill(password)
      return
    } catch {}
    const selectors = [
      'input[name="password"]',
      'input[type="password"]',
      '#password',
    ]
    for (const sel of selectors) {
      const el = await this.page.$(sel)
      if (el) { await el.fill(password); return }
    }
    expect(false, 'Password field not found').toBeTruthy()
  }

  async submit() {
    try {
      await this.page.getByRole('button', { name: /Continue/i }).click()
      return
    } catch {}
    const selectors = [
      'button[type="submit"]',
      'button:has-text("Continue")',
      'button:has-text("Sign in")',
      'button:has-text("Log in")',
      'input[type="submit"]',
    ]
    for (const sel of selectors) {
      const el = await this.page.$(sel)
      if (el) { await el.click(); return }
    }
    expect(false, 'Submit button not found').toBeTruthy()
  }
}


