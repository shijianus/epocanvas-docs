// 构建前缓存失效：public/images/canvas/ 的图片存在性决定 rehypeLocalizeDiagramImages
// 是否把 <img> 改写为语言版本，但 Astro 内容层（node_modules/.astro/data-store.json）
// 按 Markdown 源文件缓存渲染结果——新增/删除分语言图片不会触发重渲染，
// 导致"图片已生成、页面却仍引用中文原图"。这里对图片清单做指纹比对，
// 清单变化时清掉内容层缓存，保证构建始终基于当前图片集合。
// 指纹只含路径（不含内容哈希）：改写决策只依赖"某语言版本是否存在"，
// 原地更新图片内容不影响引用，无需失效。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const imagesDir = path.join(root, 'public', 'images', 'canvas');
const keyFile = path.join(root, 'node_modules', '.epo-img-cache-key');
// Astro 内容层缓存位置（新版在 node_modules/.astro，旧版同步目录在 .astro/）
const cacheDirs = [
	path.join(root, 'node_modules', '.astro'),
	path.join(root, '.astro'),
];

function listImages() {
	const out = [];
	if (!fs.existsSync(imagesDir)) return out;
	(function walk(rel) {
		const abs = path.join(imagesDir, rel);
		for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
			const relChild = rel ? rel + '/' + entry.name : entry.name;
			if (entry.isDirectory()) walk(relChild);
			else out.push(relChild);
		}
	})('');
	return out.sort();
}

const fingerprint = crypto
	.createHash('sha1')
	.update(listImages().join('\n'))
	.digest('hex');

const previous = fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : null;
if (previous && previous !== fingerprint) {
	let removed = false;
	for (const dir of cacheDirs) {
		if (fs.existsSync(dir)) {
			fs.rmSync(dir, { recursive: true, force: true });
			removed = true;
		}
	}
	if (removed) {
		console.log('[invalidate-render-cache] 图片清单变化，已清除 Astro 内容层缓存');
	}
}
fs.mkdirSync(path.dirname(keyFile), { recursive: true });
fs.writeFileSync(keyFile, fingerprint);
