---
title: Versioning & Automation Workflows
description: The version numbering scheme of EpoCanvas Docs, the standard steps for releasing an update, and the GitHub Actions automated release pipeline.
---

So that readers know which version of the product the current documentation corresponds to, and so the team can track changes in an orderly way, **EpoCanvas Docs** uses semantic version numbers and a fixed release process.

---

## 1. Semantic Versioning Rules (SemVer)

Versions use the `vMAJOR.MINOR.PATCH` format (currently `v1.3.1`):

| Change type | Example | When it applies |
| :--- | :--- | :--- |
| **Major** | `v2.0.0` | Major rework of the documentation system (e.g. upgrading the Astro major version, completely replacing the layout). |
| **Minor** | `v1.2.0` | Larger features such as new documentation chapters, new languages, or a design system upgrade. |
| **Patch** | `v1.2.1` | Small changes such as fixing typos, updating code samples, or adjusting minor styles. |

---

## 2. The Standard 3-Step Release Process

### Step 1: Write the Release Notes (`RELEASE_NOTES.md`)

Describe the update in `RELEASE_NOTES.md` in the project root; this file becomes the body text of the GitHub Release:

```markdown
## [v1.2.1] - 2026-09-14

### Fixes
- Fixed a command typo in the deployment chapter.
- Updated UI screenshots to the latest version.
```

### Step 2: Update the Version in package.json

The version badge in the navigation bar is automatically linked to the `version` field in `package.json`, which is the single source of truth for the site-wide version. Update the version in `package.json` (or run `pnpm version patch`), and the header badge syncs to the latest version automatically — no need to change it in several places by hand:

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

The project ships with an automated release workflow in `.github/workflows/release.yml`; its actual content is:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # triggers automatically when a tag starting with v is pushed

permissions:
  contents: write

jobs:
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG_NAME="${{ github.ref_name }}"
          echo "Publishing release for tag: ${TAG_NAME}"
          # 同名 release 已存在时（例如重新推送 tag，或 tag 删除后旧 release 转为草稿）先删掉，再按当前 RELEASE_NOTES.md 重新发布
          gh release delete "${TAG_NAME}" --yes 2>/dev/null || true
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

After you push the `v1.2.1` tag, GitHub starts the pipeline automatically:

1. Check out the repository code;
2. Create an official release on the repository's **Releases** page using `RELEASE_NOTES.md` as the notes, and mark it as latest;
3. Readers can click the version badge in the header to view the archive of all historical releases.

:::note
This pipeline only creates the GitHub Release; it does **not deploy the site**. Live updates are handled by Cloudflare Pages' automatic Git builds (or a local `pnpm run deploy`). The two are independent of each other; see [Deploying to Cloudflare Pages](/canvas/cloudflare/) for details.
:::

---

## 4. Content Collaboration Workflow

When several people maintain the documentation, collaborate following the fixed "branch → review → merge → release" process so the live content can always be built:

```text
main branch (always releasable, matches the live site)
  │
  ├─ 1. Create a feature branch from main        git checkout -b docs/new-guide
  ├─ 2. Write/modify Markdown
  ├─ 3. Self-check locally                       pnpm exec astro check && pnpm run build
  ├─ 4. Push the branch and open a Pull Request  triggers the CI build
  ├─ 5. Merge into main after review passes      triggers automatic live deployment
  └─ 6. Tag v* when a release is needed          triggers the GitHub Release pipeline
```

### Pull Request Review Checklist

CI (`build.yml`) only guarantees that the site builds. The following need human review:

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

The repository has `.github/workflows/build.yml`, which automatically installs dependencies and runs a full build on every push to `main` and on every Pull Request, surfacing broken links, Frontmatter errors, and other build-time problems early. Running the same check locally before committing avoids CI failures after you push:

```bash
pnpm exec astro check && pnpm run build
```
