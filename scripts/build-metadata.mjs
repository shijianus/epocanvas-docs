import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
}

export default function buildMetadata() {
  return {
    name: 'epo-build-metadata',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        const metadata = {
          version: pkg.version,
          commit: git('rev-parse', 'HEAD'),
          branch: git('branch', '--show-current'),
          dirty: Boolean(git('status', '--porcelain', '--untracked-files=all')),
          builtAt: new Date().toISOString(),
        };
        fs.writeFileSync(path.join(fileURLToPath(dir), 'build-info.json'), JSON.stringify(metadata, null, 2) + '\n');
      },
    },
  };
}
