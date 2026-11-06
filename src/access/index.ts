import type { Access, FieldAccess } from 'payload'

// Roles (BUILD-SPEC §4.1): editors create, update and publish content; only admins manage users,
// site settings, team members and testimonials, and only admins delete content.

// Accepts both the server-side request user and the admin UI's client user.
export const isAdmin = (user: unknown): boolean =>
  typeof user === 'object' && user !== null && 'role' in user && user.role === 'admin'

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const signedIn: Access = ({ req: { user } }) => Boolean(user)

export const anyone: Access = () => true

/** Admins see every user; everyone else only their own account. */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { id: { equals: user.id } }
}

/** Visitors only see published versions; signed-in users also see drafts. */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/** For collections with a `published` checkbox rather than drafts. */
export const publishedFlagOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { published: { equals: true } }
}
