import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scanMarkdown } from './markdown-utils.mjs';
import { releaseMetadata, supportedNodeVersion } from './verify-release.mjs';
import { resolveSiteUrl, decodeFragment } from './link-utils.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
function fixture(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epocanvas-quality-'));
  try { return run(dir); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
function put(dir, rel, content) {
  const dest = path.join(dir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}
function check(dir, name, expected) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', name)], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, expected, `${name}: ${result.stdout}\n${result.stderr}`);
}
const langs = new Map([['zh-CN', ''], ['zh-TW', 'zh-tw'], ...['en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'].map((l) => [l, l])]);
function writeSite(dir) {
  for (const [lang, prefix] of langs) {
    for (const slug of ['deployment', 'search-engine']) {
      const route = `${prefix ? '/' + prefix : ''}/canvas/${slug}/`;
      const alternates = [...langs, ['x-default', '']].map(([code, target]) => `<link rel="alternate" hreflang="${code}" href="https://docs.epocanvas.com${target ? '/' + target : ''}/canvas/${slug}/">`).join('');
      const html = `<html lang="${lang}"><head><link rel="canonical" href="https://docs.epocanvas.com${route}">${alternates}</head><body><h1 id="_top">Title</h1><h2 id="section">Section</h2><p>Content</p></body></html>`;
      put(dir, 'dist' + route + 'index.html', html);
    }
  }
  put(dir, 'dist/404.html', '<html lang="en"><head><meta name="robots" content="noindex"></head><body><h1 id="_top">404</h1><a href="#_top">Top</a></body></html>');
}
function addLink(dir, href) {
  const file = path.join(dir, 'dist/canvas/deployment/index.html');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('</body>', `<a href="${href}">Test</a></body>`));
}

test('Node boundary matches supported LTS lines', () => {
  for (const version of ['20.19.0', '22.0.0', '22.19.0', '22.20.0', '22.23.3', '23.0.0', '24.11.9', '25.0.0', '22.23.4-rc.1', 'invalid']) assert.equal(supportedNodeVersion(version), false, version);
  for (const version of ['22.23.4', '22.23.5', '22.24.0', '24.12.0', '24.14.0']) assert.equal(supportedNodeVersion(version), true, version);
});
test('release tags reject invalid SemVer and mismatched versions', () => {
  assert.equal(releaseMetadata('v1.3.2', '1.3.2').prerelease, false);
  assert.equal(releaseMetadata('v1.3.2-rc.1', '1.3.2-rc.1').prerelease, true);
  assert.equal(releaseMetadata('v1.3.2+build-test', '1.3.2+build-test').prerelease, false);
  for (const value of ['01.3.2', '1.3.2-01', '1.3.2";exit 0']) assert.throws(() => releaseMetadata('v' + value, value));
  assert.throws(() => releaseMetadata('v1.3.1', '1.3.2'));
});
test('relative URL and fragment parsing follows browser semantics', () => {
  assert.equal(resolveSiteUrl('../search-engine/?source=nav#section', '/canvas/deployment/').href, 'https://docs.epocanvas.com/canvas/search-engine/?source=nav#section');
  assert.equal(resolveSiteUrl('canvas/search-engine/', '/canvas/deployment/').pathname, '/canvas/deployment/canvas/search-engine/');
  assert.equal(resolveSiteUrl('?source=nav#section', '/en/canvas/deployment/').pathname, '/en/canvas/deployment/');
  assert.equal(decodeFragment('%ZZ'), null);
  assert.equal(decodeFragment('%E8%AF%AD%E8%A8%80'), '语言');
});
test('fence scanner handles marker lengths, characters, closing suffixes and open blocks', () => {
  assert.equal(scanMarkdown('````md\n```js\nexample\n```\n````\nprose').prose.trim(), 'prose');
  assert.equal(scanMarkdown('```js\n~~~\n中文').unclosedLine, 1);
  assert.match(scanMarkdown('```js\n~~~\n中文').prose, /中文/);
  assert.equal(scanMarkdown('~~~\ntext\n~~~not-a-close').unclosedLine, 1);
  assert.equal(scanMarkdown('~~~\ntext\n~~~~  ').unclosedLine, 0);
});
test('built link checker accepts relative, query and same-origin links', () => fixture((dir) => {
  writeSite(dir);
  for (const href of ['../search-engine/#section', '?source=nav#section', 'https://docs.epocanvas.com/canvas/search-engine/#section', '//docs.epocanvas.com/canvas/search-engine/#section']) addLink(dir, href);
  check(dir, 'check-links.mjs', 0);
}));

test('built link checker enforces localized Expressive Code labels for Chinese, English and German', () => fixture((dir) => {
  writeSite(dir);
  const locales = [
    { lang: 'zh-CN', prefix: '', labels: ['终端窗口', '复制到剪贴板', '复制成功！'] },
    { lang: 'en', prefix: '/en', labels: ['Terminal window', 'Copy to clipboard', 'Copied!'] },
    { lang: 'de', prefix: '/de', labels: ['Terminalfenster', 'In die Zwischenablage kopieren', 'Kopiert!'] },
  ];
  for (const { prefix, labels } of locales) {
    const file = path.join(dir, 'dist', prefix.slice(1), 'canvas/deployment/index.html');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('</body>', `<figure class="frame"><figcaption><span class="sr-only">${labels[0]}</span></figcaption><button title="${labels[1]}" data-copied="${labels[2]}">Copy</button></figure></body>`));
  }
  check(dir, 'check-links.mjs', 0);
  for (const { prefix, labels } of locales.slice(1)) {
    const file = path.join(dir, 'dist', prefix.slice(1), 'canvas/deployment/index.html');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(labels[0], locales[0].labels[0]));
    check(dir, 'check-links.mjs', 1);
  }
}));
for (const href of ['canvas/search-engine/', 'https://docs.epocanvas.com/missing/', '//docs.epocanvas.com/missing/', '../search-engine/#%ZZ', '../search-engine/#missing']) {
  test(`built link checker rejects ${href}`, () => fixture((dir) => {
    writeSite(dir);
    addLink(dir, href);
    check(dir, 'check-links.mjs', 1);
  }));
}
for (const mutation of ['canonical', 'alternate', 'duplicate', '404']) {
  test(`built checker rejects invalid ${mutation} declarations`, () => fixture((dir) => {
    writeSite(dir);
    const file = path.join(dir, mutation === '404' ? 'dist/404.html' : 'dist/en/canvas/deployment/index.html');
    let text = fs.readFileSync(file, 'utf8');
    if (mutation === 'canonical') text = text.replace('rel="canonical" href="https://docs.epocanvas.com/en/canvas/deployment/"', 'rel="canonical" href="https://docs.epocanvas.com/en/canvas/search-engine/"');
    if (mutation === 'alternate') text = text.replace('hreflang="ja" href="https://docs.epocanvas.com/ja/canvas/deployment/"', 'hreflang="ja" href="https://docs.epocanvas.com/de/canvas/deployment/"');
    if (mutation === 'duplicate') text = text.replace('</head>', '<link rel="alternate" hreflang="en" href="https://docs.epocanvas.com/en/canvas/deployment/"></head>');
    if (mutation === '404') text = text.replace('noindex', 'index');
    fs.writeFileSync(file, text);
    check(dir, 'check-links.mjs', 1);
  }));
}
test('source anchors resolve relative paths, localized roots and explicit other locales', () => fixture((dir) => {
  put(dir, 'src/content/docs/en/canvas/deployment.md', '## Intro\n[A](../search-engine/#query)\n[B](/canvas/#overview)\n[C](/ja/canvas/search-engine/#検索)\n[D](?source=nav#intro)\n');
  put(dir, 'src/content/docs/en/canvas/search-engine.md', '## Query\n');
  put(dir, 'src/content/docs/en/canvas/index.md', '## Overview\n');
  put(dir, 'src/content/docs/ja/canvas/search-engine.md', '## 検索\n');
  check(dir, 'check-anchors.mjs', 0);
  put(dir, 'src/content/docs/en/canvas/deployment.md', '## Intro\n[Bad](canvas/search-engine/#query)\n');
  check(dir, 'check-anchors.mjs', 1);
}));
