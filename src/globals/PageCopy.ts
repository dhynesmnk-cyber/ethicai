import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { adminOnly, isAdmin } from '@/access'
import { PHOTO_SLOTS } from '@/content/photo-slots'
import { httpsUrl } from '@/fields/slug'
import { revalidateEverything, revalidatePaths } from '@/lib/revalidate'

// The fixed text on Home, About and Services (docs/REDESIGN-PLAN.md §4) and the photograph on
// each page, so changing a headline, an FAQ answer or a photo never needs a code change.
// Starting text comes from src/content/defaults.ts; starting photos from src/lib/photography.ts.

const revalidatePages: GlobalAfterChangeHook = ({ context, doc, req }) => {
  // The text pages (these also tell IndexNow), then everything else: photos appear on every page.
  revalidatePaths(req, context, ['/', '/about', '/services', '/llms.txt'])
  revalidateEverything(req, context)
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
    description:
      'The fixed text on the Home, About and Services pages, and the photo on each page.',
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
              admin: { description: 'The full-screen photographic opening of the Home page.' },
              fields: [
                {
                  name: 'eyebrow',
                  type: 'text',
                  admin: {
                    description:
                      'A short line above the headline, e.g. “AI ethics and governance · Sydney”.',
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
                      'Background photo (landscape, at least 2400 pixels wide). The text sits over its lower left, so choose a photo whose lower part is calm. Leave empty for the default photo of Sydney blue gums.',
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
                  admin: { description: 'How we work, shown as a short numbered list.' },
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
        {
          label: 'Photos',
          description:
            'The photograph on each page. Leave a slot empty to use the default photo of Australian native trees (credited on the Photo credits page). Use landscape photos at least 2400 pixels wide, with a calm lower part: text sits over it.',
          fields: [
            {
              name: 'photos',
              type: 'group',
              admin: {
                description:
                  'The Home page photo is under Home → Hero. Only upload photos EthicAI owns or has a licence to use.',
              },
              fields: PHOTO_SLOTS.map((slot) => ({
                name: slot.name,
                label: slot.label,
                type: 'upload' as const,
                relationTo: 'media' as const,
                admin: { description: `Shown ${slot.where}.` },
              })),
            },
          ],
        },
      ],
    },
  ],
}
