import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function listFiles(dir, extensions) {
	const out = [];
	if (!fs.existsSync(dir)) return out;
	(function walk(rel) {
		for (const entry of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
			const child = rel ? `${rel}/${entry.name}` : entry.name;
			if (entry.isDirectory()) walk(child);
			else if (!extensions || extensions.some((ext) => entry.name.endsWith(ext))) out.push(child);
		}
	})('');
	return out.sort();
}

function contentHash(file) {
	return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function invalidateRenderCache(root = process.cwd()) {
	const imagesDir = path.join(root, 'public', 'images', 'canvas');
	const translationsDir = path.join(root, 'node_modules', '@astrojs', 'starlight', 'translations');
	const keyFile = path.join(root, 'node_modules', '.epo-img-cache-key');
	const cacheDirs = [path.join(root, 'node_modules', '.astro'), path.join(root, '.astro')];
	const translationFiles = listFiles(translationsDir, ['.json']).map((rel) => `${rel}:${contentHash(path.join(translationsDir, rel))}`);
	const contentI18nDir = path.join(root, 'src', 'content', 'i18n');
	const customI18nFiles = listFiles(contentI18nDir, ['.json', '.yml', '.yaml']).map((rel) => `${rel}:${contentHash(path.join(contentI18nDir, rel))}`);
	const configFiles = ['src/content.config.ts', 'astro.config.mjs'].map((rel) => {
		const file = path.join(root, rel);
		return `${rel}:${fs.existsSync(file) ? contentHash(file) : 'missing'}`;
	});
	const dependencyFiles = ['package.json', 'pnpm-lock.yaml'].map((rel) => {
		const file = path.join(root, rel);
		return `${rel}:${fs.existsSync(file) ? contentHash(file) : 'missing'}`;
	});
	const fingerprint = crypto.createHash('sha1').update([
		'images:' + listFiles(imagesDir).join('\n'),
		'translations:' + translationFiles.join('\n'),
		'custom-i18n:' + customI18nFiles.join('\n'),
		'configs:' + configFiles.join('\n'),
		'dependencies:' + dependencyFiles.join('\n'),
	].join('\n')).digest('hex');
	const previous = fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : null;
	if (previous !== fingerprint) {
		let removed = false;
		for (const dir of cacheDirs) {
			if (!fs.existsSync(dir)) continue;
			fs.rmSync(dir, { recursive: true, force: true });
			removed = true;
		}
		if (removed) console.log('[invalidate-render-cache] 构建输入变化或缓存指纹缺失，已清除 Astro 内容层缓存');
	}
	fs.mkdirSync(path.dirname(keyFile), { recursive: true });
	fs.writeFileSync(keyFile, fingerprint);
	return fingerprint;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	invalidateRenderCache();
}
