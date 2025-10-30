import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

async function isServerReachable(request: import('@playwright/test').APIRequestContext, baseURL: string) {
  try {
    const res = await request.get(baseURL, { timeout: 3000 })
    return res.ok() || res.status() === 404
  } catch {
    return false
  }
}

test('login redirects back and session is established', async ({ page, request, baseURL }) => {
  const username = process.env.OAUTH_TEST_USERNAME
  const password = process.env.OAUTH_TEST_PASSWORD
  const targetBaseURL = baseURL || 'http://localhost:11000'

  test.skip(!username || !password, 'Set OAUTH_TEST_USERNAME and OAUTH_TEST_PASSWORD to run this test')

  const reachable = await isServerReachable(request, targetBaseURL)
  test.skip(!reachable, `Server not reachable at ${targetBaseURL}`)

  const login = new LoginPage(page)
  await login.goto()
  await login.fillUsername(username as string)
  await login.fillPassword(password as string)
  await login.submit()

  await page.waitForLoadState('networkidle')

  // Use page.request so cookies/session are included
  const me = await page.request.get(`${targetBaseURL}/api/me`)
  expect(me.ok()).toBeTruthy()
  const meJson = await me.json()
  expect(meJson.loggedIn).toBeTruthy()
})


