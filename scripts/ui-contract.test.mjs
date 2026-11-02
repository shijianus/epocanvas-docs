import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { localizedHref, SUPPORTED_LANGUAGES } from '../src/utils/i18n.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const header = read('src/components/starlight/Header.astro');
const search = read('src/components/starlight/Search.astro');
const mobile = read('src/components/starlight/MobileMenuToggle.astro');
const sidebar = read('src/components/starlight/Sidebar.astro');
const css = read('src/styles/custom.css');
const notFound = read('src/pages/404.astro');

// These are source/structure contracts, not a claim that a browser or screen reader ran.
test('mobile menu retains the PageFrame host/sibling visibility contract', () => {
  assert.match(read('astro.config.mjs'), /MobileMenuToggle:\s*'\.\/src\/components\/starlight\/MobileMenuToggle\.astro'/);
  assert.match(mobile, /<starlight-menu-button\b[^>]*aria-expanded="false"/);
  assert.match(mobile, /<button\b[^>]*type="button"[^>]*aria-expanded="false"[^>]*aria-controls="starlight__sidebar"/);
  const pageFrame = read('node_modules/@astrojs/starlight/components/PageFrame.astro');
  assert.match(pageFrame, /<MobileMenuToggle\s*\/>\s*<div id="starlight__sidebar"/);
  assert.match(pageFrame, /:global\(\[aria-expanded='true'\]\)\s*~\s*\.sidebar-pane/);
});

test('mobile menu state updates host, button and body together', () => {
  const body = mobile.match(/private setExpanded\(expanded: boolean\) \{([\s\S]*?)\n\t\t\}/)?.[1];
  assert.ok(body, 'setExpanded must expose one shared state update');
  const host = new Map();
  const button = new Map();
  const attributes = new Set();
  const inert = new Set();
  const document = {
    body: { toggleAttribute(name, on) { on ? attributes.add(name) : attributes.delete(name); } },
    querySelectorAll() { return [{ toggleAttribute(name, on) { on ? inert.add(name) : inert.delete(name); } }]; },
  };
  const context = vm.createContext({ document, host: {
    setAttribute(name, value) { host.set(name, value); },
    button: { setAttribute(name, value) { button.set(name, value); } },
  } });
  for (const expanded of [true, false, true, false]) {
    context.expanded = expanded;
    vm.runInContext(`(function (expanded) { ${body.replace(/<HTMLElement>/g, '')} }).call(host, expanded)`, context);
    assert.equal(host.get('aria-expanded'), String(expanded));
    assert.equal(button.get('aria-expanded'), String(expanded));
    assert.equal(attributes.has('data-mobile-menu-expanded'), expanded);
    assert.equal(inert.has('inert'), expanded);
  }
  assert.match(mobile, /querySelectorAll<HTMLElement>\('\.main-frame, \.skip-link'\)/);
  assert.match(mobile, /toggleAttribute\('inert', expanded\)/);
  assert.match(mobile, /event\.key === 'Escape'[\s\S]*?!event\.isComposing[\s\S]*?this\.setExpanded\(false\);\s*this\.button\.focus/);
});

test('search loading, failure and retry are separate from result observation', () => {
  assert.match(search, /id="epo-search-status"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  assert.match(search, /data-retry-search[^>]*hidden/);
  assert.match(search, /if \(initPromise\) return initPromise/);
  assert.match(search, /initState = 'loading';[\s\S]*?announce\('loading', copy\.loading\)/);
  assert.match(search, /catch \(error\)[\s\S]*?initState = 'error';[\s\S]*?announce\('error', copy\.error\);[\s\S]*?retryBtn\.hidden = false/);
  assert.match(search, /finally\(\(\) => \{ initPromise = null; \}\)/);
  assert.match(search, /retryBtn\.addEventListener\('click',[\s\S]*?await ensurePagefind\(\)/);
  assert.match(search, /new MutationObserver\(syncResults\)/);
  assert.match(search, /\.pagefind-ui__drawer:not\(\.pagefind-ui__hidden\)/);
  assert.match(search, /\.pagefind-ui__message/);
  assert.match(search, /!results \? 'searching' : results\.children\.length \? 'results' : 'zero'/);
  assert.doesNotMatch(search, /addEventListener\(['"](?:pagefind[-:]error|pagefind_error|pagefind[-:]results)/);
});

test('search initialization cannot focus after the dialog closes', () => {
  assert.match(search, /void ensurePagefind\(\)\.then\(\(\) => \{\s*if \(dialog\.open && initState === 'ready'\)/);
  assert.match(search, /retryBtn\.addEventListener\('click', async \(\) => \{\s*await ensurePagefind\(\);\s*if \(dialog\.open && initState === 'ready'\)/);
  assert.match(search, /autofocus: false/);
  assert.match(search, /dialog\.addEventListener\('close',[\s\S]*?target\.focus\(\{ preventScroll: true \}\)/);
  assert.match(search, /dialog\.addEventListener\('keydown',[\s\S]*?modalComposing \|\| isImeKey\(e\)/);
});

test('desktop and mobile themes share one preference and guarded storage', () => {
  assert.match(sidebar, /<select data-theme-select/);
  assert.doesNotMatch(sidebar, /import (?:ThemeSelect|MobileMenuFooter) /);
  assert.match(header, /querySelectorAll<HTMLSelectElement>\('\[data-theme-select\]'\)/);
  assert.equal((header.match(/const storageKey = 'starlight-theme'/g) || []).length, 1);
  assert.match(header, /try \{\s*return parseTheme\(localStorage\.getItem\(storageKey\)\);\s*\} catch/);
  assert.match(header, /try \{\s*localStorage\.setItem\(storageKey,[\s\S]*?\} catch/);
  assert.match(header, /systemTheme\.addEventListener\('change',[\s\S]*?preference === 'auto'/);
  assert.match(header, /window\.addEventListener\('storage'/);
  assert.match(header, /setAttribute\('aria-checked', String\(theme === 'dark'\)\)/);
  assert.match(header, /select\.value = preference/);
  const provider = read('src/components/starlight/ThemeProvider.astro');
  assert.match(provider, /try \{\s*storedTheme = localStorage\.getItem\('starlight-theme'\);\s*\} catch/);
});

test('404 alone synchronizes external/version labels and theme wrapper title', () => {
  for (const key of ['nav.releases', 'social.github', 'social.telegram']) {
    assert.ok(header.includes(`data-404-label="${key}"`), key);
  }
  assert.match(header, /data-404-title="theme.toggle"/);
  assert.match(notFound, /querySelectorAll\('\[data-404-label\]'\)/);
  assert.match(notFound, /element\.setAttribute\('aria-label', version \?/);
  assert.match(notFound, /querySelectorAll\('\[data-404-title\]'\)/);
  assert.match(notFound, /search\.dataset\.searchCopy = JSON\.stringify/);
});

test('static 404 path variants switch languages to locale homepages only', () => {
  const pattern = header.match(/const langMenuPath = (\/[^;]+?)\.test\(pathname\)/)?.[1];
  assert.ok(pattern, 'Header must derive the language menu path from a 404 matcher');
  const is404Path = vm.runInNewContext(pattern);
  for (const pathname of ['/404', '/404/', '/404.html']) {
    assert.equal(is404Path.test(pathname), true, `${pathname} must be recognized as the static 404 route`);
    const menuPath = is404Path.test(pathname) ? '/' : pathname;
    for (const { code } of SUPPORTED_LANGUAGES) {
      assert.equal(localizedHref(menuPath, code), localizedHref('/', code), `${pathname} -> ${code} homepage`);
    }
  }

  const articlePath = '/canvas/i18n/';
  assert.equal(is404Path.test(articlePath), false);
  for (const { code, dir } of SUPPORTED_LANGUAGES) {
    assert.equal(localizedHref(articlePath, code), `${dir ? `/${dir}` : ''}/canvas/i18n/`, `${code} article path remains mapped`);
  }
  assert.equal(localizedHref(articlePath, 'en'), '/en/canvas/i18n/');
});

test('short landscape menus scroll and reduced motion removes animations', () => {
  assert.match(header, /max-height: min\(280px, calc\(100dvh - var\(--sl-nav-height\) - 1rem\)\)/);
  assert.match(css, /\.sidebar-pane \{\s*max-height: calc\(100dvh - var\(--sl-nav-height\)\);\s*overscroll-behavior: contain/);
  assert.match(search, /@media \(max-height: 30rem\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?dialog::backdrop[\s\S]*?animation: none !important[\s\S]*?transition: none !important/);
});

test('all ten locales provide search initialization and retry messages', () => {
  const source = read('src/utils/i18n.ts');
  const literal = source.match(/export const UI_TRANSLATIONS: Record<string, Record<string, string>> = (\{[\s\S]*?\n\});/)?.[1];
  assert.ok(literal);
  const translations = vm.runInNewContext(`(${literal})`);
  assert.equal(Object.keys(translations).length, 10);
  for (const [lang, dictionary] of Object.entries(translations)) {
    for (const key of ['search.initLoading', 'search.initError', 'search.retry', 'search.devUnavailable']) {
      assert.ok(typeof dictionary[key] === 'string' && dictionary[key].trim(), `${lang}: ${key}`);
    }
  }
});

// Browser reproduction plan — intentionally not executed by this Node suite:
// 1. After a production build, preview /canvas/, /en/canvas/, / and /en/missing-page/.
// 2. At 667x375 and 375x667, expand the sidebar; inspect host/button aria-expanded,
//    scroll to theme/language controls, press Escape and confirm focus returns to its button.
// 3. Throttle the search UI chunk: open/close the dialog before it loads; focus must stay
//    outside. Block that chunk, confirm failure/retry, unblock and retry. Search an existing
//    word, a random absent word, then clear; inspect the polite live region and busy state.
// 4. Toggle desktop/mobile themes, select auto, change system theme, update a second tab,
//    and deny localStorage via DevTools; document theme and both controls must agree.
// 5. With reduced motion enabled, verify menu/modal/highlight effects are absent. On the
//    localized 404 verify GitHub, Telegram, version and theme title/accessible names.
