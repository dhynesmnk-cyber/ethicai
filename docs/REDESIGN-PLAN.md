# Redesign plan: the EthicAI family look, selma.au, Google SEO and AI search (GEO)

**Status:** built and verified in the sandbox (10 November 2026) on branch `claude/peaceful-sagan-9iylgh`, on top of PR [#1](https://github.com/dhynesmnk-cyber/ethicai/pull/1) (Phases 0–5). The domain cutover (BUILD-SPEC §10, Phase 6) is next and stays with the owner. What was built, how it was verified and what still needs the client: `docs/HANDOVER.md` §2 and §3c.

**Revised the same day (§3a):** the owner found the result too much like a generic SaaS/AI website. The counters and the AI-site tropes were removed and the site is now led by photographs of Australian native trees, as selma.au uses Australian places; "A.I." is written "AI" everywhere.

## 1. Where things stand

- **The new site** (Next.js 16 + Payload 3.92) runs at `https://ethicaiau1.netlify.app`. Search engines are kept out on purpose (`noindex`, `Disallow: /`) because it's a `*.netlify.app` address (`isReviewSite()` in `src/lib/site-url.ts`).
- **`ethicai.au` still serves the old Squarespace site** and redirects to `www.ethicai.au`. Its sitemap lists 27 pages Google knows about:
  - 7 articles under `/insights/*`;
  - `/services`, `/futurefit`, `/academy`, and the shop pages `/aiacademy` and `/aiacademy/p/*`;
  - `/publicsector`, `/report`, `/book-a-consultation`, `/booking`;
  - campaign pages (`/bootcamp`, `/movement`, `/startmate`, `/moodi`);
  - `/about`, `/contact-us`, `/privacy-policy`.

  It already has a "Selma" menu link to `https://selma.au` and a "Selma by EthicAI is ready for impact" announcement bar.
- **selma.au** is newer and more polished: a single page in an Apple-like style. Section 3 records its design system. It has no `robots.txt`, `sitemap.xml` or structured data, and its footer links to `https://ethicai.au` and `https://www.ethicai.au/privacy-policy`.

## 2. Decisions taken

| Question | Decision |
|---|---|
| How Selma relates visually | **One shared family look, taken from Selma's newer style.** EthicAI becomes the parent brand within Selma's design system, and the eucalyptus green and Fraunces headings are retired. |
| AI crawlers | **Allow search and training crawlers by default**, with an admin setting to switch to "search only" or "block all". |
| Canonical address | **`https://ethicai.au`** (no www). `www` redirects to it permanently. |
| Selma's video hero | Not reused. AGENTS.md rule 3 keeps video files off this site, and a background video would break the LCP budget. The hero is a still image plus CSS-only motion instead. |
| A `/selma` page on ethicai.au | Not built: it would compete with selma.au in search. EthicAI presents Selma on Home, About, in the menu, the footer and the structured data, and links to selma.au. |

## 3. The family design system (taken from selma.au)

| Element | Selma (reference) | EthicAI after the redesign |
|---|---|---|
| Type | Plus Jakarta Sans 300–800; JetBrains Mono 500 for labels | Plus Jakarta Sans only, self-hosted with `next/font/local` from `@fontsource-variable` (no Google Fonts call). No monospace (§3a) |
| Colours | night `#0A0A0C`, ink `#1D1D1F`, grey `#6E6E73`, mist `#F5F5F7`, white, indigo `#534AB7` / `#9B95D8` / `#3D358A` | The same tokens in `globals.css` `@theme`. `canvas` and `sand` go; the contrast test is rewritten for light and dark sections |
| Headlines | 700–800 weight, tracking −0.02 to −0.03em, line-height 1.0–1.15, hero 52–108px | Same |
| Hero | Full-screen photograph, content at the bottom, fade to black, eyebrow in light indigo | Same layout over a photograph of Australian native trees (a bundled default per page, replaceable in the admin). A plain sentence-case line above the headline, no eyebrow |
| Menu bar | Transparent over the hero, frosted white on scroll (`saturate(180%) blur(20px)`) | Same, in CSS only (scroll-driven animation plus `body:has(.hero-dark)`); no new client JavaScript |
| Buttons | Indigo pills; underlined ghost links on dark | Same (`Button` variants) |
| Cards and sections | 16–18px radius, 0.5px hairlines, mist bands, numbered 01–04 steps, stats strip, indigo promo band, FAQ | Radius, hairlines, mist bands and FAQ kept. Services and steps sit under hairlines (no numbered cards), no stats strip, and the closing band is a photograph |
| Motion | Fade-in on scroll | None for decoration (§3a). Only hover transitions and the header turning to glass |

**Accessibility:** focus rings are indigo on light sections and light indigo on dark ones (indigo is too dark against night). The skip link stays the first Tab stop. Each page keeps one `h1`. Contrast stays at AA.

### Family cues (how visitors see that Selma is part of EthicAI)
- **Family bar:** a thin night strip above the menu: "EthicAI · Selma ↗", plus an announcement editable in the admin (e.g. "Selma ships January 2027: join the waitlist ↗").
- **Menu:** a "Selma ↗" item linking to `https://selma.au`, with the accessible name "Selma (opens selma.au)".
- **"Meet Selma" on Home:** a photograph (snow gums) with the headline over it, then the five Human at the Helm™ parts as a plain list on night (Constitution, Stitch, Trace, Guardrail, Ledger), and "Visit selma.au" and "Join the waitlist" buttons.
- **Shared proof:** press coverage (IT Brief, SecurityBrief, the launch release). The stats strip was removed in §3a.
- **Footer:** a night footer with an "EthicAI family" column (EthicAI, Selma ↗), "EthicAI Pty Ltd · ABN 13 686 628 848 · Sydney", and the Acknowledgement of Country and inclusion statement from the current site.
- ~~Shared ring mark~~: removed in §3a (it read as an "AI" motif). The favicon is a plain "E" until the client's logo files arrive.

## 3a. Photography revision (10 November 2026)

The owner's feedback on the first build: *"too much like a generic SaaS website. Remove the counters and the tropes used a lot in AI website design. Use Australian photography like the Selma website does (I like the native trees). Change A.I. to AI."*

**Removed:** the stats strip ("counters") on Home and About and its admin field; the indigo aurora glow; the orbiting ring mark (heroes, Meet Selma, footer, newsletter band, share images, favicon); film grain; frosted glass cards; JetBrains Mono; numbered 01–04 service cards; uppercase "eyebrow" labels over every heading; cards lifting with an indigo glow on hover; fade-up-on-scroll and the hero text rising in. The solid indigo promo boxes became calm mist boxes.

**Added:** a photograph of Australian native trees at the top of every main page, behind Meet Selma and behind the closing newsletter band, the way selma.au uses Australian places. Nine Creative Commons photos from Wikimedia Commons (no watermarks; real places, mostly around Sydney) are bundled as defaults:

| Place | Photo | Licence |
|---|---|---|
| Home | Sydney blue gum forest, Westleigh | CC BY-SA 4.0 |
| About | Sydney red gum canopy, Palm Beach | CC BY-SA 4.0 |
| Services | Spotted gum forest, Pokolbin | CC BY 2.0 |
| Articles | Scribbly gum bark, Royal National Park | CC BY 2.0 |
| Watch | Eucalypt at golden hour, Gundaroo | CC BY 2.0 |
| Newsletter | Gums in the Sydney winter fog | CC BY 2.0 |
| Contact | Sydney red gums, Royal National Park | CC BY-SA 4.0 |
| Meet Selma | Snow gums, Kosciuszko National Park | CC BY 2.0 |
| Closing band | Gum tree under the moon, Mount Majura | CC BY-SA 4.0 |

- Each one can be replaced in the admin (*Page copy → Photos*, Home under *Home → Hero*), so changing a photo needs no code change. The credits the licences ask for are on `/photo-credits`, linked from the footer; a replaced photo drops off that list.
- Text over a photo sits on a dark fade, checked at 4.5:1 or better behind every line of hero text at 375px and 1440px.
- Privacy, the 404 page and the contact thank-you page open on a plain light header instead.
- The share images are plain typographic cards (no glow or rings); a photo there would need the image read from disk inside the share-image function, which depends on how Netlify bundles files.

**Content model:** migration `20261110_202619_photos_and_ai` drops `page_copy_stats`, adds the eight photo slots, rewrites "A.I." as "AI" in every plain-text copy field, and fills the starting copy on an empty database (moved there from `family_redesign`; see `docs/HANDOVER.md` §5).

## 4. Content model (all editable in the admin; each change ships with a migration)

- **New `pageCopy` global.** It replaces `src/content/site-copy.ts` and closes the handover's open "page copy" item.
  - Home: hero (eyebrow, headline, subhead, image), statement, value props, FAQ, press. (Stats removed and a Photos tab added in §3a.)
  - About: the story.
- **`siteSettings`** gains three tabs:
  - **Selma & family:** show/hide, Selma URL (default `https://selma.au`), tagline "AI that answers only to you.", summary, the five suite items, waitlist URL, announcement text and link, on/off.
  - **Legal:** legal name, ABN, locality, Acknowledgement of Country, inclusion statement.
  - **Search:** Google and Bing verification codes, and the AI crawler policy.
- **New `services` collection** (title, slug, summary, body, order, published), shown at `/services` and `/services/[slug]`. Seeded with FutureFit Diagnostic, Consulting, EthicAI Academy and Public Sector Insights, using the current Squarespace copy (needs client sign-off).
- **`teamMembers`:** add `linkedinUrl` and `credentials` (e.g. MIT Sloan, LSE).
- **`users`:** add `profile` (link to a team member), so article bylines link to the author's profile.
- **`articles`:** add `keyTakeaways` (up to five points), shown first as "In short".
- **Seed** (idempotent, as now): fills the new globals and migrates the 7 Squarespace insight articles with the same slugs, original dates and Kara as author.
- **Help text** on every new field (enforced by `tests/unit/admin-help-text.test.ts`).

## 5. Pages

- **Home**, top to bottom:
  1. Family bar and menu.
  2. Full-screen photo hero: "AI grounded in human dignity", with "Work with us" and "Meet Selma ↗".
  3. A large centred statement (the current intro).
  4. ~~Stats strip~~ (removed in §3a).
  5. What we do (services).
  6. **Meet Selma.**
  7. Latest thinking: one lead article and two cards.
  8. Watch strip (dark).
  9. Testimonials.
  10. Team.
  11. FAQ.
  12. Press.
  13. Indigo newsletter band, then the footer.
- **About:** dark intro; team in Selma's portrait style with full bios, credentials and LinkedIn; "Selma is our knowledge, productised" linking to selma.au.
- **Services:** listing plus detail pages with numbered "how we work" steps, an FAQ and a contact call to action.
- **Articles:** a lead story above the grid; article pages with "In short", an author box with credentials, and visible published and updated dates.
- **Watch, Newsletter, Contact, Privacy, 404:** restyled.
- **Share images:** restyled (night background, indigo glow, rings). AVIF turned on in `next.config.ts`.

## 6. Google SEO

1. **Cutover without losing rankings.**
   - Netlify primary domain `ethicai.au`, with `www` → apex as a 301.
   - Set `NEXT_PUBLIC_SITE_URL=https://ethicai.au`; indexing then switches itself on.
   - Leave the MX, SPF and DKIM records alone.
   - If DNS sits behind Cloudflare, turn off its AI-bot blocking so it matches the allow-all policy.
2. **Redirect every Squarespace URL** (`src/lib/redirects.ts`):

   | Old page | New page |
   |---|---|
   | `/insights` | `/articles` |
   | `/insights/:slug` | `/articles/:slug` |
   | `/contact-us`, `/book-a-consultation`, `/booking` | `/contact` |
   | `/futurefit` | `/services/futurefit-diagnostic` |
   | `/academy`, `/aiacademy/*` | `/services/academy` |
   | `/publicsector`, `/report` | `/services/public-sector-insights` |
   | `/cart` | `/` |
   | campaign pages | the closest match the client confirms |

   A test checks every URL from the Squarespace sitemap.
3. **One linked set of structured data** (`src/lib/structured-data.ts`):
   - `Organization` (`https://ethicai.au/#organization`): legal name, logo, ABN, Sydney, area served Australia, social profiles, founders, and **`owns` the `Product` "Selma" (`https://selma.au/#product`), with EthicAI as its maker**.
   - `WebSite` (en-AU).
   - Per page: `WebPage`, `AboutPage`, `ContactPage` or `CollectionPage`, with visible breadcrumbs and `BreadcrumbList`.
   - A `Person` for each team member.
   - `Article` with a real author `Person`.
   - `Service`, `FAQPage` and `VideoObject`.

   Only markup that matches what's visible on the page. No search box markup: Google retired that feature.
4. **Titles and descriptions** that name the entity (e.g. "EthicAI: AI ethics & governance consultancy, Sydney · makers of Selma"). Search Console and Bing verification come from the admin.
5. **Sitemap** with last-modified dates, service pages and article images.
6. **Speed budgets kept:** LCP under 2.5s, CLS under 0.1, INP kept low by adding no client JavaScript, Lighthouse mobile 90 or above.

## 7. AI search (GEO)

1. **`robots.txt` names the AI crawlers** (OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended, Applebot-Extended, CCBot and others). What each may crawl follows the admin's AI policy, allow-all by default. `/admin` and `/api/` stay blocked for everyone.
2. **`/llms.txt` and `/llms-full.txt`**, built from the CMS:
   - who EthicAI is and how it relates to Selma;
   - services and the latest articles with one-line summaries;
   - the full article text as Markdown.

   Cheap to provide; no major AI company has confirmed it reads these files.
3. **RSS feed** at `/articles/feed.xml`.
4. **IndexNow:** publishing, updating or unpublishing notifies Bing and the other IndexNow engines straight away. Bing's index also feeds Copilot and DuckDuckGo and is one source behind ChatGPT search. New variable `INDEXNOW_KEY` in `.env.example`. Skipped on review sites.
5. **Writing that's easy to quote:**
   - key takeaways first, question-style headings, visible dates, author credentials, sources linked;
   - one description of EthicAI used word for word everywhere (schema, `llms.txt`, footer, selma.au);
   - a short checklist added to `docs/WEEKLY-RUNBOOK.md`.
6. **Hand-off note for selma.au** (`docs/SELMA-SEO-HANDOFF.md`): a `Product` structured-data snippet pointing at EthicAI, `robots.txt`, `sitemap.xml`, a canonical tag, `llms.txt`, and the footer link updated to `https://ethicai.au/privacy-policy`.

## 8. Delivery order

Each step stops for review, as the build spec does.

1. **Design system, menu bar and footer** (§3); kitchen-sink and contrast tests updated.
2. **Content model, migrations and seed** (§4).
3. **Pages** (§5).
4. **SEO, GEO and redirects** (§6–7).
5. **Checks** (§9), then the domain cutover with the owner present (`docs/DEPLOYMENT-NETLIFY.md`).

## 9. How it will be checked

- `npm run lint && npm run typecheck && npm run build && npm run test`, plus the Playwright suite.
- **New unit tests:**
  - colour contrast (light and dark);
  - `robots.txt` for each AI policy;
  - structured data (unique ids, no references that point nowhere);
  - `llms.txt` and RSS;
  - redirects cover every Squarespace URL;
  - IndexNow is off on review sites.
- **New and updated browser tests:**
  - Selma links point to `https://selma.au`;
  - the skip link is still first, with one `h1`;
  - no sideways scrolling from 320px to 1440px;
  - menu bar contrast over the dark hero, before and after scrolling;
  - the FAQ works with the keyboard;
  - reduced motion stops animation;
  - structured data parses;
  - old URLs return 301 and then 200.
- **Lighthouse mobile** on Home and an article. Google's Rich Results Test and the schema.org validator on the review site.
- **Before/after screenshots** at 375px and 1440px.
- **After cutover:** check every old URL on www and apex; confirm `robots.txt` and `llms.txt` are live; set up a Search Console domain property with the sitemap submitted; import into Bing Webmaster Tools; confirm IndexNow accepts the pings.

## 10. Needed from the client before launch

These don't block the build.

- EthicAI and Selma logo SVGs and a favicon; the client's own photography, if they want to replace the bundled Creative Commons photos (§3a).
- What happens to the **AI Academy shop** (`/aiacademy/p/*`, cart). E-commerce is out of scope for this site (BUILD-SPEC §12): keep it on a subdomain or move it elsewhere.
- Where `/bootcamp`, `/movement`, `/startmate`, `/moodi` and `/report` should go.
- Sign-off on the stats, press items and services copy; team LinkedIn URLs.
- Who manages the DNS and registrar; access to Search Console and Bing Webmaster Tools.
