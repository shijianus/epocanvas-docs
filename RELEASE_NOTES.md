# v1.2.0

Release date: 2026-09-11

- **Site**: [https://doc.epocanvas.com](https://doc.epocanvas.com) (mirror: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev))
- **Source**: [https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)

v1.2.0 is the first tagged release of EpoCanvas Docs, the official documentation site of the EpoCanvas project. The site is built with Astro 5 and Starlight, and this release completes its reading experience, search, localization, and deployment workflow.

## Features

- **Three-column reading layout**: category navigation on the left, article content in the center, and a per-page table of contents on the right that highlights the current section while scrolling. The sidebar keeps its scroll position across page transitions. The content width is capped for long-form reading.
- **Dual-mode search**: the header search box finds matches within the current page, and the `Ctrl+K` / `Cmd+K` dialog searches the whole site. Search is powered by Pagefind; the index is generated at build time and all queries run in the browser, so no third-party search service is required and the site works on intranets and offline.
- **Interface localization**: the UI ships with 10 languages — Simplified Chinese (default), Traditional Chinese, English, Japanese, Korean, Spanish, French, German, Russian, and Portuguese. Switching updates the text in place, without a page reload, and preserves the reading position.
- **Markdown extensions**: five admonition types (`:::note`, `:::tip`, `:::important`, `:::warning`, `:::caution`), Shiki syntax highlighting with file-name labels, line highlighting, and diff rendering.
- **Theme**: dark theme by default, following the system preference, with a manual toggle in the header.

## Deployment

- The site builds to static files and is hosted on Cloudflare Pages, with the custom domain `doc.epocanvas.com` and automatically provisioned HTTPS certificates.
- `pnpm run deploy` builds the site and publishes it in a single step.

## Other Changes

- Removed leftover test pages and components from earlier development stages. Documentation file names now match their content, and legacy URLs redirect to their new locations.
- The project is released under the MIT license.

## Upgrade

If you maintain a local copy, pull the latest code and rebuild:

```bash
git pull
pnpm install
pnpm run build
```

No configuration changes are required; existing content continues to work unchanged.
