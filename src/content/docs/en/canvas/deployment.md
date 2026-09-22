---
title: Quickstart (Up and Running in 3 Minutes)
description: EpoCanvas Docs local environment setup, dependency installation, starting the local dev server, and a quick reference of common commands.
---

There are two ways to get this documentation site running; pick one based on your goal:

- **You just want to see a live site right away**: no need to install anything — jump straight to the [One-Click Deploy](#one-click-deploy-go-live-with-one-button) section below, click a button, and two minutes later you have your own URL;
- **You want to write documentation and edit content**: first get the project running locally following [Prerequisites](#prerequisites), see the effect as you edit, then publish with the deploy command in [Common Commands](#common-development-commands-cheat-sheet).

---

## One-Click Deploy: Go Live with One Button

The buttons below are the official "deploy buttons" from Cloudflare, Vercel, and Netlify. Clicking one opens that platform's deployment wizard: the platform clones this repository to your own GitHub account, then automatically completes the cloud build and publish. All you need is a GitHub account — no Node.js or pnpm installation on your computer, and no commands to type.

### Deploy to Cloudflare (Recommended)

[![Deploy to Cloudflare](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

After clicking the button, the wizard takes three steps:

1. **Authorize and log in**: log in to GitHub and then Cloudflare. Both have free tiers; if you don't have an account, register one on the spot;
2. **Clone the repository**: Cloudflare automatically copies this repository to your GitHub account; all later content changes happen in your own repository;
3. **Confirm the configuration and deploy**: the wizard ends with a configuration page; verify the settings against the table below, then click Deploy:

| Setting | What the wizard shows by default | What to do |
| :--- | :--- | :--- |
| Repository name / project name | Pre-filled with `epocanvas-docs` | Keep the default |
| Build command | Auto-detected as this repository's `pnpm run build` | Keep the default |
| Deploy command | Pre-filled with `pnpm run deploy` | **Change it to `npx wrangler deploy`** |

:::caution
Make sure to change the deploy command to `npx wrangler deploy`. The pre-filled `pnpm run deploy` is a direct-upload-to-Cloudflare-Pages command kept for this site's maintainers; it deploys to a hard-coded project name and fails outright in the button deployment flow.
:::

On the first deployment, Cloudflare detects that the repository has no Workers configuration file, recognizes it as an Astro static site, and opens an auto-generated configuration Pull Request (PR) against your repository — just merge it; from then on, every push is built and published automatically. From clicking the button to seeing the URL takes two to three minutes if all goes well.

After deployment, Cloudflare assigns a public address of the form `https://epocanvas-docs.<your-subdomain>.workers.dev` with an HTTPS certificate included. To use your own domain, go to Workers & Pages → your project → **Settings** → **Domains & Routes** in the dashboard and add it there. Both addresses of the live instance are open to comparison: the default Pages domain [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev) and the custom domain [https://docs.epocanvas.com](https://docs.epocanvas.com).

### Deploy to Vercel and Netlify

If you prefer other platforms, the two buttons below do the same thing; both platforms auto-detect Astro projects, so you don't need to fill in any build configuration manually:

[![Deploy with Vercel](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Deploy to Netlify](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel**: click the button → authorize GitHub → keep the default options and click Deploy. You get an `epocanvas-docs.vercel.app` domain; free on the personal Hobby plan;
- **Netlify**: click the button → connect GitHub → the platform clones the repository and completes the first build automatically. You get an `epocanvas-docs.netlify.app` domain; the free tier is enough.

:::note
All three buttons work the same way: they clone the repository to your GitHub account and set up continuous deployment so that pushing code automatically rebuilds and republishes the site. Pick one platform and stick with it; there is no need to deploy twice. This site itself is hosted via direct upload to Cloudflare Pages (see [Deploying to Cloudflare Pages](/canvas/cloudflare/)), which is independent of the button flows above — for a static documentation site, readers get the same access experience from either hosting method.
:::

---

## Prerequisites

One-click deployment is good for "getting the site out there first", but writing and editing documentation ultimately happens locally. If you plan to write content, first make sure your computer has the following basic development environment:

| Tool | Recommended version | Check command | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.20.8` (20.3+ or 22 LTS recommended) | `node -v` | Base environment for running JavaScript and building static pages |
| **pnpm** | `>= 9` (10 in CI environments) | `pnpm -v` | The recommended package manager; installs quickly and saves disk space |
| **Git** | Latest stable version | `git --version` | Used to pull code and manage versions |

:::tip
If `pnpm` is not installed on your computer yet, you can install it globally quickly using the npm that comes with Node.js:

```bash
npm install -g pnpm
```
:::

---

## 3 Steps to Run It Locally

### Step 1: Clone the Repository to Your Computer

Open a terminal and run the following commands to clone the project code and enter the project folder:

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### Step 2: Install the Project Dependencies

Run the install command in the project root:

```bash
pnpm install
```

pnpm automatically downloads the required front-end dependencies according to `pnpm-lock.yaml`, including Astro, Starlight, and the local image processing module; it usually finishes within tens of seconds. When the installation ends, the terminal shows the total time:

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### Step 3: Start the Local Dev Preview Server

Once the dependencies are installed, run the start command:

```bash
pnpm run dev
```

The terminal prints something like the following (the first start pre-bundles dependencies and takes a few seconds):

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

Open a browser and visit `http://localhost:4321` to see the complete documentation site. After you edit any `.md` file and save, the browser page refreshes automatically to show the latest content.

![The quickstart page as actually rendered by the local dev server](/images/canvas/ui-quickstart.png)

*Figure: The actual rendering of `http://localhost:4321/canvas/deployment/` — the very page you are reading now.*

---

## Common Development Commands Cheat Sheet

When writing documentation or maintaining the project day to day, these are the main commands you will use:

| Command | When to use | Details |
| :--- | :--- | :--- |
| `pnpm run dev` | **Day-to-day writing** | Starts the local dev server with hot module replacement (HMR). After editing any `.md` file, the browser refreshes automatically to show the updated content. |
| `pnpm run build` | **Build test** | Compiles the full site's static pages locally and generates HTML, CSS, and the Pagefind search index in the `dist/` directory. |
| `pnpm run preview` | **Preview the build output** | Starts a lightweight local web server to serve the `dist/` output, used to check that links and styles are correct before the official release. |
| `pnpm run deploy` | **One-click publish** | Runs build automatically first, then uses the Wrangler tool to push `dist/` to the live Cloudflare Pages production environment. |

For the full publishing steps and how to verify the result online, read **[Deploying to Cloudflare Pages](/canvas/cloudflare/)**.

---

## Where Are the Key Configuration Files?

To change the site's basic information, focus on the following files:

- **Site name and TOC menu**: edit `astro.config.mjs` in the root. You can change the site's `title` (site title), `site` (live domain), and `sidebar` (left-side TOC menu).
- **Top navigation bar buttons**: edit `src/config/navigation.ts`. Here you can add or remove top buttons such as "Home" and "Product" and their link targets.
- **Page colors and font styles**: edit `src/styles/custom.css`. Here you can adjust the theme colors for light and dark mode.
- **Adding new documents**: create a new `.md` file directly in the `src/content/docs/canvas/` directory and register it in the sidebar; see [Markdown Authoring & Formatting Guide](/canvas/markdown/) for details.

---

## Next Steps

Once the local server is running successfully, you can continue with:

- **[Page Layout & Reading Experience](/canvas/layout/)**: layout details of the top bar, sidebar, and content interface.
- **[How Rendering Works](/canvas/rendering/)**: understand how Markdown becomes the final page and avoid formatting syntax pitfalls.
- **[Deploying to Cloudflare Pages](/canvas/cloudflare/)**: publish the documentation to the public internet and bind a custom domain.
