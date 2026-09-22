---
title: Top Navigation & Page Routing
description: Header navigation configuration in EpoCanvas Docs, dynamic active-state highlighting rules, the external version badge, and redirect settings for moved pages.
---

The top navigation bar is the main channel users use to move between sections. **EpoCanvas Docs** keeps every navigation item in a single configuration file: one change takes effect site-wide, and precise current-page highlighting plus redirect handling for old links are built in.

---

## Navigation Configuration Center (`src/config/navigation.ts`)

All top navigation buttons are maintained as a declarative array in `src/config/navigation.ts`. The fields of each entry are defined as follows:

```typescript
// Navigation item property definitions
export interface NavItem {
  id: string; // Unique identifier
  labelKey: string; // Key in the multilingual translation dictionary
  defaultLabel: string; // Default displayed text (e.g. "首页", "产品说明")
  href: string; // Navigation link or relative path
  match?: (pathname: string) => boolean; // Rule deciding whether the current page should highlight this button
  badge?: string; // Small pill badge shown next to the label (e.g. version "v1.2.0")
  isExternal?: boolean; // Whether this is an external link (opens in a new window if so)
}
```

### Current Official Configuration (excerpt)

```typescript
export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    defaultLabel: '首页',
    href: '/',
    match: (pathname: string) => pathname === '/' || pathname === '',
  },
  {
    id: 'docs',
    labelKey: 'nav.docs',
    defaultLabel: '产品说明',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname === '/canvas' ||
      pathname === '/canvas/' ||
      pathname.includes('about') ||
      pathname.includes('layout') ||
      pathname.includes('search-engine') ||
      pathname.includes('i18n') ||
      pathname.includes('navigation'),
  },
  {
    id: 'quickstart',
    labelKey: 'nav.quickstart',
    defaultLabel: '快速上手',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  // Further entries follow: guide (authoring standards), deploy (deployment), faq (FAQ)
  // plus the external release entry pointing to GitHub Releases
];
```

To add or remove a navigation item, just add or delete an entry in this array; the local dev server hot-reloads after you save.

---

## Dynamic Activation and Highlighting Rules

If you simply checked `pathname.startsWith('/canvas')`, then visiting the "Quickstart" page at `/canvas/deployment/` could light up both the "Product" and "Quickstart" buttons at once, which is confusing.

That is why each navigation item declares its own highlight scope with a `match` function:

- On the home page `/`, only the "Home" button is active;
- On regular documentation pages such as `/canvas/layout/` and `/canvas/about/`, the "Product" button is active;
- On pages under the `deployment` path, the "Quickstart" button is activated exclusively;
- The active button gets a pill-shaped background in the theme color, clearly contrasting with inactive buttons.

When you add a new documentation page, remember to add its path keyword to the `match` rule of the corresponding navigation item, otherwise the header will not highlight correctly.

---

## External Links and Version Badge Behavior

If a navigation item points to an external website (for example, the Releases page of the GitHub repository):

1. Set `isExternal: true`;
2. The system automatically adds the `target="_blank" rel="noopener noreferrer"` security attributes to the link and opens it in a new tab;
3. A small diagonal arrow icon (`↗`) follows the label, telling readers that clicking it leaves the current site.

The version badge is a pill inside that button. Its text comes from `CURRENT_DOCS_VERSION` in `src/config/navigation.ts`, which reads the `version` field of `package.json` directly — so a release only ever changes `package.json`, and the header updates itself. Clicking the badge opens the GitHub Release list. The full procedure is in [Versioning & Automation Workflows](/canvas/releases/).

---

## Page Redirect Rules (`astro.config.mjs`)

Documentation paths inevitably change as the project evolves. So that old links in readers' bookmarks do not turn into 404s, register the old-to-new mapping in the `redirects` table in `astro.config.mjs`:

```javascript
export default defineConfig({
  redirects: {
    // After the site's section paths were renamed for clarity, all old links keep redirecting
    '/canvas/rule-engine': '/canvas/cloudflare/',
    '/canvas/dns-setup': '/canvas/layout/',
  },
});
```

At build time, Astro generates automatic redirect pages for these paths, so readers visiting an old address are smoothly taken to the new one, and search engine ranking is carried over as well.
### Why the live site answers with 301

The redirect pages Astro emits are meta-refresh documents served with status `200`, which search engines treat as a second copy of the target. Cloudflare Pages reads a `_redirects` file at the site root and applies it before static files, so `cloudflareRedirectsFile()` in `astro.config.mjs` writes `dist/_redirects` from the same `legacyRedirects` table once the build finishes:

```text
/mail  /canvas/  301
/mail/  /canvas/  301
```

The two rules differ only by a trailing slash, because Cloudflare matches paths exactly: a request with the slash does not hit the rule without it and would fall back to that 200 page. A local `pnpm run preview` never reads `_redirects` and keeps using the Astro page, so both mechanisms coexist.

When adding an old path, register only the **slash-free** form: Astro renders it as `<old path>/index.html`, and adding the trailing-slash variant to the `redirects` config as well collides both into one route, which the build reports as a route collision warning (a hard error in the next Astro major).
