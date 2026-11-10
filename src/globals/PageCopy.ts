import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { adminOnly, isAdmin } from '@/access'
import { httpsUrl } from '@/fields/slug'
import { revalidatePaths } from '@/lib/revalidate'

// The fixed text on Home, About and Services (docs/REDESIGN-PLAN.md §4), so changing a headline
// or an FAQ answer never needs a code change. Starting values come from src/content/defaults.ts.

const revalidatePages: GlobalAfterChangeHook = ({ context, doc, req }) => {
  revalidatePaths(req, context, ['/', '/about', '/services', '/llms.txt'])
  return doc
}

export const PageCopy: GlobalConfig = {
  slug: 'pageCopy',
  label: 'Page copy',
  // The frontend reads this with the Local API, so the REST/admin surface can be admins-only.
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Site',
    description: 'The fixed text on the Home, About and Services pages.',
    hidden: ({ user }) => !isAdmin(user),
  },
  hooks: {
    afterChange: [revalidatePages],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Home',
          fields: [
            {
              name: 'hero',
              type: 'group',
              admin: { description: 'The dark, full-screen opening of the Home page.' },
              fields: [
                {
                  name: 'eyebrow',
                  type: 'text',
                  admin: {
                    description:
                      'Small capitals above the headline, e.g. “AI ethics and governance · Sydney”.',
                  },
                },
                {
                  name: 'headline',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'The page’s main heading. Keep it short: it is shown very large.',
                  },
                },
                {
                  name: 'subhead',
                  type: 'textarea',
                  admin: { description: 'One or two sentences under the headline.' },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Optional background photo. Choose a dark, calm landscape image (at least 1920 pixels wide); the text sits over its lower left. Leave empty for the animated indigo light.',
                  },
                },
              ],
            },
            {
              name: 'statement',
              type: 'textarea',
              admin: {
                description: 'The large centred paragraph after the opening: what EthicAI is for.',
              },
            },
            {
              name: 'stats',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Stat', plural: 'Stats' },
              admin: {
                description:
                  'Up to four short proof points, shown in a strip. Only use claims you can stand behind.',
              },
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  maxLength: 16,
                  admin: { description: 'The big figure or word, e.g. “6M+”.' },
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: { description: 'What it means, e.g. “TikTok views in under a year”.' },
                },
              ],
            },
            {
              name: 'faq',
              label: 'FAQ',
              type: 'array',
              labels: { singular: 'Question', plural: 'Questions' },
              admin: {
                description:
                  'Questions and answers near the end of the Home page. Answer in the first sentence: search engines and AI assistants quote these.',
              },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                  admin: { description: 'Phrase it the way a visitor would ask it.' },
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  required: true,
                  admin: {
                    description: 'Two or three plain sentences. Start with the answer itself.',
                  },
                },
              ],
            },
            {
              name: 'press',
              type: 'array',
              labels: { singular: 'Press mention', plural: 'Press mentions' },
              admin: { description: 'Coverage of EthicAI or Selma, linked from the Home page.' },
              fields: [
                {
                  name: 'outlet',
                  type: 'text',
                  required: true,
                  admin: { description: 'The publication, e.g. “IT Brief Australia”.' },
                },
                {
                  name: 'headline',
                  type: 'text',
                  required: true,
                  admin: { description: 'The article’s headline, as published.' },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  validate: httpsUrl,
                  admin: { description: 'The full link to the article, starting with https://.' },
                },
                {
                  name: 'date',
                  type: 'date',
                  admin: {
                    description: 'When it was published.',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'About',
          fields: [
            {
              name: 'about',
              type: 'group',
              admin: {
                description:
                  'The opening of the About page. Team members are edited under Team members.',
              },
              fields: [
                {
                  name: 'headline',
                  type: 'text',
                  required: true,
                  admin: { description: 'The page’s main heading, e.g. “About EthicAI”.' },
                },
                {
                  name: 'lead',
                  type: 'textarea',
                  admin: {
                    description:
                      'The first paragraph: who EthicAI is, in a sentence or two. Search engines and AI assistants often quote it.',
                  },
                },
                {
                  name: 'story',
                  type: 'textarea',
                  admin: {
                    description: 'The rest of the story. Leave a blank line between paragraphs.',
                    rows: 8,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Services',
          fields: [
            {
              name: 'services',
              type: 'group',
              admin: {
                description: 'The Services overview page. Each service is edited under Services.',
              },
              fields: [
                {
                  name: 'intro',
                  type: 'textarea',
                  admin: { description: 'The paragraph under the Services heading.' },
                },
                {
                  name: 'steps',
                  type: 'array',
                  maxRows: 4,
                  labels: { singular: 'Step', plural: 'Steps' },
                  admin: { description: 'How we work, shown as numbered steps (01 to 04).' },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      admin: { description: 'A few words, e.g. “Understand where you stand”.' },
                    },
                    {
                      name: 'body',
                      type: 'textarea',
                      required: true,
                      admin: { description: 'One sentence.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
