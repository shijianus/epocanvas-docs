import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '/opt/nodejs/node-v22.18.0-linux-x64/lib/node_modules/playwright/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const screenshotsDir = path.resolve(distDir, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
	fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Simple static server for dist
const mimeTypes = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
	let reqPath = req.url.split('?')[0];
	if (reqPath.endsWith('/')) reqPath += 'index.html';
	else if (!path.extname(reqPath)) reqPath += '/index.html';

	let filePath = path.join(distDir, reqPath);
	if (!fs.existsSync(filePath)) {
		filePath = path.join(distDir, '404.html');
	}

	const ext = path.extname(filePath).toLowerCase();
	const contentType = mimeTypes[ext] || 'application/octet-stream';

	fs.readFile(filePath, (err, content) => {
		if (err) {
			res.writeHead(500);
			res.end('Server Error: ' + err.code);
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf-8');
		}
	});
});

const PORT = 4399;

server.listen(PORT, async () => {
	console.log(`[Verify] Static preview server running at http://localhost:${PORT}`);
	let browser;
	try {
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext({
			viewport: { width: 1440, height: 900 },
			deviceScaleFactor: 2,
		});
		const page = await context.newPage();

		console.log('\n===========================================');
		console.log('1. Testing Page Navigation & Title');
		console.log('===========================================');
		await page.goto(`http://localhost:${PORT}/mail/`, { waitUntil: 'networkidle' });
		const pageTitle = await page.title();
		console.log(`✓ Page Title: "${pageTitle}"`);

		console.log('\n===========================================');
		console.log('2. Verification of Requirement 1: Logo Enlargement & Crispness');
		console.log('===========================================');
		const logoImg = await page.$('.site-title img');
		if (!logoImg) throw new Error('Site logo image not found');
		const logoBox = await logoImg.boundingBox();
		const logoSrc = await logoImg.getAttribute('src');
		const logoStyles = await page.$eval('.site-title img', el => {
			const s = window.getComputedStyle(el);
			return {
				width: s.width,
				height: s.height,
				imageRendering: s.imageRendering,
				filter: s.filter,
				objectFit: s.objectFit,
			};
		});
		console.log(`✓ Logo rendered: ${logoSrc}`);
		console.log(`✓ Logo Box Dimensions: ${logoBox.width}px x ${logoBox.height}px (Target ~36px, properly enlarged)`);
		console.log(`✓ Logo Styles: height=${logoStyles.height}, imageRendering=${logoStyles.imageRendering}, filter=${logoStyles.filter}`);
		if (logoBox.height < 34 || logoBox.height > 40) {
			throw new Error(`Logo height outside expected range (34-40px): ${logoBox.height}px`);
		}

		console.log('\n===========================================');
		console.log('3. Verification of Requirement 2: Search Box Centering & Multilingual Text');
		console.log('===========================================');
		const searchBtn = await page.$('.epo-search-btn');
		if (!searchBtn) throw new Error('Search button .epo-search-btn not found');
		const searchBtnBox = await searchBtn.boundingBox();
		const viewportWidth = 1440;
		const searchCenter = searchBtnBox.x + searchBtnBox.width / 2;
		const screenCenter = viewportWidth / 2;
		console.log(`✓ Search Button Width: ${searchBtnBox.width}px, X: ${searchBtnBox.x}px`);
		console.log(`✓ Search Button Center: ${searchCenter}px (Screen 50% Center: ${screenCenter}px)`);

		// Test all 10 languages
		const langs = [
			{ code: 'zh-CN', name: '简体中文' },
			{ code: 'zh-TW', name: '繁體中文' },
			{ code: 'en', name: 'English' },
			{ code: 'ja', name: '日本語' },
			{ code: 'ko', name: '한국어' },
			{ code: 'es', name: 'Español' },
			{ code: 'fr', name: 'Français' },
			{ code: 'de', name: 'Deutsch' },
			{ code: 'ru', name: 'Русский' },
			{ code: 'pt', name: 'Português' },
		];

		console.log('\n--- Verifying Search Box Across All 10 Supported Languages ---');
		for (const lang of langs) {
			await page.evaluate((code) => {
				const btn = document.querySelector(`.lang-item-btn[data-lang-code="${code}"]`);
				if (btn) btn.click();
			}, lang.code);
			await page.waitForTimeout(100);

			const searchState = await page.evaluate(() => {
				const label = document.querySelector('.search-btn-label:not(.md\\:sl-hidden)');
				const btn = document.querySelector('.epo-search-btn');
				const btnRect = btn.getBoundingClientRect();
				const labelRect = label.getBoundingClientRect();
				const s = window.getComputedStyle(label);
				return {
					text: label.textContent.trim(),
					isTruncated: label.scrollWidth > label.clientWidth,
					labelScrollWidth: label.scrollWidth,
					labelClientWidth: label.clientWidth,
					textAlign: s.textAlign,
					btnCenter: btnRect.x + btnRect.width / 2,
					textCenter: labelRect.x + labelRect.width / 2,
					centerDiff: Math.abs((btnRect.x + btnRect.width / 2) - (labelRect.x + labelRect.width / 2)),
				};
			});

			console.log(`  [${lang.code.padEnd(5)}] "${searchState.text}"`);
			console.log(`         -> Centered: textAlign=${searchState.textAlign}, centerDiff=${searchState.centerDiff.toFixed(2)}px`);
			console.log(`         -> Full text visible: isTruncated=${searchState.isTruncated} (${searchState.labelScrollWidth}px / ${searchState.labelClientWidth}px)`);

			if (searchState.isTruncated) {
				throw new Error(`Search button text truncated in language ${lang.code}: "${searchState.text}"`);
			}
			if (searchState.textAlign !== 'center') {
				throw new Error(`Search button text not centered in language ${lang.code}: ${searchState.textAlign}`);
			}
		}

		// Switch back to zh-CN
		await page.evaluate(() => {
			const btn = document.querySelector('.lang-item-btn[data-lang-code="zh-CN"]');
			if (btn) btn.click();
		});
		await page.waitForTimeout(100);

		console.log('\n===========================================');
		console.log('4. Verification of Requirement 3: Sidebar Scrollbar Behavior');
		console.log('===========================================');
		// Check normal desktop height (900px)
		const height900Metrics = await page.evaluate(() => {
			const pane = document.querySelector('.sidebar-pane');
			return {
				clientHeight: pane.clientHeight,
				scrollHeight: pane.scrollHeight,
				hasScroll: pane.scrollHeight > pane.clientHeight,
			};
		});
		console.log(`✓ Viewport Height 900px: clientHeight=${height900Metrics.clientHeight}px, scrollHeight=${height900Metrics.scrollHeight}px`);
		console.log(`✓ False Scrollbar Eliminated: hasScroll=${height900Metrics.hasScroll} (Expected: false)`);
		if (height900Metrics.hasScroll) {
			throw new Error(`Sidebar still has false scrollbar at 900px height: scrollHeight=${height900Metrics.scrollHeight} > clientHeight=${height900Metrics.clientHeight}`);
		}

		// Check large desktop height (1080px)
		await page.setViewportSize({ width: 1440, height: 1080 });
		await page.waitForTimeout(100);
		const height1080Metrics = await page.evaluate(() => {
			const pane = document.querySelector('.sidebar-pane');
			return {
				clientHeight: pane.clientHeight,
				scrollHeight: pane.scrollHeight,
				hasScroll: pane.scrollHeight > pane.clientHeight,
			};
		});
		console.log(`✓ Viewport Height 1080px: clientHeight=${height1080Metrics.clientHeight}px, scrollHeight=${height1080Metrics.scrollHeight}px`);
		console.log(`✓ Large Screen Clean: hasScroll=${height1080Metrics.hasScroll} (Expected: false)`);
		if (height1080Metrics.hasScroll) {
			throw new Error(`Sidebar still has false scrollbar at 1080px height: scrollHeight=${height1080Metrics.scrollHeight} > clientHeight=${height1080Metrics.clientHeight}`);
		}

		// Check compact height (600px) - should scroll when content genuinely overflows
		await page.setViewportSize({ width: 1440, height: 600 });
		await page.waitForTimeout(100);
		const height600Metrics = await page.evaluate(() => {
			const pane = document.querySelector('.sidebar-pane');
			return {
				clientHeight: pane.clientHeight,
				scrollHeight: pane.scrollHeight,
				hasScroll: pane.scrollHeight > pane.clientHeight,
			};
		});
		console.log(`✓ Viewport Height 600px (overflowing): clientHeight=${height600Metrics.clientHeight}px, scrollHeight=${height600Metrics.scrollHeight}px`);
		console.log(`✓ Legitimate Scroll Enabled when needed: hasScroll=${height600Metrics.hasScroll} (Expected: true)`);
		if (!height600Metrics.hasScroll) {
			throw new Error(`Sidebar should scroll when height is small (600px)`);
		}

		// Reset to 1440x900 for visual verification captures
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.waitForTimeout(200);

		console.log('\n===========================================');
		console.log('5. Capturing High-Resolution Verification Screenshots');
		console.log('===========================================');
		const lightPath = path.join(screenshotsDir, '2-doc-light.png');
		await page.screenshot({ path: lightPath, fullPage: false });
		console.log(`✓ Captured Light Mode: ${lightPath}`);

		// Dark Mode
		const themeToggle = await page.$('#vp-theme-toggle');
		if (themeToggle) {
			await themeToggle.click();
			await page.waitForTimeout(250);
			const darkPath = path.join(screenshotsDir, '1-doc-dark.png');
			await page.screenshot({ path: darkPath, fullPage: false });
			console.log(`✓ Captured Dark Mode: ${darkPath}`);
			// Toggle back to light
			await themeToggle.click();
			await page.waitForTimeout(200);
		}

		// English view
		await page.evaluate(() => {
			const btn = document.querySelector('.lang-item-btn[data-lang-code="en"]');
			if (btn) btn.click();
		});
		await page.waitForTimeout(200);
		const enPath = path.join(screenshotsDir, '5-doc-en.png');
		await page.screenshot({ path: enPath, fullPage: false });
		console.log(`✓ Captured English View: ${enPath}`);

		// German view (testing long string display)
		await page.evaluate(() => {
			const btn = document.querySelector('.lang-item-btn[data-lang-code="de"]');
			if (btn) btn.click();
		});
		await page.waitForTimeout(200);
		const dePath = path.join(screenshotsDir, '6-doc-de.png');
		await page.screenshot({ path: dePath, fullPage: false });
		console.log(`✓ Captured German View: ${dePath}`);

		// Switch back to zh-CN
		await page.evaluate(() => {
			const btn = document.querySelector('.lang-item-btn[data-lang-code="zh-CN"]');
			if (btn) btn.click();
		});
		await page.waitForTimeout(200);

		console.log('\n===========================================');
		console.log('🎉 ALL PLAYWRIGHT VISUAL & FUNCTIONAL VERIFICATIONS PASSED!');
		console.log('===========================================\n');

		await browser.close();
		server.close();
		process.exit(0);
	} catch (err) {
		console.error('\n❌ Playwright Verification Error:', err);
		if (browser) await browser.close();
		server.close();
		process.exit(1);
	}
});
