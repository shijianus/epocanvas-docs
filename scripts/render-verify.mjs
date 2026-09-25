// 视觉验证渲染脚本：对构建产物（astro preview）渲染指定页面并输出 PNG。
// 用法：node scripts/render-verify.mjs --base-url http://localhost:4321
// 输出：.cf-work/verify/*.png
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, '.cf-work', 'verify');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const CDP_PORT = 9334;

const args = process.argv.slice(2);
function argOf(name, fallback) {
	const i = args.indexOf('--' + name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE_URL = argOf('base-url', 'http://localhost:4321').replace(/\/$/, '');

const VIEW = { width: 1440, height: 1000 };
const WIDE = { width: 2560, height: 1200 };

// 验证清单：[输出名, 路径, 视口, 滚动选择器或 null]
const SHOTS = [
	['zh-layout-topnav', '/canvas/layout/', VIEW, 'img[src*="ui-topnav-annotated"]'],
	['zh-i18n-table', '/canvas/i18n/', VIEW, '.table-wrapper'],
	['zh-markup-table', '/canvas/markdown/', VIEW, '.table-wrapper'],
	['zh-deploy-table', '/canvas/deployment/', VIEW, '.table-wrapper'],
	['zh-faq', '/canvas/troubleshooting/', VIEW, null],
	['en-layout-topnav', '/en/canvas/layout/', VIEW, 'img[src*="ui-topnav-annotated"]'],
	['ja-quickstart', '/ja/canvas/deployment/', VIEW, '.table-wrapper'],
	['home', '/', VIEW, null],
	['wide-i18n', '/canvas/i18n/', WIDE, '.table-wrapper'],
	['wide-home', '/', WIDE, null],
	['wide-components', '/canvas/components/', WIDE, '.table-wrapper'],
];

class Cdp {
	constructor(ws) {
		this.ws = ws;
		this.id = 0;
		this.pending = new Map();
		this.listeners = [];
		ws.addEventListener('message', (ev) => {
			const msg = JSON.parse(ev.data);
			if (msg.id && this.pending.has(msg.id)) {
				const { resolve, reject } = this.pending.get(msg.id);
				this.pending.delete(msg.id);
				msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
			} else if (msg.method) {
				for (const fn of this.listeners) fn(msg);
			}
		});
	}
	send(method, params = {}, sessionId) {
		const id = ++this.id;
		const payload = { id, method, params };
		if (sessionId) payload.sessionId = sessionId;
		this.ws.send(JSON.stringify(payload));
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			setTimeout(() => {
				if (this.pending.has(id)) {
					this.pending.delete(id);
					reject(new Error(`CDP timeout: ${method}`));
				}
			}, 30000);
		});
	}
	on(fn) {
		this.listeners.push(fn);
	}
	waitForEvent(match, timeout = 60000) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error(`event timeout: ${match}`)), timeout);
			const fn = (msg) => {
				if (match.test(msg.method)) {
					clearTimeout(timer);
					this.listeners.splice(this.listeners.indexOf(fn), 1);
					resolve(msg);
				}
			};
			this.listeners.push(fn);
		});
	}
}

async function main() {
	fs.rmSync(OUT, { recursive: true, force: true });
	fs.mkdirSync(OUT, { recursive: true });
	const profile = path.join(ROOT, '.cf-work', 'edge-profile-verify');
	fs.rmSync(profile, { recursive: true, force: true });

	const edge = spawn(
		EDGE,
		[
			'--headless=new',
			`--remote-debugging-port=${CDP_PORT}`,
			`--user-data-dir=${profile}`,
			`--window-size=${WIDE.width},${WIDE.height}`,
			'--force-device-scale-factor=1',
			'--hide-scrollbars',
			'--disable-extensions',
			'--no-first-run',
			'--no-default-browser-check',
			'--disable-background-networking',
			'about:blank',
		],
		{ stdio: 'ignore' }
	);

	try {
		let version = null;
		for (let i = 0; i < 150 && !version; i++) {
			await new Promise((r) => setTimeout(r, 200));
			try {
				version = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`, { signal: AbortSignal.timeout(1500) })).json();
			} catch {}
		}
		if (!version) throw new Error('Edge DevTools 端口未就绪');

		const ws = new WebSocket(version.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => {
			ws.addEventListener('open', resolve);
			ws.addEventListener('error', reject);
		});
		const cdp = new Cdp(ws);
		const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
		const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
		const S = (method, params) => cdp.send(method, params, sessionId);
		await S('Page.enable');
		await S('Runtime.enable');
		await S('Emulation.setDeviceMetricsOverride', {
			width: VIEW.width,
			height: VIEW.height,
			deviceScaleFactor: 1,
			mobile: false,
		});
		const setTheme = (theme) =>
			S('Page.addScriptToEvaluateOnNewDocument', {
				source: `try{localStorage.setItem('starlight-theme','${theme}')}catch(e){}`,
			});
		await setTheme('dark');

		const evalJs = async (expression) => {
			const r = await S('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
			if (r.exceptionDetails) throw new Error('页面执行出错: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
			return r.result?.value;
		};

		let loadFired = cdp.waitForEvent(/^Page\.loadEventFired$/, 90000);
		await S('Page.navigate', { url: `${BASE_URL}/` });
		await loadFired;

		for (const [name, urlPath, view, scrollSel] of SHOTS) {
			await S('Emulation.setDeviceMetricsOverride', {
				width: view.width,
				height: view.height,
				deviceScaleFactor: 1,
				mobile: false,
			});
			loadFired = cdp.waitForEvent(/^Page\.loadEventFired$/, 60000);
			const r = await S('Page.navigate', { url: BASE_URL + urlPath });
			if (r.errorText) throw new Error(`导航失败 ${urlPath}: ${r.errorText}`);
			await loadFired;
			await evalJs(`(() => new Promise((res) => {
				const done = () => res(document.fonts.status + '|' + document.querySelectorAll('h1').length);
				if (document.readyState === 'complete') done();
				else window.addEventListener('load', done);
			}))()`);
			if (scrollSel) {
				await evalJs(`(() => {
					const el = document.querySelector('${scrollSel}');
					if (el) {
						const y = el.getBoundingClientRect().top + window.scrollY - 90;
						window.scrollTo(0, Math.max(0, y));
					}
					return el ? 'ok' : 'missing:' + '${scrollSel}';
				})()`);
			} else {
				await evalJs(`window.scrollTo(0, 0)`);
			}
			await new Promise((r2) => setTimeout(r2, 500));
			const { data } = await S('Page.captureScreenshot', { format: 'png' });
			fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(data, 'base64'));
			console.log(`[shot] ${name}.png`);
		}
		console.log('[done] 渲染完成 →', OUT);
	} finally {
		edge.kill();
	}
}

main().catch((err) => {
	console.error('[render-failed]', err.message);
	process.exit(1);
});
