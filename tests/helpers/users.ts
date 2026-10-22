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
  await payload.delete({ collection: 'users', where: { email: { equals: email } } })
}
