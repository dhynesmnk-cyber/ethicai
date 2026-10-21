# AGENTS.md — EthicAI website (copy to repo root as `AGENTS.md`)

You are working on the EthicAI website: Next.js 15+ (App Router) with Payload CMS 3, PostgreSQL, Tailwind CSS 4, deployed to **Netlify** with media on **S3-compatible storage (Cloudflare R2)**.

**Read `docs/BUILD-SPEC.md` before any task. It is the source of truth** for the data model (§4), page specs (§5), integrations (§7), and milestone acceptance criteria (§10). Work milestone-by-milestone; stop at ✅ checkpoints for human review.

## Non-negotiables

1. **Never use local disk storage for uploads** — Netlify's filesystem is ephemeral. The S3 adapter (`@payloadcms/storage-s3`) must stay configured in `payload.config.ts`.
2. **Never commit secrets.** New env vars go in `.env.example` with a comment. Editor-changeable values (Elfsight widget ID, Substack URL, socials) live in the `siteSettings` global, not env.
3. **Videos are never uploaded to this site** — they are embedded from YouTube/TikTok via the `videos` collection. Image uploads only, < 2 MB each, alt text required.
4. **No eager third-party scripts.** Elfsight loads only on `/watch` and only after user interaction (facade pattern). YouTube uses click-to-load facades (`youtube-nocookie.com`). Substack is a link/button by default.
5. **Schema changes ship with committed Payload migrations.** No destructive operations against production data; seed scripts must be idempotent.
6. Server Components + Payload Local API by default; `"use client"` only where interaction requires it. TypeScript strict, no `any`.
7. All user-facing copy in **Australian English**. Accessibility (WCAG 2.2 AA): semantic landmarks, keyboard operability, visible focus, labelled controls — shipped with the component, not retrofitted.
8. Conventional commits, one logical change per commit, PR body = what/why/how-verified (+ screenshots for UI).

## Working style

- Prefer less client-side JS and fewer moving parts when choosing between approaches.
- If a content operation would require a code change, that's a design bug — solve it with admin fields, hooks, or siteSettings instead.
- Leave `// DECISION:` comments where you chose between plausible alternatives; `// REASON:` for any lint/ts suppression.
- Run before declaring done: `npm run lint && npm run build && npm run test` (+ Playwright smoke for UI changes).
- Verify against acceptance criteria in the spec; state which ones you checked in the PR.

## Key files

- `src/payload.config.ts` — collections, globals, plugins, storage (do not reorder plugins casually)
- `src/collections/`, `src/globals/` — data model per spec §4
- `src/app/(frontend)/` — public pages per spec §5
- `src/lib/rss.ts`, `src/lib/youtube.ts`, `src/lib/elfsight.ts` — integrations per spec §7
- `scripts/seed.ts` — idempotent content seed (client copy in spec Appendix A)
- `docs/BUILD-SPEC.md`, `docs/DEPLOYMENT-NETLIFY.md` — full spec + infra
