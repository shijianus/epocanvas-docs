import assert from 'node:assert/strict';
import fs from 'node:fs';

const [base, commit] = process.argv.slice(2);
if (!base || !/^[a-f\d]{40}$/.test(commit ?? '')) throw new Error('用法：node scripts/check-deployment.mjs <preview-url> <commit-sha>');
const origin = new URL(base);
if (origin.protocol !== 'https:' || !origin.hostname.endsWith('.epocanvas-docs.pages.dev')) throw new Error('此检查仅用于 epocanvas-docs 的 HTTPS 预览地址。');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const locales = ['', 'zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];

async function get(route) {
  const response = await fetch(new URL(route, origin), { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  return { response, text: await response.text() };
}
const info = await get('/build-info.json');
assert.equal(info.response.status, 200);
const metadata = JSON.parse(info.text);
assert.equal(metadata.commit, commit, '部署 SHA 与候选不一致');
assert.equal(metadata.version, pkg.version);
assert.equal(metadata.dirty, false);
console.log(`[check-deployment] ${origin.origin}: ${metadata.version}, ${metadata.commit}`);

for (const locale of locales) {
  const prefix = locale ? '/' + locale : '';
  const homepage = await get(prefix + '/');
  assert.equal(homepage.response.status, 200, `${prefix}/`);
  assert.match(homepage.response.headers.get('x-robots-tag') ?? '', /noindex/i, '预览必须禁止索引');
  assert.ok(homepage.text.includes(pkg.version), `${prefix}/ 版本徽标错误`);
  const docs = await get(prefix + '/canvas/search-engine/');
  assert.equal(docs.response.status, 200, `${prefix}/canvas/search-engine/`);
  const expectedLang = locale === 'zh-tw' ? 'zh-TW' : locale || 'zh-CN';
  assert.ok(docs.text.includes(`lang="${expectedLang}"`), `${prefix} html lang`);
  assert.equal((docs.text.match(/<h1\b/g) ?? []).length, 1, `${prefix} h1`);
  const canonical = `https://docs.epocanvas.com${prefix}/canvas/search-engine/`;
  assert.ok(docs.text.includes(`rel="canonical" href="${canonical}"`), `${prefix} canonical`);
  for (const suffix of ['', '/']) {
    const old = await get(prefix + '/canvas/dns-setup' + suffix);
    assert.equal(old.response.status, 301, `旧路由 ${prefix}/canvas/dns-setup${suffix}`);
    assert.equal(new URL(old.response.headers.get('location'), origin).pathname, prefix + '/canvas/layout/');
  }
  const missing = await get(prefix + '/__beta-verification-missing__/');
  assert.equal(missing.response.status, 404, `错误页面 ${prefix}`);
  assert.match(missing.text, /name="robots"[^>]*noindex/i);
  assert.equal((missing.text.match(/<h1\b/g) ?? []).length, 1, `404 h1 ${prefix}`);
  console.log(`  ${expectedLang}: 首页、文档、301、404、版本与预览 noindex 通过`);
}

const manifest = await get('/pagefind/pagefind-entry.json');
assert.equal(manifest.response.status, 200);
const languages = JSON.parse(manifest.text).languages;
assert.equal(Object.keys(languages).length, 10);
for (const [language, data] of Object.entries(languages)) assert.equal(data.page_count, 18, `Pagefind ${language}`);
const module = await get('/pagefind/pagefind.js');
assert.equal(module.response.status, 200);
assert.ok(!/^\s*<!doctype html/i.test(module.text), 'Pagefind 模块不能回退成 HTML');
for (const route of ['/robots.txt', '/sitemap-index.xml']) assert.equal((await get(route)).response.status, 200, route);
console.log('[check-deployment] OK：部署身份与公开 HTTP 检查通过；真实搜索交互另在浏览器验收。');
