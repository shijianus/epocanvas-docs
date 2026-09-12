// 控制台截图处理：裁剪标签栏、遮罩账户名、绘制编号标注
// 用法: node annotate-cf.mjs
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WORK = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(WORK, '../public/images/canvas/deploy');

// XML 转义（标签文字可能含 & 等字符）
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 通用标注绘制：numbered circles + 可选引线
function markerSvg(markers, w, h) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`;
  for (const m of markers) {
    const { x, y, n, label, lx, ly } = m;
    if (m.box) {
      // 高亮框（限制在画布内）
      const bx = Math.max(2, Math.min(m.box[0], w - 4));
      const by = Math.max(2, Math.min(m.box[1], h - 4));
      const bw = Math.min(m.box[2], w - bx - 2);
      const bh = Math.min(m.box[3], h - by - 2);
      svg += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#2563eb" stroke-width="4" rx="8"/>`;
    }
    // 序号圆点（限制在画布内）
    const cx = Math.max(20, Math.min(x, w - 20));
    const cy = Math.max(20, Math.min(y, h - 20));
    svg += `<circle cx="${cx}" cy="${cy}" r="17" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>`;
    svg += `<text x="${cx}" y="${cy + 7}" font-size="21" fill="#ffffff" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-weight="bold">${n}</text>`;
    if (label) {
      // 标签底板：默认在圆点右侧，超宽则翻转到左侧
      const tw = label.length * 21 + 24;
      let lx2 = lx ?? cx + 26;
      if (lx2 + tw > w - 6) lx2 = cx - 26 - tw;
      if (lx2 < 6) lx2 = 6;
      const ly2 = Math.max(4, Math.min(ly ?? cy - 14, h - 40));
      svg += `<rect x="${lx2}" y="${ly2}" width="${tw}" height="34" rx="8" fill="#2563eb" opacity="0.92"/>`;
      svg += `<text x="${lx2 + 12}" y="${ly2 + 24}" font-size="19" fill="#ffffff" font-family="Microsoft YaHei, sans-serif">${esc(label)}</text>`;
    }
  }
  svg += '</svg>';
  return Buffer.from(svg);
}

// 遮罩：纯色圆角矩形
function maskSvg(rects, w, h) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`;
  for (const r of rects) {
    svg += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6" fill="${r.color || '#0b0f19'}"/>`;
    if (r.text) {
      svg += `<text x="${r.x + 14}" y="${r.y + 26}" font-size="19" fill="#64748b" font-family="Microsoft YaHei, sans-serif">${r.text}</text>`;
    }
  }
  svg += '</svg>';
  return Buffer.from(svg);
}

async function processImage({ src, out, crop, masks = [], markers = [], resizeWidth }) {
  const meta = await sharp(src).metadata();
  let img = sharp(src);
  if (crop) {
    img = img.extract({ left: crop.x, top: crop.y, width: crop.w, height: crop.h });
  } else {
    img = img.extract({ left: 0, top: 0, width: meta.width, height: meta.height });
  }
  const cw = crop ? crop.w : meta.width;
  const ch = crop ? crop.h : meta.height;
  // 坐标系换算到裁剪后
  const ox = crop ? -crop.x : 0;
  const oy = crop ? -crop.y : 0;
  const masks2 = masks.map(m => ({ ...m, x: m.x + ox, y: m.y + oy }));
  const markers2 = markers.map(m => ({ ...m, x: m.x + ox, y: m.y + oy, box: m.box ? m.box.map((v, i) => (i % 2 === 0 ? v + ox : v + oy)) : undefined }));
  let base = await img.toBuffer();
  if (masks2.length) base = await sharp(base).composite([{ input: maskSvg(masks2, cw, ch), top: 0, left: 0 }]).png().toBuffer();
  if (markers2.length) base = await sharp(base).composite([{ input: markerSvg(markers2, cw, ch), top: 0, left: 0 }]).png().toBuffer();
  let final = sharp(base);
  if (resizeWidth && resizeWidth < cw) final = final.resize({ width: resizeWidth });
  await final.png({ quality: 90 }).toFile(out);
  return out;
}

const jobs = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(WORK, process.argv[2] || 'jobs.json'), 'utf-8'));
for (const j of jobs) {
  const out = await processImage(j);
  console.log('done:', path.basename(out));
}
