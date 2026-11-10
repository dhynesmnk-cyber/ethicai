import { expect, test } from '@playwright/test'
import { gotoHydrated } from '../helpers/navigation'

// Phase 3: the contact form (BUILD-SPEC §5.7). Netlify Forms only exists on Netlify, so the
// submission endpoint is stubbed here; Phase 6 checks a real submission on the deployed site.

test('validates inline and points people at the first problem', async ({ page }) => {
  await gotoHydrated(page, '/contact')
  await page.getByRole('button', { name: 'Send message' }).click()

  const name = page.getByRole('textbox', { name: 'Name' })
  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Enter your name.')).toBeVisible()
  await expect(page.getByText('Enter a message.')).toBeVisible()

  await name.fill('Alex')
  await page.getByRole('textbox', { name: 'Email' }).fill('not-an-email')
  await page.getByRole('textbox', { name: 'Message' }).fill('Hello')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused()
  await expect(page.getByText('Enter an email address like name@example.com.')).toBeVisible()
})

test('submits to Netlify Forms in the background', async ({ page }) => {
  let body = ''
  await page.route('**/__forms.html', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    body = route.request().postData() ?? ''
    await route.fulfill({ status: 200, body: 'ok' })
  })

  await gotoHydrated(page, '/contact')
  // The honeypot is present for bots but invisible to people.
  await expect(page.locator('input[name="company"]')).toBeHidden()

  await page.getByRole('textbox', { name: 'Name' }).fill('Alex Citizen')
  await page.getByRole('textbox', { name: 'Email' }).fill('alex@example.com')
  await page.getByRole('textbox', { name: 'Message' }).fill('Can we talk about AI policy?')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.getByRole('status')).toContainText('Thanks for getting in touch')
  const fields = new URLSearchParams(body)
  expect(fields.get('form-name')).toBe('contact')
  expect(fields.get('email')).toBe('alex@example.com')
  expect(fields.get('company')).toBe('')
})

test('shows an error and the email address if sending fails', async ({ page }) => {
  await page.route('**/__forms.html', (route) =>
    route.request().method() === 'POST' ? route.fulfill({ status: 500 }) : route.continue(),
  )
  await gotoHydrated(page, '/contact')
  await page.getByRole('textbox', { name: 'Name' }).fill('Alex Citizen')
  await page.getByRole('textbox', { name: 'Email' }).fill('alex@example.com')
  await page.getByRole('textbox', { name: 'Message' }).fill('Hello')
  await page.getByRole('button', { name: 'Send message' }).click()
  // Next.js's route announcer also has role="alert", so match on the message.
  const alert = page.getByRole('alert').filter({ hasText: 'your message didn’t send' })
  await expect(alert).toBeVisible()
})

test('works as a plain form without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/contact')
  const form = page.locator('form[name="contact"]')
  await expect(form).toHaveAttribute('method', 'POST')
  await expect(form).toHaveAttribute('action', '/__forms.html')
  await expect(form.locator('input[name="form-name"]')).toHaveValue('contact')
  // Native validation stays on when our script isn't running.
  await expect(form).not.toHaveAttribute('novalidate')
  await context.close()
})
