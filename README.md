# EthicAI — Website

New website for [EthicAI](https://www.ethicai.au/) (AI ethics & people-strategy consultancy): a professional marketing site with an engaging TikTok/YouTube video feed, written articles summarising video content, and a weekly Substack newsletter surface — plus a Payload CMS admin for weekly publishing.

**Status:** 🏗️ Phase 1 (data model) complete — awaiting review before Phase 2 (design system).

## Docs

| Document | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Guardrails for coding agents — read first, every session |
| [`docs/BUILD-SPEC.md`](docs/BUILD-SPEC.md) | **Master brief:** stack, data model, page specs, integrations, phased milestones with acceptance criteria. The source of truth for the build |
| [`docs/DEPLOYMENT-NETLIFY.md`](docs/DEPLOYMENT-NETLIFY.md) | Netlify + Postgres + S3 media storage setup, env vars, Squarespace domain cutover, launch checklist |
| [`docs/WEEKLY-RUNBOOK.md`](docs/WEEKLY-RUNBOOK.md) | Weekly content ops: raw video → transcript → article → publish → newsletter, with templates and checklists |

## Locked decisions

| Concern | Choice |
|---|---|
| Framework + CMS | Next.js 15+ (App Router) + Payload CMS 3, TypeScript strict |
| Hosting | Netlify (Next.js runtime) |
| Database | Hosted Postgres — Neon or Supabase (`@payloadcms/db-postgres`) |
| Media storage | S3-compatible object storage — Cloudflare R2 (`@payloadcms/storage-s3`). **Local disk storage is forbidden** (Netlify's filesystem is ephemeral) |
| TikTok feed | Elfsight TikTok Feed widget — interaction-gated, `/watch` only. Widget ID lives in Payload `siteSettings` |
| YouTube feed | Curated `videos` collection + click-to-load facade embeds; optional RSS auto-sync post-launch |
| Newsletter | Substack — subscribe CTA + recent issues pulled from the publication's public RSS feed |
| Video hosting | YouTube/TikTok only — video files are **never** uploaded to this site (Netlify request-size limits) |
| Styling | Tailwind CSS 4 |

Estimated running cost: ≈ US$0–30/month (see plan package notes; Elfsight free tier is ~200 views/month and will need a paid plan for a public site).

## Before the build starts — collect from client

- [ ] Logo source files (SVG/PNG), brand guide/fonts/colours if any
- [ ] High-res headshots (Kara, Katriel, Simon)
- [ ] TikTok handle + YouTube channel URL(s)
- [ ] Substack publication URL
- [ ] Elfsight account + TikTok widget public ID (and who pays for the plan)
- [ ] Contact email + preferred contact method
- [ ] Export the Squarespace-hosted testimonial video before cutover
- [ ] Copy sign-off: keep current About/Team/Testimonial copy (captured in BUILD-SPEC Appendix A) or refresh?
- [ ] Decision: dedicated Services page? (default: "What we do" section on Home)
- [ ] Analytics preference: Plausible/Fathom (privacy-friendly) vs GA4 (needs cookie consent banner)

## Local development

Requires Node 22.23.4+ (see `.nvmrc`) and a Postgres database.

1. `npm install` (first time only for e2e tests: `npx playwright install chromium`)
2. `cp .env.example .env`, then fill in `PAYLOAD_SECRET`, `DATABASE_URI` and the `S3_*` values for the R2 bucket. `docker compose up -d` starts a local Postgres matching the example in `docker-compose.yml`. The app refuses to start without the S3 settings — uploads never go to local disk.
3. `npm run dev` → <http://localhost:3000/admin> to create the first admin user (the first account is always an admin).
4. `npm run seed` to add starter content: team, testimonials, two clearly marked demo articles and placeholder images (uploaded to the bucket). Safe to re-run — it only creates what's missing and never overwrites edits.

In development Payload pushes schema changes to the local database automatically. After any schema change, run `npm run migrate:create -- <name>` and commit the generated file in `src/migrations/` — production only ever applies committed migrations (`npm run migrate`).

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run lint` · `npm run typecheck` · `npm run format:check` | ESLint · TypeScript · Prettier |
| `npm test` | Vitest unit tests (`tests/unit/`) |
| `npm run test:e2e` | Playwright smoke tests (`tests/e2e/`; starts the dev server if needed) |
| `E2E_MEDIA_UPLOAD=1 npm run test:e2e` | Also uploads a test image through the admin to the **real bucket**, checks it renders on `/media-check`, then deletes it |
| `npm run seed` | Idempotent starter content (`scripts/seed.ts`). Don't re-run against production after launch — deleted demo content would come back |
| `npm run generate:types` · `npm run generate:importmap` | Regenerate `src/payload-types.ts` / the admin import map after config changes |

`/media-check` is a temporary, sign-in-only page that shows the latest uploads (Phase 0 acceptance). Remove it before launch.

## Working on the build (coding agents)

1. Read [`AGENTS.md`](AGENTS.md), then [`docs/BUILD-SPEC.md`](docs/BUILD-SPEC.md) in full.
2. Work through the spec's milestones (§10) in order; Phases 0–1 are done.
3. Stop at each ✅ checkpoint for human review; never skip acceptance criteria.

---

*Maintained by the developer; weekly content operations per [`docs/WEEKLY-RUNBOOK.md`](docs/WEEKLY-RUNBOOK.md).*
