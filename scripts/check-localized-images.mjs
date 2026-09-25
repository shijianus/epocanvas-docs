// 本地化图片引用体检：防止"切换语言后截图仍是中文"回归（2026-09 修复的问题）。
//
// 规则：扫描 dist/ 下每个 HTML 页面的 <img src>，
//   1. 页面属于某语言目录（如 /en/canvas/…）时，/images/canvas/<base> 引用
//      必须已改写为 /images/canvas/<语言>/<base>；
//   2. 改写的前提是 public/images/canvas/<语言>/<base> 存在——若某图还没有
//      分语言版本，必须在 SHARED_ALLOWLIST 里登记（如 Cloudflare 控制台截图，
//      它是第三方英文界面，全语言共用），否则视为疏漏并失败；
//   3. 反向校验：已改写引用指向的文件必须真实存在于 dist，避免上线 404。
// 运行时机：astro build 之后（读取 dist 产物）。
import fs from 'node:fs';
import path from 'node:path';

const LOCALE_DIRS = ['zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
// 全语言共用的图片（第三方英文界面、语言无关的徽标等）。
// 每一项都必须是 public/images/canvas/ 下真实存在的文件，下面有断言兜住：
// 白名单只会让规则变松，条目改名或删除后留在这里，等于悄悄开了一个免检口子。
const SHARED_ALLOWLIST = [
	'deploy/cf-01-projects-list.png',
	'deploy/cf-02-deployments.png',
	'deploy/cf-03-settings.png',
	'deploy/cf-04-domains.png',
	'deploy-live-site.png',
	'deploy/badge-cloudflare.svg',
	'deploy/badge-netlify.svg',
	'deploy/badge-vercel.svg',
];

const root = process.cwd();

const staleEntries = SHARED_ALLOWLIST.filter(
	(name) => !fs.existsSync(path.join(root, 'public', 'images', 'canvas', name))
);
if (staleEntries.length) {
	console.error('[check-localized-images] 共享图白名单里有已不存在的条目（会造成免检漏洞）：');
	for (const s of staleEntries) console.error('  -> ' + s);
	process.exit(1);
}

const dist = path.join(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
	console.error('[check-localized-images] 未找到 dist/，请先运行 pnpm build');
	process.exit(1);
}

const pages = [];
(function walk(rel) {
	const abs = rel ? path.join(dist, rel) : dist;
	for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
		const relChild = rel ? rel + '/' + entry.name : entry.name;
		if (entry.isDirectory()) walk(relChild);
		else if (entry.name === 'index.html') pages.push(relChild);
	}
})('');

const imgRe = /<img[^>]*\ssrc="([^"]+)"[^>]*>/g;
const problems = [];
let checked = 0;

for (const rel of pages) {
	// 产物路径 → 页面语言：en/canvas/…/index.html → en；根路径页面 → 默认语言
	const segments = rel.replace(/(^|\/)index\.html$/, '').split('/').filter(Boolean);
	let locale = null;
	if (segments.length && LOCALE_DIRS.includes(segments[0])) locale = segments[0];
	const html = fs.readFileSync(path.join(dist, rel), 'utf8');
	let m;
	imgRe.lastIndex = 0;
	while ((m = imgRe.exec(html))) {
		const src = m[1];
		if (!src.startsWith('/images/canvas/')) continue;
		checked++;
		const base = src.slice('/images/canvas/'.length);
		if (locale) {
			const localizedExists = fs.existsSync(
				path.join(process.cwd(), 'public', 'images', 'canvas', locale, base)
			);
			const isLocalized = base.startsWith(locale + '/');
			const allowed = SHARED_ALLOWLIST.includes(base);
			if (!isLocalized && localizedExists) {
				problems.push(`${rel} -> ${src}（存在 ${locale} 版本但未改写）`);
			} else if (!isLocalized && !allowed) {
				problems.push(`${rel} -> ${src}（无 ${locale} 版本且不在共享白名单）`);
			} else if (isLocalized && !fs.existsSync(path.join(dist, 'images', 'canvas', base))) {
				problems.push(`${rel} -> ${src}（产物中不存在，会上线 404）`);
			}
		}
	}
}

if (problems.length) {
	console.error(`[check-localized-images] 发现 ${problems.length} 处本地化图片引用问题：`);
	for (const p of problems) console.error('  -> ' + p);
	process.exit(1);
}
console.log(
	`[check-localized-images] OK：${pages.length} 个页面共 ${checked} 处 canvas 图片引用，` +
	'非默认语言页面均已指向对应语言版本（共享图白名单除外）'
);
