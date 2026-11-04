// 按语言生成架构图本地化版本。
// 用法：node scripts/generate-diagram-locales.mjs
// 输入：public/images/canvas/docs-*.svg（中文原图）+ scripts/diagram-i18n/<lang>.mjs 翻译表
// 输出：public/images/canvas/<locale>/<同名>.svg（en/ja/ko/es/fr/de/ru/pt/zh-tw）
// 缺译的节点自动保留中文原文，并在报告中列出，不会产出半翻译的空图。
import fs from 'node:fs';
import path from 'node:path';
import { localizeDiagram } from './diagram-render.mjs';

// 以 public/images/canvas/docs-*.svg 为唯一清单：新增图表只需放入中文源图和翻译表，
// 不必再到本文件、契约测试和说明表各维护一份名单。
const DIAGRAMS = fs.readdirSync(path.join('public', 'images', 'canvas'))
	.filter((name) => /^docs-.*\.svg$/.test(name))
	.map((name) => path.basename(name, '.svg'))
	.sort();
if (!DIAGRAMS.length) throw new Error('public/images/canvas 下没有找到 docs-*.svg 源图。');
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

// 估算显示宽度与字号缩放逻辑集中在 diagram-render.mjs，生成器和契约测试共用。
const usedKeys = new Set();
let totalMissing = 0;

for (const name of DIAGRAMS) {
	const srcPath = path.join('public/images/canvas', `${name}.svg`);
	const svg = fs.readFileSync(srcPath, 'utf8');

	for (const [locale, dict] of LOCALES) {
		const outDir = path.join('public/images/canvas', locale);
		fs.mkdirSync(outDir, { recursive: true });
		const { svg: out, usedKeys: keys, missed } = localizeDiagram(svg, dict);
		keys.forEach((key) => usedKeys.add(key));
		fs.writeFileSync(path.join(outDir, `${name}.svg`), out, 'utf8');
		totalMissing += missed.length;
		if (missed.length) {
			console.log(`[${locale}] ${name}: ${keys.length - missed.length} 翻译, ${missed.length} 缺失（保留中文）`);
			missed.slice(0, 6).forEach((k) => console.log('   MISS ' + JSON.stringify(k.slice(0, 44))));
		} else {
			console.log(`[${locale}] ${name}: ${keys.length}/${keys.length} 全部翻译`);
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
