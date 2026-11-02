import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanMarkdown } from './markdown-utils.mjs';
import { checkReleaseNotes } from './verify-release.mjs';

// Content contracts only: no build, browser, network, deployment, or file writes.
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DOCS = path.join(ROOT, 'src/content/docs');
const read = (file) => readFileSync(file, 'utf8');
const locales = ['', ...readdirSync(DOCS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'canvas')
  .map((entry) => entry.name).sort()];
const page = (locale, name) => path.join(DOCS, locale, 'canvas', `${name}.md`);
const readmes = readdirSync(ROOT).filter((name) => /^README(?:\.[^.]+)?\.md$/.test(name));
function documents(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? documents(file) : /\.mdx?$/.test(entry.name) ? [file] : [];
  });
}
const contentFiles = documents(DOCS);
const prose = (text) => scanMarkdown(text).prose.replace(/`[^`\n]*`/g, '');

test('published prose does not use unsupported active aside types', () => {
  for (const file of contentFiles) {
    assert.doesNotMatch(scanMarkdown(read(file)).prose, /^\s*:::(?:warning|important)(?:\[|\s|$)/m, file);
  }
});

test('release-note examples satisfy the actual release heading validator', () => {
  for (const locale of locales) {
    const file = page(locale, 'releases');
    const text = read(file);
    const notes = text.match(/^```markdown\r?\n([\s\S]*?)^```[ \t]*$/m)?.[1];
    const json = text.match(/^```json\r?\n([\s\S]*?)^```[ \t]*$/m)?.[1];
    assert.ok(notes && json, `${file}: release notes and package examples must exist`);
    const { version } = JSON.parse(json);
    assert.doesNotThrow(() => checkReleaseNotes(notes, version), file);
    assert.ok(text.includes('verify:config'), `${file}: explain the heading check`);
    assert.ok(text.includes('candidate') && text.includes('prerelease'), `${file}: explain prerelease identification`);
  }
  assert.throws(() => checkReleaseNotes('## [v1.2.1] - 2026-09-14', '1.2.1'), /RELEASE_NOTES/);
});

test('version bump examples do not create a tag before the documented manual tag step', () => {
  for (const locale of locales) {
    const file = page(locale, 'releases');
    const text = read(file);
    assert.ok(text.includes('`pnpm version patch --no-git-tag-version`'), file);
    assert.doesNotMatch(text, /`pnpm version patch`/, file);
  }
});

test('authoring instructions require complete translations and distinguish missing keys from stale values', () => {
  const required = [
    'src/content/docs/<locale>/canvas/user-guide.md', '9', 'translations',
    'pnpm run verify', 'pnpm run preview', '`main`', 'origin/main', 'HEAD',
    'pnpm exec wrangler login', 'pnpm run deploy', '/canvas/cloudflare/',
  ];
  for (const locale of locales) {
    const file = page(locale, 'recipes');
    const firstRecipe = read(file).split(/^## /m)[1];
    assert.ok(firstRecipe, file);
    for (const value of required) assert.ok(firstRecipe.includes(value), `${file}: missing ${value}`);
    assert.ok(firstRecipe.indexOf('pnpm run verify') < firstRecipe.indexOf('pnpm run deploy'), file);
    const recipeText = read(file);
    assert.ok(recipeText.includes('`getTranslation`'), file);
    assert.match(recipeText, /旧值|舊值|old value|古い値|이전 값|valor anterior|ancienne valeur|alten Wert|старое значение|valor antigo/, file);
  }
  for (const file of [...locales.map((locale) => page(locale, 'markdown')), ...readmes.map((name) => path.join(ROOT, name))]) {
    const instruction = read(file).split(/\r?\n/).find((line) => line.includes('translations') && line.includes('src/content/docs/<locale>/'));
    assert.ok(instruction, `${file}: complete-translation instruction`);
    for (const value of ['9', '10', 'public/images/canvas/<locale>/', 'pnpm run verify', 'CI']) {
      assert.ok(instruction.includes(value), `${file}: missing ${value}`);
    }
  }
});

test('domain examples keep site and x-default on SITE_ORIGIN and mention robots.txt', () => {
  const config = read(path.join(ROOT, 'astro.config.mjs'));
  const origin = config.match(/const SITE_ORIGIN = '([^']+)'/)?.[1];
  assert.ok(origin, 'the current configuration must expose its shared origin');
  for (const locale of locales) {
    const file = page(locale, 'configuration');
    const text = read(file);
    assert.ok(text.includes(`const SITE_ORIGIN = '${origin}';`), file);
    assert.match(text, /\bsite: SITE_ORIGIN,/, file);
    assert.ok(text.includes('hreflangXDefault()') && text.includes('public/robots.txt'), file);
  }
});

test('customization instructions identify the header and restrict logo replacement to SVG', () => {
  for (const locale of locales) {
    const file = page(locale, 'configuration');
    const text = read(file);
    const beforeSocial = text.slice(0, text.indexOf('      social: ['));
    assert.ok(beforeSocial.includes('src/components/starlight/Header.astro'), file);
    assert.ok(beforeSocial.includes('GitHub/Telegram'), file);
    const logo = text.split(/^## 4\./m)[1];
    assert.ok(logo, file);
    assert.ok(logo.includes('public/images/logo.svg') && logo.includes('src/assets/logo.svg'), file);
    assert.match(logo, /仅适用于 SVG|僅適用於 SVG|only to SVG|SVG 専用|SVG 전용|solo para SVG|uniquement SVG|nur für SVG|только для SVG|apenas a SVG/, file);
    assert.doesNotMatch(logo, /`\.png`/, `${file}: do not recommend a PNG renamed as SVG`);
  }
});

test('FAQ gives a working port option and diagnostic SSL steps without blanket verification claims', () => {
  // Resolve Astro's actual dependency through pnpm's real package directory.
  const requireAstro = createRequire(realpathSync(path.join(ROOT, 'node_modules/astro/package.json')));
  const parse = requireAstro('yargs-parser');
  for (const locale of locales) {
    const file = page(locale, 'troubleshooting');
    const text = read(file);
    const command = text.match(/^\s*(pnpm run dev[^\r\n]*4322)[ \t]*$/m)?.[1];
    const intro = scanMarkdown(text).prose.split(/^## /m)[0];
    assert.doesNotMatch(intro, /验证过|驗證過|verified fix|動作確認済み|검증된 해결|solución verificada|solution vérifiée|erprobte Lösung|проверенное решение|solução verificada/, file);
    const ssl = text.split(/^### Q11.*$/m)[1]?.split(/^### Q12/m)[0];
    assert.ok(ssl, file);
    for (const value of ['Custom domains', 'DNS', 'pages.dev', '/canvas/cloudflare/']) assert.ok(ssl.includes(value), file);
    assert.doesNotMatch(ssl, /Universal[ -]SSL|2[~–〜-]5/, file);
    assert.ok(command, file);
    const args = command.trim().split(/\s+/).slice(3);
    assert.equal(parse(['node', 'astro', 'dev', ...args]).port, 4322, file);
  }
  assert.equal(parse(['node', 'astro', 'dev', '--', '--port', '4322']).port, undefined);
});

test('all README homepage screenshots are marked as historical rather than candidate acceptance evidence', () => {
  for (const name of readmes) {
    const text = read(path.join(ROOT, name));
    const caption = text.split('./public/images/canvas/ui-home-landing.png)')[1]?.trimStart().split(/\r?\n\r?\n/)[0];
    assert.ok(caption, name);
    assert.match(caption, /historical|历史|歷史|過去|이전 UI|histórico|historique|Historisches|Исторический/i, name);
    assert.ok(caption.includes('v1.2.0') && caption.includes('Astro 5'), name);
    assert.match(caption, /acceptance|验收|驗收|受け入れ|인수|aceptación|acceptation|Abnahmetests|приёмочных|aceitação/i, name);
  }
});

test('diagram archive instructions name the actual generator input and current referring pages', () => {
  const guide = read(path.join(ROOT, 'diagram-sources/README.md'));
  const generator = read(path.join(ROOT, 'scripts/generate-diagram-locales.mjs'));
  assert.ok(guide.includes('public/images/canvas/docs-*.svg'));
  assert.match(generator, /path\.join\(['"]public\/images\/canvas['"]/);
  const rows = [...guide.matchAll(/^\| (docs-[^|]+\.svg) \| ([^|]+) \|$/gm)];
  assert.equal(rows.length, 6);
  for (const [, name, references] of rows) {
    const actual = readdirSync(path.join(DOCS, 'canvas')).filter((entry) => entry.endsWith('.md'))
      .filter((entry) => prose(read(path.join(DOCS, 'canvas', entry))).includes(`/images/canvas/${name}`))
      .map((entry) => path.basename(entry, '.md')).sort();
    assert.deepEqual(references.split(' / ').sort(), actual, name);
  }
});

test('edited page families retain translated structure and explain Git history boundaries', () => {
  for (const family of ['configuration', 'recipes', 'releases', 'troubleshooting', 'markdown', 'components']) {
    const signature = (text) => {
      const scan = scanMarkdown(text);
      assert.equal(scan.unclosedLine, 0, family);
      return { headings: [...scan.prose.matchAll(/^(#{2,4}) /gm)].map((match) => match[1]), blocks: scan.blocks };
    };
    const expected = signature(read(page('', family)));
    for (const locale of locales.slice(1)) assert.deepEqual(signature(read(page(locale, family))), expected, page(locale, family));
  }
  for (const locale of locales) {
    const file = page(locale, 'components');
    const section = read(file).split(/^### PageTitle.*$/m)[1]?.split(/^### Sidebar/m)[0];
    assert.ok(section, file);
    for (const value of ['lastUpdated: true', 'fetch-depth: 1', 'fetch-depth: 0', 'Git']) assert.ok(section.includes(value), file);
    assert.match(section, /截断|截斷|boundary commit|境界|경계|corta el historial|limite de l’historique|Grenz-Commits|граничного коммита|limite do histórico/, file);
    assert.doesNotMatch(section, /每次提交都会|每次提交都會|with every commit|コミットのたび|커밋할 때마다|con cada commit|à chaque commit|bei jedem Commit|при каждом коммите|a cada commit/, file);
  }
});

test('local Markdown image references and MDX hero files exist', () => {
  for (const file of [...contentFiles, ...readmes.map((name) => path.join(ROOT, name))]) {
    const text = read(file);
    for (const match of prose(text).matchAll(/!\[[^\]\r\n]*\]\(([^)\s]+)\)/g)) {
      const src = match[1];
      if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(src)) continue;
      const target = src.startsWith('/') ? path.join(ROOT, 'public', src) : path.resolve(path.dirname(file), src);
      assert.ok(existsSync(target), `${file}: ${src}`);
    }
    if (file.endsWith('.mdx')) {
      for (const match of text.matchAll(/^\s+file:\s*(\S+)/gm)) {
        assert.ok(existsSync(path.resolve(path.dirname(file), match[1])), `${file}: ${match[1]}`);
      }
    }
  }
});
