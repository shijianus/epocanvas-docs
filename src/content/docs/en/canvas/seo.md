---
title: SEO & Performance Optimization
description: The SEO capabilities built into EpoCanvas Docs (meta tags, Open Graph, sitemap, robots.txt) and its performance mechanisms, plus how to submit the site to search engines.
---

Documentation is written for people to read, which assumes it can be found and loads fast. **EpoCanvas Docs** ships with a set of out-of-the-box SEO capabilities and performance mechanisms at the build level. This page explains what they are, how to verify them, and what still needs to be done after launch.

---

## Built-In SEO Capabilities

All of the following take effect automatically at build time and need no extra configuration:

| Capability | Implementation | How to verify |
| :--- | :--- | :--- |
| Page title | `<title>Article Title \| EpoCanvas Docs</title>`, taken from Frontmatter | View the page source or the browser tab |
| Page description | `<meta name="description">`, taken from the Frontmatter `description` | View the page source |
| Open Graph tags | `og:title`, `og:type`, `og:url`, `og:locale`, `og:description`; show a card when the link is shared on social platforms | Paste the link into a chat app to preview |
| Canonical links | `<link rel="canonical">` generated automatically on every page, pointing to the primary domain | View the page source |
| Sitemap | `sitemap-index.xml` generated automatically at build time | Visit `/sitemap-index.xml` |
| robots.txt | The project includes `public/robots.txt`, allowing all crawlers and declaring the sitemap location | Visit `/robots.txt` |

:::tip
The Frontmatter `title` and `description` are the main material search engines display. Always write a short, accurate `description` for every document — this is the single most impactful SEO improvement.
:::

### Canonical and the Mirror Domain

The site's primary domain is `docs.epocanvas.com`; the `<site>` configuration matches it, and every page's canonical and `og:url` point to the primary domain. Even though the content is also mirrored at `epocanvas-docs.pages.dev`, search engines consolidate the ranking weight onto the primary domain and do not flag it as duplicate content.

---

## Performance Mechanisms

### Pure Static Output, No Framework Runtime

The build output is pure HTML + CSS. Page navigation, reading, and TOC scroll highlighting require downloading no front-end framework at all (React/Vue and similar runtimes are zero bytes); only interactive components such as search, theme toggle, and language switching load a small amount of script on demand. First-screen rendering does not wait for JavaScript, so weak networks and low-end devices stay smooth.

### Image Compression at Build Time

Static assets referenced through `public/` are served by the CDN at deployment; the build toolchain includes the sharp image processing module, reserving the ability to add build-time image optimization later. The current conventions require screenshots to be kept around 1440 pixels wide and diagrams to use SVG first, controlling image size at the source.

### Search Index Loaded On Demand

Pagefind generates highly compressed index shards during `pnpm run build`. Readers download no index when opening a page; only when someone actually uses site-wide search does the browser fetch the matching shards for the keywords (a few KB to a few dozen KB), leaving the first screen unaffected.

### How to Verify Performance

1. Open the **Network** panel in the browser developer tools, refresh the page, and check the first-screen transfer size;
2. Run a **Lighthouse** audit (Performance category) in a Chrome incognito window and check the score;
3. Use `curl -sI https://docs.epocanvas.com` to check that CDN caching policies such as `Cache-Control` are present in the response headers.

---

## Three Things Worth Doing After Launch

Once deployment is complete (see [Deploying to Cloudflare Pages](/canvas/cloudflare/)), complete the following in order:

### 1. Submit the Sitemap to Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and add the property `docs.epocanvas.com`;
2. Verify domain ownership via a DNS TXT record as prompted (takes a few minutes when the domain is hosted on Cloudflare);
3. Submit `https://docs.epocanvas.com/sitemap-index.xml` under "Sitemaps" in the left menu.

### 2. Verify Indexing

A week after launch, search Google with `site:docs.epocanvas.com` to confirm the articles are indexed; check the "Pages" report in Search Console to see whether the number of indexed pages matches the number of documents.

### 3. Check for Broken Links Regularly

After restructuring the documentation or renaming paths, old links referenced elsewhere may break. Check the "Not found (404)" entries in Search Console's "Pages" report, and add redirects for high-traffic dead paths in the `redirects` table of `astro.config.mjs`.

:::caution
The `epocanvas-docs.pages.dev` mirror domain is only a fallback access entry; the canonical already ensures search engines index only the primary domain. Do not actively share the mirror address elsewhere, so readers do not bookmark a domain you do not control.
:::
