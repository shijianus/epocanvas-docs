---
title: Deploying to Cloudflare Pages
description: "Cloudflare Pages deployment guide: Wrangler uploads, optional Git integration, custom domains, and post-deployment checks."
---

This page explains how to deploy static documentation to **Cloudflare Pages**, based on the repository scripts. Dashboard screenshots are existing examples, not deployment or test records for this candidate. If the dashboard differs, follow its current interface. Whether verification or deployment succeeded must be established from the actual logs and deployment status, not inferred from this guide.

---

## Prerequisites

### What You Need

| Item | Details |
| :--- | :--- |
| **A Cloudflare account** | Register for free at [dash.cloudflare.com](https://dash.cloudflare.com/); Pages does not require a paid plan |
| **A complete local build** | Run `pnpm run verify` first and confirm the `dist/` directory is generated correctly, see [Quickstart](/canvas/deployment/) |
| **Node.js + pnpm** | The deploy commands depend on your local development environment; version requirements are the same as in the Quickstart chapter |

### Choosing Between the Two Deployment Methods

![Deployment paths for local Wrangler uploads and Git-integrated builds](/images/canvas/docs-deploy-compare.svg)

*Figure: build locally and upload with Wrangler on the left; trigger cloud builds with Git integration on the right. This diagram is not evidence that either path was tested during this revision.*

| Comparison | Method 1: Command-Line Direct Upload | Method 2: Automatic Builds from Git |
| :--- | :--- | :--- |
| How it works | Run `pnpm run deploy` locally | Pushing code to GitHub triggers the build automatically |
| Difficulty | Low — two commands | Medium — one-time configuration in the dashboard |
| Best for | First launch, single maintainer, quick updates | Team collaboration, wanting "commit = live" |
| Release checks | Complete verify must pass before upload | Configure complete verify in the cloud build command |

:::tip
Choose Direct Upload or Git integration when creating the project. Do not assume an existing Direct Upload project can be switched to Git integration; create a suitable project when changing paths. Emergency Wrangler uploads still must meet the repository’s release checks.
:::

:::tip[Prefer Not to Type Commands?]
The [Quickstart](/canvas/deployment/) page provides one-click deploy buttons for Cloudflare, Vercel, and Netlify: click, authorize your account, confirm the configuration, and the documentation site is published to your own cloud account. See [One-Click Deploy](/canvas/deployment/#one-click-deploy-go-live-with-one-button) for details. The Cloudflare button uses Workers static asset hosting, which is a separate path from the Pages method described on this page; for a static documentation site the access experience is identical, so just pick one.
:::

---

## Method 1: Direct Upload from the Command Line (Recommended for First Deployment)

This path builds locally and uploads with Wrangler. The repository’s `pnpm run deploy` targets the maintainers’ `epocanvas-docs` project; it is not a generic deployment button for every fork.

### Step 1: Log In to Your Cloudflare Account

The project ships with Wrangler (Cloudflare's official command-line tool). The first use requires browser authorization:

```bash
pnpm exec wrangler login
```

The terminal prints `Opening a link in your default browser...` and the browser opens the Cloudflare authorization page. After clicking **Allow**, the terminal confirms the login. Verify your login state with:

```bash
pnpm exec wrangler whoami
```

:::caution
Valid Cloudflare login or token permissions are required. On authentication failure, check `wrangler whoami`, the account, and project permissions. Exact error wording can vary with Wrangler versions.
:::

### Step 2: One-Command Build and Upload

The project presets a one-command publish script in `scripts/verify-release.mjs`:

Authorize with `pnpm exec wrangler login`. `scripts/verify-release.mjs` requires `main`, a clean working tree including untracked files, an `origin/main` upstream, and HEAD matching the actual remote commit. `pnpm run deploy` runs complete `pnpm run verify`, rechecks Git, then calls Wrangler. The target project is defined in the script; configure your own project before reusing it.

```bash
pnpm run deploy
```

`pnpm run deploy` runs configuration checks, Astro type checking, the build, tests, and content/output checks before uploading. To check deployment prerequisites only, use the command below. It still reads remote Git references but does not run full verification, build, or upload; a successful dry run is not a successful test run.

```bash
pnpm run deploy --dry-run
```

Wrangler prints a deployment URL only after a successful upload. The script specifies `--project-name epocanvas-docs --branch main`; confirm that the project exists in your account and its production branch is configured correctly.

### Step 3: Find Your Project in the Dashboard

Open [dash.cloudflare.com](https://dash.cloudflare.com/) and click **Compute (Workers & Pages)** in the left menu to see the project list. The image below marks three key spots:

![Workers & Pages project list in the Cloudflare dashboard, marking the left menu entry, the Create application button, and the epocanvas-docs project](/images/canvas/deploy/cf-01-projects-list.png)

*Figure: The Workers & Pages project list. ① Navigate to Workers & Pages in the left menu; ② the Create application button creates a new project; ③ our `epocanvas-docs` project, showing the domain `epocanvas-docs.pages.dev` and the most recent deployment time.*

Click the project name to open the project details. The **Deployments** tab shows the full deployment history:

![Deployment history page of the epocanvas-docs project, marking the production domains, deployment records, and statuses](/images/canvas/deploy/cf-02-deployments.png)

*Figure: The deployment history page. ① Project name; ② Deployments tab; ③ the production domain is bound to both `docs.epocanvas.com` (custom domain) and `epocanvas-docs.pages.dev` (default domain); ④ each deployment record shows its branch and commit message; ⑤ status and deployment time.*

:::note
Only a successful upload creates a deployment record. Check status, branch, commit, and production domain in Deployments. A rejected command or failed verification does not update the live site.
:::

---

## Understanding the Build Configuration of a Direct-Upload Project

Open the **Settings** tab to see how a direct-upload project differs from a Git-connected one:

![Settings build configuration page of the epocanvas-docs project, with the Git repository section showing it is not connected](/images/canvas/deploy/cf-03-settings.png)

*Figure: The Settings tab. ① Settings entry; ② the Git repository section shows Connect (not connected) — a direct-upload project needs no Git build configuration because the build happens entirely on your local machine.*

:::tip
Direct upload avoids the cloud build queue. Any deployment machine still needs the required Node, pnpm, Git, and credentials; it is not tied to one specific computer.
:::

---

## Method 2: Connect a Git Repository for Automatic Builds (Optional)

For push-triggered builds, create a Git-integrated Pages project and connect the repository. The following is a configuration guide, not a claim that this path is enabled or was tested in this revision.

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
| Build command | `pnpm install --frozen-lockfile && pnpm run verify` |
| Build output directory | `dist` |
| Node.js | `22.23.4`, matching `.node-version` |
| pnpm | `10.34.5`, matching `packageManager` |

### Step 4: Verify the Automatic Build

Ensure the cloud environment has the required Node and pnpm, then choose **Save and Deploy** and inspect the Deployments logs. Installation, complete verification, and upload must all succeed. Later pushes trigger deployment only according to the configured production branch and automatic-deployment settings. A successful GitHub CI job alone does not deploy Pages.

:::caution
The Settings page of a Git-integrated project has an extra build configuration section (framework preset, build command, etc.), which differs from the [direct-upload project](#understanding-the-build-configuration-of-a-direct-upload-project) interface — if you cannot find the build configuration in Settings, the project is a direct-upload project, which is normal.
:::

---

## Bind a Custom Domain

Cloudflare provides a `<project-name>.pages.dev` domain; you can also bind your own. Domains below are examples, and DNS/certificate timing depends on the actual status.

### Step 1: Open the Custom Domain Settings

In the project details, click the **Custom domains** tab, then click **Set up a custom domain**:

![Custom domains page of the epocanvas-docs project, with docs.epocanvas.com bound and SSL active](/images/canvas/deploy/cf-04-domains.png)

*Figure: The Custom domains tab. ① Tab entry; ② the Set up a custom domain button; ③ the bound `docs.epocanvas.com`, with status Active and SSL enabled.*

### Step 2: Add the Domain and Wait for It to Take Effect

1. Click **Set up a custom domain** and enter your subdomain (e.g. `docs.epocanvas.com`);
2. If the domain's DNS is already hosted on Cloudflare, the CNAME record is added automatically; for domains hosted elsewhere, add a CNAME record manually pointing to `<project-name>.pages.dev`;
3. Wait for DNS validation and certificate issuance. Test the new domain after it becomes **Active**; a fixed number of minutes is not a completion guarantee.

HTTPS certificates are issued and renewed automatically by Cloudflare; no manual application or configuration is needed.

---

## Verify the Deployment

### Check the HTTP Status from the Command Line

```bash
curl -sI https://epocanvas-docs.pages.dev
```

Example response (the date and status depend on the actual request):

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

A `200` only confirms that this URL responded successfully. It does not validate translations, assets, search, or the latest content. Continue with the checks below for both the default and custom domains.

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

Check domain validation and certificate status in Custom domains, then inspect DNS, proxy configuration, and error details. Do not rely only on waiting a few minutes; compare with the default `pages.dev` domain.

### `pnpm run deploy` Fails with `Project not found`?

First run `pnpm exec wrangler whoami` to confirm you are logged in; then check that the `--project-name` in `scripts/verify-release.mjs` matches the project name in the dashboard.

For more troubleshooting, see [FAQ & Troubleshooting](/canvas/troubleshooting/).
