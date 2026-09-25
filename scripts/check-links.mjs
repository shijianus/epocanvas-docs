// 产物级链接与多语言声明体检：在 astro build 之后读取 dist/，把站点真正发出去的
// 每一条链接、每一个锚点、每一组 hreflang 都实际解析一遍。
//
// 为什么需要这一道：其余质量门全部只看 src/content/ 下的源文件，不看构建产物。
// 而构建产物才是上线的东西——rehype 插件改写错了链接、构建钩子漏注入了 x-default、
// 某个页面被改成了不存在的地址，源文件层什么都看不出来（历史上就因此漏掉过多次）。
// 这一门只读不改，任何一项解析失败即非零退出。
//
// 运行时机：astro build 之后（与 check-localized-images.mjs 同一阶段）。
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
	console.error('[check-links] 未找到 dist/，请先运行 pnpm build');
	process.exit(1);
}

// Starlight 会为每个语言目录生成一份页面，因此每个内容页的 hreflang 集群
// 必须是下面这 11 条（10 个语言 + x-default）且两两互证。
// 这里是刻意写死的期望值，不去复用构建侧配置：检查项与被检查实现同源就检查不出东西。
const EXPECTED_HREFLANG = ['x-default', 'zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
const LOCALE_DIRS = ['zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];

const pages = [];
(function walk(rel) {
	const abs = rel ? path.join(dist, rel) : dist;
	for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
		const r = rel ? rel + '/' + entry.name : entry.name;
		if (entry.isDirectory()) walk(r);
		else if (entry.name.endsWith('.html')) pages.push(r);
	}
})('');

/** 路由 /a/b/ 是否存在：目录式产物优先，兼容 /a/b.html 与裸文件 */
function routeFile(u) {
	const p = u.replace(/^\//, '').replace(/\/$/, '');
	if (!p) return fs.existsSync(path.join(dist, 'index.html')) ? 'index.html' : null;
	if (fs.existsSync(path.join(dist, p, 'index.html'))) return p + '/index.html';
	if (fs.existsSync(path.join(dist, p + '.html'))) return p + '.html';
	if (fs.existsSync(path.join(dist, p))) return p;
	return null;
}
const existsRoute = (u) => routeFile(u) !== null;
const dec = (s) => { try { return decodeURIComponent(s); } catch { return null; } };

const idsOf = new Map();
const htmlOf = new Map();
const headOf = new Map();
for (const rel of pages) {
	const h = fs.readFileSync(path.join(dist, rel), 'utf8');
	htmlOf.set(rel, h);
	// 判断"这页自己声明了什么"必须只看 <head>，并且只看完整标签。
	// 整篇文档做子串匹配会被正文里的字面量误触发——本文档站的 i18n 页正文就原样写着
	// hreflang="x-default"、SEO 页可能写 noindex，这些都是被讲解的对象而不是页面属性。
	const headEnd = h.indexOf('</head>');
	headOf.set(rel, headEnd === -1 ? h : h.slice(0, headEnd));
	idsOf.set(rel, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
/** 统计 head 里指定 hreflang 的真实 link 标签条数 */
function xDefaultTagCount(rel) {
	return (headOf.get(rel).match(/<link[^>]+hreflang=["']x-default["']/gi) || []).length;
}

const deadPages = [];
const deadAnchors = [];
const deadAssets = [];
const hreflangIssues = [];
const badCanonical = [];
let internalLinks = 0;
let externalLinks = 0;
let contentPages = 0;
let stubPages = 0;

for (const rel of pages) {
	const h = htmlOf.get(rel);
	const route = '/' + rel.replace(/(^|\/)index\.html$/, '').replace(/^\/$/, '');
	const isStub = /http-equiv=["']refresh["']/i.test(headOf.get(rel)) || /content=["']noindex/i.test(headOf.get(rel));
	// 404.html 与跳转桩都不是语言化页面，不参与 hreflang 集群断言
	const isLocalizedPage = !isStub && !/404\.html$/.test(rel) && !/^404\.html$/.test(rel);

	for (const m of h.matchAll(/<a\s[^>]*href="([^"]*)"/g)) {
		const href = m[1];
		if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(href)) { externalLinks++; continue; }
		if (href === '') continue;
		internalLinks++;
		if (href.startsWith('#')) {
			const id = dec(href.slice(1));
			if (id === null) deadAnchors.push(`${route} -> ${href} (百分号编码不合法)`);
			else if (href.length > 1 && !idsOf.get(rel).has(id)) deadAnchors.push(`${route} -> ${href} [页内]`);
			continue;
		}
		if (!href.startsWith('/')) { deadPages.push(`${route} -> ${href} [相对路径，产物内不可解析]`); continue; }
		const hashIdx = href.indexOf('#');
		const pth = hashIdx === -1 ? href : href.slice(0, hashIdx);
		const hash = hashIdx === -1 ? '' : dec(href.slice(hashIdx + 1));
		if (!existsRoute(pth)) { deadPages.push(`${route} -> ${href}`); continue; }
		if (hash) {
			const targetRel = routeFile(pth);
			const ids = targetRel ? idsOf.get(targetRel) : undefined;
			if (!ids) deadAnchors.push(`${route} -> ${href} [目标非已扫描页面]`);
			else if (hash === null) deadAnchors.push(`${route} -> ${href} [百分号编码不合法]`);
			else if (!ids.has(hash)) deadAnchors.push(`${route} -> ${href} [跨页]`);
		}
	}

	for (const m of h.matchAll(/<(?:img|script|link)\s[^>]*?(?:src|href)="(\/[^"]*)"/g)) {
		const u = m[1];
		if (u.startsWith('//')) continue;
		const filePart = u.split(/[?#]/)[0];
		if (!fs.existsSync(path.join(dist, filePart)) && !existsRoute(filePart)) {
			deadAssets.push(`${route} -> ${u}`);
		}
	}

	if (!isLocalizedPage) continue;
	contentPages++;
	const alts = [...headOf.get(rel).matchAll(/<link[^>]*rel="alternate"[^>]*>/g)].map((x) => x[0]);
	const seen = new Map();
	for (const a of alts) {
		const lm = /hreflang="([^"]+)"/.exec(a);
		const hm = /href="([^"]+)"/.exec(a);
		if (lm && hm) seen.set(lm[1], hm[1]);
	}
	if (seen.size === 0) { hreflangIssues.push(`${route}: 完全没有 hreflang alternate`); continue; }
	for (const code of EXPECTED_HREFLANG) {
		if (!seen.has(code)) hreflangIssues.push(`${route}: 缺少 hreflang="${code}"（实际 ${seen.size} 条）`);
	}
	for (const extra of seen.keys()) {
		if (!EXPECTED_HREFLANG.includes(extra)) hreflangIssues.push(`${route}: 出现预期外的 hreflang="${extra}"`);
	}
	const canonical = /(https?:\/\/[^"']+?)\/[^"']*"[^>]*rel="canonical"|rel="canonical"[^>]*href="(https?:\/\/[^""]+)"/.exec(h);
	const canonOrigin = canonical ? new URL(canonical[1] || canonical[2]).origin : null;
	for (const [code, url] of seen) {
		let origin, pathname;
		try { const u = new URL(url); origin = u.origin; pathname = u.pathname; }
		catch { hreflangIssues.push(`${route}: hreflang="${code}" 不是合法绝对地址：${url}`); continue; }
		if (canonOrigin && origin !== canonOrigin) hreflangIssues.push(`${route}: hreflang="${code}" 域名 ${origin} 与 canonical ${canonOrigin} 不一致`);
		if (!existsRoute(pathname)) hreflangIssues.push(`${route}: hreflang="${code}" 指向产物中不存在的路由 ${pathname}`);
	}
	// x-default 必须指向简体中文根语言版本，即同页去掉语言前缀后的路径
	const xd = seen.get('x-default');
	if (xd) {
		let xdPath = null;
		try { xdPath = new URL(xd).pathname; } catch {}
		if (xdPath) {
			const segs = xdPath.replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean);
			if (segs.length && LOCALE_DIRS.includes(segs[0].toLowerCase())) {
				hreflangIssues.push(`${route}: x-default 不应指向带语言前缀的路径 ${xdPath}`);
			}
			const ownSegs = route.replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean);
			if (ownSegs.length && LOCALE_DIRS.includes(ownSegs[0].toLowerCase())) ownSegs.shift();
			const expect = '/' + ownSegs.join('/') + (ownSegs.length ? '/' : '');
			if (xdPath !== expect) hreflangIssues.push(`${route}: x-default 指向 ${xdPath}，应为根语言同页 ${expect}`);
		}
	}
	const xdCount = xDefaultTagCount(rel);
	if (xdCount !== 1) hreflangIssues.push(`${route}: head 内 x-default link 标签出现 ${xdCount} 次，应为 1 次`);
}

for (const rel of pages) {
	const isStub = /http-equiv=["']refresh["']/i.test(headOf.get(rel)) || /content=["']noindex/i.test(headOf.get(rel));
	if (/404\.html$/.test(rel)) {
		// 全站只有一张 404.html，不存在按语言分裂的副本。Starlight 仍会按"每个语言都有本页"
		// 的前提给它输出一整组 alternate，那些 /en/404/ 之类的地址全是死路由（AUDIT_REPORT D-05）。
		const stray = (headOf.get(rel).match(/<link[^>]*rel="alternate"[^>]*hreflang="[^"]*"[^>]*>/g) || []);
		if (stray.length) hreflangIssues.push(`/${rel}: 错误页不应带 hreflang alternate（发现 ${stray.length} 条，指向的路由不存在）`);
		continue;
	}
	if (isStub) { stubPages++; continue; }
	const cm = /rel="canonical"\s+href="([^"]+)"/.exec(headOf.get(rel)) || /href="([^"]+)"[^>]*rel="canonical"/.exec(headOf.get(rel));
	if (!cm) { badCanonical.push(`/${rel.replace(/(^|\/)index\.html$/, '').replace(/\/$/, '')}: 无 canonical`); continue; }
	let cp;
	try { cp = new URL(cm[1]).pathname; } catch { badCanonical.push(`${rel}: canonical 不是合法绝对地址 ${cm[1]}`); continue; }
	if (!existsRoute(cp)) badCanonical.push(`/${rel}: canonical 指向产物中不存在的路由 ${cp}`);
}

const uniq = (a) => [...new Set(a)];
function report(title, arr, okMsg) {
	const u = uniq(arr);
	if (u.length === 0) { console.log(`  ✅ ${okMsg || title}`); return 0; }
	console.log(`  ❌ ${title}: ${arr.length} 处（${u.length} 类）`);
	u.slice(0, 25).forEach((x) => console.log('       ' + x));
	if (u.length > 25) console.log(`       ... 另有 ${u.length - 25} 类`);
	return u.length;
}

console.log(`[check-links] 扫描 ${pages.length} 个 HTML（内容页 ${contentPages}、跳转桩 ${stubPages}）`);
console.log(`              内链 ${internalLinks} 条、外链 ${externalLinks} 条、hreflang 逐页解析`);
let problems = 0;
problems += report('内链指向不存在的路由', deadPages, '内链全部命中，无死链');
problems += report('锚点在目标页中不存在', deadAnchors, '锚点全部命中');
problems += report('静态资源 404', deadAssets, 'img/script/link 引用的资源全部存在');
problems += report('hreflang 集群问题', hreflangIssues, '每个内容页 hreflang 完整（11 条）、互证、指向真实路由');
problems += report('canonical 异常', badCanonical, 'canonical 全部存在且指向真实路由');

if (problems > 0) {
	console.error(`\n[check-links] FAILED: ${problems} 类问题`);
	process.exit(1);
}
console.log('\n[check-links] OK：产物级链接与多语言声明全部自洽');
