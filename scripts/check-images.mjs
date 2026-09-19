// 图片体检：防止“空白截图”再次静默上线（2026-09 审计发现两张 5616 字节的
// 纯色空图被合成脚本覆盖进 public/images/canvas/，随构建进入了发布产物）。
// 全库正常截图最小约 62KB，未渲染完成的空白帧压缩后只有几 KB，20KB 阈值
// 两侧都有足够余量。这里只校验体积与 PNG 文件头，不做像素级检查。
import fs from 'node:fs';
import path from 'node:path';

const IMAGES_DIR = path.join(process.cwd(), 'public/images');
const MIN_BYTES = 20 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const files = [];
(function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const abs = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(abs);
		else if (entry.name.toLowerCase().endsWith('.png')) files.push(abs);
	}
})(IMAGES_DIR);

const bad = [];
for (const file of files) {
	const size = fs.statSync(file).size;
	if (size < MIN_BYTES) {
		bad.push(`${file} 只有 ${size} 字节（低于 ${MIN_BYTES / 1024}KB），疑似空白截图`);
		continue;
	}
	const head = fs.readFileSync(file).subarray(0, 8);
	if (!head.equals(PNG_MAGIC)) {
		bad.push(`${file} 文件头不是合法 PNG`);
	}
}

if (bad.length) {
	console.error(`[check-images] 发现 ${bad.length} 个异常图片文件：`);
	for (const line of bad) console.error('  -> ' + line);
	process.exit(1);
}
console.log(`[check-images] OK：${files.length} 个 PNG 均大于 ${MIN_BYTES / 1024}KB 且文件头合法`);
