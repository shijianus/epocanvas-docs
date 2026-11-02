import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { invalidateRenderCache } from './invalidate-render-cache.mjs';

function fixture(run) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'epocanvas-cache-'));
	try { return run(root); }
	finally { fs.rmSync(root, { recursive: true, force: true }); }
}
function makeCache(root) {
	const cache = path.join(root, 'node_modules', '.astro');
	fs.mkdirSync(cache, { recursive: true });
	fs.writeFileSync(path.join(cache, 'data-store.json'), 'cached render');
	return path.join(cache, 'data-store.json');
}

test('missing cache key invalidates an existing Astro content cache', () => fixture((root) => {
	const cacheFile = makeCache(root);
	invalidateRenderCache(root);
	assert.equal(fs.existsSync(cacheFile), false);
}));

test('matching cache key preserves the Astro content cache', () => fixture((root) => {
	const cacheFile = makeCache(root);
	const key = invalidateRenderCache(root);
	makeCache(root);
	invalidateRenderCache(root);
	assert.equal(fs.readFileSync(cacheFile, 'utf8'), 'cached render');
	assert.equal(fs.readFileSync(path.join(root, 'node_modules', '.epo-img-cache-key'), 'utf8'), key);
}));

test('custom i18n JSON content change invalidates cached renders', () => fixture((root) => {
	const localeFile = path.join(root, 'src', 'content', 'i18n', 'en.json');
	fs.mkdirSync(path.dirname(localeFile), { recursive: true });
	fs.writeFileSync(localeFile, JSON.stringify({ 'expressiveCode.copyButtonTooltip': 'Copy' }));
	invalidateRenderCache(root);
	const cacheFile = makeCache(root);
	fs.writeFileSync(localeFile, JSON.stringify({ 'expressiveCode.copyButtonTooltip': 'Copy code' }));
	invalidateRenderCache(root);
	assert.equal(fs.existsSync(cacheFile), false);
}));
