# EthicAI — Deployment Guide (Netlify)

Companion to `docs/BUILD-SPEC.md` Phase 6. Audience: you (developer) + coding agent.

**Architecture:** Next.js (Payload 3) on Netlify → hosted Postgres (Neon or Supabase) → media on S3-compatible object storage (Cloudflare R2). All three are free-tier friendly.

> ⚠️ The two things that break Payload-on-Netlify projects:
> 1. **Local media storage** — Netlify's filesystem is ephemeral; uploads vanish (or fail outright). The S3 adapter is not optional.
> 2. **SQLite** — not viable on serverless/multi-instance. Use Postgres.

---

## 1. Provision the database (Neon or Supabase)

Both have generous free tiers and a Netlify integration (Supabase's is one-click from the Netlify integrations directory). Pick one:

- **Neon** — serverless Postgres, simple connection string, built-in point-in-time restore (7 days on free), branch databases for preview deploys (nice bonus with Netlify preview URLs).
- **Supabase** — Postgres + dashboard UI + daily backups (7 days free tier); use the **pooler (pgBouncer) connection string** for serverless.

Steps:
1. Create project in region **Sydney (ap-southeast-2)** — closest to AU users and to Netlify's Sydney region if selected.
2. Copy the pooled connection string → will become `DATABASE_URI`.
3. Keep a direct (non-pooled) string handy for running migrations from your machine.

## 2. Provision media storage (Cloudflare R2 recommended)

R2: 10 GB free, **zero egress fees**, S3-compatible API.

1. Cloudflare dashboard → R2 → Create bucket, e.g. `ethicai-media`. Location: APAC.
2. Enable public access: either R2 public develop URL or (better) a custom domain like `media.ethicai.au` → becomes `S3_PUBLIC_URL`.
3. Create an API token (Object Read & Write, scoped to this bucket) → `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`. Endpoint = `https://<accountid>.r2.cloudflarestorage.com`, region = `auto`.
4. If the bucket is not public-read, configure CORS for the site origin (Payload docs cover the exact JSON).
5. Alternatives if the client prefers: Backblaze B2 or Wasabi (same env vars).

*Verify uploads against the real bucket in Phase 0 — do not discover this in Phase 6.*

**Direct uploads (required CORS rule):** Netlify Functions cap request bodies at ≈ 4.5 MB of binary data (base64 under a fixed 6 MB limit), so the admin uploads images straight from the browser to R2 using short-lived signed URLs (`clientUploads` in `payload.config.ts`). Payload still checks the user, file type and the 20 MB limit before signing, and R2 enforces the signed size. Browsers only allow this if the bucket has a CORS rule. In Cloudflare: R2 → the bucket → Settings → CORS policy → Edit, and paste:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://ethicaiau1.netlify.app", "https://www.ethicai.au", "https://ethicai.au"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type", "if-none-match"],
    "MaxAgeSeconds": 3600
  }
]
```

The review site's address (`https://ethicaiau1.netlify.app`) is already in the list above; remove it when the site launches on its own domain. The dev bucket and the production bucket each need the rule.

To check the rule is live (R2 can take a minute to apply it), `npx wrangler r2 bucket cors list <bucket>` shows what R2 has saved, and this preflight should answer `200` or `204` with an `access-control-allow-origin` header (a `403` without one means no rule matched):

```bash
curl -sS -o /dev/null -D - -X OPTIONS "https://<accountid>.r2.cloudflarestorage.com/<bucket>/cors-probe.jpg" \
  -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type,if-none-match" | grep -iE "^HTTP|^access-control-allow"
``` Without it, uploads in the admin fail with a CORS error in the browser console. Phase 6: upload a large (15–20 MB) image on the deployed site to confirm Payload can generate the resized versions within the function time limit.

## 3. Netlify site setup

1. Push repo to GitHub; Netlify → Add new site → import repo.
2. Framework preset: **Next.js** (auto-detected). Build command `next build`, publish dir `.next` — Netlify's Next runtime handles the rest. Node version: set **22** (site settings → environment, `NODE_VERSION=22`).
3. Add the env vars from `.env.example` (Site configuration → Environment variables). Also set them for preview deploys. `DATABASE_URI` must be available at **build** time too: static pages are prerendered with the footer's siteSettings. `REVALIDATE_SECRET` is optional (publishing refreshes pages without it); set it to allow `POST /api/revalidate` for scripts and manual refreshes. The Elfsight widget ID and Substack URL are **not** env vars: after the first deploy, enter them in the admin under Site settings (see `docs/WEEKLY-RUNBOOK.md`, "One-off: connect the integrations").
4. **Migrations workflow (choose one, document it):**
   - **A (recommended, simplest):** run migrations from your machine against prod DB: `DATABASE_URI=<prod-direct-string> npx payload migrate` whenever new migrations are committed. Add an `npm run migrate:prod` script that reads `.env.production.local` (git-ignored).
   - **B:** run in Netlify build: build command `next build && npx payload migrate --prod` (requires `DATABASE_URI` present at build time; watch build-log noise and build-minute usage).
5. Deploy previews: with Neon branching you can wire preview DBs; otherwise previews sharing the prod DB is acceptable for this project **only if** the team is just you (it is). Note the tradeoff in the repo README.

## 3a. Review deploy at `https://ethicaiau1.netlify.app` (step by step)

A working copy of the site for review before launch. It is kept out of search engines automatically: while `NEXT_PUBLIC_SITE_URL` ends in `.netlify.app`, `robots.txt` disallows everything and every page carries `noindex`. That switches itself off when the variable becomes the real domain.

**You need:** a Supabase project in Sydney, the R2 bucket and keys, and this repo on GitHub. Nothing is run on anyone's machine: the build applies the migrations, creates your admin account and (optionally) adds the demo content (`netlify.toml` → `scripts/netlify-build.mjs`).

1. **Database string.** Supabase → *Connect* → **Session pooler** (port 5432, host like `aws-0-ap-southeast-2.pooler.supabase.com`, user `postgres.<project-ref>`). Put your database password in. Use the session pooler here, not the direct connection (IPv6 only, which Netlify's build can't reach) and not the transaction pooler (port 6543), which suits running the site later but isn't meant for migrations. Special characters in the password must be URL-encoded.
2. **Create the site.** Netlify → *Add new site* → *Import an existing project* → GitHub → `dhynesmnk-cyber/ethicai`. Choose the branch to deploy (`claude/confident-feynman-bep01v` until it is merged to `main`), leave the build settings as they are (they come from `netlify.toml`), then *Site configuration → Change site name* to `ethicaiau1`.
3. **Environment variables** (*Site configuration → Environment variables*; give each the **Builds**, **Functions** and **Runtime** scopes, and tick *Contains secret values* on the secrets):

   | Variable | Value |
   |---|---|
   | `PAYLOAD_SECRET` | New random value: `openssl rand -hex 32` (never reuse the local one) |
   | `DATABASE_URI` | The session pooler string from step 1 |
   | `NEXT_PUBLIC_SITE_URL` | `https://ethicaiau1.netlify.app` (no trailing slash) |
   | `S3_BUCKET`, `S3_REGION` (`auto`), `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | The same values as in `.env.example`'s Media section |
   | `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` | Your email and a temporary password of 12+ characters. The build creates this admin only if the site has no users, which also stops anyone else claiming `/admin` first |
   | `SEED_DEMO_CONTENT` | `true` for the review (team, testimonials, two demo articles); remove once real content is in |
   | `REVALIDATE_SECRET` | Optional, `openssl rand -hex 32` |

4. **R2 CORS.** Add `https://ethicaiau1.netlify.app` to `AllowedOrigins` in the bucket's CORS rule (§2), otherwise uploading images in the admin fails in the browser.
5. **Deploy** (*Deploys → Trigger deploy → Deploy site*). The build log shows `▶ Applying database migrations`, `▶ Creating the first admin…`, `▶ Adding demo content…` and `▶ Building the site`.
6. **First sign-in.** Open `/admin`, sign in with the bootstrap email and password, and change the password under *Account*. Then **delete `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` and (once real content is in) `SEED_DEMO_CONTENT`**. The bootstrap never touches an existing site, but a password shouldn't sit in the dashboard, and demo content that you delete returns on every build while `SEED_DEMO_CONTENT` is on.
7. In *Site settings*, enter the Elfsight widget ID, Substack URL, TikTok handle and YouTube channel (see `docs/WEEKLY-RUNBOOK.md`).

If the build stops at `▶ Checking environment variables`, the log lists every variable that is missing or wrong (names only, never values). Add them, making sure each has the **Builds** scope and applies to all deploy contexts, then trigger a new deploy. If it fails at the migration step, the log names the cause: usually a wrong `DATABASE_URI` (check the password's encoding, the project reference in the user name, and that it is the session pooler). Re-running a deploy is safe: migrations apply once, and the bootstrap and seed only create what is missing.

## 4. Scheduled functions (only if Milestone 7 YouTube auto-sync is built)

`netlify.toml`:
```toml
[[functions]]
path = "/api/sync-youtube"
schedule = "@daily"   # or "0 6 * * 1" for Monday 6am UTC
```
The handler must forward `CRON_SECRET` validation to the Payload route (or call the Local API directly per Netlify's Payload pattern). Keep the route idempotent (upsert by `videoId`).

## 5. Domain cutover from Squarespace (do this last, carefully)

Current state: `ethicai.au` points at Squarespace. **Critical: check where email for the domain lives before touching DNS** (Squarespace email via Google Workspace? Another registrar?). If MX records exist, they must be copied across untouched or client email dies.

1. In Netlify: Domain management → add `ethicai.au` + `www.ethicai.au`. Netlify will show the DNS records it wants (A `75.2.60.5` / CNAME or Netlify DNS nameservers — prefer **keeping the existing registrar and setting records** over moving nameservers, unless the registrar makes it painful).
2. Where is the `.au` domain registered? (Squarespace Domains, or a registrar like VentraIP/Crazy Domains/GoDaddy.) You'll edit DNS there.
3. Copy current DNS records first (screenshot/export): note MX, TXT (SPF/DKIM — email deliverability!), any `_acme-challenge`.
4. Set the Netlify A/CNAME records; **preserve MX + SPF/DKIM TXT records exactly**; let www canonicalise to one apex form (client's current site uses `www` — match it: canonical `https://www.ethicai.au`, redirect apex → www).
5. TLS: Netlify auto-provisions Let's Encrypt once DNS resolves. Verify both hostnames.
6. Keep the Squarespace site alive (paused, not deleted) for ~30 days as a rollback + content source. Cancel only after sign-off.
7. Post-cutover: check `netlify.toml`/`next.config` 301 redirects for any old URLs that were indexed (search `site:ethicai.au` in Google to see what exists).

## 6. Launch smoke checklist (production)

- [ ] `https://www.ethicai.au` + apex both load, TLS valid, canonical/OG tags correct (validate with a social debugger)
- [ ] `/admin` login works for admin + editor roles; editor restrictions hold
- [ ] **Upload an image in prod admin → verify it lands in R2 and renders** (the #1 Netlify failure point — test explicitly)
- [ ] Publish a test article (then unpublish): appears on Home + listing, draft preview works, revalidation is prompt
- [ ] `/watch`: YouTube facade plays; TikTok Elfsight widget loads **after click** only; fallback shows if widget ID removed
- [ ] `/newsletter`: recent issues pulled from real Substack RSS; subscribe CTA lands on Substack
- [ ] Contact form submits (Netlify Forms dashboard shows entry); honeypot rejects bots
- [ ] `sitemap.xml` + `robots.txt` correct (`/admin` and `/api` disallowed)
- [ ] Lighthouse mobile on Home + one article: Perf ≥ 90, A11y ≥ 95, SEO ≥ 95
- [ ] Mobile pass on real device (320px width too)
- [ ] Client email still sends/receives (DNS MX/TXT intact) — ask client to confirm
- [ ] Old Squarespace URLs you care about 301 correctly
- [ ] Error monitoring: Netlify notifications on; consider Sentry free tier or Netlify's error detection
- [ ] Hand over: admin credentials (2 users), this doc, runbook

## 7. Backups & ongoing ops

| What | How | Frequency |
|---|---|---|
| Database | Neon PITR / Supabase daily backups (built-in) | Automatic |
| Database (extra) | `pg_dump` via GitHub Action to R2 | Weekly |
| Media | R2 object versioning ON (cheap insurance) | Automatic |
| Code | GitHub (source of truth) | Continuous |
| Substack list | Export CSV from Substack | Monthly |
| Secrets rotation | `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET` | Every 6–12 months |

Netlify plan notes: free tier = 100 GB bandwidth, 300 build min/mo — plenty at launch. Move to Pro (~US$19/mo) only when needed. Watch function invocation limits if the Elfsight facade or form traffic spikes.

## 8. Rollback plan

- **Code:** Netlify deploys list → "Publish deploy" on the last known-good build (instant).
- **DB:** migrations are forward-only in practice; if a migration breaks prod, restore PITR (Neon) or point-in-time (Supabase) and re-deploy previous build. This is why migrations are committed + reviewed before applying (spec §11.5).
- **DNS:** revert A/CNAME to Squarespace values (keep them documented in the repo under `docs/dns-cutover.md`).
