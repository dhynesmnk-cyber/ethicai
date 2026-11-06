import type { Page } from '@playwright/test'

/**
 * Navigates and waits until React has hydrated (network idle), for tests that press client-side
 * controls (menu, video facades, copy link, contact form). Without it, a click can land before
 * the handler is attached, especially on a busy dev server.
 */
export async function gotoHydrated(page: Page, path: string) {
  const response = await page.goto(path)
  await page.waitForLoadState('networkidle')
  return response
}
