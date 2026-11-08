# Session handover: EthicAI website

Working notes for the next coding session, last updated 6 November 2026 (after Phase 5 and the review-deploy preparation). **Delete this file before merging to `main`.**

Read `AGENTS.md` and `docs/BUILD-SPEC.md` first. They are the source of truth; this file only records where things stand and what earlier sessions learnt the hard way.

## 1. Where things stand

- Repo `dhynesmnk-cyber/ethicai`, branch `claude/confident-feynman-bep01v`, **PR [#1](https://github.com/dhynesmnk-cyber/ethicai/pull/1)** (open). Do not open another PR; keep updating #1's title and body at each phase (what / why / how verified / criteria checked / open items). The user does **not** want PR activity subscriptions.
- Phases 0–5 of BUILD-SPEC §10 are built and verified in the sandbox and are waiting on the owner's review. Phase 5's "no demo content remains" is **not** met: the two demo articles stay until the maintainer supplies real ones. The sandbox has no route to Netlify, so the review site at `https://ethicaiau1.netlify.app` is **prepared, not deployed**: the owner connects the repo and sets the variables (`docs/DEPLOYMENT-NETLIFY.md` §3a). **Phase 6** (launch) comes next, and only when the user says so (the spec stops at each ✅ checkpoint).
- Last verified (Phase 5): lint, typecheck and Prettier clean; 139 unit tests; 62 e2e tests pass (5 opt-in skipped); `npm run build` passes. The 5 production-build revalidation tests pass on `next build && next start` (`E2E_REVALIDATION=1`, see below). The Netlify build sequence (migrate → bootstrap admin → seed → build) was run against an empty local database and served the seeded site. Lighthouse wasn't re-run in Phases 4 or 5: the public pages changed only by the slim Home strip, and Phase 5 is admin-side.

| Phase | Content | State |
|---|---|---|
| 0 | Scaffold, R2 storage, tooling | done |
| 1 | Data model, access control, preview, seed | done |
| 2 | Design system, shell, `/kitchen-sink` | done |
| 3 | Public pages, SEO | done |
| 4 | Elfsight TikTok feed, Substack, revalidation | done (awaiting review) |
| 5 | Admin polish, real content | built (real content pending) |
| 6 | Netlify deploy | review deploy prepared; launch to do |
| 7 | Optional extras | to do |

## 2. Waiting on the user

0. **Deploy the review site** (`docs/DEPLOYMENT-NETLIFY.md` §3a): a Supabase **session pooler** string, the Netlify site (`ethicaiau1`) connected to this branch, the environment variables (including `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` and `SEED_DEMO_CONTENT=true`), and `https://ethicaiau1.netlify.app` added to the R2 CORS rule. After the first sign-in: change the password, delete the bootstrap variables and, once real content is in, `SEED_DEMO_CONTENT`.
1. **R2 CORS rule: fixed (8 November).** The owner rewrote the rule (origins `http://localhost:3000` and `https://ethicaiau1.netlify.app`, methods `GET`, `PUT`, `HEAD`, headers `*`) and the preflight from the sandbox now returns `204` with `access-control-allow-origin` for both origins. Before that it returned `403` for every origin (checked 6 November). A real browser upload through the admin has **not** been tried yet: do that on the review site. The bucket token can't read the rule back (`GetBucketCors` is `AccessDenied`), so this probe is the way to check it, from a session on the "Ethicai" environment or any machine with the values:
   ```bash
   H=$(node -e "console.log(new URL(process.env.S3_ENDPOINT).origin)")
   curl -sS -o /dev/null -D - -X OPTIONS "$H/$S3_BUCKET/cors-probe.jpg" -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: PUT" -H "Access-Control-Request-Headers: content-type,if-none-match" \
     | grep -iE "^HTTP/1.1 [0-9]+ [A-Z]|^access-control-allow"
   ```
   Success is a `200` or `204` with `access-control-allow-origin`. `npx wrangler r2 bucket cors list ethicai-media` shows what R2 has saved. The production bucket needs its own rule (`docs/DEPLOYMENT-NETLIFY.md` §2).
2. **Review of Phases 3, 4 and 5.**
3. **Open decisions** (unchanged from Phase 3):
   - Make Home/About copy editable in the admin? It lives in `src/content/site-copy.ts` (code). Suggested: a small "Page copy" global. **Not built in Phase 5** (it needs a migration and the user hasn't answered); AGENTS.md calls a code-only content change a design bug, so it is worth doing before launch.
   - JS budget: about 150 KB gzipped on an article page against the spec's 120 KB target (roughly 115 KB is Next 16 + React 19 itself). Is the target firm?
   - Client sign-off on the three "what we do" texts on Home, the privacy policy template (not legal advice) and the full team bios.
4. **Integration values**, all entered by an admin in *Site settings* (not env), none known yet: Elfsight TikTok widget (and who pays: the free plan is about 200 views a month), Substack publication URL, TikTok handle, YouTube channel URL. Everything degrades gracefully without them.

## 3. What Phase 4 built

- **Elfsight facade** (`src/lib/elfsight.ts`, `src/components/feed/ElfsightTikTok.tsx`, `/watch` only). Embed markup checked against Elfsight's current install code: `https://elfsightcdn.com/platform.js` plus `<div class="elfsight-app-<uuid>">` (the spec's `data-eapps-link` / `static.elfsight.com` are older). The admin field accepts the bare ID or the whole install code and stores only the lower-case UUID (`beforeValidate` hook + `validate`); the page re-checks it before rendering. On click: focus moves to the feed region, a status message announces loading, the script is added once. If the script fails, or nothing renders within 15 s, the curated TikTok cards show with a focused notice. Checked against the real Elfsight script with a made-up ID: it requests `elfsightcdn.com` and `core.service.elfsight.com`, renders nothing, and the fallback appears. **Not seen with a real widget**, so it's unconfirmed that Elfsight renders inside our container (rather than replacing it); check that first once a widget ID exists.
- **Substack:** fixtures moved to `tests/fixtures/rss/` (`substack.xml` copies a real Substack feed's structure with made-up content). The parser was checked against three live Substack feeds (`on.substack.com` plus two custom-domain publications) and `/newsletter` rendered real issues from one in the sandbox. Fixed: a blank `<description>` now falls back to the post body. Substack feeds are 0.5–1 MB (full post bodies); Next won't cache a fetch over 2 MB, but the page itself is cached for an hour either way.
- **Revalidation:** publishing still goes through the Payload hooks (direct `revalidatePath`). New `POST /api/revalidate` (Bearer `REVALIDATE_SECRET`, off/404 without it) for scripts and manual refreshes; `// DECISION:` in the route explains the split. Proof on `next start`: an article published through the API showed on the cached Home 0.3 s later, and unpublishing removed it (article page 404); an article written by a script with `disableRevalidate` stayed off Home until one `POST /api/revalidate`.
- `NEXT_PUBLIC_ELFSIGHT_TIKTOK_ID` / `NEXT_PUBLIC_SUBSTACK_URL` are deliberately not used (siteSettings only); `.env.example` says so. BUILD-SPEC Appendix B still lists them as fallbacks, so the spec and the code disagree; AGENTS.md rule 2 says siteSettings, and the code follows that. Confirm with the owner, then fix whichever is wrong.
- **TikTok handle:** validated when saved (optional `@`, letters, numbers, full stops, underscores, 24 characters at most) and `encodeURIComponent`-ed in the `/watch` link. Covered by `tests/e2e/tiktok-handle.e2e.spec.ts`.
- **Home newsletter strip:** a slim `<SubscribeCTA variant="slim" />` sits between the watch strip and the testimonials (one line and a button, so the page isn't a wall of calls to action).
- **Video facade focus ring:** the play button's outline is drawn inside the thumbnail (`outline-offset-[-6px]`, white), because the container's `overflow-hidden` clipped it. A computed-style check in `kitchen-sink.e2e.spec.ts` guards it.
- **Elfsight script URL: unresolved.** The code loads `https://elfsightcdn.com/platform.js`; BUILD-SPEC §7 and `react-elfsight-widget` use `https://static.elfsight.com/platform/platform.js`. Elfsight's own docs name both hosts in different places. Settle it by copying the install code from the owner's Elfsight dashboard (the admin field accepts the whole snippet) and updating `ELFSIGHT_PLATFORM_SRC` in `src/lib/elfsight.ts` if it differs.

### Proving revalidation on a production build

`next dev` never caches, so this is opt-in and needs a built server:

```bash
npm run build && npx next start          # leave running on port 3000; needs REVALIDATE_SECRET in .env
E2E_REVALIDATION=1 npm run test:e2e -- tests/e2e/revalidation-cache.e2e.spec.ts tests/e2e/revalidate.e2e.spec.ts
```

Expect 4 passed. The spec publishes and deletes an article and a featured video through the running site's REST API and polls Home and `/articles` (within 15 s; in practice under a second), then writes an article with revalidation off and shows Home stays stale until `POST /api/revalidate`. Everything it creates is deleted afterwards. Last run: 6 November 2026, passed twice in a row.

## 3b. What Phase 5 built

- **"This week" dashboard panel** (`src/components/admin/ThisWeek.tsx`, registered as `beforeDashboard`; styles in `src/app/(payload)/custom.scss`): drafts waiting (counts articles whose latest version is a draft, so live articles with unpublished edits count), the latest published article with how long ago it went live, New article / New video buttons, and the weekly checklist with an optional link from `NEXT_PUBLIC_RUNBOOK_URL` (web links only; `src/lib/this-week.ts`). It queries as the signed-in user. A future-dated article is flagged, because the site has no scheduling.
- **Help text:** every editor-facing field has an `admin.description`; `tests/unit/admin-help-text.test.ts` fails if a new field has none.
- **Markdown paste** (`src/fields/markdownPaste/`, a Lexical feature; rules in `src/lib/markdown-paste.ts`): pasting plain Markdown into the article body becomes headings, lists, quotes, bold and links. Rich pastes (Word, Google Docs, web pages) and ordinary text are left to the editor; Markdown copied from a code editor still converts. After changing the feature list run `npm run generate:importmap` and commit the result: `next dev` rewrites `importMap.js` when the config changes, so check the file still lists `MarkdownPasteFeatureClient`.
- **Slug:** autosave fills the article slug a few seconds after the title, and publishing before then is refused ("The following field is invalid: Slug"). The field's help text says to wait; the e2e test waits for it.
- **Video changes refresh linked articles** (edit and delete). Deleting needed the paths found in `beforeDelete`, and Payload gives the two delete hooks different `context` objects, so they travel in a `WeakMap` keyed by the request. This only showed up on a production build (`tests/e2e/revalidation-cache.e2e.spec.ts`).
- **Editor weekly workflow e2e** (`tests/e2e/weekly-workflow.e2e.spec.ts`): dashboard → new video → new article (hero from the library, Markdown pasted, video linked) → publish → a visitor sees it on Home, Articles, the article page and /watch. It takes about ten seconds scripted, so it proves the flow works, **not** that a person does it in under ten minutes (the runbook estimates 10–15 minutes for step 3; time a real run before calling that criterion met). `deleteTestUser` now removes a user's autosaved drafts.
- **Review-deploy support:** `netlify.toml` → `scripts/netlify-build.mjs` (migrate → `scripts/bootstrap-admin.ts` → optional seed → build, migrations and seed run as production); `isReviewSite()` (`src/lib/site-url.ts`) makes a `*.netlify.app` site non-indexable (`robots.txt` and `noindex`) and turns itself off on the real domain. The bootstrap admin exists because a fresh database leaves Payload's "create first user" open to whoever reaches `/admin` first (it returns 403 and redirects once a user exists) and because the seed's articles need an author.

## 4. Sandbox bootstrap (a fresh container each session)

Check which cloud environment the session is on first (`get_environment`):

- **"Ethicai"**: limited network (`*.r2.cloudflarestorage.com`, `*.r2.dev` plus package registries) and the five `S3_*` variables. Since 6 November 2026 it has a **setup script** (stored on the environment, not in the repo; the environment menu in the session's title bar, then Edit, shows it). It installs Node 22.23.4 (checksum-verified) into `/opt/node22`, Postgres 16 with a local-only `ethicai` role and database, runs `npm ci`, writes a git-ignored `.env` with a random `PAYLOAD_SECRET`, and installs the proxy shim. A failed step prints `setup: WARNING: ...` and never blocks the session. It had not yet run on a genuinely fresh container when this was written, so check its work: `node -v` (v22.23.4), `pg_lsclusters` (16 main online), `test -f .env`, `ls /home/user/.sandbox-ethicai/proxy/node_modules` (global-agent). It does **not** run migrations (they need the `S3_*` variables, which the script can't see): run `npm run migrate` yourself, and after a container restart `pg_ctlcluster 16 main start`. If a check fails, tell the user the script needs fixing and use the manual commands below.
- **"Personal"** (the Phase 4 session ran here): open network access, no `S3_*` variables and no setup script. Run the manual commands below and use the local S3 stand-in instead of R2.

Manual setup:

```bash
# Node >= 22.23.4 is required (Payload 3.92). Check `node -v`; the Phase 4 image already had it.
# If not: download node-v22.23.4-linux-x64.tar.xz from nodejs.org, check SHASUMS256, unpack to /opt/node22.

# Local Postgres 16 (no outside database is reachable from the sandbox)
apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y -q postgresql
pg_ctlcluster 16 main start   # also needed after any container restart
su postgres -c "psql -c \"CREATE ROLE ethicai LOGIN PASSWORD 'ethicai' CREATEDB;\" -c 'CREATE DATABASE ethicai OWNER ethicai;'"

cd /home/user/ethicai && npm ci
printf 'PAYLOAD_SECRET=%s\nDATABASE_URI=postgres://ethicai:ethicai@127.0.0.1:5432/ethicai\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\nREVALIDATE_SECRET=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > .env   # git-ignored
npm run migrate
```

**Without R2 ("Personal" environment): local S3 stand-in.** MinIO no longer publishes binaries (HTTP 410), so use moto. Keep the default `us-east-1` region; it's in-memory, so re-create the bucket after a restart.

```bash
cd /home/user/.sandbox-ethicai && python3 -m venv moto-venv && ./moto-venv/bin/pip install -q 'moto[server]'
nohup ./moto-venv/bin/moto_server -H 127.0.0.1 -p 4566 > moto.log 2>&1 &
curl -sS -X PUT http://127.0.0.1:4566/ethicai-media
curl -sS -X PUT 'http://127.0.0.1:4566/ethicai-media?policy' -H 'Content-Type: application/json' \
  -d '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::ethicai-media/*"}]}'
printf 'S3_BUCKET=ethicai-media\nS3_REGION=us-east-1\nS3_ENDPOINT=http://127.0.0.1:4566\nS3_ACCESS_KEY_ID=sandbox\nS3_SECRET_ACCESS_KEY=sandbox\nS3_PUBLIC_URL=http://127.0.0.1:4566/ethicai-media\n' >> /home/user/ethicai/.env
```

**Proxy shim** (Node's `fetch` and the AWS SDK ignore the sandbox proxy; needed for R2 and for real Substack feeds):

```bash
mkdir -p /home/user/.sandbox-ethicai/proxy && cd /home/user/.sandbox-ethicai/proxy && npm init -y >/dev/null && npm i global-agent@3.0.0
export NODE_USE_ENV_PROXY=1
export NODE_OPTIONS="--no-deprecation --use-openssl-ca --require /home/user/.sandbox-ethicai/proxy/node_modules/global-agent/bootstrap"
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium   # see below
cd /home/user/ethicai && nohup npx next dev > /home/user/.sandbox-ethicai/dev.log 2>&1 &
```

- Start the dev server with `npx next dev`, **not** `npm run dev`: the npm script resets `NODE_OPTIONS` and drops the shim.
- Create the first admin with `curl -X POST localhost:3000/api/users/first-register -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"…","name":"Sandbox Admin"}'`, then seed with the same `NODE_OPTIONS`: `npx payload run scripts/seed.ts`.
- **Playwright:** the project pins `@playwright/test` 1.56 (Chromium build 1194), but the Phase 4 image shipped build 1243 only, so every test failed instantly with "Executable doesn't exist". `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (now read by `playwright.config.ts`) fixes it. Never run `playwright install`. Start the dev server first, then `npm run test:e2e -- --trace off`.
- **Standalone Playwright scripts that need the internet** (e.g. loading the real Elfsight script): pass `args: ['--proxy-server=https=127.0.0.1:<proxy port>']`. Playwright's `proxy` option also sends `http://localhost` through the proxy, which only accepts CONNECT and answers 405.
- **Stopping processes:** never `pkill -f`/loop over `/proc` with a pattern that also appears in your own command line; it kills your shell (exit 144). Find the PID (`ss -ltnp`, or list `/proc/*/cmdline`) and `kill <pid>`. `next start` shows up as `next-server (v16.4.2)`, the same as `next dev`, so check the port.
- One-off scripts that import the Payload config must live inside the repo (to resolve `node_modules`; use the git-excluded `.review/`, but keep `.js`/`.ts` files out of it or ESLint and Prettier will pick them up) and run with `npx tsx --env-file=.env`.
- `.env` is local only and git-ignored. Never commit secrets or print the S3 values, the R2 account ID or the public bucket URL; before every commit, scan what you staged for them.
- Next 16 differs from older training data. Version-matched docs are in `node_modules/next/dist/docs/`.

## 5. Things earlier sessions learnt

- **The Local API skips access control.** Every public query in `src/lib/queries.ts` filters to published content itself; keep doing that.
- **Context objects for scripts.** Scripts and tests that call Payload outside Next pass `context: { disableRevalidate: true }`, and must use a *fresh object per call*: the storage plugin leaves a `skipCloudStorage` flag on a shared one. `tests/helpers/settings.ts` (`withSiteSettings`) changes siteSettings for a test and restores it.
- **After changing collections or the config:** `npm run generate:types`, `npm run generate:importmap` and `npm run migrate:create -- <name>`. Check the generated `down`. Field `validate`/hooks and admin descriptions need no migration (the dev server regenerates `payload-types.ts` comments by itself).
- **Prettier rewrites files**, so editing right after a format run can fail with "modified since read". Re-read first.
- **Tailwind 4:** the theme is in `src/app/(frontend)/globals.css` (`@theme static`; only the brand tokens exist). The accent is under 3:1 against `ink`, so don't put accent buttons or focus rings on dark cards.
- **Every page sets metadata through `pageMetadata()`** (`src/lib/seo.ts`).
- **Client components are deliberately few:** `SiteNav`, `Facade`, `ShareLinks`, `ContactForm`, `LivePreviewListener`, `ElfsightTikTok`. Keep it that way.
- **Playwright:** call `gotoHydrated()` before clicking client-side controls; `role="alert"` also matches Next's route announcer, so filter by text. `page.clock.install()` + `fastForward()` works for timeouts.
- **Revalidation can only be proven on `next build && next start`**; `next dev` never caches. `/articles` and `/watch` are dynamic (they read `searchParams`); Home, About, Newsletter, Contact, Privacy and article pages are cached for an hour.
- **Sandbox quirks:** Next's image optimiser can't fetch R2 (or the local stand-in) here, so `/_next/image` fails in the sandbox (fine on Netlify). YouTube thumbnails are blocked on "Ethicai".
- **Screenshots:** the user only sees files sent with `SendUserFile`. Local review images go in `.review/` (git-excluded locally via `.git/info/exclude`; add the line again in a fresh clone).
- **Git:** conventional commits, one logical change each, with the attribution lines the session's reminder specifies. GitHub work uses the `mcp__github__*` tools (load them with ToolSearch); there is no `gh` CLI.
- **How the user likes to work:** a short status at each checkpoint with explicit decisions to make, honest about what couldn't be verified, Australian English throughout, and the PR description updated rather than a new PR.

## 6. Repo map

- `src/payload.config.ts`: collections, `siteSettings` global, S3 adapter (`clientUploads: true`, 20 MB). Do not reorder plugins or swap the adapter.
- `src/collections/`, `src/globals/SiteSettings.ts`, `src/access/`, `src/blocks/YouTube.ts`, `src/fields/articleEditor.ts`.
- `src/app/(frontend)/`: the pages, `sitemap.ts`, share images, `kitchen-sink/` and `media-check/` (**both temporary, remove before launch**). `src/app/robots.ts`, `src/app/api/{preview,exit-preview,revalidate}`.
- `src/components/{ui,layout,feed,newsletter,blocks,icons}`, `ContactForm.tsx`, `JsonLd.tsx`, `OgImage.tsx`.
- `src/lib/`: `queries`, `rss`, `elfsight`, `revalidate`, `revalidate-request`, `seo`, `structured-data`, `storage`, `video-url`, `reading-time`, `site-settings`, `redirects`, and others.
- `src/content/site-copy.ts`: Home/About copy. `public/__forms.html`: the Netlify Forms declaration (keep in step with `ContactForm.tsx`).
- `scripts/seed.ts` (idempotent; don't re-run on production), `src/migrations/` (two so far), `tests/{unit,e2e,helpers,fixtures}`.

## 7. Decisions already made (don't reopen without cause)

Netlify stays. Uploads go browser → R2 by signed URL (Netlify Functions cap bodies at about 4.5 MB); 20 MB limit, raster images only. Fonts are self-hosted (Inter, Fraunces). Only R2 and `i.ytimg.com` are `next/image` hosts (Elfsight renders its own images, so none added). Header "Subscribe" goes to `/newsletter`. The article ↔ video link is stored once, on the article (`relatedVideo`). TikTok cards need an uploaded thumbnail. Integration values live in siteSettings, never env. Publishing revalidates through hooks; `/api/revalidate` is only for out-of-band changes. Production needs its own R2 bucket and CORS rule.

## 8. Not yet verified

- A browser upload straight to R2 (the preflight passes now, see §2.1; the upload itself hasn't been tried).
- **Anything on Netlify:** the build itself (Next 16 on Netlify's Next.js runtime), the Supabase session-pooler connection, Payload running as a function, `NODE_VERSION` 22.23.4 for the build (Lambda's own Node 22 patch version may be older; Payload only declares this in `engines`). None of it could be reached from the sandbox.
- A real person timing the weekly workflow (§3b), and Lighthouse on the current build.
- The Elfsight widget with a **real** widget ID (only stubbed, and the real script with a made-up ID).
- EthicAI's own Substack feed (other live Substack feeds parse correctly).
- `next/image` rendering R2 images through the optimiser; `E2E_MEDIA_UPLOAD=1 npm run test:e2e` covers it on a machine with normal network access.
- YouTube thumbnails, a real Netlify Forms submission, and anything on Netlify itself (Phase 6). Lighthouse numbers are from a local production build.

## 9. After Phase 5

- **Still open from Phase 5:** real content in place of the two demo articles (acceptance: no demo content remains), the page-copy decision, a timed weekly-workflow run by a person, and the JS budget question. The Markdown converter, dashboard panel, help-text pass and linked-article revalidation are done.
- **Phase 6** (`docs/DEPLOYMENT-NETLIFY.md`): Supabase in Sydney (transaction pooler for Netlify; session pooler for running migrations from a machine), production bucket and CORS, `DATABASE_URI` at build time, `REVALIDATE_SECRET` if wanted, a 15–20 MB upload test, a real form submission, Elfsight on production after a click, the domain cutover (keep MX/SPF/DKIM untouched), old-URL redirects, and removing `/media-check` and `/kitchen-sink`.
- **Other open items:** swap the wordmark and placeholder favicon for the client's logo; `npm audit` still shows high/moderate issues in packages Payload depends on (`braces`, `esbuild`), with no upstream fix and none handling visitor input.
