// Creates the very first admin account from BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD,
// but only when the site has no users at all. Run by the Netlify build (scripts/netlify-build.mjs)
// or by hand with `npm run bootstrap:admin`.
//
// Why: a new deployment has an empty database, and Payload's "create first user" page is open to
// whoever reaches /admin first. Creating the admin during the build closes that window, and lets
// the demo-content seed run, since articles need an author.
//
// Safe to run repeatedly: once any user exists it does nothing, so it can never add an account to
// a live site or change a password. The password is never logged. Change it after the first login
// and remove both variables from Netlify.

import config from '@payload-config'
import { getPayload } from 'payload'

const MIN_PASSWORD_LENGTH = 12

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim()
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'EthicAI admin'

if (!email || !password) {
  console.log('bootstrap-admin: BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD not set, skipped')
  process.exit(0)
}

const payload = await getPayload({ config })
const { totalDocs } = await payload.count({ collection: 'users' })

if (totalDocs > 0) {
  console.log('bootstrap-admin: users already exist, nothing to do')
  process.exit(0)
}

if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(
    `bootstrap-admin: BOOTSTRAP_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
  )
  process.exit(1)
}

await payload.create({
  collection: 'users',
  data: { email, password, name, role: 'admin' },
})
console.log(
  `bootstrap-admin: created the first admin (${email}). Change the password after signing in.`,
)
process.exit(0)
