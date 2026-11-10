import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { migrations } from '@/migrations'

// The starting copy is written by `applyContentDefaults`, which goes through Payload's Local API
// and so reads the *current* config. Called from an older migration, it would query columns that
// later migrations haven't added yet, and a new (empty) database could never be migrated.

const dir = path.resolve(__dirname, '../../src/migrations')
const source = (name: string) => readFileSync(path.join(dir, `${name}.ts`), 'utf8')
const callsDefaults = (name: string) => /\bapplyContentDefaults\(/.test(source(name))

describe('migrations', () => {
  it('fills the starting copy from the newest migration only', () => {
    const newest = migrations[migrations.length - 1]!.name
    expect(
      callsDefaults(newest),
      `Move the applyContentDefaults block (with its "never saved" check) into ${newest}.ts`,
    ).toBe(true)
    const others = migrations.slice(0, -1).filter((m) => callsDefaults(m.name))
    expect(others.map((m) => m.name)).toEqual([])
  })
})
