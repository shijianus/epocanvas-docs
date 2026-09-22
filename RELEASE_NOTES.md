# EpoCanvas Docs v1.3.0

Release date: 2026-09-22

- **Site**: [https://docs.epocanvas.com](https://docs.epocanvas.com) (mirror: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev))
- **Source**: [https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)
- **License**: MIT

## Overview

v1.3.0 takes the documentation from "interface translated" to "content translated": all 17 articles now exist in all 10 languages, together with the screenshots and architecture diagrams they refer to. On top of that it fixes how the site behaves once it is live — real 301s for old URLs, an `hreflang` entry for search engines, a 404 page that speaks the visitor's language, and a CI pipeline that stops a release when any of that regresses.

180 pages are published from this repository (18 pages × 10 languages), and a full build takes about 15 seconds.

## Highlights

- **Full-content i18n.** Every article is translated into Simplified Chinese (default), Traditional Chinese, English, Japanese, Korean, Spanish, French, German, Russian, and Portuguese. Nothing falls back to Chinese on the current set of pages.
- **Localized images.** The 6 architecture diagrams and 9 interface screenshots exist per language under `public/images/canvas/<lang>/`. The build rewrites `<img>` sources to the matching language directory and keeps the original when a language version is missing, so a new image does not have to be produced in 10 languages at once.
- **Real 301 redirects.** Legacy documentation URLs redirect with status 301 through a generated Cloudflare Pages `_redirects` file, covering both the trailing-slash and no-slash form of every old path.
- **A 404 page per visitor.** The built-in Starlight 404 always rendered in Chinese; the custom page picks its message — and the surrounding header text — from the browser language, and its language menu now links to each language's home page.
- **Five CI gates.** The build workflow now fails on a type error, an out-of-structure translation, a dead anchor, a corrupt image, or a page that points at the wrong language's screenshot.

## Localization

- Translated body text, plus per-language aside titles (`Note` / `Tip` / …), footnote labels, and search dialog strings.
- `rehypeLocalizeInternalLinks` adds the current language prefix to internal links inside translated text; `rehypeLocalizeDiagramImages` does the same for images; `rehypeLocalizeAsides` and `rehypeLocalizeFootnotes` correct strings Starlight would otherwise emit in the default language.
- `hreflangXDefault()` appends one `hreflang="x-default"` link per page after the build, pointing at the Simplified Chinese version.
- Interface strings stay in one dictionary (`src/utils/i18n.ts`, 57 keys × 10 languages); the version badge reads `package.json`, so a release changes one field.

## Rendering and Routing

- Old URLs `/mail`, `/canvas/dns-setup`, `/canvas/ai-hub`, `/canvas/oauth-provider`, `/canvas/system-config`, `/canvas/workbench`, `/canvas/api-reference`, `/canvas/rule-engine`, `/canvas/security-rbac` and their trailing-slash variants answer 301 in production and still resolve locally through the meta-refresh page Astro generates.
- Tables are wrapped in a scroll container so narrow tables stop leaving blank space inside their border.
- Missing translations still fall back to the default language instead of returning 404, which is what lets a new article ship in Chinese first.

## Search

- Pagefind indexes all 180 pages across 10 languages at build time; queries run entirely in the browser, so the site works on an intranet with no outbound access.
- In-page lookup from the header search box and the `Ctrl+K` / `Cmd+K` dialog are both translated in every locale, including the default one.

## Build and Tooling

- `sharp` is no longer a dependency and `image.service` is set to `passthroughImageService()`: under pnpm's isolated layout sharp cannot resolve its native module and a cold cache failed the build with `MissingSharp`. Image size is controlled before committing instead.
- `prebuild` runs `scripts/invalidate-render-cache.mjs`, which clears the Astro content-layer cache whenever the inventory of localized images changes — without it, a newly added language image stayed unreferenced until an unrelated edit forced a re-render.
- Screenshot pipeline: `scripts/capture-ui-shots.mjs` collects browser frames and `scripts/compose-ui-shots.py` annotates them, with a blank-frame guard so an early capture cannot overwrite a good image.
- Verification scripts: `audit-i18n.mjs`, `check-anchors.mjs`, `check-images.mjs`, `check-localized-images.mjs`.
- `pnpm run deploy` no longer passes `--commit-dirty=true`, so publishing requires a clean working tree.

## Known Limitations

- Diagrams are not rendered from text at build time: ` ```mermaid ` fences display as plain code blocks. Author diagrams externally (for example mermaid.live), export SVG, and embed them as images.
- A localized diagram is picked up by filename only; renaming one means regenerating every language version that references it.
- Full-page screenshot originals under `screenshots-i18n/` (about 119 MiB) are kept in the repository as a visual archive, which makes a fresh clone heavy. They are not served to readers.
- Korean and a few other locales keep English parentheticals inside some architecture diagrams.

## Deployment and Operations

- Static output hosted on Cloudflare Pages, custom domain `docs.epocanvas.com`, HTTPS provisioned automatically.
- `pnpm run deploy` builds and publishes in one step (Wrangler-based). Wrangler 4 requires Node.js 22 or newer; `astro build` itself still runs on Node.js 18.20.8 / 20.3+ / 22+.
- Two GitHub Actions workflows: build with the five gates above on every push and pull request, and a release workflow that publishes a GitHub Release from this file on any `v*` tag.

## Upgrade

If you maintain a local copy, pull the latest code and rebuild:

```bash
git pull
pnpm install
pnpm run build
```

The language list, the sidebar translation table, and `src/utils/i18n.ts` grew in this release; if you forked and edited those files, diff them against upstream before rebuilding.

## Full Changelog

- v1.3.0: 36 commits since v1.2.0 — [compare view](https://github.com/shijianus/epocanvas-docs/compare/v1.2.0...v1.3.0)
- v1.2.0: [first tagged release](https://github.com/shijianus/epocanvas-docs/releases/tag/v1.2.0)
