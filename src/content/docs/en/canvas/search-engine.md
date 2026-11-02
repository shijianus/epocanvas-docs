---
title: Full-Text Search & Keyboard Shortcuts
description: "How to use the two search modes in EpoCanvas Docs: the header in-page search and the Ctrl+K site-wide search dialog, plus the local static index mechanism."
---

**EpoCanvas Docs** offers in-page and site-wide search. At viewport widths of `64rem` or more, the header shows the in-page input; below `64rem`, it shows only the site-wide search button. Site-wide search uses a Pagefind static index, without a search backend.

---

## Which Search Mode to Use When

| Scenario | Mode | How |
| :--- | :--- | :--- |
| The text is in **the current article** | In-page search | Use the header input at `64rem` or wider; on narrow screens use the browser’s Find in Page |
| You do not know **which article** contains the text | Site-wide search | Click the header search button or press `Ctrl + K` (`Cmd + K` on Mac) |

---

## In-Page Search: the Header Search Box

These instructions apply at viewport widths of at least `64rem`. Click the header’s in-page input and type keywords. Below that width, the input, counter, and match controls are hidden; only the magnifier button that opens site-wide search remains. Use the browser’s Find in Page for the current article on narrow screens.

![Annotated view of in-page search in the header: (1) input box, (2) match counter, (3) previous/next navigation, (4) clear button, (5) highlights on the page](/images/canvas/ui-inpage-search.png)

*Figure: an existing in-page search screenshot, provided for orientation. The current counter, previous/next, and clear controls appear below the input, not inside it, and are hidden on narrow screens. If positions, counts, or layout in the screenshot differ, follow the actual interface.*

### Enter Keywords

Enter words or code snippets such as `pnpm` and `astro.config.mjs`. Matching visible body text is highlighted and the page scrolls to the first match. Navigation and hidden content are excluded.

### Jump Between Matches

- With the input focused, press <kbd>Enter</kbd>, or click the down-arrow button, to move to the next match;
- With the input focused, press <kbd>Shift + Enter</kbd>, or click the up-arrow button, to move to the previous match;
- Controls below the input show an `N/M` counter (for example `3/9`), indicating the current match and total.

### Clear the Search and Restore the Page

With focus in the in-page input, press <kbd>Esc</kbd>, or click the `×` clear button, to clear the query and remove highlights.

---

## Site-Wide Search: the Ctrl+K Dialog

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (<kbd>Cmd</kbd> + <kbd>K</kbd> on Mac), or click the header’s site-wide search button. Wide screens show a shortcut badge; below `64rem` the button is a magnifier icon. It still opens site-wide search, not an in-page input.

![Annotated view of the site-wide search dialog: (1) trigger badge, (2) search input box, (3) results list, (4) keyboard shortcut bar](/images/canvas/ui-search-modal.png)

*Figure: an existing site-wide search screenshot showing the input and results. If button positions or shortcut hints differ from the current layout, follow the actual interface and the instructions below. The current interface uses Tab to focus links; the footer hints may be hidden on narrow screens.*

### Enter Keywords

Enter words in the current page’s language or code snippets such as `pnpm` and `astro.config.mjs`. Pagefind ranks results by relevance; a title match is not guaranteed to come first.

### Browse the Results List

Results are organized by document, with a title, matching excerpt, and available section sub-results. Matching terms are highlighted. Titles and sub-results are links: a title opens the document, and a section link follows its anchor. A document title is not an expand/collapse control.

### Complete the Whole Flow with the Keyboard

- <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>: move focus through inputs, buttons, and result links;
- With a result link focused, press <kbd>Enter</kbd> to open it; section links follow their anchors;
- <kbd>Esc</kbd>: close the dialog.

The current Pagefind interface does not use <kbd>↑</kbd> / <kbd>↓</kbd> to select results and does not expand matching passages when you click a document title.

---

## Why Is the Search So Fast?

![Comparison of the two search modes in EpoCanvas Docs: on the left, header in-page search (DOM traversal highlighting, live counting, and smooth scrolling); on the right, the Ctrl+K site-wide dialog (Pagefind WASM in-memory inverted index for fast matching)](/images/canvas/docs-search-flow.svg)

*Figure: how the two search modes work. Left: fast keyword location within the current page via the header. Right: site-wide search over a static index built on Pagefind WASM. Both run entirely in the browser.*

Documentation search on many websites sends requests to a remote server's database, and on a poor connection you just watch a spinner.

EpoCanvas Docs uses **Pagefind**, a local static search solution:

1. **Index extracted at build time**: when you run `pnpm run build`, the system reads the content of every document and produces a set of compressed static index chunk files.
2. **On-demand index downloads**: the browser loads search code and the required index chunks from this site. Initial loading or missing cached files still involves network requests.
3. **Matching in the browser**: once the index is loaded, matching and ranking run locally. An intranet deployment must serve the search assets too; local computation does not mean a first visit works without a network.

---

## Search Tips

- **Split into words**: for more precise results, enter several words separated by spaces (for example `Cloudflare domain`).
- **Use specific terms**: titles and section names can help narrow the search, but Pagefind determines the order by relevance.
- **Dev mode limitation**: the site-wide index is only generated at build time, and in the dev server started with `pnpm run dev` the `Ctrl+K` dialog does not load the index, so site-wide search is unavailable there. To try the search, run `pnpm run build` and then `pnpm run preview` to view the built site. In-page search is not affected.
