// 按语言生成架构图本地化版本。
// 用法：node scripts/generate-diagram-locales.mjs
// 输入：public/images/canvas/docs-*.svg（中文原图）+ scripts/diagram-i18n/<lang>.mjs 翻译表
// 输出：public/images/canvas/<locale>/<同名>.svg（en/ja/ko/es/fr/de/ru/pt/zh-tw）
// 缺译的节点自动保留中文原文，并在报告中列出，不会产出半翻译的空图。
import fs from 'node:fs';
import path from 'node:path';

const DIAGRAMS = [
	'docs-architecture',
	'docs-deploy-compare',
	'docs-i18n-workflow',
	'docs-layout-3tier',
	'docs-render-pipeline',
	'docs-search-flow',
];
const LOCALES = [
	['zh-tw', (await import('./diagram-i18n/zh-tw.mjs')).default],
	['en', (await import('./diagram-i18n/en.mjs')).default],
	['ja', (await import('./diagram-i18n/ja.mjs')).default],
	['ko', (await import('./diagram-i18n/ko.mjs')).default],
	['es', (await import('./diagram-i18n/es.mjs')).default],
	['fr', (await import('./diagram-i18n/fr.mjs')).default],
	['de', (await import('./diagram-i18n/de.mjs')).default],
	['ru', (await import('./diagram-i18n/ru.mjs')).default],
	['pt', (await import('./diagram-i18n/pt.mjs')).default],
];

// 估算显示宽度：CJK 全角记 1，半角记 0.55，用于字号自适应。
function widthUnits(s) {
	let u = 0;
	for (const ch of s) u += /[\u2e80-\ua4cf\uf900-\ufaff\ufe30-\ufe4f\uff01-\uff60\u3000-\u303f]|[\u{20000}-\u{2ffff}]/u.test(ch) ? 1 : 0.55;
	return u;
}

function escapeXml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 译文字面变宽时按比例缩小该节点的 font-size（下限 0.62），避免溢出图框。
function fitFontSize(attrs, original, translated) {
	const m = attrs.match(/font-size="([\d.]+)"/);
	if (!m) return attrs;
	const fs = parseFloat(m[1]);
	const estOrig = widthUnits(original) * fs;
	const estNew = widthUnits(translated) * fs;
	if (estNew <= estOrig * 1.03) return attrs;
	const scaled = Math.max(fs * 0.62, Math.floor((fs * estOrig) / estNew * 10) / 10);
	return attrs.replace(/font-size="[\d.]+"/, `font-size="${scaled}"`);
}

const usedKeys = new Set();
let totalMissing = 0;

for (const name of DIAGRAMS) {
	const srcPath = path.join('public/images/canvas', `${name}.svg`);
	const svg = fs.readFileSync(srcPath, 'utf8');

	for (const [locale, dict] of LOCALES) {
		const outDir = path.join('public/images/canvas', locale);
		fs.mkdirSync(outDir, { recursive: true });
		let matched = 0;
		const missed = [];
		const out = svg.replace(/<text([^>]*)>([\s\S]*?)<\/text>/g, (full, attrs, inner) => {
			const raw = inner.replace(/<[^>]+>/g, '').trim();
			if (!raw || !/[\u4e00-\u9fff]/.test(raw)) return full;
			usedKeys.add(raw);
			const tr = dict[raw];
			if (!tr) { missed.push(raw); return full; }
			matched++;
			return `<text${fitFontSize(attrs, raw, tr)}>${escapeXml(tr)}</text>`;
		});
		fs.writeFileSync(path.join(outDir, `${name}.svg`), out, 'utf8');
		totalMissing += missed.length;
		if (missed.length) {
			console.log(`[${locale}] ${name}: ${matched} 翻译, ${missed.length} 缺失（保留中文）`);
			missed.slice(0, 6).forEach((k) => console.log('   MISS ' + JSON.stringify(k.slice(0, 44))));
		} else {
			console.log(`[${locale}] ${name}: ${matched}/${matched} 全部翻译`);
		}
	}
}

// 报告字典里写了但图中不存在的键（多为笔误）
const unused = [...LOCALES].flatMap(([loc, dict]) =>
	Object.keys(dict).filter((k) => !usedKeys.has(k)).map((k) => `[${loc}] ${k.slice(0, 40)}`)
);
console.log(`\n未命中的字典键: ${unused.length}`);
unused.forEach((u) => console.log('  UNUSED ' + u));
console.log(`节点缺译总数: ${totalMissing}`);
