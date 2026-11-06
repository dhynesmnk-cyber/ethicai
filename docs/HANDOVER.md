# Session handover: EthicAI website

Working notes for the next coding session, written 6 November 2026. **Delete this file before merging to `main`.**

Read `AGENTS.md` and `docs/BUILD-SPEC.md` first. They are the source of truth; this file only records where things stand and what the last session learnt the hard way.

## 1. Where things stand

- Repo `dhynesmnk-cyber/ethicai`, branch `claude/confident-feynman-bep01v`, **PR [#1](https://github.com/dhynesmnk-cyber/ethicai/pull/1)** (open, no reviews or comments yet). Do not open another PR; keep updating #1's title and body at each phase (what / why / how verified / criteria checked / open items). The user does **not** want PR activity subscriptions.
- Phases 0–3 of BUILD-SPEC §10 are built, pushed and verified in the sandbox, and are waiting on the owner's review. **Phase 4 is next.** Only start it when the user says so (the spec stops at each ✅ checkpoint).
- Last verified: lint, typecheck and Prettier clean; 66 unit tests; 43 e2e tests pass (plus 1 opt-in test skipped); `npm run build` passes; Lighthouse mobile on a local production build: Home 96–98 and article 95–98 performance, with 100 / 96 / 100 for accessibility / best practices / SEO. The 96 came from console errors: image-optimiser 500s caused by the sandbox network, plus a favicon 404 that was fixed afterwards (the score wasn't re-measured).
- When this was written the working tree was clean and in sync with GitHub at `4066f90`.

| Phase | Content | State |
|---|---|---|
| 0 | Scaffold, R2 storage, tooling | done |
| 1 | Data model, access control, preview, seed | done |
| 2 | Design system, shell, `/kitchen-sink` | done |
| 3 | Public pages, SEO | done |
| 4 | Elfsight TikTok feed, Substack, revalidation | **next** |
| 5 | Admin polish, real content | to do |
| 6 | Netlify deploy | to do |
| 7 | Optional extras | to do |

## 2. Waiting on the user

1. **R2 CORS rule is not working.** The user said twice that it was added, but on 6 November the preflight below still returns `403` with no `Access-Control-*` headers. Effect: uploads from the admin in a browser fail (editors can't add hero images or TikTok thumbnails). Uploads from scripts and the Local API work. Ask them to check the rule is saved on the bucket named in `S3_BUCKET` (`ethicai-media`) and matches the JSON in `docs/DEPLOYMENT-NETLIFY.md` §2; `wrangler r2 bucket cors list ethicai-media` shows what R2 really has. Re-probe with:
   ```bash
   H=$(node -e "console.log(new URL(process.env.S3_ENDPOINT).origin)")
   curl -sS -o /dev/null -D - -X OPTIONS "$H/$S3_BUCKET/cors-probe.jpg" -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: PUT" -H "Access-Control-Request-Headers: content-type,if-none-match" \
     | grep -iE "^HTTP/1.1 [0-9]+ [A-Z]|^access-control-allow"
   ```
   Success is a `200` or `204` with `access-control-allow-origin`.
2. **Review of Phase 3** and a go-ahead for Phase 4.
3. **Open decisions.**
   - Make Home/About copy editable in the admin? It lives in `src/content/site-copy.ts` (code), which breaks the "content changes shouldn't need code" rule. Suggested: a small "Page copy" global in Phase 5.
   - JS budget: about 150 KB gzipped on an article page against the spec's 120 KB target (roughly 115 KB is Next 16 + React 19 itself). Is the target firm?
   - Client sign-off needed on: the three "what we do" column texts on Home (written from the intro copy), the privacy policy template (not legal advice), and the full team bios (the seed uses shortened Appendix A text).
4. **Inputs needed for Phase 4**, all entered by an admin in *Site settings* (not env): Elfsight TikTok widget ID (and who pays; the free tier is about 200 views a month), Substack publication URL, TikTok handle, YouTube channel URL. None are known yet, so everything must degrade gracefully without them.

## 3. Phase 4 brief

Spec: §7.1, §7.2, §5.5, §10 Phase 4; AGENTS.md non-negotiable #4 (no eager third-party scripts).

**Already built, don't redo**
- `SubscribeCTA` (band and inline): a plain link to Substack's `/subscribe`, never Substack's script.
- `src/lib/rss.ts` (RSS 2.0 and Atom, 5 s timeout, hourly cache, returns `[]` on any failure) with tests; `/newsletter` uses it and shows a fallback.
- `/watch` TikTok section: curated cards (only those with an uploaded thumbnail) plus a profile link. That is the fallback for when no widget ID is set. A comment marks where Elfsight goes. Home's "Load the TikTok feed" card just links to `/watch`.
- Revalidation: collection `afterChange` and `afterDelete` hooks call `revalidatePaths()` (`src/lib/revalidate.ts`) directly; siteSettings revalidates every page.
- The privacy policy already says the Elfsight feed loads only on request.

**To do**
1. **Elfsight facade on `/watch` only** (`src/lib/elfsight.ts` is named in AGENTS.md). A client component with a "Show latest TikToks" button; on the click, inject the loader script once and render the widget container. Verify the exact embed markup against Elfsight's current docs (the spec mentions `data-eapps-link`; Elfsight's own embed code may differ). Requirements:
   - ID comes from `siteSettings.elfsightTikTokWidgetId`, never hard-coded.
   - Validate the ID strictly, in the field's `validate` and again when rendering, because it ends up in a class name and script. Never interpolate unchecked text.
   - Fall back to the existing curated cards if the ID is unset, or the script fails or times out.
   - Move focus sensibly and announce loading; add a code comment about the free-tier view limit.
   - Add `next.config.ts` image hosts only if actually needed.
2. **Substack:** check the parser against a real feed once the URL is known (the environment's allowed domains need that host added). The spec also wants fixture XML *files* in the repo; the tests currently use inline strings in `tests/unit/rss.test.ts`, so move them to `tests/fixtures/`.
3. **Revalidation:** hooks already exist. The spec's `/api/revalidate` route (secret-protected, uses `REVALIDATE_SECRET`) isn't built, and the env var is unused. Either build it or record a `// DECISION:` that direct `revalidatePath` makes it unnecessary. **Prove the acceptance criterion on a production build** (`npm run build && npx next start`): `next dev` never caches, so it can't show revalidation working.
4. **Tests:** before the click, no request goes to `elfsight.com`; after the click it does (stub the network); no other page loads the script even when an ID is set; ID validation unit tests.
5. Update `docs/WEEKLY-RUNBOOK.md` / `docs/DEPLOYMENT-NETLIFY.md` for the widget ID step, then the README status line and PR #1.

**Acceptance (§10):** with a real widget ID and Substack URL, `/watch` shows no TikTok widget before one click and the widget after it; `/newsletter` lists real issues; publishing an article refreshes Home and the listing within seconds.

## 4. Sandbox bootstrap (a fresh container each session)

The cloud environment is "Ethicai": limited network (allowed: `*.r2.cloudflarestorage.com`, `*.r2.dev` plus package registries) and the five `S3_*` variables already set. It has **no setup script**, so each new container needs:

```bash
# Node >= 22.23.4 is required (Payload 3.92). The image has 22.22.0.
export PATH=/opt/node22/bin:$PATH
node -v || true   # if below v22.23.4, install it:
cd /tmp && curl -sSfO https://nodejs.org/dist/v22.23.4/node-v22.23.4-linux-x64.tar.xz \
  && curl -sSf https://nodejs.org/dist/v22.23.4/SHASUMS256.txt | grep 'node-v22.23.4-linux-x64.tar.xz$' | sha256sum -c - \
  && mkdir -p /opt/node22 && tar -xJf node-v22.23.4-linux-x64.tar.xz -C /opt/node22 --strip-components=1

# Local Postgres 16 (no outside database is reachable from the sandbox)
apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y -q postgresql
pg_ctlcluster 16 main start   # also needed after any container restart; "stale pid file" is harmless
su postgres -c "psql -c \"CREATE ROLE ethicai LOGIN PASSWORD 'ethicai' CREATEDB;\" -c 'CREATE DATABASE ethicai OWNER ethicai;'"

cd /home/user/ethicai && npm install
printf 'PAYLOAD_SECRET=%s\nDATABASE_URI=postgres://ethicai:ethicai@127.0.0.1:5432/ethicai\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n' "$(openssl rand -hex 32)" > .env   # git-ignored; S3_* come from the environment
npm run migrate
```

**Proxy shim.** Node's `fetch` and the AWS SDK ignore the sandbox proxy, so anything that talks to R2 needs this (the shim lives outside the repo):

```bash
mkdir -p /home/user/.sandbox-ethicai/proxy && cd /home/user/.sandbox-ethicai/proxy && npm init -y >/dev/null && npm i global-agent@3.0.0
export NODE_USE_ENV_PROXY=1
export NODE_OPTIONS="--no-deprecation --use-openssl-ca --require /home/user/.sandbox-ethicai/proxy/node_modules/global-agent/bootstrap"
cd /home/user/ethicai && nohup npx next dev > /home/user/.sandbox-ethicai/dev.log 2>&1 &
```

- Start the dev server with `npx next dev`, **not** `npm run dev`: the npm script resets `NODE_OPTIONS` and drops the shim.
- Create the first admin at `http://localhost:3000/admin` (any details; the first user becomes an admin automatically), then seed with the same `NODE_OPTIONS`: `npx payload run scripts/seed.ts`. The seed uploads placeholder images to R2 and needs an admin to exist.
- Tests: start the dev server yourself first (Playwright reuses it), then `npm run test:e2e`. Plain `npx playwright test` fails because it lacks the tsx loader. Chromium is preinstalled; never run `playwright install`. Some tests skip unless the seed has run.
- To stop the server, don't `pkill -f "next dev"`: it matches your own shell and kills it (exit 144). Match anchored command lines from `/proc` instead.
- `.env` is local only and git-ignored. Never commit secrets or print the S3 values, the R2 account ID or the public bucket URL; before every commit, scan what you staged for them.
- Next 16 differs from older training data. Version-matched docs are in `node_modules/next/dist/docs/`.

## 5. Things the last session learnt

- **The Local API skips access control.** Every public query in `src/lib/queries.ts` filters to published content itself; keep doing that.
- **Context objects for scripts.** Scripts and tests that call Payload outside Next pass `context: { disableRevalidate: true }`, and must use a *fresh object per call*: the storage plugin leaves a `skipCloudStorage` flag on a shared one, which silently skips later uploads.
- **After changing collections or the config:** `npm run generate:types`, `npm run generate:importmap` and `npm run migrate:create -- <name>`. Check the generated `down`; Phase 1's failed because `CASCADE` drops had already removed some constraints, so it was edited to `IF EXISTS`.
- **Prettier rewrites files**, so editing right after a format run can fail with "modified since read". Re-read first.
- **Tailwind 4:** the theme is in `src/app/(frontend)/globals.css` (`@theme static`; the default palette is cleared, so only the brand tokens exist). Widths are `max-w-content` and `max-w-reading`; `.prose`, `.reveal` and `.site-header` are hand-written.
- **Every page sets metadata through `pageMetadata()`** (`src/lib/seo.ts`), because Next merges metadata shallowly.
- **Client components are deliberately few:** `SiteNav`, `Facade`, `ShareLinks`, `ContactForm`, `LivePreviewListener`. Keep it that way.
- **Playwright:** call `gotoHydrated()` before clicking client-side controls; `role="alert"` also matches Next's route announcer, so filter by text.
- **Sandbox quirks:** Next's image optimiser can't resolve `r2.dev` here, so `/_next/image` returns 500 in the sandbox (fine on Netlify). For screenshots, intercept `/_next/image` in Playwright and serve the R2 original. YouTube thumbnails (`i.ytimg.com`) and telemetry hosts are blocked. Raw database ports are blocked, so a hosted database can't be used from here.
- **Screenshots:** the user only sees files sent with `SendUserFile`. Local review images go in `.review/` (git-excluded locally via `.git/info/exclude`).
- **Git:** conventional commits, one logical change each, with the attribution lines the session's reminder specifies. Check that intermediate commits type-check and lint, using a temporary `git worktree` with `node_modules` symlinked. GitHub work uses the `mcp__github__*` tools (load them with ToolSearch); there is no `gh` CLI.
- **How the user likes to work:** a short status at each checkpoint with explicit decisions to make, honest about what couldn't be verified, Australian English throughout, and the PR description updated rather than a new PR.

## 6. Repo map

- `src/payload.config.ts`: collections, `siteSettings` global, S3 adapter (`clientUploads: true`, 20 MB). Do not reorder plugins or swap the adapter.
- `src/collections/` (Articles, Videos, Media, TeamMembers, Testimonials, Users), `src/globals/SiteSettings.ts`, `src/access/`, `src/blocks/YouTube.ts`, `src/fields/articleEditor.ts`.
- `src/app/(frontend)/`: the pages, `sitemap.ts`, share images, `kitchen-sink/` and `media-check/` (**both temporary, remove before launch**). `src/app/robots.ts` and `src/app/api/{preview,exit-preview}`.
- `src/components/{ui,layout,feed,newsletter,blocks,icons}`, `ContactForm.tsx`, `JsonLd.tsx`, `OgImage.tsx`.
- `src/lib/`: `queries`, `rss`, `seo`, `structured-data`, `revalidate`, `storage`, `video-url`, `reading-time`, `site-settings`, `redirects` (old Squarespace URLs go here), and others.
- `src/content/site-copy.ts`: Home/About copy. `public/__forms.html`: the Netlify Forms declaration for the contact form (keep in step with `ContactForm.tsx`).
- `scripts/seed.ts` (idempotent; create-if-missing; don't re-run on production), `src/migrations/` (two so far), `tests/{unit,e2e,helpers}`.

## 7. Decisions already made (don't reopen without cause)

Netlify stays. Uploads go browser → R2 by signed URL because Netlify Functions cap bodies at about 4.5 MB; the limit is 20 MB and raster images only. Fonts are self-hosted (Inter, Fraunces). Only R2 and `i.ytimg.com` are allowed `next/image` hosts. Header "Subscribe" goes to `/newsletter`. The article ↔ video link is stored once, on the article (`relatedVideo`). TikTok cards need an uploaded thumbnail. Simon Brock's title is "Digital agency leader". Production needs its own R2 bucket and its own CORS rule.

## 8. Not yet verified

- Browser upload straight to R2 (blocked by CORS above).
- `next/image` rendering R2 images through the optimiser (sandbox DNS); `E2E_MEDIA_UPLOAD=1 npm run test:e2e` covers it on a machine with normal network access.
- A real Substack feed, the Elfsight widget, YouTube thumbnails, and a real Netlify Forms submission (Phase 6).
- All Lighthouse numbers come from a local production build in the sandbox, not from Netlify.

## 9. After Phase 4

- **Phase 5:** the "This week" dashboard panel (§8), a field help-text pass, the Markdown paste converter (see the `TODO(Phase 5)` in `src/fields/articleEditor.ts`), a timed weekly-workflow check (under 10 minutes), real content in place of the demo seed, the page-copy decision, and the JS budget question.
- **Phase 6** (`docs/DEPLOYMENT-NETLIFY.md`): Supabase in Sydney (transaction pooler for Netlify; session pooler for running migrations from a machine), production bucket and CORS, `DATABASE_URI` available at build time (static pages read siteSettings), a 15–20 MB upload test on Netlify, a real form submission, the domain cutover (keep MX/SPF/DKIM records untouched), old-URL redirects, and removing `/media-check` and `/kitchen-sink`.
- **Other open items:** swap the wordmark and placeholder favicon for the client's logo; `npm audit` still shows high/moderate issues in packages Payload depends on (`braces`, `esbuild`), with no upstream fix and none handling visitor input.
