# EpoCanvas Docs v1.3.2-beta.1

Candidate date: 2026-11-02

This is a public-test candidate, not a production release. The existing production site and the `v1.3.1` tag remain unchanged. Use the deployment URL and commit identifier from the candidate verification record to identify the build under test.

## Changes since v1.3.1

- Keep a clickable site-wide search entry on narrow screens, and provide compact navigation on pages without a sidebar.
- Restore the keyboard skip-to-content link and preserve a single primary heading on the error page.
- Correct the mobile menu button's expanded state and improve search loading, status announcements, retry feedback, and focus handling.
- Align translated operating instructions with the implementation: use Tab to navigate search results, require complete translations before publishing, and distinguish Pages Direct Upload from native Git integration.
- Use one verification command for local checks and CI. Add regression tests for version boundaries, relative URLs, malformed fragments, language alternates, canonical links, Markdown fences, and release metadata.
- Separate Release validation from write-permission publication. Existing GitHub releases are updated without deleting their assets or history; prereleases are not marked Latest.
- Require a clean, synchronized main branch for production deployment. Candidate previews use a separate, explicitly named non-production branch.

## Supported tooling

- Node.js 22.23.4 or newer in the 22.x line, or 24.12 or newer in the 24.x line.
- pnpm 10.34.5, pinned in `package.json`.
- Astro 7.4.4, Starlight 0.41.11, Pagefind 1.6.0, and Wrangler 4.156.1 from the committed lockfile.
- The framework and transitive dependencies were upgraded to address the security advisories affecting the previous toolchain. Existing rehype plugins run through `@astrojs/markdown-remark`'s unified processor.

```sh
pnpm install --frozen-lockfile
pnpm run verify
```

## Candidate verification

Build and test results are recorded against the candidate commit, separately from these notes. A successful local build alone is not evidence of a successful remote deployment. Before sharing a candidate URL, check the commit's CI result, the Cloudflare preview deployment record, and the served build metadata.

The candidate workflow runs on `fix/**` and `beta/**` branch pushes as well as main pushes and pull requests. Pushing a candidate branch does not deploy the production site or create a GitHub Release.

## Known limitations

- This is a static documentation site, not an authenticated application. Preview URLs are public unless the project owner configures Cloudflare Access; `noindex` is not access control.
- Site-wide search needs a generated Pagefind index and is unavailable in the development server. Use a production build and preview server to test it.
- Language-specific images are resolved by filename. New documents and non-shared images must satisfy the repository's complete-translation checks.
- Mermaid fences are displayed as source code rather than rendered diagrams.
- Real input methods and assistive-technology combinations need device-specific testing. DOM state assertions alone cannot prove how every screen reader announces changes.
- Older screenshots are marked as illustrations when their arrangement differs from the current controls.

## Production and rollback

This candidate does not move the existing production domains, change DNS, or replace the previous production deployment. Production promotion is a separate action after preview acceptance. Retain the last successful production deployment ID before promotion so it remains available for rollback.
