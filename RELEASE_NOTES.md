# EpoCanvas Docs v1.3.1

Release date: 2026-09-22

- **Site**: [https://docs.epocanvas.com](https://docs.epocanvas.com) (mirror: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev))
- **Source**: [https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)
- **License**: MIT

## Overview

v1.3.1 changes no behavior of the site. It removes every address a reader could not open — placeholders in the guides, a framework badge where the project's own identity belongs, and a social entry whose label promised more than its target page delivers — and it closes the gap between the guides and the code they describe. Site behavior, layout and build pipeline are those of [v1.3.0](https://github.com/shijianus/epocanvas-docs/releases/tag/v1.3.0), restated below.

## Changes since v1.3.0

### Addresses in the guides now resolve

- `xxx.pages.dev` became `epocanvas-docs.pages.dev`, which is live and can be opened to compare against your own deployment.
- The Vercel and Netlify sections name the domain a clone of this repository actually receives (`epocanvas-docs.vercel.app`, `epocanvas-docs.netlify.app`) instead of `xxx.*`.
- Image examples in the rendering rules and in FAQ Q8 now point at `ui-docs-reading.png`, a file that exists in the repository, so the snippet works when pasted.
- The deploy guide lists both published addresses of this instance: `https://docs.epocanvas.com` and `https://epocanvas-docs.pages.dev`.

### Branding and social entries

- The fourth README badge is the project's own, linking to `docs.epocanvas.com` in the logo palette color, in place of a "Built with Astro" badge that sent readers off-site. The stack is still named in each README's own text.
- The header's Telegram entry keeps `@epocanvas`, and its tooltip now reads `Telegram 频道 @epocanvas` (per language) instead of `Telegram 技术社群` — the target is an account page, not a group chat.
- `components.md` corrected: both header icons are hardcoded in `src/components/starlight/Header.astro`, while `astro.config.mjs` → `social` drives the separate icon set in the sidebar. Measured line count refreshed to 646.

### Guides caught up with the code

- `seo.md` no longer credits a built-in sharp image pipeline; it states that `image.service` is `passthroughImageService()` and why.
- `i18n.md` documents the per-language image fallback, the aside and footnote plugins and the `hreflang` injection, and its "add a language" steps now mention `public/images/canvas/<lang>/` and the two CI checks a contributor must satisfy.
- `navigation.md` explains the generated `_redirects` file, why both trailing-slash forms are published there but only one is registered in Astro, and that the version badge reads `package.json` on its own.
- `index.md` lists `src/pages/404.astro` and `scripts/` in the tree and separates the Node floor for building from the one `wrangler` requires.
- Fixed: the 404 page's language menu linked to `/en/404/` and friends, which do not exist; and the trailing-slash redirect registration produced nine Astro route collisions that a future Astro major turns into a build error.
- Housekeeping: `.qoder/` ignored, the stale `sharp` entry removed from `pnpm-workspace.yaml`, one dead variable removed.

All Markdown changes are mirrored across the 10 languages, so translated pages keep the same headings and code blocks as the Chinese originals.

## Highlights

- **Full-content i18n.** Every article exists in Simplified Chinese (default), Traditional Chinese, English, Japanese, Korean, Spanish, French, German, Russian and Portuguese. Nothing falls back to Chinese on the current set of pages.
- **Localized images.** The 6 architecture diagrams and 9 interface screenshots exist per language under `public/images/canvas/<lang>/`; the build rewrites `<img>` sources to the matching directory and keeps the original when a language version is missing.
- **Real 301 redirects.** Legacy documentation URLs answer 301 through a generated Cloudflare Pages `_redirects` file, in both trailing-slash and no-slash form.
- **A 404 page per visitor.** The custom page picks its message and header text from the browser language, and its language menu links to each language's home page.
- **Five CI gates.** The build workflow fails on a type error, an out-of-structure translation, a dead anchor, a corrupt image, or a page pointing at the wrong language's screenshot.

## Localization

- Translated body text, plus per-language aside titles (`Note` / `Tip` / …), footnote labels and search dialog strings.
- `rehypeLocalizeInternalLinks` prefixes internal links in translated text; `rehypeLocalizeDiagramImages` does the same for images; `rehypeLocalizeAsides` and `rehypeLocalizeFootnotes` correct strings Starlight would otherwise emit in the default language.
- `hreflangXDefault()` appends one `hreflang="x-default"` link per page after the build, pointing at the Simplified Chinese version.
- Interface strings stay in one dictionary (`src/utils/i18n.ts`, 57 keys × 10 languages); the version badge reads `package.json`, so a release changes one field.

## Rendering and Routing

- `/mail`, `/canvas/dns-setup`, `/canvas/ai-hub`, `/canvas/oauth-provider`, `/canvas/system-config`, `/canvas/workbench`, `/canvas/api-reference`, `/canvas/rule-engine`, `/canvas/security-rbac` and their trailing-slash variants redirect in production and still resolve locally through the meta-refresh page Astro generates.
- Tables are wrapped in a scroll container so narrow tables stop leaving blank space inside their border.
- Missing translations fall back to the default language instead of returning 404, which is what lets a new article ship in Chinese first.

## Search

- Pagefind indexes all 180 pages across 10 languages at build time; queries run entirely in the browser, so the site works on an intranet with no outbound access.
- In-page lookup from the header search box and the `Ctrl+K` / `Cmd+K` dialog are translated in every locale, including the default one.

## Build and Tooling

- `sharp` is not a dependency and `image.service` is `passthroughImageService()`: under pnpm's isolated layout sharp cannot resolve its native module and a cold cache fails the build with `MissingSharp`. Image size is controlled before committing instead. 180 pages build in about 15 seconds.
- `prebuild` runs `scripts/invalidate-render-cache.mjs`, which clears the Astro content-layer cache whenever the inventory of localized images changes.
- Screenshot pipeline: `scripts/capture-ui-shots.mjs` collects browser frames and `scripts/compose-ui-shots.py` annotates them, with a blank-frame guard so an early capture cannot overwrite a good image.
- Verification scripts: `audit-i18n.mjs`, `check-anchors.mjs`, `check-images.mjs`, `check-localized-images.mjs`.
- `pnpm run deploy` publishes from a clean working tree only.

## Verification for this release

- `astro build`, `astro check` and the four project checks pass with zero findings; no Astro route collisions.
- 7832 internal links across 190 generated pages, 0 broken.
- No `xxx.*`, `your-pic` or mislabeled social placeholder remains in the built output.
- Legacy URLs answer 301 in both trailing-slash forms; unknown paths serve the localized 404 page; both published domains serve identical content.

## Known Limitations

- `mermaid` fences display as plain code blocks: author diagrams externally (for example mermaid.live), export SVG, embed as images.
- A localized diagram is picked up by filename only; renaming one means regenerating every language version that references it.
- Full-page screenshot originals under `screenshots-i18n/` (about 119 MiB) are versioned in the repository as a visual archive, which makes a fresh clone heavy. They are not served to readers.
- A few Korean diagram labels keep English parentheticals.

## Deployment and Operations

- Static output hosted on Cloudflare Pages, custom domain `docs.epocanvas.com`, HTTPS provisioned automatically.
- `pnpm run deploy` builds and publishes in one step (Wrangler-based). Wrangler 4 requires Node.js 22 or newer; `astro build` itself runs on Node.js 18.20.8 / 20.3+ / 22+.
- Two workflows: build with the five gates above on every push and pull request, and a release workflow that publishes a GitHub Release from this file on any `v*` tag.

## Upgrade

```bash
git pull
pnpm install
pnpm run build
```

Only Markdown, the README badge row, the header component and 10 `social.telegram` strings in `src/utils/i18n.ts` changed; no configuration migration is needed.

## Full Changelog

- v1.3.1: 5 commits since v1.3.0 — [compare view](https://github.com/shijianus/epocanvas-docs/compare/v1.3.0...v1.3.1)
- v1.3.0: [content-level i18n, 301 redirects, localized 404 page, CI gates](https://github.com/shijianus/epocanvas-docs/releases/tag/v1.3.0) — 36 commits since v1.2.0
- v1.2.0: [first tagged release](https://github.com/shijianus/epocanvas-docs/releases/tag/v1.2.0)
