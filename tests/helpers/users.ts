import { getPayload } from 'payload'

import config from '../../src/payload.config'

export type TestUser = {
  id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'editor'
}

/** Creates (or recreates) a throwaway user directly in the database via the Local API. */
export async function createTestUser(role: TestUser['role'], key: string): Promise<TestUser> {
  const payload = await getPayload({ config })
  const user = {
    name: `E2E ${key}`,
    email: `e2e-${key}@example.com`,
    password: `e2e-${key}-password`,
    role,
  }
  await deleteTestUser(user.email)
  const doc = await payload.create({ collection: 'users', data: user })
  return { ...user, id: doc.id }
}

export async function deleteTestUser(email: string): Promise<void> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: { email: { equals: email } },
  })
  // Opening the article form in the admin autosaves an empty draft under the signed-in user.
  // Remove what the user left behind, so tests don't pile up drafts (or dashboard counts).
  if (docs[0]) {
    await payload.delete({
      collection: 'articles',
      context: { disableRevalidate: true },
      where: { author: { equals: docs[0].id } },
    })
  }
  await payload.delete({ collection: 'users', where: { email: { equals: email } } })
}
