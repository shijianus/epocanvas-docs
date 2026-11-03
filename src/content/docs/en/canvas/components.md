---
title: UI Components & Custom Development
description: "EpoCanvas Docs UI component architecture: the Starlight component override mechanism, the responsibilities and data flow of the custom components, and what to watch out for when customizing."
---

The UI of **EpoCanvas Docs** is not built from scratch. Instead, it performs **targeted overrides** on top of Starlight's native components: Starlight's page skeleton and content processing are kept, while display components such as the top bar, sidebar, table of contents, and search are replaced to achieve the desired three-column layout and interactions. This page explains the structure of this component system and how to modify it.

---

## The Component Override Mechanism

Register custom overrides in `components` in `astro.config.mjs` as below; the current configuration is the source of truth.

```javascript
// astro.config.mjs (excerpt)
components: {
  Header: './src/components/starlight/Header.astro',
  MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
  Footer: './src/components/starlight/Footer.astro',
  SkipLink: './src/components/starlight/SkipLink.astro',
},
```

Registered overrides take precedence at build time. Components without an override keep their native Starlight implementations.

---

## Responsibilities of Custom Component Overrides

Source files live in `src/components/starlight/`; their main responsibilities are listed below.

| Component file | Responsibility |
| :--- | :--- |
| `Header.astro` | Everything in the top bar: logo, search box, main navigation, version badge, language switcher, theme toggle, GitHub and Telegram links |
| `Search.astro` | Dual-mode search: in-page search from the top bar (highlighting and counters) + the `Ctrl+K` site-wide search dialog (Pagefind UI) |
| `Pagination.astro` | Bottom "previous / next" cards: flat thin borders, theme-colored titles, and ↙/↘ diagonal arrows indicating the paging direction |
| `TwoColumnContent.astro` | Two-column skeleton for body text and the right-side table of contents; controls the fixed width and scrolling of the right column |
| `TableOfContents.astro` | The "On this page" title, icon, and TOC list; filters out the page's own title |
| `PageTitle.astro` | Breadcrumb navigation, the page's main title (taken from the Frontmatter `title`), and the "Last updated" timestamp |
| `Sidebar.astro` | A thin wrapper that reuses Starlight's native `SidebarPersister` to keep the sidebar scroll position across page changes |
| `SkipLink.astro` | Shows a skip link on keyboard focus and moves focus to the body title `_top` |
| `MobileMenuToggle.astro` | Toggles the mobile sidebar, synchronizes expanded state, and closes on Esc with focus returned |
| `ThemeProvider.astro` | Inline first-paint script that applies the saved or system theme before CSS loads, avoiding a theme flash |
| `Footer.astro` | Footer: edit this page, report an issue, back to top, and previous/next pagination |

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

The page's main title is read directly from the Frontmatter `title`, so **do not write a `#` level-one heading in the body**. With `lastUpdated: true` enabled in `astro.config.mjs` and no Frontmatter date override, the build reads the Git commit time of the last change to that file. It is not the time of every repository commit or build; changing other files does not update this page's date.

:::caution
A new uncommitted document has no Git history to read, so it shows no date. Uncommitted edits to an existing file do not change its commit date either. A shallow clone (such as `fetch-depth: 1`) can report the boundary commit's date or fail to return a date; it is not a complete history. Use full Git history for accurate dates (`fetch-depth: 0` in CI). Failure to read a date does not break the build.
:::

### Sidebar: How Scroll Position Memory Works

`Sidebar.astro` reuses Starlight’s `SidebarPersister` to restore the sidebar scroll position across page changes. `MobileMenuToggle.astro` handles the mobile menu state and focus.

### TableOfContents: Generating the On-Page TOC

The TOC data is generated by Starlight at build time from the body headings (`##` and `###`); the component only filters out the page title itself and renders the list. Scroll highlighting is handled in the browser by the `starlight-toc` custom element, with no framework dependency.

### TwoColumnContent: The Single Source of Truth for the Right Column Width

The right TOC column is fixed at `20rem` under `@media (min-width: 72rem)` (`21rem` on ultra-wide screens at `90rem` and above), and the maximum body text width subtracts the right column's width accordingly. To adjust the right column's width, change this one file only; do not scatter overrides across other stylesheets.

### Header: Navigation, Theme, and Language

- Navigation buttons are rendered by iterating over `navigationConfig`; the active state styling is decided by the `match` function's return value, and links get the current language prefix automatically via `localizedHref()`;
- The theme toggle writes to the `starlight-theme` key in LocalStorage; on page load the initial theme is decided in the order "local choice → system preference";
- Each item in the language dropdown is a real link to the current page's version in that language; clicking navigates immediately, with no extra state storage;
- Both the GitHub and the Telegram icons on the right of the top bar are hardcoded in `src/components/starlight/Header.astro`, so changing an address means editing that file; Telegram points at the `@epocanvas` account page and its tooltip is the `social.telegram` string. The `social` entry in `astro.config.mjs` drives the separate icon set at the bottom of the sidebar, and the two do not affect each other.

### Search: Dual-Mode Search

One component implements two search modes (see [Full-Text Search & Keyboard Shortcuts](/canvas/search-engine/) for details):

1. **In-page search**: the top bar input box; pressing Enter jumps between matches on the current page, with highlighting done by script-based markers;
2. **Site-wide search**: a `<dialog>` popup with Pagefind's default UI; the index is generated during `pnpm run build`.

The in-page input is visible only at viewport widths of at least `64rem`; narrower screens retain only the site-wide search button. Use the browser’s Find in Page for the current article. If screenshots differ, follow the current interface.

### Pagination: Page Cards

The previous/next page data is computed by Starlight at build time from the `sidebar` order (`Astro.locals.starlightRoute.pagination`); the component only renders it: two equal-width cards with thin borders and no shadows, theme-colored titles, and ↙ / ↘ diagonal arrows that shift along the paging direction on hover. The arrows are inline SVG paths and mirror automatically if the site is used for RTL languages.

---

## Customization Notes

:::caution
Overriding components means giving up future updates to Starlight's native components. When upgrading the Starlight version, the components' props and the structure of `Astro.locals.starlightRoute` may change; after upgrading you must run regression tests on all overridden components.
:::

- **Prefer CSS variables for style changes**: colors, fonts, and layout dimensions are centralized in the `:root` variables of `src/styles/custom.css`, see [Site Configuration & Style Customization](/canvas/configuration/). Most customization does not require touching components;
- **Only touch components to change interactions**: when adding buttons or adjusting structure, fetch UI text with `getTranslation(key, lang)` and add the entries for all 10 languages in `i18n.ts`. Languages left out fall back to Chinese;
- **Always verify locally after changes**: use `pnpm run dev` to check interactions, and `pnpm run verify` to confirm types and the build pass (for local commands, see [FAQ & Troubleshooting](/canvas/troubleshooting/)).

For common concrete customization tasks, see [Common Customization Recipes](/canvas/recipes/) directly.
