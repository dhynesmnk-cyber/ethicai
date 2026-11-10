import { describe, expect, it } from 'vitest'

import { checkEnvironment, describeFailure } from '../../scripts/netlify-preflight.mjs'

const complete = {
  PAYLOAD_SECRET: 'x'.repeat(64),
  DATABASE_URI:
    'postgresql://postgres.abc:pw@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  NEXT_PUBLIC_SITE_URL: 'https://ethicaiau1.netlify.app',
  S3_BUCKET: 'ethicai-media',
  S3_ENDPOINT: 'https://acct.r2.cloudflarestorage.com',
  S3_ACCESS_KEY_ID: 'id',
  S3_SECRET_ACCESS_KEY: 'secret',
  S3_PUBLIC_URL: 'https://pub-abc.r2.dev',
}

describe('checkEnvironment', () => {
  it('accepts a complete, sensible setup', () => {
    const result = checkEnvironment(complete)
    expect(result).toMatchObject({ missing: [], problems: [], warnings: [] })
    expect(result.info).toEqual([
      'Database: host aws-0-ap-southeast-2.pooler.supabase.com, port 6543, user postgres.abc',
    ])
  })

  it('lists every missing variable at once, as the failed Netlify build needed', () => {
    const { PAYLOAD_SECRET: _a, S3_BUCKET: _b, S3_PUBLIC_URL: _c, ...rest } = complete
    expect(checkEnvironment(rest).missing).toEqual(['PAYLOAD_SECRET', 'S3_BUCKET', 'S3_PUBLIC_URL'])
    expect(checkEnvironment({}).missing).toHaveLength(8)
  })

  it('treats blank values as missing', () => {
    expect(checkEnvironment({ ...complete, DATABASE_URI: '   ' }).missing).toEqual(['DATABASE_URI'])
  })

  it('rejects a database address that is not Postgres', () => {
    const result = checkEnvironment({ ...complete, DATABASE_URI: 'mysql://x' })
    expect(result.problems[0]).toMatch(/must start with postgres/)
  })

  it('rejects the IPv6-only Supabase direct connection with the fix', () => {
    const result = checkEnvironment({
      ...complete,
      DATABASE_URI: 'postgresql://postgres:pw@db.abcdefgh.supabase.co:5432/postgres',
    })
    expect(result.problems[0]).toMatch(/Transaction pooler/)
  })

  it('rejects a pooler address whose user is plain postgres, as the failed deploy may have had', () => {
    const result = checkEnvironment({
      ...complete,
      DATABASE_URI:
        'postgresql://postgres:pw@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
    })
    expect(result.problems[0]).toMatch(/postgres\.<project-ref>/)
  })

  it('rejects an address that still has the [YOUR-PASSWORD] placeholder', () => {
    const result = checkEnvironment({
      ...complete,
      DATABASE_URI:
        'postgresql://postgres.abc:[YOUR-PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
    })
    expect(result.problems[0]).toMatch(/square brackets/)
  })

  it('explains an address that can’t be read because of special characters in the password', () => {
    const result = checkEnvironment({
      ...complete,
      DATABASE_URI:
        'postgresql://postgres.abc:pa#ss@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
    })
    expect(result.problems[0]).toMatch(/URL-encoded/)
  })

  it('shows the host, port and user in the log but never the password', () => {
    const result = checkEnvironment({
      ...complete,
      DATABASE_URI:
        'postgresql://postgres.abc:hunter2@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
    })
    expect(result.info.join(' ')).not.toContain('hunter2')
    expect(result.info[0]).toContain('user postgres.abc')
  })

  it('rejects the Supabase session pooler, which ran out of connections on the review site', () => {
    const result = checkEnvironment({
      ...complete,
      DATABASE_URI:
        'postgresql://postgres.abc:pw@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
    })
    expect(result.problems).toHaveLength(1)
    expect(result.problems[0]).toMatch(/Session pooler \(port 5432\)/)
    expect(result.problems[0]).toMatch(/Transaction pooler/)
    expect(result.problems[0]).toMatch(/6543/)
  })

  it('treats a pooler address without a port as the session pooler', () => {
    const result = checkEnvironment({
      ...complete,
      DATABASE_URI:
        'postgresql://postgres.abc:pw@aws-0-ap-southeast-2.pooler.supabase.com/postgres',
    })
    expect(result.problems[0]).toMatch(/Session pooler \(port 5432\)/)
  })

  it('accepts the transaction pooler without a warning', () => {
    const result = checkEnvironment(complete)
    expect(result.problems).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it('rejects a site address that is not a URL', () => {
    expect(
      checkEnvironment({ ...complete, NEXT_PUBLIC_SITE_URL: 'ethicaiau1' }).problems,
    ).toHaveLength(1)
  })

  it('checks the bootstrap admin settings', () => {
    expect(checkEnvironment({ ...complete, BOOTSTRAP_ADMIN_EMAIL: 'a@b.com' }).warnings[0]).toMatch(
      /Only one of/,
    )
    const short = checkEnvironment({
      ...complete,
      BOOTSTRAP_ADMIN_EMAIL: 'a@b.com',
      BOOTSTRAP_ADMIN_PASSWORD: 'short',
    })
    expect(short.problems[0]).toMatch(/at least 12/)
  })

  it('warns while the admin password reset is on', () => {
    const result = checkEnvironment({
      ...complete,
      BOOTSTRAP_ADMIN_EMAIL: 'a@b.com',
      BOOTSTRAP_ADMIN_PASSWORD: 'a-long-enough-password',
      BOOTSTRAP_ADMIN_RESET_PASSWORD: 'true',
    })
    expect(result.problems).toEqual([])
    expect(result.warnings[0]).toMatch(/BOOTSTRAP_ADMIN_RESET_PASSWORD is on.*Remove it/)
  })

  it('rejects the admin password reset without an email and a new password', () => {
    const result = checkEnvironment({
      ...complete,
      BOOTSTRAP_ADMIN_EMAIL: 'a@b.com',
      BOOTSTRAP_ADMIN_RESET_PASSWORD: 'true',
    })
    expect(result.problems[0]).toMatch(/needs both BOOTSTRAP_ADMIN_EMAIL/)
  })

  it('ignores the reset switch unless it is exactly "true"', () => {
    const result = checkEnvironment({ ...complete, BOOTSTRAP_ADMIN_RESET_PASSWORD: 'false' })
    expect(result).toMatchObject({ problems: [], warnings: [] })
  })

  it('never puts a secret value in the message', () => {
    const result = checkEnvironment({
      ...complete,
      S3_BUCKET: '',
      DATABASE_URI: 'mysql://user:hunter2@x',
    })
    const text = describeFailure(result, { CONTEXT: 'deploy-preview' })
    expect(text).not.toContain('hunter2')
    expect(text).toContain('S3_BUCKET')
    expect(text).toContain('deploy-preview')
  })
})
