import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { adminOnly, isAdmin } from '@/access'
import { minimalEditor } from '@/fields/articleEditor'
import { revalidateEverything } from '@/lib/revalidate'

// Single source of truth for integrations and contact details (BUILD-SPEC §4.7). Anything an
// editor might need to change lives here rather than in env vars or code.

const revalidateSite: GlobalAfterChangeHook = ({ context, doc, req }) => {
  revalidateEverything(req, context)
  return doc
}

const httpsUrl = (value: string | null | undefined): true | string => {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:' || 'Use a full https:// link.'
  } catch {
    return 'Use a full https:// link.'
  }
}

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Site settings',
  // The frontend reads this with the Local API (which bypasses access control), so the REST/admin
  // surface can be admins-only.
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Site',
    hidden: ({ user }) => !isAdmin(user),
  },
  hooks: {
    afterChange: [revalidateSite],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Video & newsletter',
          fields: [
            {
              name: 'elfsightTikTokWidgetId',
              type: 'text',
              label: 'Elfsight TikTok widget ID',
              admin: {
                description:
                  'From the Elfsight dashboard (the ID in the embed code). The free plan allows about 200 widget views a month, which is why the feed only loads on /watch after a click. Leave empty to show the hand-picked TikTok videos instead.',
              },
            },
            {
              name: 'tiktokHandle',
              type: 'text',
              admin: { description: 'e.g. @ethicai' },
            },
            {
              name: 'youtubeChannelUrl',
              type: 'text',
              label: 'YouTube channel URL',
              validate: httpsUrl,
            },
            {
              name: 'youtubeChannelId',
              type: 'text',
              label: 'YouTube channel ID',
              validate: (value: string | null | undefined) =>
                !value ||
                /^UC[\w-]{22}$/.test(value) ||
                'Channel IDs start with “UC” and are 24 characters long.',
              admin: {
                description:
                  'Starts with “UC”. Only needed for the optional automatic YouTube feed sync.',
              },
            },
            {
              name: 'substackPublicationUrl',
              type: 'text',
              label: 'Substack publication URL',
              validate: httpsUrl,
              admin: {
                description:
                  'e.g. https://ethicai.substack.com. Drives the subscribe buttons and the recent issues list.',
              },
            },
          ],
        },
        {
          label: 'Contact & footer',
          fields: [
            { name: 'contactEmail', type: 'email' },
            {
              name: 'socialLinks',
              type: 'array',
              labels: { singular: 'Social link', plural: 'Social links' },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Substack', value: 'substack' },
                    { label: 'Instagram', value: 'instagram' },
                  ],
                },
                { name: 'url', type: 'text', required: true, validate: httpsUrl },
              ],
            },
            {
              name: 'footerText',
              type: 'richText',
              editor: minimalEditor,
              admin: { description: 'A sentence or two shown in the site footer.' },
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'analytics',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Plausible', value: 'plausible' },
                { label: 'Google Analytics 4', value: 'ga4' },
              ],
              admin: {
                description:
                  'Google Analytics needs a cookie consent banner; Plausible and none do not.',
              },
            },
            {
              name: 'analyticsId',
              type: 'text',
              label: 'Analytics ID',
              admin: {
                condition: (_, siblingData) => siblingData?.analytics !== 'none',
                description: 'Plausible: your domain (e.g. ethicai.au). GA4: the G-XXXXXXX ID.',
              },
            },
          ],
        },
      ],
    },
  ],
}
