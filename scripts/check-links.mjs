// Check the HTML that is actually deployed, including language clusters and URL fragments.
import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, decodeFragment, resolveSiteUrl } from './link-utils.mjs';

const dist = path.join(process.cwd(), 'dist');
const LANG_DIRS = new Map([
  ['zh-CN', ''], ['zh-TW', 'zh-tw'], ['en', 'en'], ['ja', 'ja'], ['ko', 'ko'],
  ['es', 'es'], ['fr', 'fr'], ['de', 'de'], ['ru', 'ru'], ['pt', 'pt'],
]);
const EXPECTED = [...LANG_DIRS.keys(), 'x-default'];
if (!fs.existsSync(dist)) {
  console.error('[check-links] 未找到 dist/，请先运行 pnpm run build');
  process.exit(1);
}

function decodeEntities(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#(\d+)|#x([\da-f]+));/gi, (match, decimal, hex) => {
    if (decimal || hex) {
      const code = parseInt(decimal || hex, decimal ? 10 : 16);
      return code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }[match.toLowerCase()] ?? match;
  });
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map((m) => [m[1].toLowerCase(), decodeEntities(m[2] ?? m[3])]));
}
function tags(html, names) {
  return [...html.matchAll(new RegExp(`<(?:${names})\\b[^>]*>`, 'gi'))].map((m) => attributes(m[0]));
}
function routePath(rel) {
  return '/' + rel.replace(/index\.html$/, '');
}
function routeFile(pathname) {
  const decoded = decodeFragment(pathname);
  if (decoded === null || decoded.includes('\0') || decoded.includes('\\')) return null;
  const base = decoded.replace(/^\/+/, '').replace(/\/$/, '');
  const candidates = base ? [`${base}/index.html`, `${base}.html`, base] : ['index.html'];
  for (const candidate of candidates) {
    const absolute = path.resolve(dist, candidate);
    if (!absolute.startsWith(dist + path.sep)) continue;
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) return candidate;
  }
  return null;
}
function localeInfo(route) {
  const segments = route.split('/').filter(Boolean);
  const locale = [...LANG_DIRS].find(([, dir]) => dir && dir === segments[0]);
  if (locale) segments.shift();
  return { lang: locale?.[0] ?? 'zh-CN', base: segments.length ? '/' + segments.join('/') + '/' : '/' };
}
function languagePath(base, lang) {
  const dir = LANG_DIRS.get(lang);
  return dir ? `/${dir}${base}` : base;
}

const pages = new Map();
function walk(dir, rel = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(path.join(dir, entry.name), child);
    else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(path.join(dir, entry.name), 'utf8');
      const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? html;
      const links = tags(head, 'link');
      const meta = tags(head, 'meta');
      pages.set(child, {
        html, route: routePath(child),
        ids: new Set([...html.matchAll(/\sid=(?:"([^"]+)"|'([^']+)')/g)].map((m) => decodeEntities(m[1] ?? m[2]))),
        lang: tags(html, 'html')[0]?.lang,
        canonical: links.filter((l) => l.rel === 'canonical'),
        alternates: links.filter((l) => l.rel === 'alternate' && l.hreflang),
        noindex: meta.some((m) => m.name?.toLowerCase() === 'robots' && /\bnoindex\b/i.test(m.content ?? '')),
        redirect: meta.some((m) => m['http-equiv']?.toLowerCase() === 'refresh'),
      });
    }
  }
}
walk(dist);

const issues = [];
let internalLinks = 0;
let externalLinks = 0;
let contentPages = 0;
let redirects = 0;
for (const [rel, page] of pages) {
  for (const { href } of tags(page.html, 'a')) {
    if (href === undefined) continue;
    let url;
    try { url = resolveSiteUrl(href, page.route); }
    catch { issues.push(`${page.route}: 无效链接 ${href}`); continue; }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== SITE_ORIGIN) { externalLinks++; continue; }
    internalLinks++;
    const targetRel = routeFile(url.pathname);
    if (!targetRel) { issues.push(`${page.route}: 链接目标不存在 ${href}`); continue; }
    const hash = decodeFragment(url.hash.slice(1));
    if (hash === null) issues.push(`${page.route}: 锚点编码无效 ${href}`);
    else if (hash && !pages.get(targetRel)?.ids.has(hash)) issues.push(`${page.route}: 锚点不存在 ${href}`);
  }
  for (const asset of tags(page.html, 'img|script|link')) {
    const value = asset.src ?? asset.href;
    if (!value) continue;
    let url;
    try { url = resolveSiteUrl(value, page.route); }
    catch { issues.push(`${page.route}: 资源 URL 无效 ${value}`); continue; }
    if (url.origin === SITE_ORIGIN && !routeFile(url.pathname)) issues.push(`${page.route}: 资源不存在 ${value}`);
  }

  if (rel === '404.html') {
    if (!page.noindex) issues.push('/404.html: 缺少 robots=noindex');
    if (page.canonical.length) issues.push('/404.html: 错误页不应带 canonical');
    if (page.alternates.length) issues.push('/404.html: 错误页不应带 hreflang');
    continue;
  }
  if (page.redirect) { redirects++; continue; }
  if (page.noindex) continue;
  contentPages++;
  if (page.canonical.length !== 1 || page.canonical[0]?.href !== SITE_ORIGIN + page.route) {
    issues.push(`${page.route}: canonical 必须唯一且自指`);
  }
  const info = localeInfo(page.route);
  if (page.lang?.toLowerCase() !== info.lang.toLowerCase()) issues.push(`${page.route}: html lang 应为 ${info.lang}`);
  const seen = new Set();
  for (const alternate of page.alternates) {
    if (seen.has(alternate.hreflang)) issues.push(`${page.route}: 重复 hreflang ${alternate.hreflang}`);
    seen.add(alternate.hreflang);
    if (!EXPECTED.includes(alternate.hreflang)) issues.push(`${page.route}: 多余 hreflang ${alternate.hreflang}`);
  }
  for (const lang of EXPECTED) {
    const expectedPath = languagePath(info.base, lang);
    const alternate = page.alternates.find((a) => a.hreflang === lang);
    if (alternate?.href !== SITE_ORIGIN + expectedPath) issues.push(`${page.route}: hreflang ${lang} 应指向 ${expectedPath}`);
    const target = pages.get(routeFile(expectedPath));
    if (!target) { issues.push(`${page.route}: 缺少语言页面 ${expectedPath}`); continue; }
    const reverse = target.alternates.filter((a) => a.hreflang === info.lang);
    if (reverse.length !== 1 || reverse[0].href !== SITE_ORIGIN + page.route) {
      issues.push(`${page.route}: ${expectedPath} 缺少正确的反向 hreflang ${info.lang}`);
    }
  }
}
console.log(`[check-links] 扫描 ${pages.size} 个 HTML（内容页 ${contentPages}、跳转桩 ${redirects}）`);
console.log(`              内链 ${internalLinks} 条、外链 ${externalLinks} 条`);
if (issues.length) {
  const unique = [...new Set(issues)];
  unique.slice(0, 30).forEach((issue) => console.error(`  ${issue}`));
  console.error(`[check-links] FAILED: ${unique.length} 类问题`);
  process.exit(1);
}
console.log('[check-links] OK：内链、锚点、资源、canonical、hreflang 和 404 声明通过');
