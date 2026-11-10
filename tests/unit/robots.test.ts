import { describe, expect, it } from 'vitest'

import { AI_SEARCH_CRAWLERS, AI_TRAINING_CRAWLERS, PRIVATE_PATHS, robotsRules } from '@/lib/robots'

type Rule = {
  userAgent?: string | string[]
  allow?: string | string[]
  disallow?: string | string[]
}

const ruleFor = (rules: Rule[], agent: string) =>
  rules.find((rule) => [rule.userAgent].flat().includes(agent))

describe('robots rules', () => {
  it('lets every AI crawler in by default, but never into the private paths', () => {
    const rules = robotsRules('allow-all') as Rule[]
    for (const agent of ['*', ...AI_SEARCH_CRAWLERS, ...AI_TRAINING_CRAWLERS]) {
      expect(ruleFor(rules, agent), agent).toMatchObject({ allow: '/', disallow: PRIVATE_PATHS })
    }
  })

  it('search-only keeps AI search and blocks training crawlers', () => {
    const rules = robotsRules('search-only') as Rule[]
    expect(ruleFor(rules, 'OAI-SearchBot')).toMatchObject({ allow: '/' })
    expect(ruleFor(rules, 'GPTBot')).toEqual(expect.objectContaining({ disallow: '/' }))
    expect(ruleFor(rules, 'Google-Extended')).not.toHaveProperty('allow')
  })

  it('block-all blocks every AI crawler but still allows search engines', () => {
    const rules = robotsRules('block-all') as Rule[]
    expect(ruleFor(rules, '*')).toMatchObject({ allow: '/' })
    for (const agent of [...AI_SEARCH_CRAWLERS, ...AI_TRAINING_CRAWLERS]) {
      expect(ruleFor(rules, agent), agent).toEqual(expect.objectContaining({ disallow: '/' }))
    }
  })

  it('names no crawler twice', () => {
    const all = [...AI_SEARCH_CRAWLERS, ...AI_TRAINING_CRAWLERS]
    expect(new Set(all).size).toBe(all.length)
  })
})
