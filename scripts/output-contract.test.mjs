// 构建产物级契约：验证新组件与本地化资产真的进入了 dist，而不只是源码里存在。
// verify:static 在 build 之后运行，因此这些测试能捕获"源码对、产物错"的回归。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.join(process.cwd(), 'dist');
const built = fs.existsSync(path.join(dist, 'canvas/releases/index.html'));
const skip = built ? false : 'dist 不存在，请先运行 pnpm run build';
const read = (rel) => fs.readFileSync(path.join(dist, rel), 'utf8');
const locales = ['zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
const pageCount = fs.readdirSync(path.join(process.cwd(), 'src/content/docs/canvas'))
  .filter((name) => /\.mdx?$/.test(name)).length + 1;

test('built release pages reference their localized release workflow diagram', { skip }, () => {
  assert.match(read('canvas/releases/index.html'), /src="\/images\/canvas\/docs-release-flow\.svg"/);
  for (const locale of locales) {
    const html = read(`${locale}/canvas/releases/index.html`);
    assert.match(html, new RegExp(`src="/images/canvas/${locale}/docs-release-flow\\.svg"`), locale);
    assert.doesNotMatch(html, /src="\/images\/canvas\/docs-release-flow\.svg"/, locale);
  }
});

test('built article page renders a breadcrumb with a non-link group label', { skip }, () => {
  const html = read('en/canvas/releases/index.html');
  const breadcrumb = html.match(/<nav class="page-breadcrumb[^"]*"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(breadcrumb, 'breadcrumb nav must be present');
  assert.match(breadcrumb, /<a href="\/en\/"[^>]*>[\s\S]*?Home[\s\S]*?<\/a>/);
  assert.match(breadcrumb, /<span[^>]*class="page-breadcrumb-current[^"]*"[^>]*>[\s\S]*?Deployment &amp; Maintenance[\s\S]*?<\/span>/);
  assert.doesNotMatch(breadcrumb, /<a[^>]*href="\/en\/canvas\/cloudflare\/"/);
});

test('built footer exposes edit, issue and back-to-top actions', { skip }, () => {
  const html = read('en/canvas/releases/index.html');
  assert.match(html, /github\.com\/shijianus\/epocanvas-docs\/edit\/main\/src\/content\/docs\/en\/canvas\/releases\.md/);
  assert.match(html, /github\.com\/shijianus\/epocanvas-docs\/issues\/new/);
  assert.match(html, /class="back-to-top[^"]*"[^>]*href="#_top"/);
  assert.match(html, /data-report-issue/);
});

test('built 404 page localizes footer actions and rewrites the report URL from the requested page', { skip }, () => {
  const html = read('404.html');
  for (const key of ['page.feedback', 'page.reportIssue', 'page.backToTop']) {
    assert.ok(html.includes(`data-i18n="${key}"`), key);
  }
  assert.match(html, /data-report-issue/);
  assert.match(html, /id="_top"/);
  assert.match(html, /location\.href/);
  assert.match(html, /class="feedback-label[^"]*" data-i18n="page.feedback"/);
});

test('built search index covers every locale and content page', { skip }, () => {
  const manifest = JSON.parse(read('pagefind/pagefind-entry.json'));
  assert.equal(Object.keys(manifest.languages).length, locales.length + 1);
  for (const [language, data] of Object.entries(manifest.languages)) {
    assert.equal(data.page_count, pageCount, language);
  }
});

test('built sitemap covers every locale page and excludes the 404 route', { skip }, () => {
  const urls = [...read('sitemap-0.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, pageCount * (locales.length + 1));
  assert.ok(urls.every((url) => url.startsWith('https://docs.epocanvas.com/')));
  assert.ok(!urls.some((url) => /\/404(?:\.html)?\/?$/.test(url)));
  assert.ok(urls.includes('https://docs.epocanvas.com/canvas/releases/'));
  assert.ok(urls.includes('https://docs.epocanvas.com/en/canvas/releases/'));
});
