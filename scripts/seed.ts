// Seeds starter content (BUILD-SPEC §10 Phase 1, copy from Appendix A). Run with `npm run seed`
// after creating the first admin user at /admin.
//
// Idempotent and non-destructive: every record is created only if it is missing (matched by
// slug, name, attribution or filename) and existing records are never overwritten, so edits made
// in the admin survive re-runs. Note this means deleted demo content comes back if the seed is
// re-run — don't run it against production after launch.
//
// DECISION: create-if-missing rather than a true upsert. Overwriting would discard content the
// maintainer has since edited in the admin (AGENTS.md: no destructive operations).

import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'
import sharp from 'sharp'

import { articleEditorFeatures } from '@/fields/articleEditor'

// A fresh object per call: the storage plugin stores a temporary `skipCloudStorage` flag on the
// request context, so one shared object would silently skip every upload after the first.
const context = () => ({ disableRevalidate: true })
const payload = await getPayload({ config })
const log = (message: string) => payload.logger.info(`seed: ${message}`)

// --- Helpers ---------------------------------------------------------------------------------

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`)

/** Flat placeholder image with a centred label, clearly not a real photo. */
async function placeholderPng(label: string, width: number, height: number): Promise<Buffer> {
  const fontSize = Math.round(Math.min(width, height) / 6)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#EFE9DF"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#1F6F5C"
      font-family="sans-serif" font-size="${fontSize}">${escapeXml(label)}</text>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function ensurePlaceholderMedia(args: {
  filename: string
  label: string
  alt: string
  width: number
  height: number
}): Promise<number> {
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    where: { filename: { equals: args.filename } },
  })
  if (docs[0]) return docs[0].id

  const data = await placeholderPng(args.label, args.width, args.height)
  const doc = await payload.create({
    collection: 'media',
    context: context(),
    data: { alt: args.alt },
    file: { data, mimetype: 'image/png', name: args.filename, size: data.length },
  })
  log(`created image ${args.filename}`)
  return doc.id
}

// --- Author ----------------------------------------------------------------------------------

const { docs: admins } = await payload.find({
  collection: 'users',
  depth: 0,
  limit: 1,
  sort: 'createdAt',
  where: { role: { equals: 'admin' } },
})
const author = admins[0]
if (!author) {
  throw new Error('No admin user found. Create the first admin at /admin, then run the seed again.')
}

// --- Team members (Appendix A; full bios to be pasted in from the current site) ---------------

const team = [
  {
    name: 'Kara Bombell',
    role: 'Founder',
    initials: 'KB',
    bio: [
      'Kara is a strategic operations leader, AI ethics advocate and change agent with more than 15 years’ experience transforming businesses. She was COO at Digitas and Executive Director of Operations at Isobar, where she led large-scale transformation, enterprise automation and multi-country teams, improving margins and delivery while championing ethical leadership and inclusive culture.',
      'Kara holds qualifications in Artificial Intelligence and Business Strategy (MIT Sloan) and the Ethics of AI (LSE). She is passionate about making complexity simple, building systems that scale, and embedding AI so it serves business goals and the greater good.',
    ],
  },
  {
    name: 'Katriel Healy',
    role: 'Founder',
    initials: 'KH',
    bio: [
      'Katriel is a People & Culture leader who has spent a decade supporting boards and executive leadership teams to navigate change, align people strategy to performance, and build resilient, purpose-led cultures.',
      'With a background in organisational development, advertising and psychology, she has led transformation across workforce redesign, DE&I, HR compliance, engagement and leadership development. A Certified Organisational Coach, Katriel partners with leaders to embed ethical, sustainable workforce strategies and navigate AI integration.',
    ],
  },
  {
    name: 'Simon Brock',
    // Appendix A gives no title for Simon; confirm with the client.
    role: 'Role to be confirmed',
    initials: 'SB',
    bio: [
      'Simon joined EthicAI in 2026. His career spans film and sound production, creative and strategic direction, customer experience design and digital agency leadership across Australia and New Zealand, with work for McDonald’s, ALDI, Toyota, EA Games and Tourism Australia.',
      'He is focused on genuine pathways into AI that don’t ask organisations to leave their values at the door.',
    ],
  },
]

for (const [index, member] of team.entries()) {
  const { totalDocs } = await payload.count({
    collection: 'teamMembers',
    where: { name: { equals: member.name } },
  })
  if (totalDocs > 0) {
    log(`team member "${member.name}" exists, skipped`)
    continue
  }

  const slug = member.name.toLowerCase().replace(/\s+/g, '-')
  const photo = await ensurePlaceholderMedia({
    filename: `seed-team-${slug}.png`,
    label: member.initials,
    alt: `Placeholder for ${member.name}’s photo (replace before launch)`,
    width: 800,
    height: 800,
  })
  await payload.create({
    collection: 'teamMembers',
    context: context(),
    data: {
      name: member.name,
      role: member.role,
      bio: member.bio.join('\n\n'),
      photo,
      order: index + 1,
      published: true,
    },
  })
  log(`created team member "${member.name}"`)
}

// --- Testimonials (verbatim from the current site) --------------------------------------------

const testimonials = [
  {
    attribution: 'Deputy Ombudsman',
    quote:
      'EthicAI very quickly, and with great kindness and humility, understood the cultural orientations and values of our organisation, and was able to offer incredible insights in a short space of time. The unique combination of AI knowledge and cultural awareness and change management expertise is unique and valuable. As a leader, I feel confident in guiding the changes to come, and I am also inspired, knowing all that is possible. A really worthy engagement.',
  },
  {
    attribution: 'Business Owner',
    quote:
      'EthicAI have been instrumental in our next era of AI augmented work. Our staff have a system that works for our needs while giving practitioners back what they need most; time. We aren’t technical in the slightest. They made AI understandable and actionable. And our workforce raves about the transformation.',
  },
  {
    attribution: 'Managing Director',
    quote:
      'EthicAI are what they say on the tin: Ethical. Which for our culture: morals and ethics matter. AI is changing how businesses work, and we see it as a chance to make life easier — for our customers, and for us as a whole. … AI will support us, not replace us. It’ll make life easier, helping drive service and relationships.',
  },
]

for (const [index, testimonial] of testimonials.entries()) {
  const { totalDocs } = await payload.count({
    collection: 'testimonials',
    where: { attribution: { equals: testimonial.attribution } },
  })
  if (totalDocs > 0) {
    log(`testimonial from "${testimonial.attribution}" exists, skipped`)
    continue
  }

  await payload.create({
    collection: 'testimonials',
    context: context(),
    data: { ...testimonial, order: index + 1, published: true },
  })
  log(`created testimonial from "${testimonial.attribution}"`)
}

// --- Demo articles (clearly marked; replace before launch) ------------------------------------

const DEMO_NOTICE =
  '> **Demo article** created by the seed script. Replace or delete it before launch.'

const demoArticles = [
  {
    slug: 'demo-why-ethical-ai-starts-with-people',
    title: 'Demo: Why ethical AI starts with people',
    excerpt:
      'Demo content for testing the site. Adopting AI well is less about the tools and more about the people who will use them.',
    publishedAt: '2026-10-08T09:00:00+11:00',
    tags: ['Demo', 'People & culture'],
    markdown: `${DEMO_NOTICE}

Most organisations start their AI journey with a tool. The ones that succeed start with a question: what do our people need to do their best work?

## Start with the work, not the tool

Map the tasks that drain time and energy before choosing any software. The right use of AI often looks smaller and more practical than the sales pitch.

## Bring people with you

- Explain what is changing and why.
- Invite the people closest to the work to shape it.
- Measure what matters: time given back, quality of work and wellbeing.

Change that respects people is change that lasts.`,
  },
  {
    slug: 'demo-five-questions-before-adopting-an-ai-tool',
    title: 'Demo: Five questions to ask before adopting an AI tool',
    excerpt:
      'Demo content for testing the site. A short checklist for leaders weighing up a new AI product for their organisation.',
    publishedAt: '2026-10-15T09:00:00+11:00',
    tags: ['Demo', 'AI governance'],
    markdown: `${DEMO_NOTICE}

Before signing up to a new AI product, it is worth pausing on five questions.

## The checklist

1. What problem does it solve, and for whom?
2. Where does our data go, and who can see it?
3. How will we know if it gets something wrong?
4. Who is accountable for its decisions?
5. How will it change people's roles, and have we asked them?

If the answers are unclear, that is your first piece of work.`,
  },
]

const editorConfig = await editorConfigFactory.fromFeatures({
  config: payload.config,
  features: articleEditorFeatures,
})

for (const [index, article] of demoArticles.entries()) {
  const { totalDocs } = await payload.count({
    collection: 'articles',
    where: { slug: { equals: article.slug } },
  })
  if (totalDocs > 0) {
    log(`article "${article.slug}" exists, skipped`)
    continue
  }

  const heroImage = await ensurePlaceholderMedia({
    filename: `seed-demo-article-${index + 1}.png`,
    label: 'Demo article',
    alt: 'Placeholder hero image for a demo article',
    width: 1600,
    height: 900,
  })
  await payload.create({
    collection: 'articles',
    context: context(),
    data: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      heroImage,
      content: convertMarkdownToLexical({ editorConfig, markdown: article.markdown }),
      author: author.id,
      tags: article.tags,
      publishedAt: article.publishedAt,
      _status: 'published',
    },
  })
  log(`created article "${article.slug}"`)
}

// --- Site settings placeholders (only fills empty fields) -------------------------------------

const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })
const footerText = convertMarkdownToLexical({
  editorConfig: await editorConfigFactory.default({ config: payload.config }),
  markdown: 'EthicAI helps organisations adopt AI ethically, with people at the centre.',
})
const placeholders = {
  ...(settings.analytics ? {} : { analytics: 'none' as const }),
  ...(settings.footerText ? {} : { footerText }),
}
if (Object.keys(placeholders).length > 0) {
  await payload.updateGlobal({ slug: 'siteSettings', context: context(), data: placeholders })
  log(`filled site settings: ${Object.keys(placeholders).join(', ')}`)
} else {
  log('site settings already filled, skipped')
}

log('done')
