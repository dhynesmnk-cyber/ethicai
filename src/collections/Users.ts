import type { CollectionConfig, FieldHook } from 'payload'

import { adminOnly, adminOnlyField, adminOrSelf, isAdmin } from '@/access'

// The very first account (created at /admin/create-first-user) must be an admin, otherwise
// nobody could manage users. Field access strips `role` for signed-out requests, so it is set here.
const firstUserIsAdmin: FieldHook = async ({ operation, req, value }) => {
  if (operation !== 'create') return value
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  return totalDocs === 0 ? 'admin' : value
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOnly,
  },
  admin: {
    group: 'Admin',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    // Editors manage their own account from the account menu, not the users list.
    hidden: ({ user }) => !isAdmin(user),
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Shown as the author on articles.' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        create: adminOnlyField,
        update: adminOnlyField,
      },
      hooks: {
        beforeChange: [firstUserIsAdmin],
      },
      admin: {
        position: 'sidebar',
        description:
          'Editors write and publish articles, videos and images. Admins can also manage users, site settings, team members and testimonials, and delete content.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
  ],
}
