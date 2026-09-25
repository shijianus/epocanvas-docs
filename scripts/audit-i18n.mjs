import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'src/content/docs');
const locales = ['zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
const LATIN = ['en', 'es', 'fr', 'de', 'pt', 'ru'];

function rootPages() {
	return fs.readdirSync(path.join(docsDir, 'canvas')).filter((f) => f.endsWith('.md')).sort();
}
function pages(loc) {
	const dir = path.join(docsDir, loc, 'canvas');
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
}
function pathOf(loc, f) {
	return loc === 'canvas' ? path.join(docsDir, 'canvas', f) : path.join(docsDir, loc, 'canvas', f);
}
function hasPage(loc, f) {
	return fs.existsSync(pathOf(loc, f));
}
function read(loc, f) {
	return fs.readFileSync(pathOf(loc, f), 'utf8');
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
//
// 必须按行扫描并记住「当前围栏的标记长度」，不能用跨行正则去配 ``` ：
// Markdown 演示嵌套代码块时按规范要用四个（或更多）反引号包裹，
// 此时文件里 ``` 字面量的出现次数会变成奇数，跨行正则两两配对后剩下一个，
// 它的 |$ 分支会把从这个位置到文件结尾的全部内容当成代码剥掉——
// 那部分是货真价实的正文，于是未翻译中文和坏图片引用都会从这里静默漏检。
function stripCode(txt) {
	const lines = txt.split(/\r?\n/);
	if (lines[0] === '---') {
		for (let i = 1; i < lines.length; i++) {
			if (lines[i] === '---') { lines.splice(0, i + 1); break; }
		}
	}
	const out = [];
	let fenceChar = null;
	let fenceLen = 0;
	for (const line of lines) {
		const m = /^ {0,3}(`{3,}|~{3,})/.exec(line);
		if (m) {
			const marker = m[1];
			if (fenceChar === null) { fenceChar = marker[0]; fenceLen = marker.length; continue; }
			// CommonMark：闭合围栏须与起始围栏同种字符且不更短
			if (marker[0] === fenceChar && marker.length >= fenceLen) { fenceChar = null; fenceLen = 0; continue; }
		}
		if (fenceChar === null) out.push(line);
	}
	// 未闭合的围栏不吞尾部：宁可多检不可漏检，交给下面的告警显式暴露
	return out.join('\n').replace(/`[^`\n]*`/g, '');
}

// 每个文件的围栏行数必须为偶数，否则说明有一处代码块忘了闭合，
// 剥离结果不可信，直接判为审计失败。
function unbalancedFences(loc, f) {
	const txt = read(loc, f);
	const n = (txt.match(/^ {0,3}(`{3,}|~{3,})/gm) || []).length;
	return n % 2 !== 0 ? n : 0;
}

// 合法包含 CJK 的正文行：语言名表格行（专名不翻译）与描述本地化截图的图注。
const LANG_TABLE = /^\|?\s*(简体中文|繁體中文|日本語|한국어|English|Español|Français|Deutsch|Русский|Português)/;
const FIGURE_CAPTION = /^\*(?:Figure|Abbildung|Figura|Рисунок|图示|圖示|图注)[.:：\s]/;

// ---- 0. 页面清单对齐：缺译 / 多页 / 围栏未闭合 ----
// 这一节必须存在，否则后面所有以「根语言页面清单」为基准的比对都会把
// 「某语言缺一份文件」读成 ENOENT 崩溃（诊断不可读），或干脆 continue 跳过（静默漏检）。
// 缺译后果不只是少一个页面：Starlight 会用默认语言内容兜底生成该路由，
// 于是产出一张 lang/og:locale/hreflang 都声明为目标语言、正文却是中文的页面。
const ROOT_PAGES = rootPages();
console.log('0) 页面清单对齐（以简体中文根目录为基准）:');
let parityIssues = 0;
for (const loc of locales) {
	const locSet = new Set(pages(loc));
	const rootSet = new Set(ROOT_PAGES);
	const missing = ROOT_PAGES.filter((f) => !locSet.has(f));
	const extra = [...locSet].filter((f) => !rootSet.has(f));
	for (const f of missing) { parityIssues++; console.log(`  [缺译] ${loc}/canvas/${f}  → 构建后会生成 lang=${loc} 但正文为简体中文的页面`); }
	for (const f of extra) { parityIssues++; console.log(`  [多余页] ${loc}/canvas/${f}  → 根语言无此页，hreflang 集群会指向不存在的 URL`); }
	const rootIdx = path.join(docsDir, 'index.mdx');
	const locIdx = path.join(docsDir, loc, 'index.mdx');
	if (fs.existsSync(rootIdx) && !fs.existsSync(locIdx)) { parityIssues++; console.log(`  [缺译] ${loc}/index.mdx`); }
	if (!fs.existsSync(rootIdx) && fs.existsSync(locIdx)) { parityIssues++; console.log(`  [多余页] ${loc}/index.mdx`); }
	if (!missing.length && !extra.length) console.log(`  ${loc}: 17 篇正文 + 首页，与根目录一致`);
}
let fenceIssues = 0;
for (const loc of ['canvas', ...locales]) {
	const list = loc === 'canvas' ? ROOT_PAGES : pages(loc);
	for (const f of list) {
		if (!hasPage(loc, f)) continue;
		const n = unbalancedFences(loc, f);
		if (n) { fenceIssues++; console.log(`  [围栏未闭合] ${loc}/canvas/${f}: 围栏行数=${n}（奇数），代码块剥离结果不可信`); }
	}
}
if (!fenceIssues) console.log('  全部 180 篇文档围栏行数均为偶数，代码块剥离可靠');
console.log(`0) 缺译/多页: ${parityIssues}   围栏不闭合: ${fenceIssues}`);

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
		if (!hasPage(loc, f)) { rows.push(`${loc}:NO-FILE`); continue; }
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
		console.log(`  ${f.padEnd(20)} root-title="${((rf && rf.title) || '').slice(0, 20).padEnd(22)} ${rows.length ? 'ISSUES: ' + rows.join(' ') : 'OK'}`);
}

// ---- 4. image references outside code: exist? ----
// 注意：教程里作为示例展示的占位路径（xxx.png、your-pic.png）都写在代码里，剥离后不会再误报。
console.log('\n4) missing image files (prose only):');const imgRe = /!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g;
let imgMissing = 0;
// 逐语言用它自己的文件清单，而不是根语言清单：以根清单为基准 + 缺文件就 continue，
// 会让「只在某一语言新增的页面」整篇不参与图片检查，形成盲区。
for (const loc of ['canvas', ...locales]) {
	for (const f of loc === 'canvas' ? ROOT_PAGES : pages(loc)) {
		if (!hasPage(loc, f)) continue;
		const txt = stripCode(read(loc, f));
		let m;
		imgRe.lastIndex = 0;
		while ((m = imgRe.exec(txt))) {
			const src = m[1];
			const pub = path.join(root, 'public', src);
			if (!fs.existsSync(pub)) {
				imgMissing++;
				console.log(`  MISSING: ${loc}/canvas/${f} -> ${src}`);
			}
		}
	}
	// 首页 index.mdx 里的图片引用同样要查
	const idx = path.join(docsDir, loc === 'canvas' ? 'index.mdx' : path.join(loc, 'index.mdx'));
	if (fs.existsSync(idx)) {
		const txt = stripCode(fs.readFileSync(idx, 'utf8'));
		let m;
		imgRe.lastIndex = 0;
		while ((m = imgRe.exec(txt))) {
			if (!fs.existsSync(path.join(root, 'public', m[1]))) {
				imgMissing++;
				console.log(`  MISSING: ${loc}/index.mdx -> ${m[1]}`);
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
		if (!hasPage(loc, f)) { bad.push(`${f}(缺文件)`); continue; }
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
const totalIssues = parityIssues + fenceIssues + issues1 + twIssues + fmIssues + imgMissing + structIssues + mdxIssues;
if (totalIssues > 0) {
	console.error(`\ni18n audit FAILED: ${totalIssues} issue(s)` +
		`（缺译/多页 ${parityIssues}、围栏不闭合 ${fenceIssues}、CJK 残留 ${issues1}、` +
		`繁体用词 ${twIssues}、frontmatter ${fmIssues}、缺图 ${imgMissing}、` +
		`结构不对齐 ${structIssues}、首页缺失 ${mdxIssues}）`);
	process.exit(1);
}
console.log('\ni18n audit OK');
