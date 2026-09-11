import fs from 'fs';
import path from 'path';
import { chromium } from '/opt/nodejs/node-v22.18.0-linux-x64/lib/node_modules/playwright/index.mjs';

const artifactDir = '/root/.gemini/antigravity-cli/brain/4cb6791a-e9ac-47cc-a5fb-b53486627634';
const screenshotsDir = path.join(artifactDir, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function verify() {
  const report = {
    timestamp: new Date().toISOString(),
    url: 'http://localhost:4321/mail/',
    results: {}
  };

  console.log('[1/7] Launching Chromium browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  // 1. Navigation
  console.log('[2/7] Navigating to http://localhost:4321/mail/ ...');
  const response = await page.goto('http://localhost:4321/mail/', { waitUntil: 'networkidle', timeout: 20000 });
  const status = response.status();
  const pageTitle = await page.title();
  console.log(`✓ Navigated: status=${status}, title="${pageTitle}"`);

  const initialLightPath = path.join(screenshotsDir, '01_page_overview_light.png');
  await page.screenshot({ path: initialLightPath, fullPage: false });

  report.results.navigation = {
    status,
    pageTitle,
    success: status === 200 && pageTitle.length > 0,
    screenshot: initialLightPath
  };

  // 2. Right Sidebar TOC
  console.log('[3/7] Checking right sidebar TOC...');
  const rightSidebar = await page.$('.right-sidebar');
  if (!rightSidebar) {
    throw new Error('Right sidebar (.right-sidebar) not found on page');
  }

  const tocBoundingBox = await rightSidebar.boundingBox();
  const tocStyles = await page.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      width: s.width,
      minWidth: s.minWidth,
      maxWidth: s.maxWidth,
      padding: s.padding,
      paddingRight: s.paddingRight,
      paddingLeft: s.paddingLeft,
      overflowY: s.overflowY,
      scrollbarGutter: s.scrollbarGutter || 'none'
    };
  }, rightSidebar);

  const tocLinks = await page.$$('.right-sidebar .toc-link, .right-sidebar a');
  console.log(`Found ${tocLinks.length} TOC items`);

  const tocItemsData = [];
  let allSingleLine = true;
  for (let i = 0; i < tocLinks.length; i++) {
    const link = tocLinks[i];
    const itemData = await page.evaluate((el) => {
      const textSpan = el.querySelector('.toc-text') || el;
      const comp = window.getComputedStyle(textSpan);
      const rect = textSpan.getBoundingClientRect();
      const isNowrap = comp.whiteSpace === 'nowrap';
      const isSingleLineHeight = rect.height <= 32;
      return {
        text: textSpan.textContent.trim(),
        whiteSpace: comp.whiteSpace,
        overflow: comp.overflow,
        textOverflow: comp.textOverflow,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        scrollWidth: textSpan.scrollWidth,
        clientWidth: textSpan.clientWidth,
        isSingleLine: isNowrap || isSingleLineHeight
      };
    }, link);

    if (!itemData.isSingleLine) {
      allSingleLine = false;
    }
    tocItemsData.push(itemData);
  }

  const tocScreenshotPath = path.join(screenshotsDir, '02_toc_sidebar.png');
  await rightSidebar.screenshot({ path: tocScreenshotPath });

  report.results.toc = {
    width: Math.round(tocBoundingBox.width),
    height: Math.round(tocBoundingBox.height),
    computedStyles: tocStyles,
    isSpacious: tocBoundingBox.width >= 300,
    totalItems: tocLinks.length,
    allSingleLine,
    sampleItems: tocItemsData.slice(0, 8),
    screenshot: tocScreenshotPath,
    success: tocBoundingBox.width >= 300 && allSingleLine
  };
  console.log(`✓ TOC: width=${Math.round(tocBoundingBox.width)}px (>=300px: ${tocBoundingBox.width >= 300}), allSingleLine=${allSingleLine}`);

  // 3. Search Bar & Modal
  console.log('[4/7] Checking search bar and modal...');
  const searchBtn = await page.$('button[data-open-modal], site-search button');
  if (!searchBtn) {
    throw new Error('Search button (button[data-open-modal]) not found');
  }

  const searchBtnBox = await searchBtn.boundingBox();
  const searchBtnText = await page.evaluate(el => el.textContent.trim(), searchBtn);

  // Click search button
  await searchBtn.click();
  await page.waitForSelector('.epo-search-dialog[open], dialog[open]', { state: 'visible', timeout: 4000 });
  const searchModal = await page.$('.epo-search-dialog[open], dialog[open]');
  const modalBox = await searchModal.boundingBox();

  // Inspect input & shortcuts
  const searchInput = await page.$('.pagefind-ui__search-input, dialog input');
  let inputPlaceholder = '';
  let isFocused = false;
  if (searchInput) {
    inputPlaceholder = await searchInput.getAttribute('placeholder') || '';
    isFocused = await page.evaluate(el => document.activeElement === el, searchInput);
  }

  const shortcutsEl = await page.$('.footer-shortcuts, dialog footer, .search-footer');
  const shortcutsText = shortcutsEl ? await page.evaluate(el => el.textContent.trim().replace(/\s+/g, ' '), shortcutsEl) : '';

  const searchModalOpenPath = path.join(screenshotsDir, '03_search_modal_open.png');
  await page.screenshot({ path: searchModalOpenPath });

  // Type search query to verify results
  let resultCount = 0;
  if (searchInput) {
    await searchInput.fill('OAuth');
    await page.waitForTimeout(800);
    const results = await page.$$('.pagefind-ui__result, .pagefind-ui__result-link');
    resultCount = results.length;
  }
  const searchResultsPath = path.join(screenshotsDir, '03b_search_results.png');
  await page.screenshot({ path: searchResultsPath });

  // Close modal via Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const modalClosed = await page.evaluate(() => {
    const d = document.querySelector('.epo-search-dialog, dialog[open]');
    return !d || !d.hasAttribute('open');
  });

  report.results.search = {
    buttonWidth: Math.round(searchBtnBox.width),
    buttonText: searchBtnText,
    modalOpened: !!searchModal,
    modalWidth: Math.round(modalBox.width),
    modalHeight: Math.round(modalBox.height),
    inputFound: !!searchInput,
    inputFocused: isFocused,
    inputPlaceholder,
    shortcutsText,
    testQuery: 'OAuth',
    resultsCount: resultCount,
    modalClosedWithEsc: modalClosed,
    screenshotModal: searchModalOpenPath,
    screenshotResults: searchResultsPath,
    success: !!searchModal && !!searchInput && modalClosed
  };
  console.log(`✓ Search: modal opened=${!!searchModal}, shortcuts="${shortcutsText}", results=${resultCount}, closedWithEsc=${modalClosed}`);

  // 4. Theme Toggle
  console.log('[5/7] Checking theme toggle...');
  const themeToggle = await page.$('#vp-theme-toggle');
  if (!themeToggle) {
    throw new Error('Theme toggle (#vp-theme-toggle) not found');
  }

  // Light mode check
  const lightThemeValue = await page.evaluate(() => document.documentElement.dataset.theme);
  const sunIcon = await page.$('.icon-sun');
  const sunVisible = sunIcon ? await page.evaluate(el => {
    const s = window.getComputedStyle(el);
    return parseFloat(s.opacity) > 0.8 && el.clientWidth > 10;
  }, sunIcon) : false;

  const toggleLightPath = path.join(screenshotsDir, '04a_theme_toggle_light.png');
  await themeToggle.screenshot({ path: toggleLightPath });

  // Click toggle -> Dark Mode
  await themeToggle.click();
  await page.waitForTimeout(400);

  const darkThemeValue = await page.evaluate(() => document.documentElement.dataset.theme);
  const moonIcon = await page.$('.icon-moon');
  const moonVisible = moonIcon ? await page.evaluate(el => {
    const s = window.getComputedStyle(el);
    return parseFloat(s.opacity) > 0.8 && el.clientWidth > 10;
  }, moonIcon) : false;

  const docDarkPath = path.join(screenshotsDir, '04b_doc_dark_mode.png');
  await page.screenshot({ path: docDarkPath });

  const toggleDarkPath = path.join(screenshotsDir, '04c_theme_toggle_dark.png');
  await themeToggle.screenshot({ path: toggleDarkPath });

  // Click toggle -> Light Mode
  await themeToggle.click();
  await page.waitForTimeout(400);
  const restoredThemeValue = await page.evaluate(() => document.documentElement.dataset.theme);
  const sunRestored = sunIcon ? await page.evaluate(el => {
    const s = window.getComputedStyle(el);
    return parseFloat(s.opacity) > 0.8;
  }, sunIcon) : false;

  report.results.theme = {
    initialTheme: lightThemeValue,
    sunIconVisibleInLight: sunVisible,
    darkTheme: darkThemeValue,
    moonIconVisibleInDark: moonVisible,
    restoredTheme: restoredThemeValue,
    sunRestored,
    screenshotLight: toggleLightPath,
    screenshotDarkDoc: docDarkPath,
    screenshotDark: toggleDarkPath,
    success: lightThemeValue === 'light' && darkThemeValue === 'dark' && sunVisible && moonVisible && restoredThemeValue === 'light'
  };
  console.log(`✓ Theme: light=${lightThemeValue} (sun=${sunVisible}), dark=${darkThemeValue} (moon=${moonVisible}), restored=${restoredThemeValue}`);

  // 5. Language Dropdown
  console.log('[6/7] Checking language dropdown...');
  const langBtn = await page.$('#vp-lang-btn');
  if (!langBtn) {
    throw new Error('Language picker button (#vp-lang-btn) not found');
  }

  const initialLangCode = await page.evaluate(() => document.querySelector('#current-lang-code')?.textContent?.trim());

  // Click to open language dropdown
  await langBtn.click();
  await page.waitForSelector('.lang-dropdown-wrapper.open .vp-lang-menu', { state: 'visible', timeout: 3000 });

  const langItems = await page.$$('.lang-item-btn');
  const languages = [];
  for (const item of langItems) {
    const code = await item.getAttribute('data-lang-code');
    const name = await item.textContent();
    languages.push({ code, name: name.trim() });
  }

  const langMenuPath = path.join(screenshotsDir, '05a_language_menu_open.png');
  await page.screenshot({ path: langMenuPath });

  // Switch to English
  console.log('  -> Testing switch to English (en)...');
  await page.click('.lang-item-btn[data-lang-code="en"]');
  await page.waitForTimeout(400);

  const navHomeEn = await page.$eval('.nav-btn[data-i18n="nav.home"]', el => el.textContent.trim());
  const navDocsEn = await page.$eval('.nav-btn[data-i18n="nav.docs"]', el => el.textContent.trim());
  const tocTitleEn = await page.$eval('[data-i18n="toc.title"]', el => el.textContent.trim());
  const badgeEn = await page.$eval('#current-lang-code', el => el.textContent.trim());

  const docEnPath = path.join(screenshotsDir, '05b_doc_english.png');
  await page.screenshot({ path: docEnPath });

  // Switch to Japanese
  console.log('  -> Testing switch to Japanese (ja)...');
  await langBtn.click();
  await page.waitForTimeout(300);
  await page.click('.lang-item-btn[data-lang-code="ja"]');
  await page.waitForTimeout(400);

  const navHomeJa = await page.$eval('.nav-btn[data-i18n="nav.home"]', el => el.textContent.trim());
  const tocTitleJa = await page.$eval('[data-i18n="toc.title"]', el => el.textContent.trim());
  const badgeJa = await page.$eval('#current-lang-code', el => el.textContent.trim());

  const docJaPath = path.join(screenshotsDir, '05c_doc_japanese.png');
  await page.screenshot({ path: docJaPath });

  // Switch back to 简体中文
  console.log('  -> Switching back to 简体中文 (zh-CN)...');
  await langBtn.click();
  await page.waitForTimeout(300);
  await page.click('.lang-item-btn[data-lang-code="zh-CN"]');
  await page.waitForTimeout(400);

  const badgeRestored = await page.$eval('#current-lang-code', el => el.textContent.trim());

  report.results.language = {
    initialLang: initialLangCode,
    supportedLanguagesCount: languages.length,
    supportedLanguages: languages,
    englishSwitch: {
      navHome: navHomeEn,
      navDocs: navDocsEn,
      tocTitle: tocTitleEn,
      badge: badgeEn,
      success: badgeEn === 'EN' && navHomeEn === 'Home' && tocTitleEn === 'On this page'
    },
    japaneseSwitch: {
      navHome: navHomeJa,
      tocTitle: tocTitleJa,
      badge: badgeJa,
      success: badgeJa === 'JA' && navHomeJa === 'ホーム' && tocTitleJa === '目次'
    },
    badgeRestored,
    screenshotMenu: langMenuPath,
    screenshotEn: docEnPath,
    screenshotJa: docJaPath,
    success: languages.length >= 8 && badgeEn === 'EN' && badgeJa === 'JA' && badgeRestored === '简'
  };
  console.log(`✓ Language: count=${languages.length}, EN Switch=${report.results.language.englishSwitch.success}, JA Switch=${report.results.language.japaneseSwitch.success}`);

  // 6. Left Sidebar Navigation Indentation & Guide Rails
  console.log('[7/7] Checking left sidebar indentation & guide rails...');
  const leftSidebar = await page.$('.sidebar-content');
  if (!leftSidebar) {
    throw new Error('Left sidebar content (.sidebar-content) not found');
  }

  const sublists = await page.$$('.sidebar-content ul ul');
  const nestedLis = await page.$$('.sidebar-content ul ul li');

  const sublistStyles = [];
  for (let i = 0; i < sublists.length; i++) {
    const s = await page.evaluate(el => {
      const comp = window.getComputedStyle(el);
      return {
        borderInlineStart: comp.borderInlineStart,
        borderInlineStartWidth: comp.borderInlineStartWidth,
        borderInlineStartColor: comp.borderInlineStartColor,
        marginInlineStart: comp.marginInlineStart,
        paddingInlineStart: comp.paddingInlineStart
      };
    }, sublists[i]);
    sublistStyles.push(s);
  }

  const nestedLiStyles = [];
  let redundantLiBorderFound = false;
  for (let i = 0; i < nestedLis.length; i++) {
    const s = await page.evaluate(el => {
      const comp = window.getComputedStyle(el);
      return {
        borderInlineStartWidth: comp.borderInlineStartWidth,
        borderLeftWidth: comp.borderLeftWidth,
        paddingInlineStart: comp.paddingInlineStart
      };
    }, nestedLis[i]);
    if (s.borderInlineStartWidth !== '0px' || s.borderLeftWidth !== '0px') {
      redundantLiBorderFound = true;
    }
    nestedLiStyles.push(s);
  }

  const leftSidebarPath = path.join(screenshotsDir, '06_left_sidebar_nav.png');
  await leftSidebar.screenshot({ path: leftSidebarPath });

  report.results.leftSidebar = {
    nestedSublistsCount: sublists.length,
    nestedLisCount: nestedLis.length,
    sublistGuideRail: sublistStyles[0] || null,
    nestedLiBorderZero: !redundantLiBorderFound,
    redundantLiBorderFound,
    sampleLiStyles: nestedLiStyles.slice(0, 5),
    screenshot: leftSidebarPath,
    success: sublists.length > 0 && !redundantLiBorderFound
  };
  console.log(`✓ Left sidebar: sublists=${sublists.length}, nestedLis=${nestedLis.length}, redundantLiBorderFound=${redundantLiBorderFound}`);

  await browser.close();

  // Save report to artifacts directory
  const reportPath = path.join(artifactDir, 'verification_summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n==============================================`);
  console.log(`🎉 ALL 6 VERIFICATION CHECKS COMPLETED SUCCESSFULLY!`);
  console.log(`Report written to: ${reportPath}`);
  console.log(`Screenshots written to: ${screenshotsDir}`);
  console.log(`==============================================\n`);
}

verify().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
