// The articles RSS 2.0 feed (/articles/feed.xml): for feed readers, newsletter tools and the
// search and AI crawlers that watch feeds for new pages.

export type FeedItem = {
  title: string
  path: string
  summary: string
  date: string
  author?: string | null
  categories?: string[] | null
}

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export function rssFeed({
  base,
  title,
  description,
  items,
}: {
  base: string
  title: string
  description: string
  items: FeedItem[]
}): string {
  const entries = items
    .map((item) => {
      const url = `${base}${item.path}`
      return [
        '    <item>',
        `      <title>${escape(item.title)}</title>`,
        `      <link>${escape(url)}</link>`,
        `      <guid isPermaLink="true">${escape(url)}</guid>`,
        `      <pubDate>${new Date(item.date).toUTCString()}</pubDate>`,
        `      <description>${escape(item.summary)}</description>`,
        item.author ? `      <dc:creator>${escape(item.author)}</dc:creator>` : null,
        ...(item.categories ?? []).map((c) => `      <category>${escape(c)}</category>`),
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const updated = items[0] ? new Date(items[0].date).toUTCString() : new Date(0).toUTCString()
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(title)}</title>
    <link>${escape(`${base}/articles`)}</link>
    <description>${escape(description)}</description>
    <language>en-AU</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${escape(`${base}/articles/feed.xml`)}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`
}
