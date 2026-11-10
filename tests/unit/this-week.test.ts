import { describe, expect, it } from 'vitest'

import { publishingPace, runbookUrl } from '@/lib/this-week'

const now = new Date('2026-11-10T10:00:00+11:00')
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - 1000)

describe('runbookUrl', () => {
  it('accepts web links', () => {
    expect(runbookUrl('https://notion.so/ethicai-runbook')).toBe(
      'https://notion.so/ethicai-runbook',
    )
    expect(runbookUrl(' http://localhost:3000/runbook ')).toBe('http://localhost:3000/runbook')
  })

  it('ignores a missing, blank or malformed value', () => {
    expect(runbookUrl(undefined)).toBeNull()
    expect(runbookUrl('')).toBeNull()
    expect(runbookUrl('not a url')).toBeNull()
  })

  it('refuses links that are not web pages, so the dashboard never renders a script URL', () => {
    expect(runbookUrl('javascript:alert(1)')).toBeNull()
    expect(runbookUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(runbookUrl('file:///etc/passwd')).toBeNull()
  })
})

describe('publishingPace', () => {
  it('says so when nothing has been published', () => {
    expect(publishingPace(null, now)).toEqual({
      publishedThisWeek: false,
      summary: 'Nothing has been published yet.',
    })
    expect(publishingPace('garbage', now).publishedThisWeek).toBe(false)
  })

  it('describes recent days in plain words', () => {
    expect(publishingPace(new Date(now.getTime() - 3600_000), now).summary).toBe('Published today.')
    expect(publishingPace(daysAgo(1), now).summary).toBe('Published yesterday.')
    expect(publishingPace(daysAgo(3), now).summary).toBe('Published 3 days ago.')
  })

  it('counts the last seven days as this week, and no further back', () => {
    expect(publishingPace(daysAgo(6), now).publishedThisWeek).toBe(true)
    expect(publishingPace(daysAgo(7), now).publishedThisWeek).toBe(false)
    expect(publishingPace(daysAgo(7), now).summary).toBe('Published 7 days ago.')
  })

  it('flags a future date, because the site has no scheduling and the article is already live', () => {
    expect(publishingPace(new Date(now.getTime() + 86_400_000 * 2), now)).toEqual({
      publishedThisWeek: true,
      summary: 'Dated in the future. Check its publish date.',
    })
  })
})
