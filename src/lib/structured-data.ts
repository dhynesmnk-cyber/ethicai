import type { ImageData } from '@/lib/media'
import { siteUrl } from '@/lib/site-url'
import { youtubeThumbnailUrl } from '@/lib/video-url'
import { teamMemberAnchor } from '@/lib/view-models'
import type { Article, Service, SiteSetting, TeamMember, Video } from '@/payload-types'

// schema.org JSON-LD (BUILD-SPEC §9, docs/REDESIGN-PLAN.md §4). One linked set of records:
// every page carries the Organization, WebSite and the people and product it points to, each
// with a stable @id, and pages add their own records that refer back to those ids. Only facts
// that are also visible on the site go in here.
//
// DECISION: separate top-level objects (each with its own @context) rather than one @graph.
// Search engines read both the same way, and each record keeps its own @type at the top level.

type Schema = Record<string, unknown>

const CONTEXT = 'https://schema.org'

/** One sentence that describes EthicAI, used word for word wherever the site describes itself. */
export const ORGANISATION_DESCRIPTION =
  'EthicAI is a Sydney-based AI ethics and governance consultancy that helps organisations adopt AI ethically, blending sharp operational insight with deep people strategy. It makes Selma, local AI for organisations that can’t use cloud AI.'

export const ids = {
  organisation: () => `${siteUrl()}/#organization`,
  website: () => `${siteUrl()}/#website`,
  person: (name: string) => `${siteUrl()}/about#${teamMemberAnchor(name)}`,
  webpage: (path: string) => `${siteUrl()}${path === '/' ? '/' : path}#webpage`,
  /** Selma's own site owns this id; selma.au should publish the same one (docs/SELMA-SEO-HANDOFF.md). */
  selma: (selmaUrl: string) => `${selmaUrl.replace(/\/+$/, '')}/#product`,
}

const KNOWS_ABOUT = [
  'AI ethics',
  'AI governance',
  'Responsible AI adoption',
  'Sovereign and on-premises AI',
  'Change management',
  'People and culture strategy',
  'AI literacy and education',
  'Psychosocial risk of AI at work',
]

type SiteSchemaInput = {
  settings: Pick<SiteSetting, 'socialLinks' | 'contactEmail' | 'organisation' | 'selma'>
  founders: Array<Pick<TeamMember, 'name' | 'role'>>
}

/** Organization, WebSite, Selma and the founders: on every page, from the root layout. */
export function siteSchemas({ settings, founders }: SiteSchemaInput): Schema[] {
  const base = siteUrl()
  const organisation = settings.organisation ?? {}
  const selma = settings.selma ?? {}
  const selmaUrl = selma.url || 'https://selma.au'
  const showSelma = selma.show !== false
  const sameAs = (settings.socialLinks ?? []).map((link) => link.url)
  const abn = organisation.abn?.replace(/\s/g, '')

  const org: Schema = {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ids.organisation(),
    name: 'EthicAI',
    ...(organisation.legalName ? { legalName: organisation.legalName } : {}),
    url: `${base}/`,
    logo: { '@type': 'ImageObject', url: `${base}/logo.png`, width: 512, height: 512 },
    image: `${base}/opengraph-image`,
    description: ORGANISATION_DESCRIPTION,
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sydney',
      addressRegion: 'NSW',
      addressCountry: 'AU',
    },
    areaServed: { '@type': 'Country', name: 'Australia' },
    ...(abn
      ? {
          identifier: { '@type': 'PropertyValue', propertyID: 'ABN', value: abn },
          taxID: abn,
        }
      : {}),
    knowsAbout: KNOWS_ABOUT,
    ...(founders.length
      ? { founder: founders.map((person) => ({ '@id': ids.person(person.name) })) }
      : {}),
    ...(showSelma ? { owns: { '@id': ids.selma(selmaUrl) } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }

  const website: Schema = {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': ids.website(),
    name: 'EthicAI',
    url: `${base}/`,
    inLanguage: 'en-AU',
    publisher: { '@id': ids.organisation() },
  }

  const product: Schema[] = showSelma
    ? [
        {
          '@context': CONTEXT,
          '@type': 'Product',
          '@id': ids.selma(selmaUrl),
          name: 'Selma',
          url: selmaUrl,
          ...(selma.tagline ? { slogan: selma.tagline } : {}),
          ...(selma.summary ? { description: selma.summary } : {}),
          brand: { '@type': 'Brand', name: 'Selma' },
          manufacturer: { '@id': ids.organisation() },
          category: 'On-premises AI system',
        },
      ]
    : []

  const people: Schema[] = founders.map((person) => ({
    '@context': CONTEXT,
    '@type': 'Person',
    '@id': ids.person(person.name),
    name: person.name,
    jobTitle: person.role,
    url: ids.person(person.name),
    worksFor: { '@id': ids.organisation() },
  }))

  return [org, website, ...product, ...people]
}

type WebPageInput = {
  path: string
  name: string
  description?: string
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'FAQPage'
  breadcrumb?: boolean
}

export function webPageSchema({
  path,
  name,
  description,
  type = 'WebPage',
  breadcrumb = path !== '/',
}: WebPageInput): Schema {
  return {
    '@context': CONTEXT,
    '@type': type,
    '@id': ids.webpage(path),
    url: `${siteUrl()}${path === '/' ? '/' : path}`,
    name,
    ...(description ? { description } : {}),
    inLanguage: 'en-AU',
    isPartOf: { '@id': ids.website() },
    about: { '@id': ids.organisation() },
    ...(breadcrumb ? { breadcrumb: { '@id': `${siteUrl()}${path}#breadcrumb` } } : {}),
  }
}

/** Matches a visible FAQ on the same page. */
export function faqSchema(
  path: string,
  items: Array<{ question: string; answer: string }>,
): Schema {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    '@id': `${siteUrl()}${path === '/' ? '/' : path}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** The full record for a team member, on /about. Same @id as the short one on every page. */
export function personSchema(member: TeamMember, image: ImageData | null): Schema {
  return {
    '@context': CONTEXT,
    '@type': 'Person',
    '@id': ids.person(member.name),
    name: member.name,
    jobTitle: member.role,
    url: ids.person(member.name),
    worksFor: { '@id': ids.organisation() },
    ...(image ? { image: image.url } : {}),
    description: member.bio.split(/\n\s*\n/)[0],
    ...(member.credentials?.length
      ? {
          hasCredential: member.credentials.map((credential) => ({
            '@type': 'EducationalOccupationalCredential',
            name: credential,
          })),
        }
      : {}),
    ...(member.linkedinUrl ? { sameAs: [member.linkedinUrl] } : {}),
  }
}

type AuthorInput = { name: string; profile?: TeamMember | null }

export function articleSchema(
  article: Article,
  image: ImageData | null,
  author: AuthorInput | null,
): Schema {
  const url = `${siteUrl()}/articles/${article.slug}`
  return {
    '@context': CONTEXT,
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: { '@id': ids.webpage(`/articles/${article.slug}`) },
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    inLanguage: 'en-AU',
    ...(image ? { image: [image.url] } : {}),
    ...(author
      ? {
          author: author.profile
            ? { '@id': ids.person(author.profile.name), name: author.profile.name }
            : { '@type': 'Person', name: author.name },
        }
      : {}),
    publisher: { '@id': ids.organisation() },
    isPartOf: { '@id': ids.website() },
    ...(article.tags?.length
      ? {
          keywords: article.tags.join(', '),
          about: article.tags.map((tag) => ({ '@type': 'Thing', name: tag })),
        }
      : {}),
  }
}

export function serviceSchema(service: Service): Schema {
  const url = `${siteUrl()}/services/${service.slug}`
  return {
    '@context': CONTEXT,
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    url,
    provider: { '@id': ids.organisation() },
    areaServed: { '@type': 'Country', name: 'Australia' },
  }
}

export function videoSchema(video: Video, description: string, thumbnail?: string): Schema | null {
  if (video.platform !== 'youtube' || !video.videoId) return null
  return {
    '@context': CONTEXT,
    '@type': 'VideoObject',
    name: video.title,
    description,
    thumbnailUrl: [thumbnail ?? youtubeThumbnailUrl(video.videoId)],
    uploadDate: video.publishedAt,
    contentUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
  }
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): Schema {
  const last = items[items.length - 1]
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    ...(last ? { '@id': `${siteUrl()}${last.path}#breadcrumb` } : {}),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl()}${item.path}`,
    })),
  }
}
