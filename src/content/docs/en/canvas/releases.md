---
title: Versioning & Automation Workflows
description: The version numbering scheme of EpoCanvas Docs, the standard steps for releasing an update, and the GitHub Actions automated release pipeline.
---

So that readers know which version of the product the current documentation corresponds to, and so the team can track changes in an orderly way, **EpoCanvas Docs** uses semantic version numbers and a fixed release process.

![Release workflow: five checkpoints from editing content and running pnpm run verify locally, through review and merge to main, to tagging v*; tagging only creates a GitHub Release, while site deployment requires running pnpm run deploy on main separately](/images/canvas/docs-release-flow.svg)

---

## 1. Semantic Versioning Rules (SemVer)

Stable releases use `vMAJOR.MINOR.PATCH`; prereleases add an identifier, as in the current candidate `v1.3.2-beta.1`. A candidate version does not mean a Release has been published or production deployed.

| Change type | Example | When it applies |
| :--- | :--- | :--- |
| **Major** | `v2.0.0` | Major rework of the documentation system (e.g. upgrading the Astro major version, completely replacing the layout). |
| **Minor** | `v1.2.0` | Larger features such as new documentation chapters, new languages, or a design system upgrade. |
| **Patch** | `v1.2.1` | Small changes such as fixing typos, updating code samples, or adjusting minor styles. |

---

## 2. The Standard 3-Step Release Process

### Step 1: Write the Release Notes (`RELEASE_NOTES.md`)

Describe the update in `RELEASE_NOTES.md` in the project root; this file becomes the GitHub Release body. Its first line must be exactly `# EpoCanvas Docs v<version>`, matching `package.json`; `verify:config` checks this format. The example below illustrates the format only: use an unused version for an actual release. Prerelease notes must also identify the build as a `candidate` or `prerelease`.

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### Fixes
- Fixed a command typo in the deployment chapter.
- Updated UI screenshots to the latest version.
```

### Step 2: Update the Version in package.json

The version badge in the navigation bar is automatically linked to the `version` field in `package.json`, which is the single source of truth for the site-wide version. Update the version in `package.json` (or run `pnpm version patch --no-git-tag-version`), and the header badge syncs to the latest version automatically — no need to change it in several places by hand:

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### Step 3: Commit the Code and Create a Git Tag

```bash
# 1. Commit all changes
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. Create the matching version tag and push it
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. The GitHub Actions Release Pipeline

The authoritative workflow is [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml); the full YAML is not duplicated here. Pushing a `v*` tag triggers it. Before tagging, run the following local check; it neither writes to GitHub Releases nor deploys the site:

```bash
pnpm run verify
```

1. The `validate` job uses read-only `contents: read` permissions and runs the full `pnpm run verify` check first.
2. Only after validation passes does the `publish` job receive `contents: write` permissions to create or update a GitHub Release using `RELEASE_NOTES.md`.
3. Existing releases are updated in place, non-destructively, rather than deleted and recreated. GitHub determines `Latest` for stable releases by version; prereleases are not marked `Latest`. Readers can use the header version badge to browse release history.

:::note
This workflow only creates or updates GitHub Releases; it does not automatically deploy the site. Merging into `main` does not deploy it either. Publish through local `pnpm run deploy` or a separately configured hosting Git integration; see [Deploying to Cloudflare Pages](/canvas/cloudflare/).
:::

---

## 4. Content Collaboration Workflow

When several people maintain the documentation, collaborate following the fixed "branch → review → merge → release" process so the live content can always be built:

```text
main branch (release source; live content changes only after deployment)
  │
  ├─ 1. Create a feature branch from main        git checkout -b docs/new-guide
  ├─ 2. Write/modify Markdown
  ├─ 3. Self-check locally                       pnpm run verify
  ├─ 4. Push the branch and open a Pull Request  triggers full CI validation
  ├─ 5. Merge into main after review passes      does not deploy the live site automatically
  └─ 6. Tag v* when a release is needed          triggers the GitHub Release pipeline
```

### Pull Request Review Checklist

CI (`build.yml`) runs `pnpm run verify`: tests, configuration checks, Astro type checks, the build, and content/output checks. Visual results still need human review:

- **Link validity**: do new internal links and anchors work; do moved documents have redirects registered;
- **Rendering**: do the `:::` aside syntax and code block annotations display correctly on the page (CI does not check visuals);
- **Figure-text correspondence**: do new screenshots have captions, and are they legible;
- **Naming conventions**: lowercase filenames with hyphens, complete `title` and `description` in the Frontmatter.

### Suggested Division of Roles

| Role | Responsibilities |
| :--- | :--- |
| Documentation author | Write content, self-check locally, open the PR |
| Reviewer | Check rendering and links, merge the code |
| Release manager | Create version tags, maintain `RELEASE_NOTES.md`, keep the navigation version badge in sync |

---

## 5. CI Build Checks

`.github/workflows/build.yml` runs full validation on pushes to `main` and on Pull Requests. CI uses Node.js 22.23.4 pinned in `.node-version` and pnpm 10.34.5. Run the same self-check locally before committing:

```bash
pnpm run verify
```
