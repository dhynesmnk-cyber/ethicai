import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Payload, PayloadRequest } from 'payload'

import { articleEditorFeatures } from '@/fields/articleEditor'

import {
  ABOUT_DEFAULTS,
  HOME_DEFAULTS,
  ORGANISATION_DEFAULTS,
  SELMA_DEFAULTS,
  SERVICE_DEFAULTS,
  SERVICES_PAGE_DEFAULTS,
} from './defaults'

// Writes the starting copy from ./defaults into the database, but only into fields that are
// still empty and only creates services that don't exist yet. Run by the family-redesign
// migration (so production gets it on deploy) and by the seed. Safe to run any number of times:
// nothing an editor has written is ever overwritten (AGENTS.md: no destructive operations).

type Args = { payload: Payload; req?: Partial<PayloadRequest> }

// A fresh object per call: the storage plugin leaves a flag on a shared context object.
const context = () => ({ disableRevalidate: true })

const isBlank = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0)

/** Credentials taken from the team's published bios (BUILD-SPEC Appendix A). */
const TEAM_CREDENTIALS: Record<string, string[]> = {
  'Kara Bombell': [
    'Artificial Intelligence and Business Strategy, MIT Sloan',
    'Ethics of AI, London School of Economics',
  ],
  'Katriel Healy': ['Certified Organisational Coach'],
}

export async function applyContentDefaults({ payload, req }: Args): Promise<string[]> {
  const changed: string[] = []

  // --- Page copy -----------------------------------------------------------------------------
  const copy = await payload.findGlobal({ slug: 'pageCopy', depth: 0, req })
  const copyData: Record<string, unknown> = {}
  const hero = { ...copy.hero }
  let heroChanged = false
  for (const key of ['eyebrow', 'headline', 'subhead'] as const) {
    if (isBlank(hero[key])) {
      hero[key] = HOME_DEFAULTS.hero[key]
      heroChanged = true
    }
  }
  if (heroChanged) copyData.hero = hero
  if (isBlank(copy.statement)) copyData.statement = HOME_DEFAULTS.statement
  if (isBlank(copy.stats)) copyData.stats = HOME_DEFAULTS.stats
  if (isBlank(copy.faq)) copyData.faq = HOME_DEFAULTS.faq
  if (isBlank(copy.press)) copyData.press = HOME_DEFAULTS.press

  const about = { ...copy.about }
  let aboutChanged = false
  for (const key of ['headline', 'lead', 'story'] as const) {
    if (isBlank(about[key])) {
      about[key] = ABOUT_DEFAULTS[key]
      aboutChanged = true
    }
  }
  if (aboutChanged) copyData.about = about

  const services = { ...copy.services }
  let servicesChanged = false
  if (isBlank(services.intro)) {
    services.intro = SERVICES_PAGE_DEFAULTS.intro
    servicesChanged = true
  }
  if (isBlank(services.steps)) {
    services.steps = SERVICES_PAGE_DEFAULTS.steps
    servicesChanged = true
  }
  if (servicesChanged) copyData.services = services

  if (Object.keys(copyData).length > 0) {
    await payload.updateGlobal({ slug: 'pageCopy', context: context(), data: copyData, req })
    changed.push(`page copy: ${Object.keys(copyData).join(', ')}`)
  }

  // --- Site settings: Selma and organisation text -------------------------------------------
  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 0, req })
  const settingsData: Record<string, unknown> = {}
  const selma = { ...settings.selma }
  let selmaChanged = false
  for (const key of ['url', 'waitlistUrl', 'tagline', 'summary'] as const) {
    if (isBlank(selma[key])) {
      selma[key] = SELMA_DEFAULTS[key]
      selmaChanged = true
    }
  }
  if (isBlank(selma.suite)) {
    selma.suite = SELMA_DEFAULTS.suite
    selmaChanged = true
  }
  if (selmaChanged) settingsData.selma = selma

  const organisation = { ...settings.organisation }
  let organisationChanged = false
  for (const key of ['legalName', 'abn', 'locality', 'acknowledgement', 'inclusion'] as const) {
    if (isBlank(organisation[key])) {
      organisation[key] = ORGANISATION_DEFAULTS[key]
      organisationChanged = true
    }
  }
  if (organisationChanged) settingsData.organisation = organisation

  if (Object.keys(settingsData).length > 0) {
    await payload.updateGlobal({
      slug: 'siteSettings',
      context: context(),
      data: settingsData,
      req,
    })
    changed.push(`site settings: ${Object.keys(settingsData).join(', ')}`)
  }

  // --- Services ----------------------------------------------------------------------------
  const editorConfig = await editorConfigFactory.fromFeatures({
    config: payload.config,
    features: articleEditorFeatures,
  })
  for (const [index, service] of SERVICE_DEFAULTS.entries()) {
    const { totalDocs } = await payload.count({
      collection: 'services',
      where: { slug: { equals: service.slug } },
      req,
    })
    if (totalDocs > 0) continue
    await payload.create({
      collection: 'services',
      context: context(),
      data: {
        title: service.title,
        slug: service.slug,
        generateSlug: false,
        summary: service.summary,
        body: convertMarkdownToLexical({ editorConfig, markdown: service.body }),
        faq: service.faq ?? [],
        order: index + 1,
        published: true,
      },
      req,
    })
    changed.push(`service "${service.slug}"`)
  }

  // --- Team credentials (only for people who exist and have none yet) ---------------------
  for (const [name, credentials] of Object.entries(TEAM_CREDENTIALS)) {
    const { docs } = await payload.find({
      collection: 'teamMembers',
      depth: 0,
      limit: 1,
      where: { name: { equals: name } },
      req,
    })
    const member = docs[0]
    if (!member || !isBlank(member.credentials)) continue
    await payload.update({
      collection: 'teamMembers',
      id: member.id,
      context: context(),
      data: { credentials },
      req,
    })
    changed.push(`credentials for ${name}`)
  }

  return changed
}
