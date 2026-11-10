// Starting copy for the admin-editable page text, Selma details, organisation details and
// services. It is written into the database once, by the family-redesign migration (production)
// and by the seed (local), and only into fields that are still empty, so anything edited in the
// admin is never overwritten. After that, the admin is the source of truth: the site reads the
// database, never this file.
//
// Sources: Home/About copy from the current ethicai.au; Selma copy verbatim from selma.au; stats
// from selma.au's "Who we are"; services from ethicai.au/services, /academy and /publicsector.
// The FAQ answers and the press list are new and need the client's sign-off.

export const HOME_DEFAULTS = {
  hero: {
    eyebrow: 'AI ethics and governance · Sydney',
    headline: 'A.I. grounded in human dignity',
    subhead:
      'We help organisations adopt AI ethically, building the systems, culture and clarity to move with change.',
  },
  statement:
    'In a world where AI is reshaping work and certainty is in short supply, the most powerful thing an organisation can be is adaptable. At EthicAI, we help organisations build the systems, culture, and clarity to move with change. We blend sharp operational insight with deep people strategy to create workplaces that are data led, ethical, and energised for what’s next.',
  stats: [
    { value: '6M+', label: 'TikTok views in under a year' },
    { value: 'AI Summit', label: 'Global AI Impact Summit, Australian Government delegation' },
    {
      value: 'GIA',
      label:
        'Selected by the Governance Institute of Australia to develop national AI board training',
    },
    { value: 'In pilot', label: 'Selma is running with Australian partner organisations now' },
  ],
  faq: [
    {
      question: 'What does EthicAI do?',
      answer:
        'EthicAI is a Sydney-based AI ethics and governance consultancy. We help organisations adopt AI without compromising their values, their legal obligations or their control of their own data, through readiness diagnostics, consulting, education and governance work.',
    },
    {
      question: 'What is Selma?',
      answer:
        'Selma is local AI for organisations that can’t use cloud AI: a dedicated computer that sits in your building, runs AI on your own documents and is reached only over your own network. Nothing you put in ever leaves your organisation. Selma is piloting with Australian organisations now and ships in January 2027.',
    },
    {
      question: 'How is Selma related to EthicAI?',
      answer:
        'Selma is built by EthicAI. It is our AI ethics and governance experience, productised: the same team and the same values, with the Human at the Helm™ Suite keeping a person in charge of every decision.',
    },
    {
      question: 'Who do you work with?',
      answer:
        'Boards, executive teams and the people doing the work, across the public sector, for-purpose organisations and business. We meet organisations where they are, whether they are just starting with AI or already using it.',
    },
    {
      question: 'How do we get started?',
      answer:
        'Most organisations start with the FutureFit Diagnostic, which shows where you stand on AI readiness, shadow AI use and AI literacy. Get in touch and we’ll suggest the right first step for you.',
    },
  ],
  press: [
    {
      outlet: 'IT Brief Australia',
      headline: 'EthicAI launches Selma as Australian firms seek AI control',
      url: 'https://itbrief.com.au/story/ethicai-launches-selma-as-australian-firms-seek-ai-control',
      date: '2026-06-18T00:00:00.000Z',
    },
    {
      outlet: 'SecurityBrief Australia',
      headline: 'EthicAI launches Selma as Australian firms seek AI control',
      url: 'https://securitybrief.com.au/story/ethicai-launches-selma-as-australian-firms-seek-ai-control',
      date: '2026-06-18T00:00:00.000Z',
    },
  ],
}

export const ABOUT_DEFAULTS = {
  headline: 'About EthicAI',
  lead: 'EthicAI is a Sydney-based AI ethics and governance consultancy. We’ve spent years inside the organisations Selma is built for, helping them adopt AI without compromising their values, their legal obligations or their control of their own data.',
  story:
    'In a world where AI is reshaping work and certainty is in short supply, the most powerful thing an organisation can be is adaptable. We help organisations build the systems, culture, and clarity to move with change, blending sharp operational insight with deep people strategy to create workplaces that are data led, ethical, and energised for what’s next.\n\nSelma is that knowledge and experience, productised.',
}

export const SERVICES_PAGE_DEFAULTS = {
  intro:
    'We help organisations harness the power of AI while making sure they are ready for its impact on systems, roles and teams. From leadership education to workforce design and organisational consulting, our work makes AI adoption both ethical and human-centred.',
  steps: [
    {
      title: 'Understand where you stand',
      body: 'A clear picture of AI readiness, the tools already in use and the risks to your people.',
    },
    {
      title: 'Set the rules',
      body: 'Governance and ethical guardrails your organisation writes, signs and can stand behind.',
    },
    {
      title: 'Build capability',
      body: 'Education that turns AI literacy into everyday, defensible decisions at every level.',
    },
    {
      title: 'Embed and sustain',
      body: 'Systems, roles and ways of working redesigned so the change lasts.',
    },
  ],
}

export const SELMA_DEFAULTS = {
  url: 'https://selma.au',
  waitlistUrl: 'https://selma.au/#waitlist',
  tagline: 'AI that answers only to you.',
  summary:
    'Selma is AI that lives in your building, not the cloud. Selma knows your organisation, follows your rules, and nothing you put in ever leaves your organisation.',
  suite: [
    {
      name: 'The Constitution',
      kicker: 'A co-designed ethical harness',
      description:
        'The rules your organisation writes and signs. What Selma may do, what Selma must never do, and which humans decide.',
    },
    {
      name: 'Stitch',
      kicker: 'Deterministic document analysis',
      description:
        'Cuts hallucinations at the source. Ordinary code, never AI, reads every document before anyone asks a question, so Selma knows what your data can’t answer instead of guessing.',
    },
    {
      name: 'Trace',
      kicker: 'Provenance for every response',
      description:
        'Every fact is marked Documented, Calculated or Synthesised. A figure that can’t be traced doesn’t get stated.',
    },
    {
      name: 'Guardrail',
      kicker: 'Selma’s guidance system',
      description:
        'Holds to your rules under pressure. Ask Selma to bend and it declines, names the rule, and offers what the record actually shows instead.',
    },
    {
      name: 'Ledger',
      kicker: 'Tamper-evident record',
      description:
        'A record of every decision, refusal and human at the helm, and it shows if anyone tampers with it.',
    },
  ],
}

export const ANNOUNCEMENT_DEFAULTS = {
  enabled: true,
  text: 'Selma by EthicAI ships January 2027.',
  linkLabel: 'Join the waitlist',
  linkUrl: 'https://selma.au/#waitlist',
}

export const ORGANISATION_DEFAULTS = {
  legalName: 'EthicAI Pty Ltd',
  abn: '13 686 628 848',
  locality: 'Sydney, NSW',
  acknowledgement:
    'We acknowledge the Wangal people of the Eora Nation as the Traditional Custodians of the land on which we operate. We pay our respects to Elders past and present.',
  inclusion:
    'We are committed to fostering inclusive environments that celebrate LGBTIQA+ communities and embrace neurodiversity, creating safe, respectful and accessible spaces for all.',
}

export type ServiceDefault = {
  slug: string
  title: string
  summary: string
  /** Markdown, converted to rich text when it is written to the database. */
  body: string
  faq?: Array<{ question: string; answer: string }>
}

export const SERVICE_DEFAULTS: ServiceDefault[] = [
  {
    slug: 'futurefit-diagnostic',
    title: 'FutureFit Diagnostic',
    summary:
      'A comprehensive diagnostic of your organisation’s AI readiness: receptiveness to change, shadow AI use and AI literacy, plus an audit of AI-related psychosocial hazards.',
    body: `FutureFit evaluates receptiveness to change, existing AI shadow infrastructure and AI literacy, giving you a clear picture of where you currently stand. We also audit AI-related psychosocial hazards within your organisation.

## Why it matters

This deep analysis means you can build an AI strategy on informed insights. Finding the gaps early helps you avoid unnecessary cost, and time wasted on AI solutions that don’t fit your needs.

## How we help

- **Organisational readiness assessment:** evaluate your current state for AI integration.
- **AI shadow infrastructure:** find out which paid and unpaid AI tools are already in use across the organisation.
- **Tailored strategy and business case:** a future-proof AI strategy based on your business context, with a business case to support internal alignment.

## Start with the FutureFit Index

The FutureFit Index is a free, five-minute first look at your organisation’s AI readiness, highlighting strengths, gaps and areas worth a closer look. You receive a snapshot report straight away, with the option of a free follow-up conversation.`,
    faq: [
      {
        question: 'What does the FutureFit Diagnostic cover?',
        answer:
          'AI readiness and receptiveness to change, the AI tools already in use (shadow AI), AI literacy, and AI-related psychosocial hazards, followed by a tailored strategy and business case.',
      },
    ],
  },
  {
    slug: 'consulting',
    title: 'Consulting',
    summary:
      'Tailored consulting that prepares your organisation for AI adoption, optimising systems, roles and team structures.',
    body: `We offer predefined pathways (Ignite Potential, Skillscape and Elastic Workforce) or fully bespoke work, depending on your needs.

## Why it matters

AI adoption takes more than implementing technology. Organisations must be ready across operations, roles and teams to realise AI’s potential. We position your organisation for sustainable success and help you avoid the risks of unprepared AI integration.

## How we help

- **Optimising systems and performance:** improve operational efficiency and align performance before AI arrives.
- **Preparing for agentic AI and automation:** structure roles and ways of working to get the most from AI and automation.
- **Building adaptive business models:** a flexible, high-performing organisation that can thrive as AI accelerates.
- **Bespoke work:** organisational design, technology implementation and more.`,
  },
  {
    slug: 'academy',
    title: 'Education and the EthicAI Academy',
    summary:
      'Education that builds real AI competency across leadership and teams, with governance and ethics built in.',
    body: `We build AI literacy across leadership and teams: foundational knowledge, practical tools and specialised guidance on the human impact of AI, including psychosocial risks and leadership in the AI era.

## How we help

- **Leadership:** guide your organisation through AI-driven ethical dilemmas, with clear decision-making frameworks.
- **Practical AI:** the foundational knowledge to use AI tools well, with safety guidelines for responsible use.
- **Managing psychosocial risks for HR:** identify and reduce the psychosocial risks of AI at work.
- **Custom programs:** HR, leadership coaching, navigating change and reducing burnout in the AI era.

## The EthicAI Academy

The Academy is built around the 70-20-10 model of learning: 70% of capability is built on the job, 20% through peers and 10% through formal learning. Micro-learning modules come with weekly exercises and peer work, so understanding becomes part of everyday work. It is tool-agnostic, has governance and ethics built in, and drives defensible AI decisions at every level. Modules include AI 101, Agentic Basics, Agentic Build, AI Governance and Ethics, and Defensible Decision Making. The Academy pilots in January 2027.`,
  },
  {
    slug: 'public-sector-insights',
    title: 'Public sector AI insights',
    summary:
      'Rigorous, vendor-neutral insight papers for policy advisers, senior public servants and ministers’ offices.',
    body: `EthicAI has produced three insight papers for policy advisers, senior public servants and ministers’ offices who want rigorous, vendor-neutral thinking to inform the decisions they are already making. The pack covers three of the most under-examined tensions in current AI policy:

- **The training economy:** who owns the value created when AI learns from public and institutional data.
- **AI psychosis:** the governance risks emerging from uncritical AI dependency inside organisations.
- **AI in education:** why waiting for a national framework is itself a policy choice, and a costly one.

Get in touch and we’ll send you the full collection.`,
  },
]
