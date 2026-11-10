# Session handover: EthicAI website

Working notes for the next coding session, last updated 10 November 2026 (after the photography revision of the family redesign; Phase 5 notes below still apply). **Delete this file before merging to `main`.**

Read `AGENTS.md` and `docs/BUILD-SPEC.md` first. They are the source of truth; this file only records where things stand and what earlier sessions learnt the hard way.

## 1. Where things stand

- **Photography revision (10 November 2026), branch `claude/determined-cerf-s9l7ne`**, stacked on the family redesign's head (`d796f79`, branch `claude/peaceful-sagan-9iylgh`). The owner found the redesign too much like a generic SaaS/AI website: the counters (stats strip) and the AI-site tropes are gone, every main page now opens on a photograph of Australian native trees (as selma.au uses Australian places), and "A.I." is written "AI". The why is `docs/REDESIGN-PLAN.md` §3a; what was built is §3d below. No PR was opened (the user hadn't asked). Merge order: PR #1, then `peaceful-sagan`, then this branch (it contains both).
- **Family redesign (10 November 2026), branch `claude/peaceful-sagan-9iylgh`**, stacked on PR #1's head (`673e508`). The owner asked for a more impressive design taken from selma.au (the client's product site) so Selma reads as part of the EthicAI family, links to selma.au, and current Google SEO and AI search (GEO) practice. The plan is `docs/REDESIGN-PLAN.md`; what was built is in §3c. It is built and verified in the sandbox; no PR was opened (the user hadn't asked). Merge order: PR #1 first, then this branch (or retarget it onto #1's branch).
- The live site is still **Squarespace on ethicai.au** (apex redirects to www). The new build runs only at `https://ethicaiau1.netlify.app` (noindex). The owner chose **`https://ethicai.au` (apex) as the canonical address** for the cutover.
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
| — | Family redesign, SEO and GEO (`docs/REDESIGN-PLAN.md`) | built on `claude/peaceful-sagan-9iylgh`, awaiting review |

## 2. Waiting on the user

**From the family redesign** (defaults in place until answered, each marked `// DECISION:` where it lives in code):

- **Client sign-off on new copy:** the Home FAQ answers, the press list (IT Brief and SecurityBrief, June 2026), the four services (from the old /services, /academy and /publicsector pages) and the Services "how we work" steps. All of it is editable in *Page copy*, *Services* and *Site settings*.
- **Where the old campaign pages go:** `/bootcamp`, `/movement`, `/startmate` and `/moodi` redirect to `/services`; the AI Academy shop pages (`/aiacademy/p/*`) and `/cart` go to `/services/academy` and `/`. The shop is e-commerce, out of scope here: keep it on a subdomain or another platform if it's still selling.
- **Logo files** (EthicAI and Selma, SVG) and a favicon. `public/logo.png`, `icon.svg` and the header wordmark are placeholders.
- **Photography:** nine Creative Commons photos of Australian native trees are bundled as defaults (`src/lib/photography.ts`, credited on `/photo-credits`). Does the client want their own photos, or a commissioned shoot? Each place can be replaced in *Page copy → Photos* (Home in *Home → Hero*). Keep the footer's "Photo credits" link while any bundled photo is in use: the CC licences require the attribution.
- **The proof points from the removed stats strip** (6M+ TikTok views, the Global AI Impact Summit delegation, Governance Institute of Australia board training, Selma in pilot) are no longer anywhere on the site. If the client wants them, they read better as a sentence in the About story (*Page copy → About*) than as counters.
- **Simon Brock's role:** the review database still says "Digital agency leader"; the press calls him Partner and Chief Product Officer, selma.au says Co-founder. The seed now uses "Partner and Chief Product Officer" for new databases only.
- **Team LinkedIn URLs** for *Team members* (they feed the Person structured data).
- **User accounts for Kara and Katriel**, linked to their team profiles (*Users → Profile*), before running the Squarespace import against production, so the old posts keep their bylines.
- **selma.au:** send `docs/SELMA-SEO-HANDOFF.md` to whoever maintains it.

**From earlier phases:**

0. **Deploy the review site** (`docs/DEPLOYMENT-NETLIFY.md` §3a): a Supabase **transaction pooler** string (port 6543; the session pooler ran out of connections on the review site, see §8), the Netlify site (`ethicaiau1`) connected to this branch, the environment variables (including `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` and `SEED_DEMO_CONTENT=true`), and `https://ethicaiau1.netlify.app` added to the R2 CORS rule. After the first sign-in: change the password, delete the bootstrap variables and, once real content is in, `SEED_DEMO_CONTENT`.
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

## 3c. What the family redesign built

See `docs/REDESIGN-PLAN.md` for the why. Thirteen commits on top of PR #1 (`git log 673e508..`), each one logical change:

- **Content model** (migration `20261110_165153_family_redesign`): a *Page copy* global (Home hero, statement, stats, FAQ, press; About; Services intro and steps), Site settings tabs *Selma & family*, *Organisation* and *Search*, a *Services* collection (`/services`, `/services/<slug>`), team LinkedIn and credentials, users → team profile, article key takeaways.
  - The migration only adds tables and columns, then fills empty fields from `src/content/defaults.ts` through `src/content/apply-defaults.ts`, which the seed also calls. It never overwrites anything.
  - The generated `down` failed on a constraint already dropped by `CASCADE`, so it uses `IF EXISTS`. Up, down and up again were checked.
  - `src/content/site-copy.ts` is gone (the open "page copy" decision is done).
- **Design system** (selma.au's): night/ink/mist/indigo tokens, Plus Jakarta Sans and JetBrains Mono via `next/font/local`.
  - Dark hero (`DarkHero`, `PageIntro`) with a CSS aurora and the `RingMark` drawing in. The header is transparent over a dark hero (`body:has(.hero-dark)`) and turns to glass with a scroll-driven animation; there is no JavaScript.
  - Family bar, a Selma menu link, the Meet Selma showcase, and a night footer with an EthicAI family column, ABN and Acknowledgement of Country.
  - The new components are in `src/components/family/`. Client components are unchanged.
- **Pages:** Home rebuilt; new Services pages; About, Articles, Watch, Newsletter, Contact and Privacy restyled with breadcrumbs. Articles gain key takeaways and an author box (when the user is linked to a profile); the automatic "Updated" date was removed because imported posts would all show the import date.
- **Squarespace import:** `scripts/import-squarespace.ts` brings in the 7 /insights posts with their original slugs, dates, authors and header images. It is idempotent and must run against production *before* the cutover. The converter is `src/lib/html-to-markdown.ts`.
- **SEO:**
  - One linked set of JSON-LD: Organization `…/#organization` owns Product `https://selma.au/#product`, plus WebSite, founders, WebPage, BreadcrumbList, FAQPage, Person, Service and Article.
  - Entity-naming titles; verification codes from settings; sitemap with services, dates and images; AVIF.
  - `fetchPriority="high"` hero images (Next 16 deprecates `priority`).
  - Redirects for all 27 Squarespace URLs (`src/lib/redirects.ts`, fixture `tests/fixtures/squarespace/sitemap-paths.txt`).
- **GEO:**
  - robots.txt names AI search and training crawlers and follows *Site settings → Search* (allow-all by default; `src/lib/robots.ts`).
  - `/llms.txt`, `/llms-full.txt` and `/articles/feed.xml`.
  - IndexNow on publish (`src/lib/indexnow.ts`; off without `INDEXNOW_KEY`, on review sites and locally).
- **Docs:** cutover steps for the apex domain and the import (`DEPLOYMENT-NETLIFY.md` §5–6), `SELMA-SEO-HANDOFF.md`, an "answer first" check in the runbook, and BUILD-SPEC §6.
- **Verified** (sandbox, 10 November):
  - lint and typecheck clean; 224 unit tests; full e2e suite 107 passed, 5 opt-in skipped; `npm run build` passes.
  - New e2e tests: Selma links, header colour over the hero and after scrolling, FAQ from the keyboard, reduced motion, every JSON-LD reference resolves, and all 28 old URLs ending on a 200.
  - Lighthouse mobile on the production build: Home 100/100/100/100 (LCP 0.9 s, CLS 0); article 96/100/100/100 (CLS 0). The article's *simulated* LCP is 2.8 s against the 2.5 s target, while the observed LCP was 0.14 s and the image starts at 43 ms with high priority. Lighthouse's slow-4G model counts the framework scripts (about 160 KB) as competing with the image. Re-check on Netlify, where its image CDN serves `next/image`.

## 3d. What the photography revision built

Why and what was removed: `docs/REDESIGN-PLAN.md` §3a. On top of `d796f79`:

- **Photos:** `src/assets/photos/` (nine JPEGs, 1920 px wide, Home 2400 px; 4.4 MB in all), registered with alt text, crop position and TASL credit in `src/lib/photography.ts`. `photoFor(copy, slot)` returns the editor's upload if there is one, else the default. Static imports, so `next/image` gets sizes and a blur placeholder and serves AVIF/WebP.
- **Components:** `PageHero` (replaces `DarkHero`; plain light header when there's no photo), `Photo`, `PhotoBand`. `RingMark` and `StatsStrip` are deleted. `SelmaShowcase`, `Statement`, `NumberedSteps`, `PressStrip`, `SectionHeading` (no `eyebrow` prop now), `Card`, `SubscribeCTA`, `Footer`, `OgImage` and `icon.svg` restyled. JetBrains Mono is uninstalled.
- **CSS:** the aurora, grain, ring and rise/reveal animations and the `glass` and `eyebrow` utilities are gone from `globals.css`. The only animation left is the header turning to glass.
- **Content model** (migration `20261110_202619_photos_and_ai`): Page copy loses `stats` and gains a *Photos* tab (eight upload slots, `src/content/photo-slots.ts`); "A.I." becomes "AI" in every plain-text copy field; the starting copy is filled on an empty database. The `pageCopy` hook now also revalidates every page (photos appear site-wide).
- **Bug fixed on the way:** `family_redesign` filled the starting copy through the Local API, which reads the *current* config; once `page_copy` gained columns, a brand-new database could no longer be migrated (the query asked for `photos_about_id` before it existed). The fill now lives in the newest migration, guarded by "Page copy has never been saved" so databases that already had it are left alone, and `tests/unit/migrations.test.ts` fails if a newer migration is added without moving it.
- **`/photo-credits`**, linked from the footer and listed in the sitemap: title, author, Wikimedia Commons link and licence for each bundled photo still in use.
- **Sharpness on phones:** a photo cropped with `object-fit: cover` into a tall box renders wider than the screen, so `sizes="100vw"` made phones fetch a 750 px image and stretch it. `Photo` defaults to `(max-width: 640px) 150vw, 100vw` (200vw fetched 1920 px images and cost About ~1.5 s of LCP); the full-screen Home hero uses `(orientation: portrait) 80vh, 100vw`.
- **Weight:** photos behind text are encoded at quality 60 (`images.qualities: [60, 75]` in `next.config.ts`; Next 16 refuses other values). On a typical phone the hero is the 1200 px AVIF: 87 KB on Home, 111 KB on About.
- **Lighthouse mobile** (local production build, three runs each; the sandbox's CPU makes TBT swing 110–750 ms between identical runs): About 96–97 performance, LCP 2.5–2.6 s; Home 72–90, LCP 2.6–3.5 s; accessibility, best practices and SEO 100 on both; CLS 0. Home's LCP used to be the headline (0.9 s); now it's the photo. The photo itself arrives fast (observed: TTFB 18 ms, load 24 ms, painted about 0.3 s in), but Lighthouse's slow-phone model adds the framework JavaScript that runs before it paints ("render delay" ≈ 2.5 s), the same artefact §3c notes for article pages. **Home's simulated LCP is over the 2.5 s budget**; re-measure on Netlify (its image CDN serves `next/image`) before deciding whether it needs work.
- **Legibility:** the hero fades were tuned until white text measured at least 4.5:1 against the 90th-percentile brightest pixel behind every line of hero text and every menu link, on all seven photo pages at 375 and 1440 px (a Playwright + sharp check; the text hidden, the background sampled).

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

- **The dev server records a `dev` row in `payload_migrations`** (batch −1) when it pushes the schema. `npm run migrate` then stops to ask about it. If no schema change was pushed, delete the row (`delete from payload_migrations where name='dev' and batch=-1`) before migrating. Stop the dev server before `migrate:create`.
- **`ss` isn't installed** in this image: find the dev server's PIDs through `/proc/*/cmdline` (and see the warning above about patterns in your own command line).
- **Full-page screenshots** need `reducedMotion: 'reduce'`, or the scroll-driven `.reveal` blocks below the fold come out invisible.
- **Payload's generated `down` migrations** can fail when a `DROP TABLE … CASCADE` already removed a constraint that a later line drops again; use `IF EXISTS`.
- **`payload migrate:down` rolls back the whole last batch**, not one migration. On a database where everything ran in one batch, that's every table. To test one migration's `down`, first move it into its own batch (`update payload_migrations set batch = <max+1> where name = '<it>'`).
- **Never use the Local API in an old migration.** It reads the current config, so a later column breaks the old migration on an empty database. See §3d and `tests/unit/migrations.test.ts`.
- **Wikimedia Commons** throttles full-size downloads hard (`Retry-After: 600`); its standard 1920 px renditions download without trouble.
- **Full-page screenshots** also need lazy images loaded: scroll through the page first, or the photo bands come out as their blurred placeholder.
- The sandbox's "Ethicai" environment now reaches `selma.au` and `ethicai.au` (the owner widened it), and R2 images render through `next/image` here.

## 6. Repo map

- `src/payload.config.ts`: collections, `siteSettings` global, S3 adapter (`clientUploads: true`, 20 MB). Do not reorder plugins or swap the adapter.
- `src/collections/`, `src/globals/SiteSettings.ts`, `src/access/`, `src/blocks/YouTube.ts`, `src/fields/articleEditor.ts`.
- `src/app/(frontend)/`: the pages, `sitemap.ts`, share images, `kitchen-sink/` and `media-check/` (**both temporary, remove before launch**). `src/app/robots.ts`, `src/app/api/{preview,exit-preview,revalidate}`.
- `src/components/{ui,layout,feed,newsletter,blocks,icons}`, `ContactForm.tsx`, `JsonLd.tsx`, `OgImage.tsx`.
- `src/lib/`: `queries`, `rss`, `elfsight`, `revalidate`, `revalidate-request`, `seo`, `structured-data`, `storage`, `video-url`, `reading-time`, `site-settings`, `redirects`, and others.
- `public/__forms.html`: the Netlify Forms declaration (keep in step with `ContactForm.tsx`).
- Photography: `src/assets/photos/`, `src/lib/photography.ts`, `src/content/photo-slots.ts`, `src/components/family/{PageHero,Photo,PhotoBand}.tsx`, `src/app/(frontend)/photo-credits/`.
- Family redesign: `src/components/family/*`, `src/globals/PageCopy.ts`, `src/collections/Services.ts`, `src/content/{defaults,apply-defaults}.ts`, `src/fields/slug.ts`, `src/lib/{family,robots,llms,feed,indexnow,html-to-markdown,plain-content}.ts`, routes `src/app/{llms.txt,llms-full.txt,indexnow-key.txt}`, `src/app/(frontend)/{services,articles/feed.xml}`, `scripts/import-squarespace.ts`.
- `scripts/seed.ts` (idempotent; don't re-run on production), `src/migrations/` (four so far; the newest must hold the `applyContentDefaults` call), `tests/{unit,e2e,helpers,fixtures}`.

## 7. Decisions already made (don't reopen without cause)

Netlify stays. Uploads go browser → R2 by signed URL (Netlify Functions cap bodies at about 4.5 MB); 20 MB limit, raster images only. Fonts are self-hosted (Inter, Fraunces). Only R2 and `i.ytimg.com` are `next/image` hosts (Elfsight renders its own images, so none added). Header "Subscribe" goes to `/newsletter`. The article ↔ video link is stored once, on the article (`relatedVideo`). TikTok cards need an uploaded thumbnail. Integration values live in siteSettings, never env. Publishing revalidates through hooks; `/api/revalidate` is only for out-of-band changes. Production needs its own R2 bucket and CORS rule.

Family redesign decisions:

- **One shared family look** taken from selma.au (the owner's call), with EthicAI as the parent brand.
- **Canonical `https://ethicai.au`**, with www redirecting to it (Netlify primary domain).
- **AI crawlers allowed by default**, search and training alike, changeable in the admin.
- **No `/selma` page**, so the site doesn't compete with selma.au; Selma lives on Home, About, Services, the menu, the footer and the structured data.
- Newsletter left the header menu; the Subscribe button and the footer cover it.
- No video hero: AGENTS.md rule 3, and the LCP budget.

## 8. Not yet verified

- A browser upload straight to R2 (the preflight passes now, see §2.1; the upload itself hasn't been tried).
- **Anything on Netlify:** the build itself (Next 16 on Netlify's Next.js runtime), Payload running as a function on the Supabase transaction pooler (the first review deploy used the session pooler, and `/admin` crashed with `max clients reached in session mode`; the build now refuses it; migrations, the admin bootstrap, the build and the admin were checked locally through PgBouncer in transaction mode, the seed was not because it needs R2), `NODE_VERSION` 22.23.4 for the build (Lambda's own Node 22 patch version may be older; Payload only declares this in `engines`). None of it could be reached from the sandbox.
- A real person timing the weekly workflow (§3b), and Lighthouse on the current build.
- The Elfsight widget with a **real** widget ID (only stubbed, and the real script with a made-up ID).
- EthicAI's own Substack feed (other live Substack feeds parse correctly).
- `next/image` rendering R2 images through the optimiser; `E2E_MEDIA_UPLOAD=1 npm run test:e2e` covers it on a machine with normal network access.
- YouTube thumbnails, a real Netlify Forms submission, and anything on Netlify itself (Phase 6). Lighthouse numbers are from a local production build.

- The photos through Netlify's image CDN, and the photo heroes' LCP on a real phone (Home's simulated LCP is 2.6–3.5 s locally, §3d).
- The family redesign on Netlify, and in Safari and Firefox. Browsers without scroll-driven animations keep the frosted header throughout, by design; that fallback was not seen in a real browser.
- The Squarespace import against production, Search Console and Bing, an IndexNow ping from the live site, and selma.au's side of the hand-off.

## 9. After Phase 5

- **Still open from Phase 5:** real content in place of the two demo articles (acceptance: no demo content remains), the page-copy decision, a timed weekly-workflow run by a person, and the JS budget question. The Markdown converter, dashboard panel, help-text pass and linked-article revalidation are done.
- **Phase 6** (`docs/DEPLOYMENT-NETLIFY.md`): Supabase in Sydney (transaction pooler for Netlify, build migrations included), production bucket and CORS, `DATABASE_URI` at build time, `REVALIDATE_SECRET` if wanted, a 15–20 MB upload test, a real form submission, Elfsight on production after a click, the domain cutover (keep MX/SPF/DKIM untouched), old-URL redirects, and removing `/media-check` and `/kitchen-sink`.
- **Other open items:** swap the wordmark and placeholder favicon (a plain "E") for the client's logo; `npm audit` still shows high/moderate issues in packages Payload depends on (`braces`, `esbuild`), with no upstream fix and none handling visitor input.
