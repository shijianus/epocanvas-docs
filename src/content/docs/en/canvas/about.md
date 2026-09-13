---
title: What Is This
description: "Start here: EpoCanvas Docs is the official documentation project for EpoCanvas. This page explains what it is, how it relates to the code repository, what it is actually for, and where different readers should start."
---

**EpoCanvas Docs is the official documentation project for the EpoCanvas project**. In plain terms: what this repository delivers is the documentation itself — the entire site you are browsing right now is its finished product. The repository contains no feature code for other software; the "product" you are looking for is this documentation site.

---

## What "Documentation Project" Means

The term has two meanings, and both hold at the same time:

1. **It is a manual.** The content is organized around "what it is, how to use it, how to change it, and how to publish it": how to operate the reading interface, how to write new documents, where to change the configuration, what the deploy commands are. It has exactly one purpose — so that anyone who receives EpoCanvas can get things done by following the documentation instead of asking around.
2. **It is itself a website system you can run directly.** Clone the repository locally and run two commands, `pnpm install` and `pnpm run dev`, and you get a site identical to the one in front of you. The whole codebase is based on Astro 5 and Starlight, licensed under MIT, and can be taken wholesale and turned into the documentation site for your own project.

One easily overlooked trait: **every feature described in this documentation is one you are using right now**. The three-column reading layout, `Ctrl + K` site-wide search, and in-place switching between 10 languages in the top-right corner — what the documentation describes is exactly what this site implements, so you can verify it as you read.

---

## What It Is Actually For

Depending on who the reader is, this documentation project does three jobs:

| Who you are | What it does for you | Where to start |
| :--- | :--- | :--- |
| **Readers who just need to look something up** | Look up how a feature works or how to fix an error | Use the top search box or `Ctrl + K` site-wide search to jump straight to the relevant section |
| **Developers who want to build their own documentation site** | Provides a complete, runnable documentation site source code and deployment workflow | Product Overview → Quickstart → Deployment |
| **Writers who contribute documentation** | Specifies where files go, how to format them, where images are stored, and how to publish | The three chapters under the "Writing & Content Management" group |

In one sentence: **readers can understand it, developers can take it away, and writers have a clear set of rules to follow.**

---

## What This Project Contains

The sidebar has five groups, each answering one question:

- **Product Overview & Getting Started**: What is this thing? How do I run it locally?
- **Core Features & Usage Guides**: How exactly do the reading interface, search, multilingual support, and navigation work?
- **Writing & Content Management**: How do I write new documents? What are the rules for Markdown formatting and rendering?
- **Configuration & Customization**: Where do I change the site title, navigation menu, and theme colors? How do I modify components?
- **Publishing & Deployment**: How do I publish the site, bind a domain, and handle SEO and version management?

Every article stands on its own and can be consulted independently; there is no need to read them in order.

---

## Two Common Misunderstandings

**Misunderstanding 1: "This is the manual for some other piece of software, and I need to go find that software."**
This repository contains only the documentation site's source code, no code for other software; what the documentation actually explains is the usage, customization, and deployment of this documentation site system itself.

**Misunderstanding 2: "This is a read-only website, so downloading it is useless."**
Quite the opposite: the source code is fully open on GitHub and runs locally with two commands; using it as a template to build your own project's documentation site is one of its intended uses.

---

## Next Steps

- For a full introduction to the product positioning, core features, and technology choices, read **[Product Overview & Core Value](/canvas/)**.
- To run the site locally right away, read **[Quickstart (Up and Running in 3 Minutes)](/canvas/deployment/)**.
- Just looking up a specific question? Use the top search box or `Ctrl + K` to search for keywords.
