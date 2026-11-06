import { expect, type Locator, type Page, test } from '@playwright/test'

import { login } from '../helpers/login'
import { createTestUser, deleteTestUser, type TestUser } from '../helpers/users'

// Phase 5 / BUILD-SPEC §8: the maintainer drafts in Markdown, so pasting Markdown into the article
// body must become real headings, lists, bold text and links.

let editor: TestUser

test.beforeAll(async () => {
  editor = await createTestUser('editor', 'markdown-paste')
})

test.afterAll(async () => {
  await deleteTestUser(editor.email)
})

async function openBody(page: Page): Promise<Locator> {
  await login({ page, user: editor })
  await page.goto('/admin/collections/articles/create')
  const body = page.locator('.rich-text-lexical [contenteditable="true"]').first()
  await expect(body).toBeVisible()
  await body.click()
  return body
}

/** Fires a paste event carrying the given clipboard contents, like the browser does on Ctrl+V. */
async function paste(body: Locator, clipboard: { text: string; html?: string }) {
  await body.evaluate((element, { text, html }) => {
    const data = new DataTransfer()
    data.setData('text/plain', text)
    if (html) data.setData('text/html', html)
    element.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
    )
  }, clipboard)
}

const markdown = [
  '## Why it matters',
  '',
  'Teams adopt AI **faster** when people lead the change, as [our guide](https://example.com/guide) explains.',
  '',
  '### Three questions',
  '',
  '- Who is affected?',
  '- What changes for them?',
  '- How will we know it worked?',
  '',
  '1. Ask',
  '2. Listen',
  '',
  '> People first, tools second.',
].join('\n')

test('pasted Markdown becomes formatted article content', async ({ page }) => {
  const body = await openBody(page)
  await paste(body, { text: markdown })

  await expect(body.getByRole('heading', { level: 2, name: 'Why it matters' })).toBeVisible()
  await expect(body.getByRole('heading', { level: 3, name: 'Three questions' })).toBeVisible()
  await expect(body.locator('strong', { hasText: 'faster' })).toBeVisible()
  await expect(body.getByRole('link', { name: 'our guide' })).toHaveAttribute(
    'href',
    'https://example.com/guide',
  )
  await expect(body.locator('ul > li')).toHaveText([
    'Who is affected?',
    'What changes for them?',
    'How will we know it worked?',
  ])
  await expect(body.locator('ol > li')).toHaveText(['Ask', 'Listen'])
  await expect(body.locator('blockquote')).toHaveText('People first, tools second.')

  // The Markdown markers are gone, not left in the text.
  const text = await body.innerText()
  expect(text).not.toContain('##')
  expect(text).not.toContain('**')
  expect(text).not.toContain('](')
})

test('Markdown copied from a code editor still converts', async ({ page }) => {
  const body = await openBody(page)
  await paste(body, {
    text: '## From a code editor\n\n- one\n- two',
    html: '<meta charset="utf-8"><div style="white-space: pre;"><span>## From a code editor</span></div>',
  })
  await expect(body.getByRole('heading', { level: 2, name: 'From a code editor' })).toBeVisible()
  await expect(body.locator('ul > li')).toHaveCount(2)
})

test('pasting at the caret keeps the text around it', async ({ page }) => {
  const body = await openBody(page)
  await page.keyboard.type('Before')
  await paste(body, { text: '- first\n- second' })
  await expect(body.locator('ul > li')).toHaveText(['first', 'second'])
  await expect(body).toContainText('Before')
})

test('ordinary text and rich content paste the way they always did', async ({ page }) => {
  const body = await openBody(page)

  await paste(body, { text: 'Just a sentence, pasted in.' })
  await expect(body).toContainText('Just a sentence, pasted in.')
  await expect(body.locator('ul, ol, h2, h3, blockquote')).toHaveCount(0)

  // Real rich content (here a Google Docs style list) is left to the editor, whatever its text says.
  await paste(body, {
    text: '- from a document',
    html: '<ul><li>from a document</li></ul>',
  })
  await expect(body).toContainText('from a document')
})
