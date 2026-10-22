import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { adminOnly, publishedFlagOrSignedIn } from '@/access'
import { revalidatePaths } from '@/lib/revalidate'
import type { TeamMember } from '@/payload-types'

const paths = ['/', '/about']

const revalidateTeam: CollectionAfterChangeHook<TeamMember> = ({ context, doc, req }) => {
  revalidatePaths(req, context, paths)
  return doc
}

const revalidateDeletedTeam: CollectionAfterDeleteHook<TeamMember> = ({ context, doc, req }) => {
  revalidatePaths(req, context, paths)
  return doc
}

export const TeamMembers: CollectionConfig = {
  slug: 'teamMembers',
  labels: { singular: 'Team member', plural: 'Team members' },
  access: {
    read: publishedFlagOrSignedIn,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: 'Site',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order', 'published'],
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [revalidateTeam],
    afterDelete: [revalidateDeletedTeam],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: { description: 'e.g. “Founder”. Shown under the name.' },
    },
    {
      // DECISION: plain textarea rather than rich text. Bios are prose paragraphs; blank lines
      // separate paragraphs on the site.
      name: 'bio',
      type: 'textarea',
      required: true,
      admin: { description: 'Leave a blank line between paragraphs.', rows: 12 },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Square head-and-shoulders photo works best.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Only published team members appear on the site.',
      },
    },
  ],
}
