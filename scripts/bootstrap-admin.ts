// Creates the very first admin account from BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD,
// but only when the site has no users at all. Run by the Netlify build (scripts/netlify-build.mjs)
// or by hand with `npm run bootstrap:admin`.
//
// Why: a new deployment has an empty database, and Payload's "create first user" page is open to
// whoever reaches /admin first. Creating the admin during the build closes that window, and lets
// the demo-content seed run, since articles need an author.
//
// Safe to run repeatedly: once any user exists it creates nothing and changes nothing, unless
// BOOTSTRAP_ADMIN_RESET_PASSWORD=true (below). The password is never logged. Change it after the
// first login and remove the variables from Netlify.
//
// Locked out: with BOOTSTRAP_ADMIN_RESET_PASSWORD=true, the account whose email is
// BOOTSTRAP_ADMIN_EMAIL gets BOOTSTRAP_ADMIN_PASSWORD as its password and is unlocked.
// DECISION: a build-time switch rather than a password-reset email. The site sends no email, so
// "Forgot password" can't reach anyone, and whoever can set Netlify variables can already read
// DATABASE_URI and PAYLOAD_SECRET, so the switch grants nothing new. It never creates a second
// account, and stops the build if no account has that email.

import config from '@payload-config'
import { createLocalReq, getPayload, resetLoginAttempts } from 'payload'

const MIN_PASSWORD_LENGTH = 12

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'EthicAI admin'
const resetPassword = process.env.BOOTSTRAP_ADMIN_RESET_PASSWORD?.trim() === 'true'

if (!email || !password) {
  if (resetPassword) {
    console.error(
      'bootstrap-admin: BOOTSTRAP_ADMIN_RESET_PASSWORD is on, but it needs both ' +
        'BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD',
    )
    process.exit(1)
  }
  console.log('bootstrap-admin: BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD not set, skipped')
  process.exit(0)
}

if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(
    `bootstrap-admin: BOOTSTRAP_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
  )
  process.exit(1)
}

const payload = await getPayload({ config })
const { totalDocs } = await payload.count({ collection: 'users' })

if (totalDocs === 0) {
  await payload.create({
    collection: 'users',
    data: { email, password, name, role: 'admin' },
  })
  console.log(
    `bootstrap-admin: created the first admin (${email}). Change the password after signing in.`,
  )
  process.exit(0)
}

const { docs } = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
  depth: 0,
  // Includes the lock fields, which resetLoginAttempts reads.
  showHiddenFields: true,
})
const account = docs[0]

if (!resetPassword) {
  console.log(
    account
      ? `bootstrap-admin: users already exist, nothing to do. An account with ${email} exists; ` +
          'if its password no longer works, set BOOTSTRAP_ADMIN_RESET_PASSWORD=true and deploy ' +
          'again (docs/DEPLOYMENT-NETLIFY.md §3a).'
      : `bootstrap-admin: users already exist, nothing to do. No account has ${email}, so the ` +
          'first admin was created with another address: see Supabase → Table editor → users.',
  )
  process.exit(0)
}

if (!account) {
  console.error(
    `bootstrap-admin: BOOTSTRAP_ADMIN_RESET_PASSWORD is on, but no account has ${email}, so ` +
      'nothing was changed. Set BOOTSTRAP_ADMIN_EMAIL to the address in Supabase → Table editor → ' +
      'users, or remove BOOTSTRAP_ADMIN_RESET_PASSWORD.',
  )
  process.exit(1)
}

await payload.update({ collection: 'users', id: account.id, data: { password } })
await resetLoginAttempts({
  collection: payload.collections.users.config,
  // A plain copy: the generated User interface has no index signature, which this helper wants.
  doc: { ...account },
  payload,
  req: await createLocalReq({}, payload),
})
console.log(
  `bootstrap-admin: set the password of ${email} (${account.role}) from ` +
    'BOOTSTRAP_ADMIN_PASSWORD and unlocked it. Remove BOOTSTRAP_ADMIN_RESET_PASSWORD now: while ' +
    'it is on, every deploy sets this password again.',
)
process.exit(0)
