---
title: Common Customization Recipes
description: "Quick reference for high-frequency EpoCanvas Docs customizations: adding documents, navigation buttons, UI languages, theme colors, logo, layout sizes, and search copy."
---

This page organizes the most common customization needs into a quick reference you can follow step by step. Each recipe points to the exact file to change; before you start, it helps to read [Rendering Rules](/canvas/rendering/) and [UI Components](/canvas/components/) first to avoid detours.

---

## Recipe 1: Add a New Document

1. Create a new `.md` file under `src/content/docs/canvas/` (lowercase English names with hyphens, e.g. `user-guide.md`);
2. Write the Frontmatter at the top of the file:

   ```yaml
   ---
   title: User Guide
   description: One sentence on what this page covers; it appears in search results and share cards.
   ---
   ```

3. Open `astro.config.mjs` and register the page in the target group of the `sidebar` array:

   ```javascript
   { label: 'User Guide', link: '/canvas/user-guide/' }
   ```

4. Complete the matching `src/content/docs/<locale>/canvas/user-guide.md` in the other 9 language directories, along with sidebar `translations` and any images that need translation. Missing translations fail the publication checks.
5. Check the navigation and content locally, run `pnpm run verify`, then inspect the build with `pnpm run preview`.
6. After review and merging, a maintainer publishes from a clean `main` branch that tracks `origin/main`, with HEAD matching the remote commit. Authorize with `pnpm exec wrangler login`, then run `pnpm run deploy`. For your own fork, first configure your target project as described in the [deployment guide](/canvas/cloudflare/); do not reuse the maintainer's deployment settings unchanged.

:::caution
If you create the file without registering it in `sidebar`, the page is accessible but does not appear in the left sidebar — the most common beginner mistake.
:::

---

## Recipe 2: Add a Top Navigation Button

1. Open `src/config/navigation.ts` and append an entry to the `navigationConfig` array:

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: 'Blog',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // External links open in a new window
   },
   ```

2. Open `src/utils/i18n.ts` and add translation entries for `nav.blog` in all 10 languages;
3. After saving, the new button appears in the top bar immediately. If an internal link should participate in navigation highlighting, configure a `match` function for it.

---

## Recipe 3: Adjust Page Highlighting Rules

When a page path change causes the wrong top bar button to be highlighted, modify the `match` function of the corresponding entry in `navigation.ts`:

```typescript
// Add the new page slug to the allowlist; isCanvasPage strips the language prefix first
match: isCanvasPage(['layout', 'navigation']),
```

`isCanvasPage` matches an exact slug, so do not change it back to `includes` substring matching. The `match` functions of multiple buttons must not overlap, otherwise two buttons can be highlighted at the same time.

---

## Recipe 4: Change the Brand Theme Color

1. Open `src/styles/custom.css`;
2. Change the accent color trio in both the light (`:root`) and dark (`:root[data-theme='dark']`) blocks:

   ```css
   --sl-color-accent: #10b981;      /* Accent color: buttons, selected states */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* Light background for selected items */
   --sl-color-accent-high: #047857; /* Links and highlighted text */
   ```

3. After saving, buttons, highlights, and links across the site update automatically. Changing only one block leaves the other theme with mismatched colors.

---

## Recipe 5: Replace the Logo

| Location | File | Purpose |
| :--- | :--- | :--- |
| Left side of the top bar | `public/images/logo.svg` | Top bar icon on inner pages; the path is configured via `logo.src` in `astro.config.mjs` |
| Homepage image | `src/assets/logo.svg` | Decorative image on the right side of the landing page |

Replace both at the same time. Use the SVG vector format for logos; setting `logo.replacesTitle` to `true` in `astro.config.mjs` hides the title text and keeps only the icon.

---

## Recipe 6: Adjust Layout Sizes

The three core layout values are at the top of `src/styles/custom.css`:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* Sidebar width */
  --sl-content-width: 60rem;    /* Maximum body text width */
  --sl-nav-height: 3.5rem;      /* Top bar height */
}
```

:::caution
The right TOC column's width is not in these variables; it is controlled by the `20rem` value in `src/components/starlight/TwoColumnContent.astro` (`21rem` on ultra-wide screens). When adjusting the right column's width, also update `max-width: calc(100% - 20rem)` for the body area in the same file.
:::

---

## Recipe 7: Change Search Box Copy

The search box placeholder, button hints, and other UI copy come from the multilingual dictionary in `src/utils/i18n.ts`. Open the file and edit entries such as `search.placeholder` using the "language → key" two-level structure:

```typescript
// File path: src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ...other entries for this language
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ...other entries for this language
  },
  // The remaining 8 languages work the same way
};
```

`getTranslation` first uses the current language's existing non-empty value. It falls back to Chinese only if the key is missing or empty, and to the key name if Chinese is missing too. An existing translation that you do not update keeps its old value, so synchronize changes across all 10 languages. Local hot reload shows saved changes without a build.

---

## Recipe 8: Add Verification `<head>` Tags to the Site

Connecting services such as Google Search Console requires injecting verification tags into `<head>`. Open `astro.config.mjs` and append to the `head` array in the Starlight configuration:

```javascript
head: [
  // Existing favicon configuration ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: 'verification string',
    },
  },
],
```

After saving and redeploying, use the platform's verification button to check. For search engine configuration after launch, see [SEO & Performance Optimization](/canvas/seo/).

---

## General Verification Workflow After Changes

Whatever the customization, verify in this order before committing:

```bash
pnpm run dev      # 1. Review each page in the browser
pnpm run verify   # 2. Run tests, configuration checks, Astro type checks, the build, and content/output checks
pnpm run preview  # 3. Preview the build output and publish only after confirming there are no issues
```

For deployment, see [Deploying to Cloudflare Pages](/canvas/cloudflare/).
