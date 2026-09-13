# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)

English | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [Français](./README.fr.md)

EpoCanvas Docs is the official documentation site of the EpoCanvas project. It is built with Astro 5 and Starlight and provides a three-column reading layout, dual-mode search, and full multilingual content out of the box. All content is written in plain Markdown and published to Cloudflare Pages.

**Live site**: [https://docs.epocanvas.com](https://docs.epocanvas.com) · Mirror: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)

## Preview

![EpoCanvas Docs documentation home page](./public/images/canvas/ui-home-landing.png)

The site uses a three-column layout: category navigation on the left, article content in the center, and the table of contents of the current page on the right. The dark theme is the default, follows the system preference, and can be toggled manually from the header.

## Features

- **Three-column reading layout** — the content width is capped for long-form reading; the sidebar keeps its scroll position across page transitions, and the right-hand outline highlights the current section while scrolling.
- **Dual-mode search** — the search box in the header finds matches within the current page, while `Ctrl+K` / `Cmd+K` opens a site-wide search dialog powered by Pagefind. The index is generated at build time and all queries run in the browser, with no third-party search service involved, so the site also works on intranets without outbound internet access.
- **Full multilingual content** — the UI and the body text of every article are available in 10 languages: Simplified Chinese (default), Traditional Chinese, English, Japanese, Korean, Spanish, French, German, Russian, and Portuguese. Each language lives under its own URL prefix (e.g. `/en/`), and pages that are missing a translation fall back to Chinese instead of returning 404.
- **Markdown extensions** — four admonition types (`:::note`, `:::tip`, `:::caution`, `:::danger`), Shiki code highlighting with file-name labels, line highlighting, and diff rendering.
- **One-command deployment** — the site builds to static files and publishes to Cloudflare Pages with a single command; custom domains and HTTPS certificates are provisioned automatically.

## Requirements

- Node.js 20 or later (18.17+ is supported)
- pnpm 10

## Quick Start

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

Open `http://localhost:4321` in your browser. While the dev server is running, Markdown changes are reflected immediately.

### Commands

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Start the local dev server with hot reload |
| `pnpm run build` | Build the static site into `dist/` and generate the search index |
| `pnpm run preview` | Preview the build output locally |
| `pnpm run deploy` | Build and publish to Cloudflare Pages |

## Project Structure

```text
epocanvas-docs/
├── public/images/canvas/       # Screenshots and diagrams used by the documentation
├── src/
│   ├── components/starlight/   # Overridden Starlight components (Header, Sidebar, …)
│   ├── config/navigation.ts    # Top navigation bar configuration
│   ├── content/docs/           # Documentation content per language (canvas/ = Chinese, en/ ja/ … = translations)
│   ├── styles/custom.css       # Theme colors and layout styles
│   └── utils/i18n.ts           # UI strings and language registry
├── astro.config.mjs            # Site configuration: title, sidebar, redirects
├── AGENTS.md                   # Technical writing guidelines
├── LICENSE
└── package.json
```

## Writing Documentation

1. Create a new `.md` file under `src/content/docs/canvas/`.
2. Add frontmatter at the top of the file:

   ```yaml
   ---
   title: Document title
   description: A one-sentence description of the page
   ---
   ```

3. Register the page in the `sidebar` array in `astro.config.mjs`; pages that are not registered do not appear in the navigation.
4. Store images in `public/images/canvas/` and reference them with an absolute path:

   ```markdown
   ![alt text](/images/canvas/your-image.png)
   ```

Run `pnpm run build` before committing to verify that the site builds without errors.

## Deployment

The site is hosted on Cloudflare Pages:

- **Local publishing** — run `wrangler login` once to authorize, then `pnpm run deploy` builds and publishes the site.
- **Custom domain** — in the Cloudflare dashboard, open the Pages project `epocanvas-docs` and add the domain under *Custom domains*. The CNAME record and the SSL certificate are provisioned automatically.

## Contributing

Issues and pull requests are welcome. Please run `pnpm run build` locally and make sure it passes before submitting a PR.

## License

[MIT](./LICENSE)
