// 图表文本本地化的纯函数实现。生成器与契约测试共用同一份逻辑，
// 这样测试比较的是“当前源图 + 当前词典”的完整输出，而不只是文字节点。
export function widthUnits(s) {
	let u = 0;
	for (const ch of s) u += /[\u2e80-\ua4cf\uf900-\ufaff\ufe30-\ufe4f\uff01-\uff60\u3000-\u303f]|[\u{20000}-\u{2ffff}]/u.test(ch) ? 1 : 0.55;
	return u;
}

export function escapeXml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 译文字面变宽时按比例缩小该节点的 font-size（下限 0.62），避免溢出图框。
export function fitFontSize(attrs, original, translated) {
	const m = attrs.match(/font-size="([\d.]+)"/);
	if (!m) return attrs;
	const fs = parseFloat(m[1]);
	const estOrig = widthUnits(original) * fs;
	const estNew = widthUnits(translated) * fs;
	if (estNew <= estOrig * 1.03) return attrs;
	const scaled = Math.max(fs * 0.62, Math.floor((fs * estOrig) / estNew * 10) / 10);
	return attrs.replace(/font-size="[\d.]+"/, `font-size="${scaled}"`);
}

/**
 * 把一张中文 SVG 按词典转换成目标语言版本。
 * 返回当前 SVG 中出现的中文键（含缺译键）和缺译列表，供生成器报告使用。
 */
export function localizeDiagram(svg, dict) {
	const usedKeys = [];
	const missed = [];
	const out = svg.replace(/<text([^>]*)>([\s\S]*?)<\/text>/g, (full, attrs, inner) => {
		const raw = inner.replace(/<[^>]+>/g, '').trim();
		if (!raw || !/[\u4e00-\u9fff]/.test(raw)) return full;
		usedKeys.push(raw);
		const tr = dict[raw];
		if (!tr) { missed.push(raw); return full; }
		let formattedTr = escapeXml(tr);
		const tspanMatch = /<tspan([^>]*)>([\s\S]*?)<\/tspan>/.exec(inner);
		if (tspanMatch) {
			const tspanAttrs = tspanMatch[1];
			const parts = tr.split(' / ');
			if (parts.length > 1) {
				const last = parts.pop();
				formattedTr = escapeXml(parts.join(' / ') + ' / ') + `<tspan${tspanAttrs}>${escapeXml(last)}</tspan>`;
			}
		}
		return `<text${fitFontSize(attrs, raw, tr)}>${formattedTr}</text>`;
	});
	return { svg: out, usedKeys, missed };
}
