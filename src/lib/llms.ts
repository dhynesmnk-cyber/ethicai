// /llms.txt and /llms-full.txt (docs/REDESIGN-PLAN.md §5): plain Markdown summaries of the site
// for AI assistants, following the llms.txt proposal (llmstxt.org). No major AI company has said
// it reads these files; they're cheap to provide, and they say who EthicAI is and how Selma
// relates to it in words we control. Everything here is also on the site itself.

export type LlmsLink = {
  title: string
  path: string
  summary?: string | null
  date?: string | null
}

export type LlmsInput = {
  base: string
  description: string
  aboutLead?: string | null
  locality?: string | null
  contactEmail?: string | null
  selma?: { url: string; tagline?: string; summary?: string } | null
  services: LlmsLink[]
  articles: LlmsLink[]
}

const line = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim()

/** YYYY-MM-DD in Sydney time, the day the site itself shows. */
const sydneyDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' })
export const isoDay = (value: string) => sydneyDay.format(new Date(value))

function linkList(base: string, links: LlmsLink[]): string {
  return links
    .map((link) => {
      const date = link.date ? ` (${isoDay(link.date)})` : ''
      const summary = line(link.summary)
      const url = /^https?:\/\//.test(link.path) ? link.path : `${base}${link.path}`
      return `- [${line(link.title)}](${url})${date}${summary ? `: ${summary}` : ''}`
    })
    .join('\n')
}

export function llmsTxt(input: LlmsInput): string {
  const { base, selma } = input
  const facts = [
    `- EthicAI is an AI ethics and governance consultancy based in ${line(input.locality) || 'Sydney, NSW'}, Australia.`,
    selma
      ? `- Selma (${selma.url}) is EthicAI’s product${selma.tagline ? `: ${line(selma.tagline)}` : '.'} It is built and sold by EthicAI.`
      : null,
    input.contactEmail
      ? `- Contact: ${input.contactEmail} or ${base}/contact`
      : `- Contact: ${base}/contact`,
  ].filter(Boolean)

  const sections = [
    `# EthicAI`,
    `> ${line(input.description)}`,
    [line(input.aboutLead), facts.join('\n')].filter(Boolean).join('\n\n'),
    `## About\n\n${linkList(base, [
      { title: 'About EthicAI and the team', path: '/about' },
      { title: 'Contact', path: '/contact' },
    ])}`,
    input.services.length ? `## Services\n\n${linkList(base, input.services)}` : null,
    selma
      ? `## Selma\n\n${linkList(base, [
          { title: 'Selma by EthicAI', path: selma.url, summary: selma.summary },
        ])}`
      : null,
    input.articles.length ? `## Articles\n\n${linkList(base, input.articles)}` : null,
    `## Optional\n\n${linkList(base, [
      { title: 'Full text of the articles and services', path: '/llms-full.txt' },
      { title: 'Articles RSS feed', path: '/articles/feed.xml' },
      { title: 'Short videos', path: '/watch' },
      { title: 'Weekly newsletter', path: '/newsletter' },
    ])}`,
  ]
  return `${sections.filter(Boolean).join('\n\n')}\n`
}

export type LlmsDocument = {
  title: string
  path: string
  summary?: string | null
  date?: string | null
  author?: string | null
  markdown: string
}

export function llmsFullTxt(
  input: Pick<LlmsInput, 'base' | 'description'> & {
    documents: LlmsDocument[]
  },
): string {
  const parts = input.documents.map((doc) => {
    const meta = [
      `URL: ${input.base}${doc.path}`,
      doc.date ? `Published: ${isoDay(doc.date)}` : null,
      doc.author ? `Author: ${doc.author}` : null,
    ].filter(Boolean)
    // Demote the document's own headings one level so each document stays under its H1.
    const body = doc.markdown.replace(/^(#{1,5}) /gm, '#$1 ')
    return [
      `# ${line(doc.title)}`,
      meta.join('\n'),
      line(doc.summary) ? `> ${line(doc.summary)}` : null,
      body,
    ]
      .filter(Boolean)
      .join('\n\n')
  })
  return `# EthicAI: full text\n\n> ${line(input.description)}\n\n${parts.join('\n\n---\n\n')}\n`
}
