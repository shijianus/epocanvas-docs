import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { checkReleaseNotes } from './verify-release.mjs';
import { assertPreviewBuild, assertPreviewSource, runPreview } from './pages-preview.mjs';

test('release notes identify exactly the package version', () => {
  assert.equal(checkReleaseNotes('# EpoCanvas Docs v1.3.2-beta.1\n\nCandidate', '1.3.2-beta.1').prerelease, true);
  assert.equal(checkReleaseNotes('# EpoCanvas Docs v1.3.2\n', '1.3.2').prerelease, false);
  assert.throws(() => checkReleaseNotes('# EpoCanvas Docs v1.3.1\nCandidate', '1.3.2-beta.1'));
  assert.throws(() => checkReleaseNotes('# EpoCanvas Docs v1.3.2-beta.1\n', '1.3.2-beta.1'));
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  checkReleaseNotes(fs.readFileSync(new URL('../RELEASE_NOTES.md', import.meta.url), 'utf8'), pkg.version);
});

test('preview source checks do not require stale build output', () => {
  const { metadata, ...source } = {
    branch: 'fix/candidate', upstream: 'origin/fix/candidate', commit: 'a'.repeat(40), remoteCommit: 'a'.repeat(40),
    version: '1.3.2-beta.1', dirty: false, productionBranch: 'main',
    metadata: { commit: 'old', version: 'old', dirty: true },
  };
  assert.doesNotThrow(() => assertPreviewSource(source));
  assert.throws(() => assertPreviewBuild({ ...source, metadata }));
});

test('preview deploy verifies, rereads source and metadata, then deploys', async () => {
  const source = { branch: 'fix/candidate', upstream: 'origin/fix/candidate', commit: 'a'.repeat(40), remoteCommit: 'a'.repeat(40), dirty: false };
  const calls = [];
  await runPreview({
    mode: 'deploy', version: '1.3.2-beta.1',
    readSource: async () => { calls.push('source'); return { ...source }; },
    readProject: async () => { calls.push('project'); return { name: 'test', productionBranch: 'main' }; },
    verify: async () => { calls.push('verify'); },
    readMetadata: async () => { calls.push('metadata'); return { commit: source.commit, version: '1.3.2-beta.1', dirty: false }; },
    deploy: async () => { calls.push('deploy'); },
  });
  assert.deepEqual(calls, ['source', 'project', 'verify', 'source', 'project', 'metadata', 'deploy']);
});

test('preview deploy refuses to upload after verify leaves dirty files', async () => {
  const source = { branch: 'fix/candidate', upstream: 'origin/fix/candidate', commit: 'a'.repeat(40), remoteCommit: 'a'.repeat(40), dirty: false };
  let reads = 0;
  let uploaded = false;
  await assert.rejects(runPreview({
    mode: 'deploy', version: '1.3.2-beta.1',
    readSource: async () => ({ ...source, dirty: ++reads > 1 }),
    readProject: async () => ({ name: 'test', productionBranch: 'main' }),
    verify: async () => {},
    readMetadata: async () => ({ commit: source.commit, version: '1.3.2-beta.1', dirty: false }),
    deploy: async () => { uploaded = true; },
  }), /工作树发生变化/);
  assert.equal(uploaded, false);
});

test('preview check does not read or validate build metadata', async () => {
  const calls = [];
  await runPreview({
    mode: 'check', version: '1.3.2-beta.1',
    readSource: async () => ({ branch: 'fix/candidate', upstream: 'origin/fix/candidate', commit: 'a'.repeat(40), remoteCommit: 'a'.repeat(40), dirty: false }),
    readProject: async () => ({ name: 'test', productionBranch: 'main' }),
    verify: async () => { calls.push('verify'); },
    readMetadata: async () => { calls.push('metadata'); },
    deploy: async () => { calls.push('deploy'); },
  });
  assert.deepEqual(calls, []);
});

test('preview deploy rejects production, unpushed, dirty or stale output', () => {
  const base = { branch: 'fix/candidate', upstream: 'origin/fix/candidate', commit: 'a'.repeat(40), remoteCommit: 'a'.repeat(40), version: '1.3.2-beta.1', dirty: false, productionBranch: 'main', metadata: { commit: 'a'.repeat(40), version: '1.3.2-beta.1', dirty: false } };
  assert.doesNotThrow(() => assertPreviewBuild(base));
  for (const change of [
    { dirty: true }, { branch: 'main' }, { productionBranch: 'beta-preview' },
    { remoteCommit: 'b'.repeat(40) }, { version: '1.3.2' },
    { metadata: { ...base.metadata, dirty: true } },
    { metadata: { ...base.metadata, commit: 'b'.repeat(40) } },
    { metadata: { ...base.metadata, version: '1.3.1' } },
    { upstream: 'other/fix/candidate' },
  ]) assert.throws(() => assertPreviewBuild({ ...base, ...change }));
});
