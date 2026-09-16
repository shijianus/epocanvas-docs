---
title: UI Components & Custom Development
description: "EpoCanvas Docs UI component architecture: the Starlight component override mechanism, the responsibilities and data flow of the seven custom components, and what to watch out for when customizing."
---

The UI of **EpoCanvas Docs** is not built from scratch. Instead, it performs **targeted overrides** on top of Starlight's native components: Starlight's page skeleton and content processing are kept, while display components such as the top bar, sidebar, table of contents, and search are replaced to achieve the desired three-column layout and interactions. This page explains the structure of this component system and how to modify it.

---

## The Component Override Mechanism

Starlight lets you replace any native component with a custom implementation via the `components` field in `astro.config.mjs`. This project overrides 7 components:

```javascript
// astro.config.mjs (excerpt)
components: {
  Header: './src/components/starlight/Header.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
},
```

At build time, every position where Starlight renders a page uses the file specified here first. Components that are not overridden (such as the footer or the mobile menu) continue to use the native implementations.

---

## Responsibilities of the Seven Custom Components

All source code lives in `src/components/starlight/`. Their sizes and responsibilities are as follows:

| Component file | Size | Responsibility |
| :--- | :--- | :--- |
| `Header.astro` | About 639 lines | Everything in the top bar: logo, search box, main navigation, version badge, language switcher, theme toggle, GitHub and Telegram links |
| `Search.astro` | About 837 lines | Dual-mode search: in-page search from the top bar (highlighting and counters) + the `Ctrl+K` site-wide search dialog (Pagefind UI) |
| `Pagination.astro` | About 123 lines | Bottom "previous / next" cards: flat thin borders, theme-colored titles, and ↙/↘ diagonal arrows indicating the paging direction |
| `TwoColumnContent.astro` | About 77 lines | Two-column skeleton for body text and the right-side table of contents; controls the fixed width and scrolling of the right column |
| `TableOfContents.astro` | About 64 lines | The "On this page" title, icon, and TOC list; filters out the page's own title |
| `PageTitle.astro` | About 62 lines | The page's main title (taken from the Frontmatter `title`) and the "Last updated" timestamp |
| `Sidebar.astro` | About 22 lines | A thin wrapper that reuses Starlight's native `SidebarPersister` to keep the sidebar scroll position across page changes |

---

## Data Flow: Three Configuration Files Drive the Entire UI

The custom components contain no business data themselves. The UI content is driven by three configuration files:

```text
astro.config.mjs ──→ locales + sidebar arrays ──→ Sidebar.astro renders the left sidebar (each language gets its translated labels)
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro renders the top navigation and highlights (links get the language prefix automatically)
src/utils/i18n.ts ──→ UI_TRANSLATIONS dictionary ──→ components fetch entries for the current language at build time
```

- **The left sidebar** only reads the `sidebar` declarations in `astro.config.mjs`; new documents must be registered there. Each entry's `translations` field provides menu text in 10 languages;
- **The top navigation** fetches each item's display text through its `labelKey` from the `i18n.ts` dictionary, and the `match` function decides which button is highlighted for the current page (the language prefix is stripped before matching);
- **UI copy** (search box placeholders, the "On this page" title, theme toggle tooltips, etc.) is output directly in the current language at build time by each component calling `getTranslation(key, lang)`. There is no runtime replacement script in the page.

In other words: to change UI content, look for the corresponding configuration file first. Only changing appearance (spacing, colors, icons) requires touching component source code.

---

## Key Implementation Details of Each Component

### PageTitle: Page Title and Real Update Times

The page's main title is read directly from the Frontmatter `title`, so **do not write a `#` level-one heading in the body**. The "Last updated" timestamp comes from the Git commit history at build time (`lastUpdated: true` is enabled in `astro.config.mjs`). It refreshes automatically with every commit and requires no manual maintenance.

:::caution
The update time is read from Git history at build time. Therefore: **new documents that have not been committed yet show no date** (only the standard byline appears below the title); it shows up after committing and rebuilding. If the build environment is a shallow clone (such as `fetch-depth: 1` in CI), the Git history is incomplete and the timestamp will be missing as well. Neither case breaks the build.
:::

### Sidebar: How Scroll Position Memory Works

`Sidebar.astro` is only about 20 lines long; its core is reusing Starlight's official `SidebarPersister` component, which keeps the sidebar DOM from being rebuilt across page changes, preserving the scroll position. This is how the left sidebar "does not jump" between pages.

### TableOfContents: Generating the On-Page TOC

The TOC data is generated by Starlight at build time from the body headings (`##` and `###`); the component only filters out the page title itself and renders the list. Scroll highlighting is handled in the browser by the `starlight-toc` custom element, with no framework dependency.

### TwoColumnContent: The Single Source of Truth for the Right Column Width

The right TOC column is fixed at `20rem` under `@media (min-width: 72rem)` (`21rem` on ultra-wide screens at `90rem` and above), and the maximum body text width subtracts the right column's width accordingly. To adjust the right column's width, change this one file only; do not scatter overrides across other stylesheets.

### Header: Navigation, Theme, and Language

- Navigation buttons are rendered by iterating over `navigationConfig`; the active state styling is decided by the `match` function's return value, and links get the current language prefix automatically via `localizedHref()`;
- The theme toggle writes to the `starlight-theme` key in LocalStorage; on page load the initial theme is decided in the order "local choice → system preference";
- Each item in the language dropdown is a real link to the current page's version in that language; clicking navigates immediately, with no extra state storage;
- The GitHub link on the right of the top bar comes from `social.github` in `astro.config.mjs`. The Telegram link (`https://t.me/epocanvas`) is currently hardcoded in the component; edit `Header.astro` directly to change it.

### Search: Dual-Mode Search

One component implements two search modes (see [Full-Text Search & Keyboard Shortcuts](/canvas/search-engine/) for details):

1. **In-page search**: the top bar input box; pressing Enter jumps between matches on the current page, with highlighting done by script-based markers;
2. **Site-wide search**: a `<dialog>` popup with Pagefind's default UI; the index is generated during `pnpm run build`.

### Pagination: Page Cards

The previous/next page data is computed by Starlight at build time from the `sidebar` order (`Astro.locals.starlightRoute.pagination`); the component only renders it: two equal-width cards with thin borders and no shadows, theme-colored titles, and ↙ / ↘ diagonal arrows that shift along the paging direction on hover. The arrows are inline SVG paths and mirror automatically if the site is used for RTL languages.

---

## Customization Notes

:::caution
Overriding components means giving up future updates to Starlight's native components. When upgrading the Starlight version, the components' props and the structure of `Astro.locals.starlightRoute` may change; after upgrading you must run regression tests on all 7 overridden components.
:::

- **Prefer CSS variables for style changes**: colors, fonts, and layout dimensions are centralized in the `:root` variables of `src/styles/custom.css`, see [Site Configuration & Style Customization](/canvas/configuration/). Most customization does not require touching components;
- **Only touch components to change interactions**: when adding buttons or adjusting structure, fetch UI text with `getTranslation(key, lang)` and add the entries for all 10 languages in `i18n.ts`. Languages left out fall back to Chinese;
- **Always verify locally after changes**: use `pnpm run dev` to check interactions, and `pnpm run build` to confirm types and the build pass (for local commands, see [FAQ & Troubleshooting](/canvas/troubleshooting/)).

For common concrete customization tasks, see [Common Customization Recipes](/canvas/recipes/) directly.
