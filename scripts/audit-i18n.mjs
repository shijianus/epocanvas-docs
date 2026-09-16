import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'src/content/docs');
const locales = ['zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
const LATIN = ['en', 'es', 'fr', 'de', 'pt', 'ru'];
const CJKish = ['zh-tw', 'ja', 'ko'];

const ROOT_PAGES = fs.readdirSync(path.join(docsDir, 'canvas')).filter((f) => f.endsWith('.md')).sort();
function pages(loc) {
	return fs.readdirSync(path.join(docsDir, loc, 'canvas')).filter((f) => f.endsWith('.md')).sort();
}
function read(loc, f) {
	const base = loc === 'canvas' ? path.join(docsDir, 'canvas', f) : path.join(docsDir, loc, 'canvas', f);
	return fs.readFileSync(base, 'utf8');
}
function front(txt) {
	const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return null;
	const out = {};
	for (const line of m[1].split('\n')) {
		const kv = line.replace(/\r$/, '').match(/^([A-Za-z_-]+):\s*(.*)$/);
		if (kv) out[kv[1]] = kv[2];
	}
	return out;
}

const cjk = /[\u4e00-\u9fff\u3400-\u4dbf]/;

// 正文检查前先剥离不参与最终文案的部分：围栏代码块、行内代码、frontmatter。
// 代码示例里的中文（默认配置值、注释）和行内代码里的占位符都不是翻译遗漏。
function stripCode(txt) {
	return txt
		.replace(/^---\r?\n[\s\S]*?\r?\n---/, '') // frontmatter
		.replace(/```[\s\S]*?(?:```|$)/g, '') // fenced code blocks
		.replace(/`[^`\n]*`/g, ''); // inline code spans
}

// 合法包含 CJK 的正文行：语言名表格行（专名不翻译）与描述本地化截图的图注。
const LANG_TABLE = /^\|?\s*(简体中文|繁體中文|日本語|한국어|English|Español|Français|Deutsch|Русский|Português)/;
const FIGURE_CAPTION = /^\*(?:Figure|Abbildung|Figura|Рисунок|图示|圖示|图注)[.:：\s]/;

// ---- 1. CJK leftover in latin/cyrillic locales (prose only) ----
let issues1 = 0;
// 正文页与各语言首页（index.mdx）都纳入检查，避免只扫 canvas/ 目录留下盲区
for (const loc of LATIN) {
	const checkFile = (relPath, label) => {
		const lines = stripCode(fs.readFileSync(path.join(docsDir, loc, relPath), 'utf8')).split('\n');
		lines.forEach((line, i) => {
			if (!cjk.test(line)) return;
			if (LANG_TABLE.test(line.trim()) || FIGURE_CAPTION.test(line.trim())) return;
			issues1++;
			if (issues1 <= 40) console.log(`[CJK-in-${loc}] ${label}:${i + 1}: ${line.trim().slice(0, 110)}`);
		});
	};
	for (const f of pages(loc)) checkFile(`canvas/${f}`, `${loc}/canvas/${f}`);
	if (fs.existsSync(path.join(docsDir, loc, 'index.mdx'))) checkFile('index.mdx', `${loc}/index.mdx`);
}
console.log(`1) CJK leftovers in latin locales (prose lines, code excluded): ${issues1}`);

// ---- 2. zh-TW terms inside root zh-CN ----
// 与第 1 节一致先剥离代码块，避免代码示例里的繁体用词被误报。
let twIssues = 0;
// 根首页 index.mdx 与 canvas/ 正文一起检查，避免审计盲区
const rootZhFiles = ['index.mdx', ...fs.readdirSync(path.join(docsDir, 'canvas')).filter((f) => f.endsWith('.md'))];
for (const f of rootZhFiles) {
	const full = f === 'index.mdx' ? path.join(docsDir, 'index.mdx') : path.join(docsDir, 'canvas', f);
	const lines = stripCode(fs.readFileSync(full, 'utf8')).split('\n');
	lines.forEach((line, i) => {
		for (const t of ['专案', '點擊', '資訊', '網路', '軟體', '預設', '支援', '伺服器', '檔案', '程式', '設定', '搜尋', '影片', '記憶體', '滑鼠']) {
			if (line.includes(t)) {
				twIssues++;
				if (twIssues <= 30) console.log(`[TW-in-zh-CN] ${f}:${i + 1}: "${t}" ${line.trim().slice(0, 90)}`);
			}
		}
	});
}
console.log(`2) Taiwan-style terms in root zh-CN: ${twIssues}`);

// ---- 3. frontmatter parity: keys + title/slug ----
console.log('\n3) frontmatter parity per page:');
let fmIssues = 0;
for (const f of ROOT_PAGES) {
	const rf = front(read('canvas', f));
	const rootKeys = Object.keys(rf || {}).sort().join(',');
	const rows = [];
	for (const loc of locales) {
		const lf = front(read(loc, f));
		if (!lf) { rows.push(`${loc}:NO-FM`); continue; }
		const lk = Object.keys(lf).sort().join(',');
		if (lk !== rootKeys) rows.push(`${loc}:KEYS(${lk})`);
		else {
			const t = lf.title || '';
			if (LATIN.includes(loc) && cjk.test(t)) rows.push(`${loc}:title-is-CJK!`);
		}
	}
	if (rows.length) fmIssues += rows.length;
	const desc = (rf && rf.description ? rf.description : '').slice(0, 24);
	console.log(`  ${f.padEnd(20)} root-title="${((rf && rf.title) || '').slice(0, 20).padEnd(22)} ${rows.length ? 'ISSUES: ' + rows.join(' ') : 'OK'}`);
}

// ---- 4. image references outside code: exist? ----
// 注意：教程里作为示例展示的占位路径（xxx.png、your-pic.png）都写在代码里，剥离后不会再误报。
console.log('\n4) missing image files (prose only):');const imgRe = /!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g;
let imgMissing = 0;
const allLocs = ['canvas', ...locales];
for (const loc of allLocs) {
	for (const f of ROOT_PAGES) {
		const p = loc === 'canvas' ? path.join(docsDir, 'canvas', f) : path.join(docsDir, loc, 'canvas', f);
		if (!fs.existsSync(p)) continue;
		const txt = stripCode(fs.readFileSync(p, 'utf8'));
		let m;
		while ((m = imgRe.exec(txt))) {
			const src = m[1];
			const pub = path.join(root, 'public', src);
			if (!fs.existsSync(pub)) {
				imgMissing++;
				console.log(`  MISSING: ${loc}/canvas/${f} -> ${src}`);
			}
		}
	}
}
console.log(`   -> ${imgMissing} missing`);

// ---- 5. per-locale vs root: heading & code-fence alignment ----
// 字节长度比在中文与拉丁文之间天然差 2-3 倍，不作为对齐依据。
console.log('\n5) structural alignment (headings / code fences vs root):');
let structIssues = 0;
for (const loc of locales) {
	const bad = [];
	for (const f of ROOT_PAGES) {
		const rootTxt = read('canvas', f);
		const locTxt = read(loc, f);
		const h = (s) => (s.match(/^#{2,4} /gm) || []).length;
		const codeFences = (s) => (s.match(/^```/gm) || []).length;
		const dh = h(locTxt) - h(rootTxt);
		const dcf = codeFences(locTxt) - codeFences(rootTxt);
		if (dh !== 0 || dcf !== 0) {
			bad.push(`${f}(h${dh >= 0 ? '+' : ''}${dh} fences${dcf >= 0 ? '+' : ''}${dcf})`);
		}
	}
	if (bad.length) structIssues += bad.length;
	console.log(`  ${loc}: ${bad.length === 0 ? 'all pages structurally aligned' : bad.join(' ')}`);
}

// ---- 6. index.mdx parity ----
console.log('\n6) index.mdx per locale:');
let mdxIssues = 0;
for (const loc of locales) {
	const p = path.join(docsDir, loc, 'index.mdx');
	const exists = fs.existsSync(p);
	if (!exists) mdxIssues++;
	console.log(`  ${loc}: ${exists ? fs.statSync(p).size + 'B' : 'MISSING'}`);
}

// 任何一节发现问题都以非零码退出，供 CI（build.yml）作为质量门使用
const totalIssues = issues1 + twIssues + fmIssues + imgMissing + structIssues + mdxIssues;
if (totalIssues > 0) {
	console.error(`\ni18n audit FAILED: ${totalIssues} issue(s)`);
	process.exit(1);
}
console.log('\ni18n audit OK');
