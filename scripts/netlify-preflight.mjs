// Checks the environment variables the Netlify build needs before anything else runs, so a missing
// one is reported once, in full, with where to fix it. (Without this the build stops at the first
// thing that happens to read a variable, and each fix reveals the next.) Used by
// scripts/netlify-build.mjs; no secrets are ever printed, only variable names.

/** @typedef {Record<string, string | undefined>} Env */

const REQUIRED = [
  'PAYLOAD_SECRET',
  'DATABASE_URI',
  'NEXT_PUBLIC_SITE_URL',
  'S3_BUCKET',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_URL',
]

const MIN_ADMIN_PASSWORD_LENGTH = 12

/**
 * @param {Env} env
 * @returns {{ missing: string[], problems: string[], warnings: string[] }}
 *   `missing` and `problems` stop the build; `warnings` don't.
 */
export function checkEnvironment(env) {
  const has = (/** @type {string} */ name) => Boolean(env[name]?.trim())
  const missing = REQUIRED.filter((name) => !has(name))
  /** @type {string[]} */
  const problems = []
  /** @type {string[]} */
  const warnings = []

  const database = env.DATABASE_URI?.trim()
  if (database) {
    if (!/^postgres(ql)?:\/\//.test(database)) {
      problems.push('DATABASE_URI must start with postgres:// or postgresql://.')
    } else if (/@db\.[^:/]+\.supabase\.co[:/]/.test(database)) {
      problems.push(
        'DATABASE_URI is the Supabase direct connection, which is IPv6-only and unreachable from ' +
          'Netlify builds. Use the Session pooler string (Supabase → Connect → Session pooler).',
      )
    } else if (/:6543(\/|$|\?)/.test(database)) {
      warnings.push(
        'DATABASE_URI looks like the Supabase transaction pooler (port 6543). Migrations can fail ' +
          'there; the Session pooler (port 5432) is the one to use for the first deploy.',
      )
    }
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) {
    try {
      new URL(siteUrl)
    } catch {
      problems.push(
        'NEXT_PUBLIC_SITE_URL must be a full address, e.g. https://ethicaiau1.netlify.app.',
      )
    }
  }

  const bootstrapEmail = has('BOOTSTRAP_ADMIN_EMAIL')
  const bootstrapPassword = has('BOOTSTRAP_ADMIN_PASSWORD')
  if (bootstrapEmail !== bootstrapPassword) {
    warnings.push(
      'Only one of BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD is set, so no admin will be created.',
    )
  }
  if (
    bootstrapPassword &&
    (env.BOOTSTRAP_ADMIN_PASSWORD ?? '').length < MIN_ADMIN_PASSWORD_LENGTH
  ) {
    problems.push(
      `BOOTSTRAP_ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`,
    )
  }

  return { missing, problems, warnings }
}

/** The text printed when the check fails. */
export function describeFailure(
  /** @type {{ missing: string[], problems: string[] }} */ result,
  /** @type {Env} */ env,
) {
  const lines = ['The build can’t start because of the settings below.']
  if (result.missing.length > 0) {
    lines.push(
      '',
      `Missing environment variables: ${result.missing.join(', ')}`,
      '  Add them in Netlify → Site configuration → Environment variables. Each one needs the',
      '  “Builds” scope (plus Functions and Runtime) and must apply to every deploy context, not just',
      `  Production. This build’s context is “${env.CONTEXT ?? 'unknown'}”. See docs/DEPLOYMENT-NETLIFY.md §3a.`,
    )
  }
  for (const problem of result.problems) lines.push('', problem)
  return lines.join('\n')
}
