---
title: Deploying to Cloudflare Pages
description: "A complete illustrated guide to publishing EpoCanvas Docs: direct upload with the Wrangler CLI, automatic builds from Git, and custom domain binding, with real dashboard screenshots at every step."
---

Once your documentation is written, you need to publish it to the public internet so your team and users can access it. **EpoCanvas Docs** recommends hosting on **Cloudflare Pages**: no server to buy, no Nginx to configure — just upload the static files and you automatically get an HTTPS certificate. This site itself (`docs.epocanvas.com`) was published using the method in this guide, and all dashboard screenshots below come from a real deployment.

---

## Prerequisites

### What You Need

| Item | Details |
| :--- | :--- |
| **A Cloudflare account** | Register for free at [dash.cloudflare.com](https://dash.cloudflare.com/); Pages does not require a paid plan |
| **A complete local build** | Run `pnpm run build` first and confirm the `dist/` directory is generated correctly, see [Quick Start](/canvas/deployment/) |
| **Node.js + pnpm** | The deploy commands depend on your local development environment; version requirements are the same as in the Quick Start chapter |

### Choosing Between the Two Deployment Methods

![Comparison of the two Cloudflare Pages deployment paths: direct upload from the local command line on the left (used by this site), automatic builds from a Git repository on the right (recommended for team collaboration)](/images/canvas/docs-deploy-compare.svg)

*Figure: A comparison of the two Cloudflare Pages deployment paths. On the left, build locally and upload directly to the edge with Wrangler (what this site actually uses); on the right, a GitHub Webhook triggers an automatic cloud build.*

| Comparison | Method 1: Command-Line Direct Upload | Method 2: Automatic Builds from Git |
| :--- | :--- | :--- |
| How it works | Run `pnpm run deploy` locally | Pushing code to GitHub triggers the build automatically |
| Difficulty | Low — two commands | Medium — one-time configuration in the dashboard |
| Best for | First launch, single maintainer, quick updates | Team collaboration, wanting "commit = live" |
| Used by this site | ✅ Yes (verifiable in the dashboard) | Not enabled; can be added at any time |

:::tip
The two methods can coexist: use Git automatic builds for day-to-day work, and use a local `pnpm run deploy` to push an urgent fix straight to production.
:::

:::tip[Prefer Not to Type Commands?]
The [Quick Start](/canvas/deployment/) page provides one-click deploy buttons for Cloudflare, Vercel, and Netlify: click, authorize your account, confirm the configuration, and the documentation site is published to your own cloud account. See [One-Click Deploy](/canvas/deployment/#one-click-deploy-go-live-with-one-button) for details. The Cloudflare button uses Workers static asset hosting, which is a separate path from the Pages method described on this page; for a static documentation site the access experience is identical, so just pick one.
:::

---

## Method 1: Direct Upload from the Command Line (Recommended for First Deployment)

With this method, the site is built locally and uploaded directly to Cloudflare. It is what **this site actually uses**.

### Step 1: Log In to Your Cloudflare Account

The project ships with Wrangler (Cloudflare's official command-line tool). The first use requires browser authorization:

```bash
npx wrangler login
```

The terminal prints `Opening a link in your default browser...` and the browser opens the Cloudflare authorization page. After clicking **Allow**, the terminal confirms the login. Verify your login state with:

```bash
npx wrangler whoami
```

:::caution
If you run the deploy without logging in first, the terminal prints `You are not authenticated. Please run 'wrangler login'.` and nothing is deployed.
:::

### Step 2: One-Command Build and Upload

The project presets a one-command publish script in `package.json`:

```bash
pnpm run deploy
```

It runs two steps in sequence: first `astro build` compiles the whole site into the `dist/` directory and generates the search index, then `wrangler pages deploy dist` uploads the output directly to Cloudflare. The real build output looks like this:

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

When the upload finishes, Wrangler prints a preview URL for this deployment. On the first deployment Wrangler asks for the project name interactively; just press Enter to accept the preset `epocanvas-docs` from `package.json`.

### Step 3: Find Your Project in the Dashboard

Open [dash.cloudflare.com](https://dash.cloudflare.com/) and click **Compute (Workers & Pages)** in the left menu to see the project list. The image below marks three key spots:

![Workers & Pages project list in the Cloudflare dashboard, marking the left menu entry, the Create application button, and the epocanvas-docs project](/images/canvas/deploy/cf-01-projects-list.png)

*Figure: The Workers & Pages project list. ① Navigate to Workers & Pages in the left menu; ② the Create application button creates a new project; ③ our `epocanvas-docs` project, showing the domain `epocanvas-docs.pages.dev` and the most recent deployment time.*

Click the project name to open the project details. The **Deployments** tab shows the full deployment history:

![Deployment history page of the epocanvas-docs project, marking the production domains, deployment records, and statuses](/images/canvas/deploy/cf-02-deployments.png)

*Figure: The deployment history page. ① Project name; ② Deployments tab; ③ the production domain is bound to both `docs.epocanvas.com` (custom domain) and `epocanvas-docs.pages.dev` (default domain); ④ each deployment record shows its branch and commit message; ⑤ status and deployment time.*

:::note
Every `pnpm run deploy` adds a new record at the top of the list, which automatically becomes the current production version. Older records stay in the list, so you can roll back at any time if something goes wrong.
:::

---

## Understanding the Build Configuration of a Direct-Upload Project

Open the **Settings** tab to see how a direct-upload project differs from a Git-connected one:

![Settings build configuration page of the epocanvas-docs project, with the Git repository section showing it is not connected](/images/canvas/deploy/cf-03-settings.png)

*Figure: The Settings tab. ① Settings entry; ② the Git repository section shows Connect (not connected) — a direct-upload project needs no Git build configuration because the build happens entirely on your local machine.*

:::tip
This also explains the advantage of direct upload: the build environment is your own computer, unaffected by the Cloudflare build queue. The trade-off is that every update must be deployed from that same machine.
:::

---

## Method 2: Connect a Git Repository for Automatic Builds (Optional)

If you want "push to commit means automatically live", you can connect the project to a GitHub repository and let Cloudflare build it in the cloud.

### Step 1: Start the Creation Flow

On the Workers & Pages project list page, click the **Create application** button in the top-right corner (marked ② in the screenshot in [Method 1, Step 3](#step-3-find-your-project-in-the-dashboard)) and select the **Pages** tab.

### Step 2: Connect a Git Repository

1. Choose **Connect to Git** in the creation screen;
2. Authorize Cloudflare to access your GitHub account;
3. Select the documentation repository `epocanvas-docs` from the repository list;
4. Click **Begin setup**.

### Step 3: Fill In the Build Configuration

In "Set up builds and deployments", enter the following:

| Setting | Value |
| :--- | :--- |
| Framework preset | `Astro` |
| Build command | `pnpm run build` |
| Build output directory | `dist` |

### Step 4: Verify the Automatic Build

Click **Save and Deploy** and Cloudflare completes the first build automatically. Afterwards, every push to the `main` branch makes Cloudflare pull, build, and publish automatically. The build log for each deployment can be viewed by clicking that deployment in the project's **Deployments** tab.

:::caution
The Settings page of a Git-integrated project has an extra build configuration section (framework preset, build command, etc.), which differs from the [direct-upload project](#understanding-the-build-configuration-of-a-direct-upload-project) interface — if you cannot find the build configuration in Settings, the project is a direct-upload project, which is normal.
:::

---

## Bind a Custom Domain

The default `xxx.pages.dev` domain assigned by Cloudflare works out of the box; binding your own domain (for example `docs.epocanvas.com`) takes only a few minutes.

### Step 1: Open the Custom Domain Settings

In the project details, click the **Custom domains** tab, then click **Set up a custom domain**:

![Custom domains page of the epocanvas-docs project, with docs.epocanvas.com bound and SSL active](/images/canvas/deploy/cf-04-domains.png)

*Figure: The Custom domains tab. ① Tab entry; ② the Set up a custom domain button; ③ the bound `docs.epocanvas.com`, with status Active and SSL enabled.*

### Step 2: Add the Domain and Wait for It to Take Effect

1. Click **Set up a custom domain** and enter your subdomain (e.g. `docs.epocanvas.com`);
2. If the domain's DNS is already hosted on Cloudflare, the CNAME record is added automatically; for domains hosted elsewhere, add a CNAME record manually pointing to `<project-name>.pages.dev`;
3. Wait for the certificate to be issued (usually 2–5 minutes). Once the status changes to **Active** (marked ③ in the image above), the site is reachable through the new domain.

HTTPS certificates are issued and renewed automatically by Cloudflare; no manual application or configuration is needed.

---

## Verify the Deployment

### Check the HTTP Status from the Command Line

```bash
curl -sI https://epocanvas-docs.pages.dev
```

The real response:

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

A `200` means the site is healthy. After binding a custom domain, run the check again with your own domain in the URL.

### Check Each Item in the Browser

| Check | Expected result |
| :--- | :--- |
| Homepage and any document page open | Page renders fully, no blank screen |
| Recent changes are live | The section you just edited is visible online |
| `Ctrl+K` site-wide search | Finds the latest articles (the index is generated with the build) |
| Light/dark theme toggle | Switches correctly and persists after a refresh |

---

## Common Deployment Issues

### Content Not Updated Online After Deployment?

Hard-refresh the browser (`Ctrl+F5` / `Cmd+Shift+R`) to rule out caching. If it still does not update, check the timestamp of the latest record on the Deployments page in the dashboard, then compare against the deployment preview domain with `curl -sI`.

### Custom Domain Shows an SSL Handshake Failure (Error 525)?

Certificate issuance takes 2–5 minutes to propagate globally; wait and hard-refresh. In the meantime you can use the default `xxx.pages.dev` domain.

### `pnpm run deploy` Fails with `Project not found`?

First run `npx wrangler whoami` to confirm you are logged in; then check that the `--project-name` in the `deploy` script of `package.json` matches the project name in the dashboard.

For more troubleshooting, see [FAQ & Troubleshooting](/canvas/troubleshooting/).
