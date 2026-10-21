# EthicAI — Weekly Maintenance Runbook

Your operating manual for the content pipeline. Target: **~1.5–2.5 hours/week** for 2–4 videos. Keep this file open on publishing day; tick the checklist at the bottom.

---

## The pipeline

```
Client sends raw video(s)
        │  (Drive/Dropbox/WeTransfer)
        ▼
1. Transcribe ──────────── Whisper locally (free) or platform auto-captions
        │
        ▼
2. Write article ────────── AI-assisted first draft → your human edit in EthicAI voice
        │
        ▼
3. Publish on site ──────── Admin: add video entry → add article → link them → publish
        │
        ▼
4. Newsletter (Substack) ── Group the week's posts → issue from template → schedule send
        │
        ▼
5. Light touches ────────── Client's socials (optional), skim analytics weekly, tidy tasks
```

## Step 1 — Transcribe (10–20 min, mostly hands-off)

**If the video is already public on YouTube/TikTok:** grab the platform's auto-captions first — often good enough and zero setup. (YouTube: "Show transcript" in the description panel; TikTok: captions toggle.)

**For raw files (recommended default — local, free, private):**

```bash
# One-time setup
pip install -U openai-whisper ffmpeg
# or the faster engine: pip install -U faster-whisper

# Per video (medium model ≈ good accuracy for AU/US English; use 'large-v3' if accents trip it)
whisper client-video.mp4 --model medium --language en --output_format txt --output_dir ./transcripts
```

Mac users: **MacWhisper** (free tier fine) does the same with a GUI. Any of these runs fully locally — no per-minute cost, nothing uploaded to a third party (clients may appreciate the confidentiality angle; it fits EthicAI's brand).

Post-process (2 min): strip timestamps, fix obvious mishearings of names/terms (Kara, Katriel, "EthicAI", "AI ethics", org names).

## Step 2 — Write the article (30–45 min)

Use a two-pass approach: machine draft, human voice.

**Draft prompt (adapt to your tool of choice):**

> You are writing for EthicAI (ethicai.au), an Australian consultancy on ethical AI adoption and people strategy. Voice: warm, credible, plain-spoken, human-centred; Australian English; no hype, no jargon, no em-dash overuse. Turn this video transcript into a 500–800 word article: a hook that states the tension, 2–4 sections with H2s capturing the key ideas, one pull-quote-worthy line, and a short close that invites reflection or action. Keep every claim grounded in the transcript — do not invent facts or statistics. Transcript: [paste]

**Your edit pass (the part that matters):**
- Verify every claim against the transcript; cut AI filler ("In today's fast-paced world…").
- Add the EthicAI angle: why this matters for *Australian organisations* / people strategy.
- Title: specific and human, not clickbait. Excerpt ≤ 300 chars — it becomes the meta description and newsletter teaser, so make it self-contained.
- Pick 1–3 tags consistent with existing tags (check the admin tags list before inventing new ones).

**Article skeleton (matches the site's content model):**
1. Hook (1–2 short paragraphs, the tension)
2. H2 sections (2–4) — the ideas from the video, in readable prose
3. Pull quote (Lexical quote block) — the most shareable line
4. Close + CTA line ("Watch the 60-second original on TikTok/YouTube — link above.")

## Step 3 — Publish on the site (10–15 min)

In `/admin`, in this order:

1. **Videos → New video.** Paste the TikTok/YouTube URL — platform, video ID and YouTube thumbnail fill automatically. Set `publishedAt` to the real platform date. Tick `featured` if it should appear on Home.
2. **Articles → New article.** Title (slug auto), excerpt, hero image (upload + **alt text is required** — describe the image, don't keyword-stuff), paste/Markdown-convert the body, set author, tags, and **link `relatedVideo`** to the entry from step 1 (this puts the video embed at the top of the article and a "Read the summary" card on the feed).
3. Save as **draft** → hit **Preview** → read it once on mobile width → **Publish**.
4. Quick checks: article appears on Home "Latest" and `/articles`; the video shows on `/watch`; the YouTube facade plays.

**Hero images:** if the client doesn't supply artwork, a clean frame grab from the video works (macOS: pause + ⇧⌘4, or `ffmpeg -ss 00:00:12 -i video.mp4 -frames:v 1 grab.jpg`). Keep under ~2 MB, landscape ~16:9.

## Step 4 — Weekly newsletter on Substack (30–45 min)

Cadence suggestion: **send Friday 7–8am AEST** (good open rates for professionals; write Thursday, schedule it).

**Issue template — "The EthicAI Weekly" (rename to taste):**

```
Subject: [Theme of the week] + 1 concrete hook
  e.g. "AI won't replace your people. Bad rollout will."

Preview text: one line teasing the best item.

Hi [first_name],

[2–3 sentence intro: the thread connecting this week's posts — group them
under a theme, don't just list them.]

━━ This week ━━

▸ [Article title] (TikTok/YouTube, 2 min)
  [2–3 sentence summary of the insight — write for a skimming exec.
  What's the takeaway? Why now?]
  → Read the full piece: [site article URL]

▸ [Article title]
  [summary]
  → Read: [URL]

▸ Worth watching: [any video posted without an article this week]
  → [platform URL]

━━ One idea to sit with ━━
[A single quote or question from the week's content — the pull-quote you
already wrote. This section is what makes it feel curated, not automated.]

[Standard footer: who you are, one line, unsubscribe is automatic on Substack]
```

Practical notes:
- Write the issue **from the excerpts you already wrote** — the newsletter is 80% assembled during Step 2 if you keep excerpts strong.
- Group 2–4 posts under one theme; if the week is thin (1 post), that's fine — a short issue beats a padded one. Consistency > volume.
- In Substack: Posts → New post → paste → **Schedule**. Turn on "Send as email to everyone."
- The website's `/newsletter` page auto-lists recent issues (hourly refresh) — nothing to do there.
- Growth loop: every TikTok/YouTube caption and every article ends with "Full write-up + weekly summary → ethicai.au/newsletter". Ask the client to do the same on their socials.
- Compliance (Australia): Substack handles Spam Act 2003 essentials (consent at signup, unsubscribe in every email). Your job: never add addresses without consent, keep the site privacy policy accurate.

## Step 5 — Weekly light touches (10 min)

- Skim Netlify analytics / Plausible (if enabled): what got read? Note for the client.
- Elfsight dashboard: check TikTok widget **view usage** vs plan limit (free tier = 200/mo — if you're near it, upgrade the plan or the widget silently stops serving).
- Anything the client sent that's queued for next week? Log it.

---

## Monthly checklist (~45 min, first Monday)

- [ ] `npm audit` + review Dependabot/Renovate PRs; update Payload & Next minor versions on a branch, test admin + a publish, then merge (never blind-merge framework majors)
- [ ] Verify DB backups actually ran (Neon/Supabase dashboard); test-restore once a quarter
- [ ] Substack: export subscriber CSV backup; review open rates / best-performing theme
- [ ] Broken-link check (free: brokenlinkcheck.com against the site)
- [ ] Review analytics → send client a 5-line "what worked this month" note (huge perceived value, tiny effort)
- [ ] Check SSL, Netlify function error log, R2 storage usage

## Quarterly

- [ ] Lighthouse re-audit (mobile) on Home, an article, /watch
- [ ] Content review: stale articles, tags sprawl, hero images
- [ ] SEO: Google Search Console — queries, coverage, any crawl errors; refresh 1–2 older articles
- [ ] Dependency majors (Next, Payload, Tailwind) — budget a half-day, run the Playwright smoke suite
- [ ] Client check-in: newsletter performance, feed engagement, anything new they want surfaced

## Troubleshooting quick hits

| Symptom | First move |
|---|---|
| Image upload fails in admin (prod) | R2 credentials/CORS — see deployment doc §2; this is never a "Netlify disk" fix, disk storage must stay off |
| TikTok feed blank on /watch | Elfsight view quota exhausted, or widget ID changed in their dashboard → update `siteSettings.elfsightTikTokWidgetId` (no redeploy needed) |
| Newsletter page shows no issues | Substack RSS hiccup or publication URL typo in siteSettings; page degrades gracefully by design — fix the URL |
| New article not on Home | Wait for revalidation (≤ a few seconds on publish hook; ISR max 1h) → or hit `/api/revalidate` with secret |
| YouTube facade shows grey box | Video is private/age-restricted/embedding-disabled on YouTube |
| Admin slow on big uploads | Expected on serverless; keep images < 2 MB (they should be — video files never go here) |

---

## ✅ Weekly publishing checklist (print me)

```
Week of: ____________   Videos received: ___   Articles published: ___   Issue sent: ___

[ ] 1. Videos downloaded/organised (client folder dated)
[ ] 2. Transcripts generated + cleaned
[ ] 3. Articles drafted (AI pass) and HUMAN-EDITED in EthicAI voice
[ ] 4. Claims verified against transcripts; AU English check
[ ] 5. Video entries created in admin (correct platform date, featured flag)
[ ] 6. Articles created: excerpt ≤300 chars, hero + alt text, tags consistent,
       relatedVideo linked
[ ] 7. Previewed on mobile → published
[ ] 8. Frontend spot-check: Home, /articles, /watch, article page, feed card links back
[ ] 9. Substack issue written from template, theme-grouped, links tested
[ ] 10. Issue scheduled (Fri 7am AEST) / sent
[ ] 11. Elfsight quota + analytics skim
[ ] 12. Next week's raw files logged
```
