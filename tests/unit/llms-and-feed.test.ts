import { describe, expect, it } from 'vitest'

import { rssFeed } from '@/lib/feed'
import { llmsFullTxt, llmsTxt } from '@/lib/llms'

const base = 'https://ethicai.au'

describe('llms.txt', () => {
  const text = llmsTxt({
    base,
    description: 'EthicAI is a Sydney-based AI ethics and governance consultancy.',
    aboutLead: 'We help organisations adopt AI ethically.',
    locality: 'Sydney, NSW',
    contactEmail: 'hello@example.com',
    selma: {
      url: 'https://selma.au',
      tagline: 'AI that answers only to you.',
      summary: 'Local AI.',
    },
    services: [{ title: 'Consulting', path: '/services/consulting', summary: 'Tailored work.' }],
    articles: [
      {
        title: 'Ethical AI ≠ Soft AI',
        path: '/articles/ethical-ai-soft-ai',
        summary: 'It’s strategic.',
        // 10 am on 26 May in Sydney is still 25 May in UTC.
        date: '2025-05-25T23:00:00.000Z',
      },
    ],
  })

  it('follows the llms.txt shape: H1, summary quote, then link sections', () => {
    expect(text.startsWith('# EthicAI\n\n> EthicAI is a Sydney-based')).toBe(true)
    expect(text).toContain(
      '## Services\n\n- [Consulting](https://ethicai.au/services/consulting): Tailored work.',
    )
    expect(text).toContain('## Optional')
  })

  it('states the EthicAI–Selma relationship and links to selma.au', () => {
    expect(text).toContain('Selma (https://selma.au) is EthicAI’s product')
    expect(text).toContain('- [Selma by EthicAI](https://selma.au): Local AI.')
  })

  it('dates articles by the Sydney calendar', () => {
    expect(text).toContain('(2025-05-26)')
  })

  it('leaves Selma out when it is hidden', () => {
    const hidden = llmsTxt({ base, description: 'x', selma: null, services: [], articles: [] })
    expect(hidden).not.toContain('Selma')
  })
})

describe('llms-full.txt', () => {
  it('puts each document under its own H1 and demotes its headings', () => {
    const text = llmsFullTxt({
      base,
      description: 'EthicAI.',
      documents: [
        { title: 'Consulting', path: '/services/consulting', markdown: '## How we help\n\nText.' },
      ],
    })
    expect(text).toContain('# Consulting\n\nURL: https://ethicai.au/services/consulting')
    expect(text).toContain('### How we help')
  })
})

describe('RSS feed', () => {
  const xml = rssFeed({
    base,
    title: 'EthicAI articles',
    description: 'Short reads.',
    items: [
      {
        title: 'AI & people <now>',
        path: '/articles/a',
        summary: 'A “quoted” summary',
        date: '2026-10-15T09:00:00+11:00',
        author: 'Kara Bombell',
        categories: ['AI governance'],
      },
    ],
  })

  it('escapes text and gives absolute links', () => {
    expect(xml).toContain('<title>AI &amp; people &lt;now&gt;</title>')
    expect(xml).toContain('<link>https://ethicai.au/articles/a</link>')
    expect(xml).toContain('<dc:creator>Kara Bombell</dc:creator>')
    expect(xml).toContain('<category>AI governance</category>')
  })

  it('uses RFC 822 dates', () => {
    expect(xml).toContain('<pubDate>Wed, 14 Oct 2026 22:00:00 GMT</pubDate>')
  })
})
