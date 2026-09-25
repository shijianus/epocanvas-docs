// 一次性校验脚本：检查所有语言文档里的锚点链接是否指向真实标题。
// 规则：与 github-slugger 相同的 slug 算法（小写、去标点、空格转连字符、重复标题加 -1）。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'src/content/docs';
const LOCALES = ['', 'zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];

function slugify(text) {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\p{M}\s_\-]/gu, '')
		.replace(/ /g, '-');
}

// 提取非代码块内的标题与链接，返回 { headings: [{depth,text}], links: [{href, line}] }
function parseMarkdown(md) {
	const headings = [];
	const links = [];
	const lines = md.split(/\r?\n/);
	let fenceChar = null;
	let fenceLen = 0;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
		if (fenceMatch) {
			const marker = fenceMatch[1];
			if (fenceChar === null) {
				fenceChar = marker[0];
				fenceLen = marker.length;
				continue;
			}
			if (marker[0] === fenceChar && marker.length >= fenceLen) {
				fenceChar = null;
				fenceLen = 0;
				continue;
			}
		}
		if (fenceChar !== null) continue;
		const h = line.match(/^(#{1,6})\s+(.*)$/);
		if (h) {
			// 去掉标题尾部多余的 # 与行内格式
			let text = h[2].replace(/\s+#+\s*$/, '');
			text = text.replace(/`([^`]*)`/g, '$1').replace(/\*\*?([^*]*)\*\*?/g, '$1');
			headings.push({ depth: h[1].length, text, line: i + 1 });
		}
		const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
		let m;
		while ((m = linkRe.exec(line))) {
			links.push({ text: m[1], href: m[2].trim(), line: i + 1 });
		}
	}
	return { headings, links };
}

function slugSet(headings) {
	const map = new Map();
	const seen = new Map();
	for (const h of headings) {
		let s = slugify(h.text);
		if (seen.has(s)) {
			const n = seen.get(s);
			seen.set(s, n + 1);
			s = `${s}-${n}`;
		} else {
			seen.set(s, 1);
		}
		map.set(s, h.line);
	}
	return map;
}

function fileFor(locale, linkPath) {
	// linkPath 形如 /canvas/deployment/ 或 /en/canvas/i18n/
	let p = linkPath.replace(/^\//, '').replace(/\/$/, '');
	// 跨语言链接：映射到本 locale 目录下同路径文件
	const first = p.split('/')[0];
	if (LOCALES.includes(first)) p = p.slice(first.length + 1);
	const base = locale ? `${locale}/${p}` : p;
	for (const ext of ['.md', '.mdx']) {
		const f = path.join(ROOT, base + ext);
		if (fs.existsSync(f)) return f;
	}
	return null;
}

const problems = [];
for (const locale of LOCALES) {
	const dir = locale ? path.join(ROOT, locale) : ROOT;
	const files = [];
	const walk = (d, top) => {
		for (const e of fs.readdirSync(d, { withFileTypes: true })) {
			const f = path.join(d, e.name);
			if (e.isDirectory()) {
				// 根目录扫描时跳过各语言子目录，避免同一文件被扫描两次产生误报
				if (top && LOCALES.slice(1).includes(e.name)) continue;
				walk(f, false);
			} else if (/\.(md|mdx)$/.test(e.name)) files.push(f);
		}
	};
	walk(dir, true);
	for (const file of files) {
		const md = fs.readFileSync(file, 'utf8');
		const { links } = parseMarkdown(md);
		for (const link of links) {
			if (link.href.startsWith('http') || link.href.startsWith('mailto:')) continue;
			const hashIdx = link.href.indexOf('#');
			if (hashIdx === -1) continue;
			const target = link.href.slice(hashIdx + 1);
			const pathPart = link.href.slice(0, hashIdx);
			let targetFile = file;
			if (pathPart) {
				// 跨页链接（绝对或相对路径）
				if (!pathPart.startsWith('/')) continue; // 相对路径链接（如图片）不在本次检查范围
				targetFile = fileFor(locale, pathPart);
				if (!targetFile) {
					problems.push({ file, line: link.line, type: '目标页面不存在', href: link.href });
					continue;
				}
			}
			const targetMd = fs.readFileSync(targetFile, 'utf8');
			const targetSlugs = slugSet(parseMarkdown(targetMd).headings);
			if (!targetSlugs.has(target)) {
				problems.push({ file, line: link.line, type: '锚点不存在', href: link.href });
			}
		}
	}
}

if (problems.length === 0) {
	console.log('OK: 所有锚点均能命中');
	process.exit(0);
} else {
	const byType = {};
	for (const p of problems) {
		byType[p.type] = (byType[p.type] || 0) + 1;
		console.log(`[${p.type}] ${p.file}:${p.line} -> ${p.href}`);
	}
	console.log('\n汇总:', JSON.stringify(byType));
	// 非零码退出，供 CI（build.yml）作为质量门使用
	process.exit(1);
}
