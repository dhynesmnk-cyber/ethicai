import type { AccessArgs, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { adminOnly, adminOrSelf, isAdmin, publishedOrSignedIn, signedIn } from '@/access'

const asUser = (user: { id: number; role: 'admin' | 'editor' } | null): AccessArgs =>
  ({ req: { user } as unknown as PayloadRequest }) as AccessArgs

const admin = asUser({ id: 1, role: 'admin' })
const editor = asUser({ id: 2, role: 'editor' })
const visitor = asUser(null)

describe('access rules', () => {
  it('recognises admins only', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true)
    expect(isAdmin({ role: 'editor' })).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })

  it('keeps admin-only operations away from editors and visitors', () => {
    expect(adminOnly(admin)).toBe(true)
    expect(adminOnly(editor)).toBe(false)
    expect(adminOnly(visitor)).toBe(false)
  })

  it('lets editors see only their own user record', () => {
    expect(adminOrSelf(admin)).toBe(true)
    expect(adminOrSelf(editor)).toEqual({ id: { equals: 2 } })
    expect(adminOrSelf(visitor)).toBe(false)
  })

  it('lets any signed-in user edit content', () => {
    expect(signedIn(editor)).toBe(true)
    expect(signedIn(visitor)).toBe(false)
  })

  it('shows visitors published articles only', () => {
    expect(publishedOrSignedIn(editor)).toBe(true)
    expect(publishedOrSignedIn(visitor)).toEqual({ _status: { equals: 'published' } })
  })
})
