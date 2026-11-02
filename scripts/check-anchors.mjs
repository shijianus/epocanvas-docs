// 一次性校验脚本：检查所有语言文档里的锚点链接是否指向真实标题。
// 这里用于源码层友好诊断；最终路径和锚点仍由构建产物检查器复核。
import fs from 'node:fs';
import path from 'node:path';
import { resolveSiteUrl } from './link-utils.mjs';

const ROOT = path.resolve('src/content/docs');
const LOCALES = ['', 'zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
const LOCALE_SET = new Set(LOCALES.filter(Boolean));

function slugify(text) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*?([^*]*)\*\*?/g, '$1')
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/ /g, '-');
  return base || 'section';
}

function parseMarkdown(md) {
  const headings = [];
  const links = [];
  const lines = md.split(/\r?\n/);
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (match) {
      const marker = match[1];
      if (!fence) fence = { char: marker[0], length: marker.length };
      else if (marker[0] === fence.char && marker.length >= fence.length && !match[2].trim()) fence = null;
      continue;
    }
    if (fence) continue;
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) headings.push({ depth: heading[1].length, text: heading[2].replace(/\s+#+\s*$/, ''), line: i + 1 });
    const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
    let link;
    while ((link = linkRe.exec(line))) links.push({ text: link[1], href: link[2].trim(), line: i + 1 });
  }
  return { headings, links };
}

function slugSet(headings) {
  const slugs = new Map();
  const used = new Set();
  const nextCounts = new Map();
  for (const heading of headings) {
    const base = slugify(heading.text);
    let count = nextCounts.get(base) ?? 0;
    let slug = count ? `${base}-${count}` : base;
    while (used.has(slug)) {
      count += 1;
      slug = `${base}-${count}`;
    }
    nextCounts.set(base, count + 1);
    used.add(slug);
    slugs.set(slug, heading.line);
  }
  return slugs;
}

function sourceRoute(file) {
  const parts = path.relative(ROOT, file).split(path.sep);
  const stem = parts.pop().replace(/\.(md|mdx)$/, '');
  if (stem !== 'index') parts.push(stem);
  return parts.length ? '/' + parts.join('/') + '/' : '/';
}

function fileFor(sourceLocale, absolutePath) {
  const pathname = absolutePath.split(/[?#]/, 1)[0];
  const segments = pathname.split('/').filter(Boolean);
  let targetLocale = sourceLocale;
  if (segments.length && LOCALE_SET.has(segments[0].toLowerCase())) targetLocale = segments.shift().toLowerCase();
  const base = targetLocale ? path.join(ROOT, targetLocale, ...segments) : path.join(ROOT, ...segments);
  const candidates = [];
  if (!segments.length) candidates.push(targetLocale ? path.join(ROOT, targetLocale, 'index.mdx') : path.join(ROOT, 'index.mdx'));
  else candidates.push(`${base}.md`, `${base}.mdx`, path.join(base, 'index.md'), path.join(base, 'index.mdx'));
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function targetFileFor(sourceLocale, sourceFile, pathPart) {
  const pathname = resolveSiteUrl(pathPart, sourceRoute(sourceFile)).pathname;
  // Root-absolute Markdown links are localized by the rehype plugin; relative links are not.
  return fileFor(pathPart.startsWith('/') ? sourceLocale : '', pathname);
}

function walkMarkdown(dir, skipLocaleDirs = false) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipLocaleDirs && LOCALE_SET.has(entry.name)) continue;
      files.push(...walkMarkdown(full));
    } else if (/\.(md|mdx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const problems = [];
for (const locale of LOCALES) {
  const dir = locale ? path.join(ROOT, locale) : ROOT;
  if (!fs.existsSync(dir)) continue;
  const files = locale ? walkMarkdown(dir) : walkMarkdown(dir, true);
  for (const file of files) {
    const parsed = parseMarkdown(fs.readFileSync(file, 'utf8'));
    for (const link of parsed.links) {
      if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(link.href)) continue;
      const hashIndex = link.href.indexOf('#');
      if (hashIndex < 0) continue;
      let target;
      try { target = decodeURIComponent(link.href.slice(hashIndex + 1)); }
      catch { problems.push({ file, line: link.line, type: '锚点编码无效', href: link.href }); continue; }
      const pathPart = link.href.slice(0, hashIndex);
      let targetFile;
      try { targetFile = pathPart ? targetFileFor(locale, file, pathPart) : file; }
      catch { targetFile = null; }
      if (!targetFile) {
        problems.push({ file, line: link.line, type: '目标页面不存在', href: link.href });
        continue;
      }
      const targetSlugs = slugSet(parseMarkdown(fs.readFileSync(targetFile, 'utf8')).headings);
      if (target && !targetSlugs.has(target)) problems.push({ file, line: link.line, type: '锚点不存在', href: link.href });
    }
  }
}

if (!problems.length) {
  console.log('OK: 所有源码锚点均能命中');
  process.exit(0);
}
const byType = {};
for (const problem of problems) {
  byType[problem.type] = (byType[problem.type] || 0) + 1;
  console.log(`[${problem.type}] ${problem.file}:${problem.line} -> ${problem.href}`);
}
console.log('\n汇总:', JSON.stringify(byType));
process.exit(1);
