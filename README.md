# EthicAI — Website

New website for [EthicAI](https://www.ethicai.au/) (AI ethics & people-strategy consultancy): a professional marketing site with an engaging TikTok/YouTube video feed, written articles summarising video content, and a weekly Substack newsletter surface — plus a Payload CMS admin for weekly publishing.

**Status:** 📋 Planning complete — build not yet started. This repo currently contains the full build plan; the Next.js + Payload app will be scaffolded into this repo (Phase 0 of the build spec).

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

## Getting started (for the coding agent)

1. Read [`AGENTS.md`](AGENTS.md), then [`docs/BUILD-SPEC.md`](docs/BUILD-SPEC.md) in full.
2. Execute **Phase 0** (scaffold + infra) of the spec's milestone list (§10) in this repo.
3. Stop at each ✅ checkpoint for human review; never skip acceptance criteria.

---

*Maintained by the developer; weekly content operations per [`docs/WEEKLY-RUNBOOK.md`](docs/WEEKLY-RUNBOOK.md).*
