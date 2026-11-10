// Netlify's build command (see netlify.toml). Runs in this order, stopping at the first failure:
//   0. check that every required environment variable is set (scripts/netlify-preflight.mjs)
//   1. apply the committed Payload migrations to the database (it must already be reachable, and
//      pages are prerendered from it in step 3, so the tables have to exist first)
//   2. create the first admin from BOOTSTRAP_ADMIN_* (only if there are no users yet; see
//      scripts/bootstrap-admin.ts)
//   3. optionally add the demo content, only while SEED_DEMO_CONTENT=true (review site)
//   4. build the site
//
// DECISION: migrations run in the build (docs/DEPLOYMENT-NETLIFY.md §3, option B) so a deploy needs
// no commands on anyone's machine. They are committed and reviewed first, and only ever add to or
// change the schema as written there; nothing here resets or empties data.
import { spawnSync } from 'node:child_process'

import { checkEnvironment, describeFailure } from './netlify-preflight.mjs'

// Migrations and the seed run as production, as they would anywhere else: Payload's development
// mode would try to push schema changes straight into the database and could stop to ask.
const production = { ...process.env, NODE_ENV: 'production' }

function run(label, args, env = process.env) {
  console.log(`\n▶ ${label}`)
  const result = spawnSync('npm', args, { stdio: 'inherit', env })
  if (result.status !== 0) {
    console.error(`\n✖ ${label} failed`)
    process.exit(result.status ?? 1)
  }
}

console.log('\n▶ Checking environment variables')
const environment = checkEnvironment(process.env)
for (const line of environment.info) console.log(`  ${line}`)
for (const warning of environment.warnings) console.warn(`⚠ ${warning}`)
if (environment.missing.length > 0 || environment.problems.length > 0) {
  console.error(`\n✖ ${describeFailure(environment, process.env)}`)
  process.exit(1)
}

run('Applying database migrations', ['run', 'migrate'], production)

run('Creating the first admin, if there are no users yet', ['run', 'bootstrap:admin'], production)

if (process.env.SEED_DEMO_CONTENT === 'true') {
  // The seed only creates what is missing, but deleted demo content comes back on every deploy
  // while this is on, so it must be switched off once real content is in.
  run('Adding demo content (SEED_DEMO_CONTENT=true)', ['run', 'seed'], production)
} else {
  console.log('\n▶ Skipping demo content (SEED_DEMO_CONTENT is not "true")')
}

run('Building the site', ['run', 'build'])
