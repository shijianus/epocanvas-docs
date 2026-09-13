---
title: How Rendering Works
description: "The complete rendering rules of EpoCanvas Docs: the pipeline from a Markdown file to the final page, and all conventions for Frontmatter, headings, asides, code blocks, images, and links."
---

This page explains the rendering rules of **EpoCanvas Docs** in full: what processing steps a Markdown file goes through, what each piece of syntax renders into, and which syntax is not supported. Read it once before writing documents and you will avoid the vast majority of formatting problems.

---

## The Rendering Pipeline: from .md File to Live Page

![Diagram of the EpoCanvas Docs Markdown rendering pipeline: the complete 5-step flow from scanning Markdown sources, GFM AST parsing, and code highlighting, through layout assembly by 7 custom components, to static HTML and Pagefind index generation](/images/canvas/docs-render-pipeline.svg)

*Figure: the 5-step Markdown rendering pipeline. The steps run in order at build time; the build output is pure static files with no runtime framework overhead in the client.*

A Markdown file goes through the following five steps between being saved and being read by a reader:

1. **Content collection**: when Astro starts or builds, it scans the `src/content/docs/` directory, registers every `.md` / `.mdx` file as a content entry, and validates the Frontmatter (a missing `title` fails the build immediately).
2. **Markdown compilation**: the body text is converted to HTML by the Markdown compiler (with GFM extensions). Extended syntax such as tables, task lists, and strikethrough takes effect at this step.
3. **Code block highlighting**: all code fences are handed to Expressive Code, which produces code blocks with syntax highlighting, a title bar, line numbers, and a copy button.
4. **Site layout applied**: the compiled HTML is placed into the Starlight page skeleton — the header, left sidebar, and right-hand on-this-page outline are all rendered by the custom components under `src/components/starlight/`.
5. **Index and static files generated**: during `pnpm run build`, Pagefind walks every output page and extracts the full-text index; the pure HTML in the final `dist/` directory can be hosted on any static server.

:::note
The pipeline above runs once at build time. After the site goes live there is no server involved; all interactions (search, theme switching, language switching) happen in the browser.
:::

---

## Frontmatter Rules

- `title` is **required**; if missing, the build fails with `InvalidInputError`;
- `description` is recommended; it appears in search engine results and share cards;
- The Frontmatter must be a valid YAML block at the very top of the file, including both sets of three dashes.

---

## Heading Rules

| Rule | Explanation |
| :--- | :--- |
| Do not write a level-1 heading `#` in the body | The `title` from Frontmatter is already rendered as the page's main heading; adding `#` in the body produces two main headings |
| Start the body with level-2 headings `##` | `##` and `###` headings automatically appear in the right-hand "On this page" outline |
| `####` and deeper do not enter the outline | Deeper levels are rendered only as body styles |
| Heading text becomes an anchor | For a Chinese heading the anchor is the Chinese text itself, e.g. `#标题规则` |

---

## Aside Rules (Admonitions)

Asides use Starlight's triple-colon syntax and support 4 types:

```markdown
:::note
Supplementary information.
:::

:::tip
A small trick that improves efficiency.
:::

:::caution
A risk to watch out for or an operation that is easy to get wrong.
:::

:::danger
A high-severity warning involving data loss or irreversible operations.
:::
```

You can also add a custom title after the type: `:::tip[Speed Up Installation]`.

:::caution
Two frequent mistakes to avoid:

- GitHub-style `> [!TIP]` blockquote syntax is **not supported**; if you write it, `[!TIP]` shows up as plain text inside the blockquote;
- `:::important` and `:::warning` are **not valid types**; they do not error out but are silently rendered as ordinary paragraphs.

When migrating old documents: `> [!NOTE]` → `:::note`, `> [!WARNING]` → `:::caution`, `> [!CAUTION]` → `:::danger`.
:::

![The actual rendered appearance of the four colored asides](/images/canvas/ui-markup-examples.png)

*Figure: how the four aside types actually look when written with the syntax above, taken from the [Asides, Code Blocks & Diagrams](/canvas/syntax/) page.*

---

## Code Block Rules

Code fences (triple backticks) are rendered by Expressive Code and support the following annotations (written after the language tag on the first line):

| Annotation | Effect | Example |
| :--- | :--- | :--- |
| Language tag | Chooses the syntax highlighting scheme | <code>```ts</code> |
| `title="..."` | Shows a filename title bar | <code>```ts title="src/config/site.ts"</code> |
| `{2}` / `{2-4}` | Highlights the given lines | <code>```ts {2}</code> |
| `lang="diff"` or `diff` | Shows added/removed lines in red/green | <code>```diff</code> |
| Terminal languages such as `bash` / `sh` | Rendered with a terminal-style frame | <code>```bash</code> |

Every code block automatically gets a one-click copy button, and code text is included in the Pagefind search index, so readers can search directly for keywords in code.

---

## Image Rules

- Store images in `public/images/canvas/` and reference them with absolute paths: `![description](/images/canvas/xxx.png)`;
- Use `.svg` vector format for architecture and flow diagrams, and compressed `.png` for UI screenshots;
- The description text is required: it is the alt text shown when the image fails to load and the basis for accessibility;
- **The current version has no built-in Mermaid diagram rendering**: a ` ```mermaid ` fence is displayed as an ordinary code block showing the source. When you need a flow diagram, export an SVG from a tool such as mermaid.live first, then insert it as an image.

---

## Link Rules

- **Internal links**: use full paths that start and end with `/`, such as `/canvas/deployment/`. After a documentation path changes, register a redirect for the old path in the `redirects` table in `astro.config.mjs`;
- **Anchor links**: `/canvas/rendering/#code-block-rules` jumps straight to a section on this page;
- **External links**: just write the full URL; the text is shown in the theme color in the body.

---

## Other Rendering Behavior

| Syntax | Rendered result |
| :--- | :--- |
| `**bold**`, `*italic*`, `~~strikethrough~~` | The corresponding text styles |
| `inline code` | Monospace pill in the theme color |
| <kbd>Ctrl</kbd>+<kbd>K</kbd> notation | Keycap-style key badge |
| GFM tables | Bordered data tables with hover highlighting |
| `- [x]` task lists | Visual checkboxes (disabled state) |
| `[^name]` footnotes | Superscript number in the body + footnote list at the bottom of the page, with clickable jumps both ways |
| Markdown blockquote `>` | Theme-colored vertical bar on the left + light background |
| Horizontal rule `---` | Thin divider spanning the body area |

:::tip
When unsure how a piece of syntax will render, the most reliable method is: start `pnpm run dev`, put a small sample into a test document, and confirm it with your own eyes in the browser before using it for real.
:::
