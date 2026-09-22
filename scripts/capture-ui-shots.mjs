// 界面截图采集脚本：无头 Edge（CDP）批量采集 10 种语言 × 9 类界面截图底图。
//
// 用法：
//   node scripts/capture-ui-shots.mjs                     # 采集全部语言（需先 pnpm build && pnpm preview）
//   node scripts/capture-ui-shots.mjs --locales en,ja     # 只采集指定语言
//   node scripts/capture-ui-shots.mjs --base-url http://127.0.0.1:4321
//
// 输出：.cf-work/shots/<locale>/<figure>.png + _spec.json（锚点矩形）。
// 之后运行 scripts/compose-ui-shots.py 合成标注图并写入 public/images/canvas/。
//
// 采集时序要求（与 compose-ui-shots.py 的空白帧检测配套）：
//   - 必须对构建产物（astro preview）采集，Pagefind 弹窗只在生产模式挂载；
//   - 每次导航后等待 load 事件 + 字体加载 + 图片解码完成 + 正文渲染，
//     过早截图会得到近乎纯色的空白帧，合成脚本会拒绝覆盖 public/。
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_BASE = path.join(ROOT, '.cf-work', 'shots');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const CDP_PORT = 9333;

// ---- 参数 ----
const args = process.argv.slice(2);
function argOf(name, fallback) {
	const i = args.indexOf('--' + name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE_URL = argOf('base-url', 'http://127.0.0.1:4321').replace(/\/$/, '');
const ONLY = argOf('locales', null)?.split(',').map((s) => s.trim()).filter(Boolean) ?? null;

// ---- 语言与 URL 前缀（root = 简体中文，占用根路径）----
const LOCALES = [
	{ dir: 'root', prefix: '' },
	{ dir: 'zh-tw', prefix: 'zh-tw' },
	{ dir: 'en', prefix: 'en' },
	{ dir: 'ja', prefix: 'ja' },
	{ dir: 'ko', prefix: 'ko' },
	{ dir: 'es', prefix: 'es' },
	{ dir: 'fr', prefix: 'fr' },
	{ dir: 'de', prefix: 'de' },
	{ dir: 'ru', prefix: 'ru' },
	{ dir: 'pt', prefix: 'pt' },
];

// ---- 各语言页内/全站检索关键词（已按构建产物核实命中数 > 50，回退词保底）----
const SEARCH_WORDS = {
	root: ['部署'],
	'zh-tw': ['部署'],
	en: ['deploy'],
	ja: ['デプロイ'],
	ko: ['배포'],
	es: ['despliegue', 'desplegar'],
	fr: ['déploiement', 'déployer'],
	de: ['Deployment', 'Bereitstellung'],
	ru: ['развёртывание', 'развертывание'],
	pt: ['implantação', 'implantar'],
};

// ---- 视口：所有成品图均为 1440×920 @1x，与 compose-ui-shots.py 的几何定义一致 ----
const VIEW = { width: 1440, height: 920 };

// ---------- 极简 CDP 客户端 ----------
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

async function waitUntil(evalFn, predicate, timeout, label, interval = 200) {
	const start = Date.now();
	while (true) {
		const value = await evalFn();
		if (predicate(value)) return value;
		if (Date.now() - start > timeout) {
			throw new Error(`等待超时: ${label}（最后值: ${JSON.stringify(value)?.slice(0, 200)}）`);
		}
		await new Promise((r) => setTimeout(r, interval));
	}
}

async function main() {
	if (!fs.existsSync(EDGE)) throw new Error(`未找到 Edge: ${EDGE}`);
	const profile = path.join(ROOT, '.cf-work', 'edge-profile');
	fs.rmSync(profile, { recursive: true, force: true });
	fs.mkdirSync(OUT_BASE, { recursive: true });

	console.log('[launch] 启动无头 Edge…');
	const edge = spawn(
		EDGE,
		[
			'--headless=new',
			`--remote-debugging-port=${CDP_PORT}`,
			`--user-data-dir=${profile}`,
				`--window-size=${VIEW.width},${VIEW.height}`,
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
		// 等 DevTools 端口就绪（冷启动 + 杀软扫描可能超过 10 秒；fetch 必须带超时，
		// 否则 Edge 半启动时会永久挂起）
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

		const evalJs = async (expression) => {
			const r = await S('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
			if (r.exceptionDetails) {
				throw new Error('页面执行出错: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
			}
			return r.result?.value;
		};

		// 主题持久化：导航前写入 localStorage（Starlight 读取 starlight-theme 键）
		const setThemeOnNewDoc = (theme) => {
			const source = `try{localStorage.setItem('starlight-theme','${theme}')}catch(e){}`;
			return S('Page.addScriptToEvaluateOnNewDocument', { source });
		};
		await setThemeOnNewDoc('dark');

		// 先导航到站点首页做预热（冷启动首跳要初始化网络服务、字体缓存等）
		let loadFired = cdp.waitForEvent(/^Page\.loadEventFired$/, 90000);
		{
			const warm = await S('Page.navigate', { url: `${BASE_URL}/` });
			if (warm.errorText) throw new Error(`预热导航失败: ${warm.errorText}`);
			await loadFired;
			console.log('[warmup] 预热完成');
		}
		const navigate = async (url) => {
			loadFired = cdp.waitForEvent(/^Page\.loadEventFired$/, 60000);
			const r = await S('Page.navigate', { url });
			if (r.errorText) throw new Error(`导航失败 ${url}: ${r.errorText}`);
			await loadFired;
			// 渲染完成判定：正文、侧栏、字体、图片全部就绪，再留出过渡动画时间
			await waitUntil(
				() =>
					evalJs(`(() => {
						const h1 = document.querySelector('h1');
						return {
							ready: document.readyState,
							h1: h1 ? h1.textContent.trim().length : 0,
							fonts: document.fonts ? document.fonts.status : 'loaded',
							imgs: [...document.images].every((i) => i.complete),
							header: !!document.querySelector('header'),
						};
					})()`),
				(v) => v.ready === 'complete' && v.h1 > 0 && v.fonts === 'loaded' && v.imgs && v.header,
				20000,
				`页面渲染 ${url}`
			);
			await new Promise((r) => setTimeout(r, 500));
		};

		const shot = async (outDir, name) => {
			const { data } = await S('Page.captureScreenshot', { format: 'png' });
			const buf = Buffer.from(data, 'base64');
			if (buf.length < 30 * 1024) {
				throw new Error(`${name}.png 仅 ${buf.length} 字节，疑似空白帧，已中止（不写入输出目录）`);
			}
			fs.writeFileSync(path.join(outDir, name + '.png'), buf);
			console.log(`  [shot] ${name}.png (${Math.round(buf.length / 1024)}KB)`);
		};

		// 量取锚点矩形；badge（版本徽标）没有稳定 class，按文字 v* 在主导航里识别
		const measure = async (keys) => {
			const rects = await evalJs(`(() => {
				const pick = (sel) => {
					for (const s of sel.split('|')) {
						const el = document.querySelector(s);
						if (el) return el;
					}
					return null;
				};
				const rect = (el) => {
					if (!el) return null;
					const r = el.getBoundingClientRect();
					return { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
				};
				const out = {};
				const sel = ${JSON.stringify(keys)};
				for (const [k, s] of Object.entries(sel)) {
					if (k === 'badge') {
						const links = [...document.querySelectorAll('.nav-links a')];
						out[k] = rect(links.find((a) => /^v\\d/.test(a.textContent.trim())));
						continue;
					}
					out[k] = rect(pick(s));
				}
				return out;
			})()`);
			const missing = Object.entries(rects).filter(([, v]) => !v).map(([k]) => k);
			if (missing.length) throw new Error(`锚点量取失败: ${missing.join(', ')}`);
			return rects;
		};

		const ui = (p) => `${BASE_URL}/${p}`;
		const url = (loc, slug) => ui(`${loc.prefix ? loc.prefix + '/' : ''}canvas/${slug}`);

		for (const loc of LOCALES) {
			if (ONLY && !ONLY.includes(loc.dir)) continue;
			const outDir = path.join(OUT_BASE, loc.dir);
			fs.mkdirSync(outDir, { recursive: true });
			const spec = { locale: loc.dir, figures: {} };
			console.log(`\n=== ${loc.dir} ===`);

			// 1. 产品简介页（深色，页首）
			await navigate(url(loc, ''));
			await shot(outDir, 'ui-docs-reading');
			spec.figures['ui-docs-reading'] = { rects: {} };

			// 2. 快速上手页（深色，页首）
			await navigate(url(loc, 'deployment'));
			await shot(outDir, 'ui-quickstart');
			spec.figures['ui-quickstart'] = { rects: {} };

			// 3. 快速上手页（浅色）——点主题开关后拍摄，再切回深色
			await evalJs(`document.getElementById('vp-theme-toggle').click()`);
			await waitUntil(
				() => evalJs(`document.documentElement.dataset.theme || ''`),
				(t) => t === 'light',
				5000,
				'切换浅色主题'
			);
			await new Promise((r) => setTimeout(r, 400));
			await shot(outDir, 'ui-theme-light');
			spec.figures['ui-theme-light'] = { rects: {} };
			await evalJs(`document.getElementById('vp-theme-toggle').click()`);
			await waitUntil(
				() => evalJs(`document.documentElement.dataset.theme || ''`),
				(t) => t === 'dark',
				5000,
				'切回深色主题'
			);

			// 4. 提示框示例页（滚动到第一个小节标题）
			await navigate(url(loc, 'syntax'));
			await evalJs(`(() => {
				const h2 = document.querySelector('.sl-markdown-content h2');
				if (h2) window.scrollTo(0, h2.getBoundingClientRect().top + window.scrollY - 90);
			})()`);
			await new Promise((r) => setTimeout(r, 400));
			await shot(outDir, 'ui-markup-examples');
			spec.figures['ui-markup-examples'] = { rects: {} };

			// 5. 渲染规则页（深色）——整页锚点（图注写明“以《渲染规则详解》页为例”）
			await navigate(url(loc, 'rendering'));
			await shot(outDir, 'ui-layout-annotated');
			spec.figures['ui-layout-annotated'] = {
				rects: await measure({
					header: 'header',
					sidebar: '.sidebar-pane|nav.sidebar|.sidebar-wrapper',
					main: '.main-pane|main',
					toc: '.right-sidebar|starlight-toc aside',
				}),
			};

			// 6. 顶栏特写底图（同一页，compose 时裁顶部 144px）
			await shot(outDir, 'ui-topnav-raw');
			spec.figures['ui-topnav-annotated'] = {
				rects: await measure({
					title: '.site-title|.title-wrapper',
					search: '#epo-search-box',
					nav: '.nav-links',
					badge: '.nav-links a',
					lang: '#vp-lang-btn',
					theme: '#vp-theme-toggle',
					github: '.header-social-links a[href*="github.com"]',
					tg: '.header-social-links a[href*="t.me"]',
				}),
			};

			// 7. 语言下拉展开
			await evalJs(`document.getElementById('vp-lang-btn').click()`);
			await waitUntil(
				() => evalJs(`(() => {
					const m = document.getElementById('vp-lang-menu');
					if (!m) return 0;
					const r = m.getBoundingClientRect();
					return r.height;
				})()`),
				(h) => h > 100,
				5000,
				'展开语言菜单'
			);
			await new Promise((r) => setTimeout(r, 300));
			await shot(outDir, 'ui-i18n-open');
			spec.figures['ui-i18n-open'] = {
				rects: await measure({
					btn: '#vp-lang-btn',
					menu: '#vp-lang-menu',
					active: '.lang-item-btn.active',
				}),
			};
			await evalJs(`document.getElementById('vp-lang-btn').click()`);

			// 8. 全站检索弹窗（Ctrl K）——输入本语言关键词，等结果列表出现
			await navigate(url(loc, 'cloudflare'));
			await evalJs(`document.getElementById('epo-modal-trigger').click()`);
			await waitUntil(
				() => evalJs(`!!document.querySelector('.pagefind-ui__search-input')`),
				(Boolean) => Boolean,
				15000,
				'Pagefind 弹窗挂载'
			);
			const words = SEARCH_WORDS[loc.dir];
			let resultCount = 0;
			for (const w of words) {
				await evalJs(`(() => {
					const i = document.querySelector('.pagefind-ui__search-input');
					const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
					set.call(i, ${JSON.stringify(w)});
					i.dispatchEvent(new Event('input', { bubbles: true }));
				})()`);
				resultCount = await waitUntil(
					() => evalJs(`document.querySelectorAll('.pagefind-ui__result').length`),
					(n) => n > 0,
					15000,
					`全站检索结果「${w}」`
				).catch(() => 0);
				if (resultCount > 0) {
					console.log(`  [search] 弹窗关键词「${w}」→ ${resultCount} 条结果`);
					break;
				}
			}
			if (!resultCount) throw new Error(`${loc.dir}: 全站检索所有关键词均无结果: ${words.join('/')}`);
			await new Promise((r) => setTimeout(r, 600));
			await shot(outDir, 'ui-search-modal');
			spec.figures['ui-search-modal'] = {
				rects: await measure({
					input: '.pagefind-ui__search-input',
					results: '.pagefind-ui__results',
					footer: '.modal-footer',
				}),
			};
			await evalJs(`document.querySelector('button[data-close-modal]').click()`);

			// 9. 页内搜索（顶栏输入框）——等高亮出现且计数 > 0
			for (const w of words) {
				await evalJs(`(() => {
					const i = document.getElementById('epo-inpage-input');
					const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
					set.call(i, ${JSON.stringify(w)});
					i.dispatchEvent(new Event('input', { bubbles: true }));
				})()`);
				const marked = await waitUntil(
					() => evalJs(`(() => {
						const marks = document.querySelectorAll('mark.epo-doc-highlight');
						const active = document.querySelector('mark.epo-doc-highlight.active');
						const count = document.getElementById('epo-search-count');
						return {
							n: marks.length,
							active: !!active,
							count: count ? count.textContent.trim() : '',
						};
					})()`),
					(v) => v.n > 0 && v.active,
					10000,
					`页内搜索「${w}」`
				).catch(() => null);
				if (marked && !marked.count.startsWith('0')) {
					console.log(`  [search] 页内关键词「${w}」→ ${marked.count}`);
					break;
				}
			}
			const finalState = await evalJs(`(() => ({
				n: document.querySelectorAll('mark.epo-doc-highlight').length,
				count: (document.getElementById('epo-search-count') || {}).textContent || '',
			}))()`);
			if (!finalState.n || finalState.count.trim().startsWith('0')) {
				throw new Error(`${loc.dir}: 页内搜索无命中（${finalState.count}）: ${words.join('/')}`);
			}
			await new Promise((r) => setTimeout(r, 400));
			await shot(outDir, 'ui-inpage-search');
			spec.figures['ui-inpage-search'] = {
				rects: await measure({
					input: '#epo-inpage-input',
					count: '#epo-search-count',
					prev: '#epo-search-prev',
					next: '#epo-search-next',
					clear: '#epo-search-clear',
					mark: 'mark.epo-doc-highlight.active',
				}),
			};

			fs.writeFileSync(path.join(outDir, '_spec.json'), JSON.stringify(spec, null, 1), 'utf8');
			console.log(`  [spec] _spec.json 已写入`);
		}

		console.log('\n[done] 全部采集完成');
	} finally {
		edge.kill();
	}
}

main().catch((err) => {
	console.error('\n[capture-failed]', err.message);
	process.exit(1);
});
