import { chromium } from '/opt/nodejs/node-v22.18.0-linux-x64/lib/node_modules/playwright/index.mjs';

const PREVIEW_URL = 'http://localhost:4321/mail/';

async function verifyPreview() {
  console.log(`[Preview Check] Connecting to live Astro preview instance at ${PREVIEW_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const response = await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  console.log(`✓ HTTP Status: ${response.status()}`);

  const title = await page.title();
  console.log(`✓ Page Title: "${title}"`);

  // 1. Check Logo
  const logoImg = await page.$('.site-title img');
  const logoBox = await logoImg.boundingBox();
  console.log(`✓ Live Preview Logo Size: ${logoBox.width}px x ${logoBox.height}px`);

  // 2. Check Search Box
  const searchBtn = await page.$('.epo-search-btn');
  const searchBtnBox = await searchBtn.boundingBox();
  const searchLabel = await page.$eval('.search-btn-label:not(.md\\:sl-hidden)', el => ({
    text: el.textContent.trim(),
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    isTruncated: el.scrollWidth > el.clientWidth,
  }));
  console.log(`✓ Live Preview Search Button Box: width=${searchBtnBox.width}px, text="${searchLabel.text}", isTruncated=${searchLabel.isTruncated}`);

  // 3. Check Sidebar Scrollbar
  const sidebar = await page.evaluate(() => {
    const pane = document.querySelector('.sidebar-pane');
    return {
      clientHeight: pane.clientHeight,
      scrollHeight: pane.scrollHeight,
      hasScroll: pane.scrollHeight > pane.clientHeight,
    };
  });
  console.log(`✓ Live Preview Sidebar: clientHeight=${sidebar.clientHeight}px, scrollHeight=${sidebar.scrollHeight}px, hasScroll=${sidebar.hasScroll}`);

  await page.screenshot({ path: 'dist/screenshots/live-preview-1440x900.png' });
  console.log('✓ Captured live preview screenshot to dist/screenshots/live-preview-1440x900.png');

  await browser.close();
  console.log('✓ Live Preview verification completed successfully!');
}

verifyPreview().catch((err) => {
  console.error('Preview verification failed:', err);
  process.exit(1);
});
