import type { MetadataRoute } from 'next'

// Who may crawl the site (docs/REDESIGN-PLAN.md §5). Search engines always may. AI crawlers are
// listed by name so the policy chosen in Site settings → Search is explicit either way.
//
// Each list holds the user agents as their operators document them (checked November 2026).
// A crawler that matches a named group ignores the `*` group, so every allowed group repeats the
// same private paths.

/** Crawlers that fetch pages to answer or cite in AI search (not for training). */
export const AI_SEARCH_CRAWLERS = [
  'OAI-SearchBot', // ChatGPT search
  'ChatGPT-User', // ChatGPT fetching a page a user asked about
  'Claude-SearchBot', // Claude search
  'Claude-User', // Claude fetching a page a user asked about
  'PerplexityBot', // Perplexity search
  'Perplexity-User', // Perplexity fetching a page a user asked about
  'DuckAssistBot', // DuckDuckGo AI answers
  'MistralAI-User', // Le Chat fetching a page a user asked about
] as const

/** Crawlers that collect content to train AI models. */
export const AI_TRAINING_CRAWLERS = [
  'GPTBot', // OpenAI
  'ClaudeBot', // Anthropic
  'Google-Extended', // Gemini training and grounding (doesn't affect Google Search)
  'Applebot-Extended', // Apple Intelligence training (doesn't affect Applebot search)
  'CCBot', // Common Crawl, used by many model builders
  'meta-externalagent', // Meta
  'Amazonbot', // Amazon
  'Bytespider', // ByteDance
] as const

export const PRIVATE_PATHS = ['/admin', '/api/', '/kitchen-sink', '/media-check', '/contact/thanks']

export type AiCrawlerPolicy = 'allow-all' | 'search-only' | 'block-all'

export function robotsRules(policy: AiCrawlerPolicy): MetadataRoute.Robots['rules'] {
  const allowed = { allow: '/', disallow: PRIVATE_PATHS }
  const blocked = { disallow: '/' }
  return [
    { userAgent: '*', ...allowed },
    { userAgent: [...AI_SEARCH_CRAWLERS], ...(policy === 'block-all' ? blocked : allowed) },
    { userAgent: [...AI_TRAINING_CRAWLERS], ...(policy === 'allow-all' ? allowed : blocked) },
  ]
}
