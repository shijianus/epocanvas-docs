# EpoCanvas Docs v1.2.0

Release date: 2026-09-11

- **Site**: [https://docs.epocanvas.com](https://docs.epocanvas.com) (mirror: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev))
- **Source**: [https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)
- **License**: MIT

## Overview

EpoCanvas Docs is the official documentation site of the EpoCanvas project. It is built with Astro 5 and Starlight, styled through a set of overridden Starlight components and a single theme stylesheet, and published to Cloudflare Pages as a fully static site.

v1.2.0 is the first tagged release. It completes the reading experience, search, localization, authoring workflow, and deployment pipeline that the documentation describes, and it is the version the project will build on going forward.

## Highlights

- A three-column reading layout with a per-page outline that tracks the current section, and a sidebar that keeps its scroll position across page transitions.
- Dual-mode search: in-page lookup from the header search box, and site-wide search in a `Ctrl+K` / `Cmd+K` dialog. Everything runs locally in the browser.
- An interface translated into 10 languages; the language picker links to the same page in the target language.
- Extended Markdown support: four admonition types, Expressive Code (Shiki) syntax highlighting with file-name labels, line highlighting, diff rendering, and GFM tables.
- One-command deployment to Cloudflare Pages with automatic HTTPS on a custom domain.

## Reading Experience

- **Three-column layout**: category navigation on the left, article content in the center, and the current page's table of contents on the right. The content column is width-capped (60rem) for comfortable long-form reading.
- **Outline follow-highlight**: the right-hand outline picks up every `h2`/`h3` heading and highlights the section currently in view; entries link smoothly to their anchors.
- **Sidebar scroll persistence**: switching pages preserves the navigation's scroll position, so readers don't lose their place in deep category trees.
- **Theme**: the dark theme is the default, follows the operating system preference, and can be toggled manually from the header.

## Search

- **In-page lookup**: the search box in the header finds matches within the current page, with keyword highlighting and a match count.
- **Site-wide search**: pressing `Ctrl+K` (macOS: `Cmd+K`) opens a full-site search dialog. It is powered by Pagefind: the index is generated at build time, and all queries run in the browser.
- No third-party search service is involved, so search keeps working on intranets and offline. Chinese and English content are both indexed.

## Localization

- The interface ships with 10 languages: Simplified Chinese (default), Traditional Chinese, English, Japanese, Korean, Spanish, French, German, Russian, and Portuguese.
- Switching languages navigates to the same page in the target language. Each language has its own URL, so a translated page can be bookmarked and shared directly.
- Translations live in a single dictionary (`src/utils/i18n.ts`) and are rendered at build time, so adding a language is a one-file change.

## Authoring and Markdown Support

- Pages are plain Markdown files under `src/content/docs/`, registered in the sidebar defined in `astro.config.mjs`. A `title` and `description` in the frontmatter are required.
- **Admonitions**: four callout types — `:::note`, `:::tip`, `:::caution`, `:::danger`.
- **Code blocks**: rendered with Expressive Code (Shiki), including syntax highlighting, file-name labels on the title bar, line numbers, per-line highlighting, diff rendering, and a copy button.
- **Extended Markdown**: GFM tables, task lists, and strikethrough are supported.
- **Images**: stored under `public/images/canvas/` and referenced with absolute paths.

## Known Limitations

- Diagrams are not rendered from text at build time: ` ```mermaid ` fences are displayed as plain code blocks. The documented workflow is to author diagrams externally (for example in mermaid.live), export them as SVG, and embed them as images. Adding a renderer such as `rehype-mermaid` is left to custom development.

## Deployment and Operations

- The site builds to static files and is hosted on Cloudflare Pages, with the custom domain `docs.epocanvas.com` and automatically provisioned HTTPS certificates.
- `pnpm run deploy` builds the site and publishes it to production in a single step (Wrangler-based).
- Legacy documentation URLs redirect to their current locations, so older links keep working.
- The repository ships with two GitHub Actions workflows: a build workflow that compiles the site on every push and pull request, and a release workflow that publishes a GitHub Release from `RELEASE_NOTES.md` whenever a `v*` tag is pushed.

## Upgrade

If you maintain a local copy, pull the latest code and rebuild:

```bash
git pull
pnpm install
pnpm run build
```

No configuration changes are required; existing content continues to work unchanged.

## Full Changelog

This is the initial tagged release. For the complete history, see the [commit list](https://github.com/shijianus/epocanvas-docs/commits/v1.2.0).
