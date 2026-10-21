# EthicAI — Website Build Specification (Coding Agent Brief)

> **How to use this document:** You are a coding agent building a new website for EthicAI. Work through the Milestones (§10) in order. Each milestone has acceptance criteria — do not proceed until they pass. Follow the Conventions & Guardrails (§11) at all times. If a decision is ambiguous, choose the simpler option and leave a `// DECISION:` comment explaining it, rather than stalling.

---

## 1. Project overview

EthicAI (ethicai.au) is an Australian consultancy helping organisations adopt AI ethically — blending operational insight with people strategy. They publish short-form video (TikTok, YouTube) and want the website to be the "home base": a professional, clean marketing site with an engaging video feed, written articles that summarise the video content in text form, and a weekly newsletter (hosted on Substack, surfaced on the site).

**Audience:** business leaders, HR/people-strategy professionals, Australian organisations evaluating AI adoption. Tone: warm, credible, plain-spoken, human-centred. **All copy in Australian English** (e.g. "organisation", "summarise", "program" except where quoting).

**Content operations model (important for design decisions):**
- A developer-maintainer (not the client) publishes content weekly via the Payload admin.
- The client sends raw video files; the maintainer transcribes them, writes an article, publishes it, links it to the posted video, and groups the week's posts into a Substack newsletter issue.
- Therefore: the admin experience for *articles* and *videos* is the most important surface after the public pages. Optimise for speed of weekly publishing.

## 2. Tech stack (fixed decisions — do not substitute)

| Concern | Choice |
|---|---|
| Framework | Next.js 15+ (App Router, TypeScript, strict mode) |
| CMS | Payload CMS 3.x, installed into the Next.js app (`@payloadcms/next`) |
| Database | PostgreSQL via `@payloadcms/db-postgres` (Neon or Supabase in prod; local Postgres or Docker for dev) |
| Rich text | `@payloadcms/richtext-lexical` with Markdown + HTML paste converters and the YouTube embed block enabled |
| Media storage | `@payloadcms/storage-s3` → Cloudflare R2 (S3-compatible). **Never local disk storage in production** (Netlify filesystem is ephemeral) |
| Styling | Tailwind CSS 4. No component library required; shadcn/ui permitted only if it accelerates forms/dialogs |
| Hosting | Netlify (Next.js runtime). See `docs/DEPLOYMENT-NETLIFY.md` |
| TikTok feed | Elfsight TikTok Feed widget (third-party script, ID from site settings) |
| YouTube feed | Curated `videos` collection + native `next/image` facade embeds; optional RSS auto-sync (Milestone 7) |
| Newsletter | Substack — embedded subscribe widget + recent issues pulled from the publication's public RSS feed (`https://<pub>.substack.com/feed`) with ISR |
| Fonts | `next/font` — see §6 |
| Testing | Vitest (unit, esp. RSS parsing/mapping), Playwright (smoke: home, article, watch, admin login) |

**Scaffold command:** `npx create-payload-app@latest` (choose the Next.js + Postgres + Lexical template, blank/website template as preferred), then adapt. Pin exact versions in `package.json`.

## 3. Repository structure

```
/ (repo root = Next.js app)
├── src/
│   ├── app/
│   │   ├── (payload)/            # Payload admin + API routes (from template)
│   │   ├── (frontend)/           # Public site pages
│   │   │   ├── page.tsx                      # Home
│   │   │   ├── about/page.tsx                # About + team
│   │   │   ├── articles/page.tsx             # Listing (+ ?tag= filter, ?q= search, pagination)
│   │   │   ├── articles/[slug]/page.tsx      # Article detail
│   │   │   ├── watch/page.tsx                # Video feed (TikTok + YouTube)
│   │   │   ├── newsletter/page.tsx           # Substack embed + recent issues
│   │   │   ├── contact/page.tsx
│   │   │   ├── privacy-policy/page.tsx
│   │   │   └── layout.tsx                    # Header/footer shell
│   │   ├── api/
│   │   │   ├── revalidate/route.ts           # On-demand revalidation (secret-protected)
│   │   │   └── sync-youtube/route.ts         # Milestone 7 (optional cron target)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── layout.tsx
│   ├── collections/              # Payload collections (one file each)
│   ├── globals/                  # siteSettings global
│   ├── components/
│   │   ├── layout/               # Header, Footer, Nav, Container
│   │   ├── ui/                   # Button, Card, Tag, Pagination, Prose, etc.
│   │   ├── feed/                 # ElfsightTikTok, VideoCard, YouTubeFacade
│   │   ├── newsletter/           # SubstackEmbed, IssueList
│   │   └── blocks/               # Lexical custom blocks/renderers
│   ├── lib/                      # payload.server.ts, rss.ts, youtube.ts, seo.ts, elfsight.ts
│   └── payload.config.ts
├── public/
├── scripts/                      # seed.ts, migrate helpers
├── docs/                         # This spec lives here
├── .env.example                  # Every var documented (no real secrets)
└── AGENTS.md                     # repo root copy of AGENTS.md
```

## 4. Data model (Payload)

All collections: enable `versions` (drafts) where marked; add `createdAt/updatedAt` (Payload default). Slugs must be URL-safe and unique. Add admin `listable` columns and sensible `admin.description` help text on every non-obvious field — the weekly maintainer relies on them.

### 4.1 `users` (auth)
- Payload default auth collection. Add `role: 'admin' | 'editor'` (default `editor`), `name`, `avatar` (upload, optional).
- Access: editors can create/update/publish articles, videos, media; only admins can edit users, siteSettings, teamMembers, testimonials.

### 4.2 `media` (upload)
- Image-first. Accept `image/*` only (`application/pdf` disallowed). **Do not accept video files** (videos are always third-party hosted — see §7.3 rationale).
- S3 adapter (`@payloadcms/storage-s3`) pointed at R2 bucket.
- Required `alt` text on every upload (field-level validation).
- Generated sizes: `thumbnail` 480w, `card` 960w, `hero` 1920w (WebP + fallback).

### 4.3 `articles` (the core content type)
| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, unique, localized false | Auto-from-title, editable |
| `excerpt` | textarea, required, max 300 chars | Used on cards, RSS, meta description |
| `heroImage` | upload(media), required | |
| `content` | Lexical rich text, required | Enable: headings, lists, quotes, links, inline toolbar; **YouTube embed block**; Markdown paste converter ON |
| `author` | relationship → `users`, required, hasMany false | |
| `tags` | text, hasMany, `admin.isSortable` | Free-text with autocomplete from existing values (`hasMany` + suggestions via a `tags` option set is fine) |
| `relatedVideo` | relationship → `videos`, optional | Surfaces "Watch the video" embed at top of article |
| `status` | `draft` \| `published` (Payload drafts enabled) | |
| `publishedAt` | date | Default now; used for ordering |
| `seo` | group: `metaTitle`, `metaDescription`, `ogImage` (override) | Fallbacks computed from title/excerpt/heroImage |

- Default sort: `-publishedAt`. Index listing queries on `status`+`publishedAt`.
- Enable **Live Preview** and **draft preview URL** on the frontend (`/articles/[slug]` with draft mode token).

### 4.4 `videos` (curated feed entries)
| Field | Type | Notes |
|---|---|---|
| `platform` | select: `youtube` \| `tiktok`, required | |
| `url` | text, required | Canonical watch URL; validate format per platform; extract + store `videoId` in a `beforeChange` hook |
| `videoId` | text, required, unique per platform | Derived by hook; used for embeds + RSS upsert dedupe |
| `title` | text, required | |
| `publishedAt` | date, required | The date it went live on the platform |
| `thumbnail` | upload(media), optional | If empty: YouTube → `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`; TikTok → leave to Elfsight widget (TikTok cards on the site only appear when manually thumbnailed) |
| `article` | relationship → `articles`, optional | Inverse of relatedVideo; shown as "Read the summary" |
| `featured` | checkbox | Featured videos surface on Home |
| `source` | select: `manual` \| `youtube-rss`, default `manual`, admin-read-only-ish | For Milestone 7 |

### 4.5 `teamMembers`
`name`, `role`, `bio` (Lexical or textarea), `photo` (upload, required), `order` (number), `published` (checkbox).

### 4.6 `testimonials`
`quote` (textarea, required), `attribution` (text, e.g. "Deputy Ombudsman"), `organisation` (text, optional), `featuredVideo` (optional media/url — the current site has a testimonial video), `order`, `published`.

### 4.7 `siteSettings` (global — single source of truth for integrations)
| Field | Notes |
|---|---|
| `elfsightTikTokWidgetId` | text — public widget ID from Elfsight dashboard |
| `tiktokHandle`, `youtubeChannelUrl`, `youtubeChannelId` | text — channelId (UC…) needed only for Milestone 7 RSS |
| `substackPublicationUrl` | e.g. `https://ethicai.substack.com` — drives embed + RSS |
| `contactEmail` | |
| `socialLinks` | array of { platform select, url } |
| `footerText` | rich text (small) |
| `analytics` | select `none` \| `plausible` \| `ga4` + `analyticsId` |

Revalidate the frontend (`revalidateTag('site-settings')` / on-demand revalidation endpoint) whenever siteSettings is saved.

## 5. Sitemap & page specifications

Design principle: **calm, credible, editorial.** Lots of whitespace, strong typographic hierarchy, one accent colour, zero dark patterns. Every page: semantic landmarks, skip-link, visible focus states.

### 5.1 Global chrome
- **Header:** logo left; nav: About · Articles · Watch · Newsletter · Contact; "Subscribe" button (→ newsletter page or Substack directly — decide with client, default: `/newsletter`). Sticky, condenses on scroll. Mobile: accessible disclosure menu.
- **Footer:** short value line, nav columns, social icons (TikTok, YouTube, LinkedIn, Substack), contact email, Privacy Policy link, © EthicAI.
- **Newsletter banner:** a slim reusable `SubscribeCTA` component (Substack button) placed at the end of every article and mid-way on Home.

### 5.2 Home (`/`)
Sections in order:
1. **Hero** — headline "A.I. grounded in human dignity" (retain current messaging unless client supplies new copy), 1–2 sentence subhead, CTAs: "Read the latest" + "Subscribe to the newsletter". Calm imagery or subtle abstract graphic; no stock-photo clichés.
2. **Value prop** — the "adaptable organisation" paragraph (current copy, Appendix A) in a 2–3 column layout: Systems & clarity / People & culture / Ethical AI.
3. **Latest articles** — 3 most recent published articles as cards (hero image, tag chips, title, excerpt, date, reading time computed from content word count). "View all articles →".
4. **Watch strip** — horizontal preview: featured videos (up to 4) + embedded Elfsight TikTok widget *facade* (see §7.1 — do not auto-load the third-party script on Home; show a "Load TikTok feed" card linking to `/watch` to protect performance). "See all videos →".
5. **Testimonials** — 2–3 rotating or stacked quotes with attribution.
6. **Team teaser** — three photos + names + one-line roles → link to `/about`.
7. **Subscribe CTA** — full-width band with Substack embed.

### 5.3 About (`/about`)
- Story section (current "A.I. grounded in human dignity" intro copy).
- Team: cards from `teamMembers` (photo, name, role, full bio — bio behind a "More" toggle or on the card, designer's call; keep bios fully readable, they're substantial).
- Credentials strip: MIT Sloan, LSE mentions come out of the bios naturally; no separate logos section unless client supplies them.

### 5.4 Articles (`/articles`, `/articles/[slug]`)
- **Listing:** header + optional search input (server-side `ilike` on title/excerpt via Payload query param) + tag filter chips (from distinct tags) + paginated card grid (9/page). Empty state: friendly copy.
- **Detail:** hero image + title + meta row (author, date, reading time, tags). If `relatedVideo` is set: YouTube facade embed (or TikTok link card) directly under the hero with "Watch the original video". Lexical content in a `prose` component with max-width ~68ch. End of article: `SubscribeCTA` + "Related articles" (same tag, excluding current, up to 3) + prev/next links. Share buttons: copy-link + LinkedIn + X (no heavyweight share SDKs).
- JSON-LD: `Article` (+ `VideoObject` when a related video exists).

### 5.5 Watch (`/watch`)
- Tabbed or two-section layout: **TikTok** first (client priority), **YouTube** second.
- TikTok: Elfsight widget container, lazy-loaded (§7.1), with fallback copy + link to the TikTok profile if the widget ID is missing/errors.
- YouTube: responsive grid from `videos` where platform=youtube (most recent first, pagination or "load more" — server components + pagination preferred over client JS). Each card: facade thumbnail → click replaces with real iframe (`youtube-nocookie.com`). "Read the summary →" when linked to an article.
- This page is allowed to load the Elfsight script (it's the dedicated feed page).

### 5.6 Newsletter (`/newsletter`)
- Value copy: what subscribers get, cadence (weekly), who writes it.
- **Substack embed** (official embeddable subscribe widget/script from Substack, or a styled link-button to `<pub>.substack.com/subscribe` if the embed script conflicts with CSP — prefer the button+link for performance and privacy, embed if client insists).
- **Recent issues:** server component fetching `<substackPublicationUrl>/feed` (RSS/Atom), parsed in `lib/rss.ts`, rendered as a list (title, date, 1–2 line summary, "Read on Substack →"). `revalidate = 3600`. Graceful fallback ("Read the archive on Substack →") if fetch fails — never break the page.
- Link to full archive: `<pub>.substack.com/archive`.

### 5.7 Contact (`/contact`)
- Simple: contact email as `mailto:` + a Netlify Forms-powered form (name, email, message) with honeypot spam field. Success/error states without page reload (progressive enhancement: plain form POST works without JS).

### 5.8 Legal
- `/privacy-policy`: template covering analytics (per siteSettings choice), Elfsight third-party embed (loads on `/watch`), Substack (subscription handled on Substack's domain), contact form data, Australian Privacy Principles reference. **Flag for client review — not legal advice.**
- Cookie/consent: if GA4 chosen → consent banner required; if Plausible/none → banner unnecessary (note this in the admin-facing docs).

## 6. Design system

- **Palette (default proposal unless client supplies brand guide):**
  - Background `#FBFAF8` (warm off-white), surface `#FFFFFF`, ink `#1C1C1E` (near-black), muted `#5C5C63`, accent `#1F6F5C` (deep eucalyptus green — credible, human, distinct from tech-bro blue), accent-hover darker, plus a soft sand `#EFE9DF` for section bands. Verify WCAG AA contrast for all text pairs.
- **Type:** headings — a humanist serif or strong sans (e.g. `Fraunces`, `Newsreader`, or `Inter Tight`); body — `Inter` or `Source Sans 3` via `next/font`, 17–18px base, line-height 1.65. Load max 2 families, self-hosted via next/font, `display: swap`.
- **Spacing/radius:** 4px base grid; cards radius 12–16px; shadows subtle (or none — prefer borders/hairlines).
- **Components (build once, reuse):** `Container`, `SectionHeading`, `Button` (primary/secondary/ghost), `Card` (article/video variants), `TagChip`, `Prose`, `Facade` (click-to-load embed), `Pagination`, `SubscribeCTA`, `Quote`.
- **Imagery:** real team photos; no generic AI/robot stock imagery. Decorative graphics should be restrained (thin line work, soft gradient meshes at most).
- **Motion:** minimal — fade/slide-up on scroll via CSS or 20 lines of IntersectionObserver; respect `prefers-reduced-motion`.

## 7. Integrations — implementation details

### 7.1 Elfsight TikTok widget
- Widget ID from `siteSettings.elfsightTikTokWidgetId` (never hard-coded).
- Elfsight injects a third-party script + iframe. **Load it lazily:** render a styled facade (TikTok-branded card, "Show latest TikToks" button); only on user interaction inject the Elfsight loader script (`https://static.elfsight.com/platform/platform.js` + `data-eapps-link` widget div), and only on `/watch`.
- If widget ID is unset, render fallback: latest manually-curated TikTok `videos` entries + profile link.
- Document in code comments: free tier = 200 views/month per app; views are consumed each time the widget loads — this is why it's interaction-gated and `/watch`-only.

### 7.2 Substack
- No API keys required. `siteSettings.substackPublicationUrl` drives: (a) subscribe CTA target, (b) RSS fetch for recent issues on `/newsletter`, (c) footer icon link.
- `lib/rss.ts`: fetch with `next: { revalidate: 3600 }`, parse XML (use a small parser like `fast-xml-parser`), map to `{ title, link, pubDate, excerpt }`, take latest 5. Timeout 5s, try/catch → empty array.

### 7.3 YouTube
- **Primary (required):** facade embeds from the `videos` collection. `YouTubeFacade` component: thumbnail (`i.ytimg.com/vi/{id}/hqdefault.jpg` via `next/image` `remotePatterns`, or uploaded thumbnail if present), play button; on click swap in `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1">` with proper `title` attr for a11y. Zero JS until interaction.
- **Optional (Milestone 7):** auto-sync from channel RSS `https://www.youtube.com/feeds/videos.xml?channel_id={youtubeChannelId}` — latest 15 entries, upsert into `videos` keyed on `videoId` (source=`youtube-rss`), triggered by a Netlify scheduled function hitting `POST /api/sync-youtube` with `CRON_SECRET` header auth. Never overwrite manually-edited titles if `source=manual`.

### 7.4 Video files
- Raw client video files are **never** uploaded to the site (Netlify function body limits ≈ 6 MB; videos live on TikTok/YouTube). Images only, each ideally < 2 MB.

## 8. Admin experience requirements

The weekly maintainer is the admin's primary user. Make publishing an article take < 10 minutes:
- Payload admin at `/admin` (default). Login protected; editors restricted per §4.1.
- **Dashboard home:** custom Payload dashboard panel "This week" showing: count of drafts, latest published article, quick "New article" / "New video" buttons, and a checklist card linking to the runbook URL (set via env `NEXT_PUBLIC_RUNBOOK_URL`, optional).
- Article editor: title → auto-slug; Lexical toolbar tuned for long-form (H2/H3, bold/italic, lists, quote, link, YouTube block); Markdown paste enabled (maintainer drafts in Markdown); excerpt with live char count; hero image upload with alt text; relatedVideo dropdown searchable by title.
- Videos editor: paste URL → hook auto-detects platform + videoId, auto-fills YouTube thumbnail preview.
- Draft preview: "Preview" button opens the frontend draft view in a new tab.
- Sensible `admin.description` copy on every field; group SEO fields in a collapsed tab.

## 9. SEO, accessibility, performance

**SEO**
- Per-page `generateMetadata`: title template `"%s — EthicAI"`, descriptions from excerpt/field fallbacks, canonical URLs, OpenGraph + Twitter cards (auto OG image via `next/og` for articles: title + brand band).
- `sitemap.ts` (articles, videos excluded, static pages) and `robots.ts` (block `/admin`, `/api`).
- JSON-LD: `Organization` (site-wide), `Article`, `VideoObject`, `BreadcrumbList`.
- 301 redirects from old Squarespace paths if any content URLs are already indexed (`next.config` redirects, maintain list in one file).

**Accessibility (WCAG 2.2 AA target)**
- Semantic landmarks, one `h1` per page, logical heading order; skip link; focus-visible styles everywhere; form labels + inline errors; facade embeds keyboard-operable with descriptive labels; alt text enforced; contrast AA; `prefers-reduced-motion` honoured.

**Performance budgets (Lighthouse mobile, production)**
- LCP < 2.5s on Home and article pages; CLS < 0.1; no third-party script loaded eagerly anywhere (Elfsight interaction-gated; YouTube facades; Substack button-not-script by default); images via `next/image` with correct sizes; fonts subset; JS on article page < 120 KB gzipped target. ISR: article pages `revalidate = 3600` + on-demand revalidation on publish (Payload `revalidate` hook → `/api/revalidate`).

## 10. Milestones

Work in small, reviewable increments. Commit after each passing milestone (conventional commits). Stop for human review at each ✅ checkpoint.

### Phase 0 — Scaffold & infrastructure ✅ checkpoint
- `create-payload-app` (Next.js 15+, Payload 3, Postgres adapter, Lexical, Tailwind template or add Tailwind).
- Configure `@payloadcms/storage-s3` against R2-compatible env vars **from the start** (verify uploads work against a real bucket, not local disk — Netlify will not persist local files).
- `.env.example` with every variable documented; `.gitignore`; ESLint + Prettier; TS strict; Vitest + Playwright wired (one trivial test each).
- App boots locally: `/admin` reachable, first admin user creatable.
- **Acceptance:** `npm run dev` → login to admin → upload an image → it lands in S3/R2 and renders on a test page. `npm run build` passes.

### Phase 1 — Data model ✅ checkpoint
- All collections/globals from §4 with access control, hooks (slug, videoId extraction, revalidation), drafts on `articles`, seed script (`scripts/seed.ts`) that is **idempotent** (upsert by slug/email) and populates: 3 team members + 3 testimonials from Appendix A, 2 demo articles (clearly marked demo), siteSettings placeholders.
- **Acceptance:** seed runs twice without duplicates; editor role cannot reach users/siteSettings; article draft→publish flow works with preview URL.

### Phase 2 — Design system ✅ checkpoint
- Tailwind theme tokens (§6), fonts via `next/font`, all shared components (§6 list) built and demoed on a temporary `/kitchen-sink` route (deleted or access-restricted before launch).
- Header/footer shell responsive 320px → 1440px; mobile nav accessible.
- **Acceptance:** kitchen-sink renders all components; contrast checks pass; no layout shift from fonts/images.

### Phase 3 — Public pages ✅ checkpoint
- Home, About, Articles (list + detail + related/prev-next + reading time), Watch (curated YouTube grid + TikTok facade section), Newsletter (RSS-driven issue list + fallback), Contact (Netlify Form), Privacy Policy, 404 page.
- Full metadata/JSON-LD per §9; sitemap + robots.
- **Acceptance:** every page renders from seeded/real data; Playwright smoke passes; Lighthouse mobile ≥ 90 on Performance/Accessibility/Best Practices/SEO for Home + an article (locally, without Elfsight loaded).

### Phase 4 — Integrations ✅ checkpoint
- Elfsight facade + interaction-gated loader on `/watch` only; fallback when ID unset.
- Substack CTA component everywhere per §5.1; RSS issue list with tests for the parser (fixture XML in repo).
- On-demand revalidation wired to article/video publish events.
- **Acceptance:** with real widget ID + Substack URL in env/siteSettings, `/watch` shows TikTok widget after one click and zero before; `/newsletter` lists real issues; publishing an article revalidates Home + listing within seconds.

### Phase 5 — Admin polish & real content ✅ checkpoint
- Dashboard "This week" panel (§8); field help text pass; editor role tested end-to-end by simulating the weekly workflow (create video → create article linked to it → publish → verify frontend).
- Replace demo seed content with real client copy/assets (provided by maintainer).
- **Acceptance:** full weekly workflow completable in admin in < 10 minutes; no demo content remains.

### Phase 6 — Deploy to Netlify (follow `docs/DEPLOYMENT-NETLIFY.md`) ✅ checkpoint
- Prod env vars, Neon/Supabase DB provisioned, migrations applied, R2 production bucket + CORS, Netlify site + domain cutover plan executed with the human.
- Post-deploy smoke checklist (uploads work!, admin login, forms, Elfsight on prod, RSS on prod, redirects, analytics if chosen).
- **Acceptance:** production site passes the launch checklist in the deployment doc; media upload verified against production specifically (the classic Netlify failure point).

### Phase 7 — Optional enhancements (post-launch, individually approved)
- YouTube RSS auto-sync cron (§7.3).
- Analytics (Plausible snippet gated by siteSettings).
- Article search upgrades (`@payloadcms/plugin-search`), related-content improvements.
- OG image polish, print styles for articles.

## 11. Conventions & guardrails (always in force)

1. TypeScript strict; no `any` (use `unknown` + narrowing); no `@ts-ignore` without a `// REASON:` comment.
2. Server Components by default; add `"use client"` only when interaction demands it; never ship CMS queries to the client — use Payload **Local API** in RSCs, REST only for browser-side needs.
3. Tailwind utility classes in components; no inline `style` except dynamic values; no CSS-in-JS libraries.
4. Never commit secrets; every new env var goes in `.env.example` with a comment. Widget IDs/URLs that editors may change belong in `siteSettings`, not env.
5. All Payload schema changes ship with a committed migration (`payload migrate:create`); migrations must be reversible where practical; document in the PR/commit message.
6. Idempotent seed scripts only; never destructive scripts against prod DB (no `drop` in committed code).
7. Conventional commits (`feat:`, `fix:`, `chore:`…); one milestone-scoped commit or small logical commits; PR description = what changed + how verified + screenshots for UI.
8. Australian English in all user-facing copy and content strings.
9. Third-party scripts: interaction-gated or route-scoped only (see §7). No new third-party dependencies without a `// DECISION:` note.
10. Images: `next/image` always; `remotePatterns` limited to: the R2/S3 public host, `i.ytimg.com`, `img.youtube.com`, Elfsight CDN (only if needed post-load), Substack CDN (only if embedding their widget).
11. Accessibility is a feature, not a phase: every component ships keyboard-operable and labelled.
12. When unsure between two approaches, pick the one with **less client-side JS and fewer moving parts**, and note it.
13. Do not modify `payload.config.ts` plugin order or DB adapter without flagging it in a comment — deployment depends on it.
14. Keep the weekly maintainer in mind: if a content operation requires touching code, it's a design bug — solve it in the admin (fields, hooks, settings).

## 12. Out of scope (do not build unless explicitly asked)

- E-commerce, booking/scheduling, paid content, member areas.
- Storing newsletter subscribers on the site (Substack owns the list).
- TikTok scraping/API integration (Elfsight is the vendor decision).
- Multi-language/i18n (single locale `en-AU`).
- Hosting/serving video files.

---

## Appendix A — Current site copy (captured 22 Oct 2026, for seeding/migration)

**Hero headline:** "A.I. grounded in human dignity"

**Intro:** "In a world where AI is reshaping work and certainty is in short supply, the most powerful thing an organisation can be is adaptable. At EthicAI, we help organisations build the systems, culture, and clarity to move with change. We blend sharp operational insight with deep people strategy to create workplaces that are data led, ethical, and energised for what's next."

**Kara Bombell** — Founder. Strategic operations leader, AI ethics advocate and change agent, 15+ years transforming businesses. Former COO at Digitas; Executive Director of Operations at Isobar. Led large-scale transformation, enterprise automation, multi-country teams, margin and delivery improvements, while championing ethical leadership and inclusive culture. Qualifications in Artificial Intelligence and Business Strategy (MIT Sloan) and Ethics of AI (LSE). Passion: making complexity simple, systems that scale, AI embedded to serve business goals and the greater good.

**Katriel Healy** — Founder. People & Culture leader, a decade supporting Boards and ELTs to navigate change, align people strategy to performance, build resilient purpose-led cultures. Background in organisational development, advertising and psychology; led transformation across workforce redesign, DE&I, HR compliance, engagement, leadership development. Certified Organisational Coach. Partners with leaders to embed ethical, sustainable workforce strategies and navigate AI integration.

**Simon Brock** — Joined EthicAI in 2026. Career spans film and sound production, creative and strategic direction, customer experience design and digital agency leadership across Australia and NZ; work for McDonald's, ALDI, Toyota, EA Games, Tourism Australia. Focused on genuine pathways into AI that don't ask organisations to leave their values at the door.

*(Full unabridged bios are on the current site — maintainer to paste full text into seed content or via admin before launch.)*

**Testimonials (3, verbatim on current site):**
1. "EthicAI very quickly, and with great kindness and humility, understood the cultural orientations and values of our organisation, and was able to offer incredible insights in a short space of time. The unique combination of AI knowledge and cultural awareness and change management expertise is unique and valuable. As a leader, I feel confident in guiding the changes to come, and I am also inspired, knowing all that is possible. A really worthy engagement." — **Deputy Ombudsman**
2. "EthicAI have been instrumental in our next era of AI augmented work. Our staff have a system that works for our needs while giving practitioners back what they need most; time. We aren't technical in the slightest. They made AI understandable and actionable. And our workforce raves about the transformation." — **Business Owner**
3. "EthicAI are what they say on the tin: Ethical. Which for our culture: morals and ethics matter. AI is changing how businesses work, and we see it as a chance to make life easier — for our customers, and for us as a whole. … AI will support us, not replace us. It'll make life easier, helping drive service and relationships." — **Managing Director**

*Note: the current site also embeds a testimonial video (Squarespace-hosted). Export this file from Squarespace before cutover; re-host on YouTube (unlisted if preferred) and reference via the `videos`/`testimonials` model.*

## Appendix B — Environment variables (complete list for `.env.example`)

```bash
# --- Core ---
PAYLOAD_SECRET=                # openssl rand -hex 32
DATABASE_URI=                  # postgres://...  (Neon/Supabase; local for dev)
NEXT_PUBLIC_SITE_URL=          # https://www.ethicai.au (canonical, used for metadata/redirects)

# --- Media (S3-compatible, e.g. Cloudflare R2) ---
S3_BUCKET=
S3_REGION=auto                 # R2 uses "auto"
S3_ENDPOINT=                   # e.g. https://<account>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=                 # public bucket/custom domain URL for next/image remotePatterns

# --- Integrations (non-secret, but env-configurable fallbacks; live values in siteSettings) ---
NEXT_PUBLIC_ELFSIGHT_TIKTOK_ID=   # optional fallback; siteSettings preferred
NEXT_PUBLIC_SUBSTACK_URL=         # optional fallback; siteSettings preferred

# --- Ops ---
REVALIDATE_SECRET=             # for /api/revalidate
CRON_SECRET=                   # for /api/sync-youtube (Milestone 7)
NEXT_PUBLIC_RUNBOOK_URL=       # optional: link on admin dashboard
```

## Appendix C — Reference links

- Payload 3 docs — deployment: https://payloadcms.com/docs/production/deployment
- Netlify official Payload 3 guide: https://developers.netlify.com/guides/deploy-payload-cms-3-to-netlify/
- Known Netlify media-upload issue (why S3 is mandatory): https://github.com/payloadcms/payload/issues/14296
- Payload S3 storage adapter: https://payloadcms.com/docs/storage-remote
- Elfsight TikTok Feed widget + pricing: https://elfsight.com/tiktok-feed-widget/pricing/
- Substack features (embeddable subscribe widget, RSS): https://substack.com/features
- YouTube channel RSS format: `https://www.youtube.com/feeds/videos.xml?channel_id=UC…`
- Australia's AI Ethics Principles (useful context/link for site content): https://www.industry.gov.au/publications/australias-ai-ethics-principles
