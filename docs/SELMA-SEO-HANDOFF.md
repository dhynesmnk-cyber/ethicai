# selma.au: changes to match ethicai.au

For whoever maintains selma.au. It lives outside this repository, so these are suggestions to copy across, not changes made here. Checked against selma.au on 10 November 2026.

## Why

ethicai.au now presents Selma as part of the EthicAI family: a family bar on every page, a Selma link in the menu, a "Meet Selma" section on Home and structured data saying EthicAI makes Selma. Search engines and AI assistants trust that link more when selma.au says the same thing back, with the same names and identifiers.

## What selma.au has today

- Good: a clear title and description, Open Graph and Twitter tags, "Selma by EthicAI" in the menu and footer, a visible FAQ.
- Missing: `robots.txt` and `sitemap.xml` (both return the host's 404 page), structured data (no JSON-LD), a canonical link, and `lang="en-AU"` (it says `en`).
- Links: the footer links to `https://www.ethicai.au/privacy-policy`. After the domain moves, `www` redirects to the apex, so change it to `https://ethicai.au/privacy-policy` and `https://ethicai.au` to skip the redirect.

## 1. In `<head>`

```html
<html lang="en-AU">
…
<link rel="canonical" href="https://selma.au/" />
<script type="application/ld+json">
[
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://selma.au/#product",
    "name": "Selma",
    "url": "https://selma.au",
    "slogan": "AI that answers only to you.",
    "description": "Selma is AI that lives in your building, not the cloud. Selma knows your organisation, follows your rules, and nothing you put in ever leaves your organisation.",
    "brand": { "@type": "Brand", "name": "Selma" },
    "manufacturer": { "@id": "https://ethicai.au/#organization" },
    "category": "On-premises AI system"
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://ethicai.au/#organization",
    "name": "EthicAI",
    "legalName": "EthicAI Pty Ltd",
    "url": "https://ethicai.au/",
    "logo": "https://ethicai.au/logo.png"
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://selma.au/#website",
    "name": "Selma",
    "url": "https://selma.au/",
    "inLanguage": "en-AU",
    "publisher": { "@id": "https://ethicai.au/#organization" }
  }
]
</script>
```

The two `@id` values are the important part: ethicai.au uses exactly `https://selma.au/#product` for Selma and `https://ethicai.au/#organization` for EthicAI, so the two sites describe one connected set of records. Keep the description word for word the same as ethicai.au's *Site settings → Selma & family → Summary*.

Optionally, add an `FAQPage` record matching selma.au's visible FAQ (same questions and answers, word for word). Google only shows FAQ rich results for government and health sites, but other search engines and AI assistants read the markup.

## 2. `robots.txt` (at `https://selma.au/robots.txt`)

```text
User-agent: *
Allow: /

Sitemap: https://selma.au/sitemap.xml
```

ethicai.au lets AI search and training crawlers in by default. If selma.au wants a different policy, say so explicitly with named user agents; ethicai.au's `src/lib/robots.ts` has the current list.

## 3. `sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://selma.au/</loc></url>
</urlset>
```

## 4. `llms.txt` (optional)

```markdown
# Selma

> Selma is local AI for organisations that can't use cloud AI: a machine that lives in your building, runs on your power and works only from your own documents. Made by EthicAI (https://ethicai.au), a Sydney-based AI ethics and governance consultancy.

- Selma is in pilot with Australian organisations and ships in January 2027.
- The Human at the Helm™ Suite: the Constitution, Stitch, Trace, Guardrail and Ledger.

## Links

- [Selma](https://selma.au): overview, how it works, the suite, who it's for, FAQ, waitlist
- [EthicAI](https://ethicai.au): the team behind Selma
- [EthicAI on Selma](https://ethicai.au/llms.txt): how Selma fits with EthicAI's services
```

## 5. Look like one family (optional)

ethicai.au now uses selma.au's design system (Plus Jakarta Sans, night `#0A0A0C`, indigo `#534AB7`, and photographs of Australian native trees). To close the loop, selma.au could show the same thin bar at the very top: "EthicAI · **Selma**", with EthicAI linking to `https://ethicai.au`.

## 6. Once selma.au is updated

- Add `selma.au` to Google Search Console and Bing Webmaster Tools under the same Google account as ethicai.au.
- Check both sites in Google's Rich Results Test.
