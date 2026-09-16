---
title: Site Configuration & Style Customization
description: How to edit the core configuration files of EpoCanvas Docs, adjust the sidebar menu, replace the brand logo, and customize theme colors.
---

If you want to use **EpoCanvas Docs** as the documentation site for your own team, or adjust the site title, logo, directory structure, and theme colors, this chapter covers the common customization entry points. Once configuration changes are saved, the local development server hot-reloads automatically and the browser reflects them immediately.

---

## 1. Basic Site Information (`astro.config.mjs`)

The `astro.config.mjs` file in the project root is the main configuration file for the entire documentation site. The options directly related to site information are listed below (comments indicate when to change them):

```javascript
export default defineConfig({
  // Production domain of the site; affects SEO links and sitemap generation
  site: 'https://docs.epocanvas.com',

  integrations: [
    starlight({
      // Site title, shown in the browser tab and the top bar
      title: 'EpoCanvas Docs',
      // Site description, used for search engine result summaries
      description: 'EpoCanvas 全栈技术、架构与产品运维指南',

      // Path to the logo image shown on the left side of the top bar
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // Set to true to show only the logo and hide the title text
      },

      // GitHub repository link in the top-right corner
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

      // Entry point for custom stylesheets
      customCss: ['./src/styles/custom.css'],

      // Sidebar directory (see the next section)
      sidebar: [/* ... */],
    }),
  ],

  // Redirect table for old paths, so existing links do not break
  redirects: { '/mail': '/canvas/' },
});
```

---

## 2. How to Change the Left Sidebar Menu?

The documentation categories in the left sidebar are controlled by the `sidebar` array in the Starlight configuration inside `astro.config.mjs`:

```javascript
sidebar: [
  // Group 1: product overview
  {
    label: '产品概览与入门',  // Group name
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // Group 2: you can add your own business groups here
  {
    label: '用户指南',
    items: [
      { label: '账号注册与登录', link: '/canvas/login/' },
    ],
  },
];
```

- **`label`**: the category or page name displayed in the sidebar. It can differ from the Frontmatter `title` (for example, to use a shorter display name);
- **`link`**: the access path of the page, which corresponds to the file location under `src/content/docs/`.

:::warning
A newly created `.md` file only appears in the left sidebar after it is registered in the `sidebar` array. Creating the file without registering it is the most common beginner mistake.
:::

---

## 3. Custom Brand Theme Colors (`src/styles/custom.css`)

All site colors are controlled by CSS variables defined in `src/styles/custom.css`. The top of the file holds the light mode variables, and the `:root[data-theme='dark']` block holds the dark mode variables:

```css
:root {
  /* Brand accent color (light mode) */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* Light background for selected items */
  --sl-color-accent-high: #1d4ed8;                  /* Links and highlighted text */

  /* Page background and dividers */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* Dark mode uses the same variable names; only the values change */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

For example, to change the site-wide accent color to a vibrant green, update `--sl-color-accent` in both the light and dark blocks to a `#10b981` series value. Buttons, selected states, and links update automatically.

Layout dimensions are also defined at the top of the same file:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* Sidebar width */
  --sl-content-width: 60rem;    /* Maximum body text width */
  --sl-nav-height: 3.5rem;      /* Top bar height */
}
```

---

## 4. Replacing the Site Logo

1. Prepare a vector image of your brand logo (`.svg` is recommended; a sharp `.png` also works);
2. Overwrite `public/images/logo.svg` with it (the large homepage image lives in `src/assets/logo.svg`);
3. Refresh the browser and the icons in the top bar and on the homepage are replaced automatically.

:::tip
The two logos serve different purposes: `public/images/logo.svg` is used in the top bar, while `src/assets/logo.svg` is the decorative image on the right side of the homepage. It is best to replace both at the same time.
:::
