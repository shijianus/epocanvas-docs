import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8').replace(/\r\n/g, '\n');
const names = ['docs-architecture', 'docs-deploy-compare', 'docs-i18n-workflow', 'docs-layout-3tier', 'docs-render-pipeline', 'docs-search-flow'];
const locales = ['en', 'zh-tw', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
const dictionaries = Object.fromEntries(await Promise.all(locales.map(async (locale) => [
  locale, (await import(`./diagram-i18n/${locale}.mjs`)).default,
])));
const source = Object.fromEntries(names.map((name) => [name, read(`public/images/canvas/${name}.svg`)]));
const textNodes = (svg) => [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
  .map((match) => match[1].replace(/<[^>]+>/g, '').trim());
const hasChinese = (text) => /[\u4e00-\u9fff]/u.test(text);
const decodeXml = (text) => text.replace(/&(amp|lt|gt|quot|apos);/g, (_, entity) => ({
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
})[entity]);
const variants = (name) => [
  ['zh-CN', source[name]],
  ...locales.map((locale) => [locale, read(`public/images/canvas/${locale}/${name}.svg`)]),
];

test('Chinese diagram archives match the public sources', () => {
  for (const name of names) {
    assert.equal(read(`diagram-sources/zh-CN/${name}.svg`), source[name], name);
  }
});

test('all diagram translation keys are used and every generated text matches its dictionary', () => {
  const keys = [...new Set(Object.values(source).flatMap(textNodes).filter(hasChinese))].sort();
  for (const locale of locales) {
    const dict = dictionaries[locale];
    assert.deepEqual(Object.keys(dict).sort(), keys, `${locale}: missing or unused keys`);
    for (const name of names) {
      const originals = textNodes(source[name]);
      const actual = textNodes(read(`public/images/canvas/${locale}/${name}.svg`)).map(decodeXml);
      const expected = originals.map((text) => {
        if (!hasChinese(text)) return decodeXml(text);
        assert.equal(typeof dict[text], 'string', `${locale}/${name}: ${text}`);
        assert.ok(dict[text].trim(), `${locale}/${name}: empty translation`);
        return dict[text];
      });
      assert.deepEqual(actual, expected, `${locale}/${name}: stale or untranslated text`);
    }
  }
});

test('diagram versions follow package.json without obsolete dependency or badge versions', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const [locale, svg] of variants('docs-architecture')) {
    assert.ok(svg.includes(`Astro ${pkg.dependencies.astro}`), `${locale}: Astro version`);
    assert.ok(svg.includes(`Starlight ${pkg.dependencies['@astrojs/starlight']}`), `${locale}: Starlight version`);
  }
  for (const [locale, svg] of variants('docs-layout-3tier')) {
    const badges = [...svg.matchAll(/>v(\d+\.\d+\.\d+(?:-[\w.-]+)?) ↗<\/text>/g)].map((match) => match[1]);
    assert.deepEqual(badges, [pkg.version], `${locale}: package version badge`);
  }
  const obsolete = /Astro[ -]5\b|Starlight\s+0\.32\b|v1\.2\.0\b/;
  for (const name of names) {
    for (const [locale, svg] of variants(name)) assert.doesNotMatch(svg, obsolete, `${locale}/${name}`);
  }
  for (const locale of locales) assert.doesNotMatch(JSON.stringify(dictionaries[locale]), obsolete, locale);
});

test('deployment diagrams retain full verification, separate preview and project-type constraints', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const script of ['verify', 'deploy', 'verify:preview', 'deploy:preview']) {
    assert.equal(typeof pkg.scripts[script], 'string', `missing documented script: ${script}`);
  }
  const projectTypeKey = 'Direct Upload 改用 Git 集成需另建项目；Wrangler 发布仍须检查，图示不代表已部署。';
  for (const [locale, svg] of variants('docs-deploy-compare')) {
    const texts = textNodes(svg).map(decodeXml);
    for (const command of ['pnpm run verify', 'pnpm install --frozen-lockfile', 'pnpm run deploy:preview', 'pnpm run verify:preview']) {
      assert.ok(texts.some((text) => text.includes(command)), `${locale}: ${command}`);
    }
    assert.doesNotMatch(svg, /pnpm run build\b/, `${locale}: obsolete cloud build command`);
    assert.ok(texts.includes(locale === 'zh-CN' ? projectTypeKey : dictionaries[locale][projectTypeKey]), `${locale}: project-type constraint`);
  }
  assert.doesNotMatch(source['docs-architecture'] + source['docs-layout-3tier'] + source['docs-render-pipeline'], /7 个(?:原生|定制)?组件|共 7 个/);
});
