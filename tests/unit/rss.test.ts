import { afterEach, describe, expect, it, vi } from 'vitest'

import { getNewsletterIssues, parseFeed, toExcerpt } from '@/lib/rss'

// Shaped like a Substack feed: CDATA titles/descriptions, RFC 822 dates.
const substackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[EthicAI Weekly]]></title>
    <link>https://ethicai.substack.com</link>
    <item>
      <title><![CDATA[Issue 2: AI &amp; the four-day week]]></title>
      <description><![CDATA[<p>What we learnt this week about <strong>time</strong> &amp; trust.</p>]]></description>
      <link>https://ethicai.substack.com/p/issue-2</link>
      <pubDate>Wed, 21 Oct 2026 20:00:00 GMT</pubDate>
    </item>
    <item>
      <title><![CDATA[Issue 1: Start with people]]></title>
      <description><![CDATA[Why adopting AI well starts with the people who'll use it.]]></description>
      <link>https://ethicai.substack.com/p/issue-1</link>
      <pubDate>Wed, 14 Oct 2026 20:00:00 GMT</pubDate>
    </item>
    <item>
      <title><![CDATA[No link, skipped]]></title>
    </item>
  </channel>
</rss>`

const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom feed</title>
  <entry>
    <title>Older entry</title>
    <link rel="alternate" href="https://example.com/older"/>
    <updated>2026-09-01T00:00:00Z</updated>
    <summary>An older post.</summary>
  </entry>
  <entry>
    <title>Newer entry</title>
    <link rel="self" href="https://example.com/newer.atom"/>
    <link rel="alternate" href="https://example.com/newer"/>
    <published>2026-10-01T00:00:00Z</published>
    <summary>A newer post.</summary>
  </entry>
</feed>`

describe('parseFeed', () => {
  it('maps a Substack RSS feed to issues, newest first', () => {
    const issues = parseFeed(substackRss)
    expect(issues).toEqual([
      {
        title: 'Issue 2: AI & the four-day week',
        link: 'https://ethicai.substack.com/p/issue-2',
        pubDate: '2026-10-21T20:00:00.000Z',
        excerpt: 'What we learnt this week about time & trust.',
      },
      {
        title: 'Issue 1: Start with people',
        link: 'https://ethicai.substack.com/p/issue-1',
        pubDate: '2026-10-14T20:00:00.000Z',
        excerpt: "Why adopting AI well starts with the people who'll use it.",
      },
    ])
  })

  it('reads Atom feeds and prefers the alternate link', () => {
    const issues = parseFeed(atom)
    expect(issues.map((i) => [i.title, i.link])).toEqual([
      ['Newer entry', 'https://example.com/newer'],
      ['Older entry', 'https://example.com/older'],
    ])
  })

  it('limits the number of issues', () => {
    expect(parseFeed(substackRss, 1)).toHaveLength(1)
  })

  it.each(['', 'not xml at all', '<html><body>Oops</body></html>', '<rss><channel/></rss>'])(
    'returns nothing for unusable input: %j',
    (xml) => {
      expect(parseFeed(xml)).toEqual([])
    },
  )
})

describe('toExcerpt', () => {
  it('strips tags, decodes entities and trims at a word boundary', () => {
    expect(toExcerpt('<p>One &amp; two&#8217;s <em>three</em></p>')).toBe('One & two’s three')
    expect(toExcerpt('alpha beta gamma delta', 13)).toBe('alpha beta…')
  })
})

describe('getNewsletterIssues', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns nothing without a publication URL', async () => {
    expect(await getNewsletterIssues(null)).toEqual([])
  })

  it('fetches <publication>/feed', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(substackRss, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const issues = await getNewsletterIssues('https://ethicai.substack.com/')
    expect(fetchMock.mock.calls[0][0]).toBe('https://ethicai.substack.com/feed')
    expect(issues).toHaveLength(2)
  })

  it('falls back to an empty list when the feed is down or errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
    expect(await getNewsletterIssues('https://ethicai.substack.com')).toEqual([])
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    expect(await getNewsletterIssues('https://ethicai.substack.com')).toEqual([])
  })
})
