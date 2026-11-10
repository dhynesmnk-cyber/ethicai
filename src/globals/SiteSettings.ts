import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { adminOnly, isAdmin } from '@/access'
import { minimalEditor } from '@/fields/articleEditor'
import { httpsUrl } from '@/fields/slug'
import { normaliseElfsightWidgetId, validateElfsightWidgetId } from '@/lib/elfsight'
import { revalidateEverything } from '@/lib/revalidate'

// Single source of truth for integrations and contact details (BUILD-SPEC §4.7). Anything an
// editor might need to change lives here rather than in env vars or code.

const revalidateSite: GlobalAfterChangeHook = ({ context, doc, req }) => {
  revalidateEverything(req, context)
  return doc
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
              // Pasting the whole install code works too; only the bare ID is stored.
              validate: validateElfsightWidgetId,
              hooks: {
                beforeValidate: [({ value }) => normaliseElfsightWidgetId(value)],
              },
              admin: {
                description:
                  'From the Elfsight dashboard: paste the install code (or just the ID in it, like 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d). The free plan allows about 200 widget views a month, which is why the feed only loads on /watch after a click. Leave empty to show the hand-picked TikTok videos instead.',
              },
            },
            {
              name: 'tiktokHandle',
              type: 'text',
              validate: (value: string | null | undefined) =>
                !value ||
                /^@?[A-Za-z0-9._]{1,24}$/.test(value) ||
                'Use your TikTok handle, like @ethicai (letters, numbers, full stops and underscores).',
              admin: { description: 'e.g. @ethicai. Used for the “Follow us on TikTok” link.' },
            },
            {
              name: 'youtubeChannelUrl',
              type: 'text',
              label: 'YouTube channel URL',
              validate: httpsUrl,
              admin: {
                description:
                  'e.g. https://www.youtube.com/@ethicai. Used for the “Visit our YouTube channel” link on Watch.',
              },
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
            {
              name: 'contactEmail',
              type: 'email',
              admin: {
                description: 'Shown on the Contact page and in the footer. Leave empty to hide it.',
              },
            },
            {
              name: 'socialLinks',
              type: 'array',
              labels: { singular: 'Social link', plural: 'Social links' },
              admin: { description: 'Icons shown in the site footer, in this order.' },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  admin: { description: 'Decides which icon is shown.' },
                  options: [
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Substack', value: 'substack' },
                    { label: 'Instagram', value: 'instagram' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  validate: httpsUrl,
                  admin: { description: 'The full link, starting with https://.' },
                },
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
        {
          label: 'Selma & family',
          description:
            'Selma is EthicAI’s product. These settings control how it appears across this site: the family bar at the top of every page, the Selma link in the menu, the Meet Selma section on Home and the footer.',
          fields: [
            {
              name: 'selma',
              type: 'group',
              admin: { description: 'Selma’s details, as shown on this site.' },
              fields: [
                {
                  name: 'show',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Show Selma on this site',
                  admin: {
                    description:
                      'Untick to hide every Selma link and section (menu, family bar, Home section, footer).',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Selma website',
                  defaultValue: 'https://selma.au',
                  validate: httpsUrl,
                  admin: { description: 'Where every “Selma” link goes.' },
                },
                {
                  name: 'waitlistUrl',
                  type: 'text',
                  label: 'Waitlist link',
                  defaultValue: 'https://selma.au/#waitlist',
                  validate: httpsUrl,
                  admin: { description: 'Where the “Join the waitlist” buttons go.' },
                },
                {
                  name: 'tagline',
                  type: 'text',
                  defaultValue: 'AI that answers only to you.',
                  admin: { description: 'Selma’s one-line promise, shown with the name.' },
                },
                {
                  name: 'summary',
                  type: 'textarea',
                  admin: {
                    description: 'Two or three sentences introducing Selma on the Home page.',
                  },
                },
                {
                  name: 'suite',
                  type: 'array',
                  label: 'Human at the Helm™ Suite',
                  labels: { singular: 'Part', plural: 'Parts' },
                  maxRows: 6,
                  admin: {
                    description: 'The parts of the suite, shown as cards on the Home page.',
                  },
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: { description: 'e.g. “Trace”.' },
                    },
                    {
                      name: 'kicker',
                      type: 'text',
                      admin: {
                        description:
                          'A short line under the name, e.g. “Provenance for every response”.',
                      },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: true,
                      admin: { description: 'One or two sentences.' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'announcement',
              type: 'group',
              admin: {
                description: 'A short message in the dark family bar at the top of every page.',
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Show the announcement',
                  admin: {
                    description: 'Untick to show only the EthicAI · Selma links in the bar.',
                  },
                },
                {
                  name: 'text',
                  type: 'text',
                  defaultValue: 'Selma by EthicAI ships January 2027.',
                  admin: { description: 'Keep it to one short sentence.' },
                },
                {
                  name: 'linkLabel',
                  type: 'text',
                  defaultValue: 'Join the waitlist',
                  admin: { description: 'The link text after the message.' },
                },
                {
                  name: 'linkUrl',
                  type: 'text',
                  defaultValue: 'https://selma.au/#waitlist',
                  validate: httpsUrl,
                  admin: { description: 'Where the link goes (https:// links only).' },
                },
              ],
            },
          ],
        },
        {
          label: 'Organisation',
          fields: [
            {
              name: 'organisation',
              type: 'group',
              admin: {
                description:
                  'Shown in the footer and given to search engines, so keep it exactly as registered.',
              },
              fields: [
                {
                  name: 'legalName',
                  type: 'text',
                  defaultValue: 'EthicAI Pty Ltd',
                  admin: { description: 'The registered company name.' },
                },
                {
                  name: 'abn',
                  type: 'text',
                  label: 'ABN',
                  defaultValue: '13 686 628 848',
                  validate: (value: string | null | undefined) =>
                    !value ||
                    /^\d{11}$/.test(value.replace(/\s/g, '')) ||
                    'An ABN has 11 digits, e.g. 13 686 628 848.',
                  admin: { description: 'Australian Business Number, e.g. 13 686 628 848.' },
                },
                {
                  name: 'locality',
                  type: 'text',
                  defaultValue: 'Sydney, NSW',
                  admin: { description: 'Where EthicAI is based, e.g. “Sydney, NSW”.' },
                },
                {
                  name: 'acknowledgement',
                  type: 'textarea',
                  label: 'Acknowledgement of Country',
                  admin: { description: 'Shown in the footer of every page.' },
                },
                {
                  name: 'inclusion',
                  type: 'textarea',
                  label: 'Inclusion statement',
                  admin: {
                    description: 'Shown in the footer under the Acknowledgement of Country.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Search',
          fields: [
            {
              name: 'search',
              type: 'group',
              admin: { description: 'Search engine and AI assistant settings.' },
              fields: [
                {
                  name: 'aiCrawlers',
                  type: 'select',
                  label: 'AI crawlers',
                  defaultValue: 'allow-all',
                  required: true,
                  options: [
                    { label: 'Allow AI search and training', value: 'allow-all' },
                    { label: 'Allow AI search only (block training)', value: 'search-only' },
                    { label: 'Block all AI crawlers', value: 'block-all' },
                  ],
                  admin: {
                    description:
                      'Which AI companies’ crawlers may read the site (robots.txt). “AI search” lets ChatGPT, Claude, Perplexity and others find and cite EthicAI when people ask them questions. “Training” also lets them learn from the content for future models. Search engines like Google and Bing are always allowed.',
                  },
                },
                {
                  name: 'googleVerification',
                  type: 'text',
                  label: 'Google Search Console verification code',
                  admin: {
                    description:
                      'Only if you verify with the HTML tag method: paste the content="…" value. Not needed if the domain is verified through DNS.',
                  },
                },
                {
                  name: 'bingVerification',
                  type: 'text',
                  label: 'Bing Webmaster Tools verification code',
                  admin: {
                    description:
                      'The content="…" value of Bing’s msvalidate.01 meta tag. Not needed if you import the site from Google Search Console.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
