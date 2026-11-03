// 只读检查：--config、--tag（TAG_NAME 环境变量）、--deploy-check。
// --deploy --dry-run 只检查前置条件并打印命令，不构建、不访问发布服务。
// 真正部署仅从 --deploy 进入：检查 Git → 完整 verify → 再检查 Git → Wrangler。
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
export function supportedNodeVersion(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return false;
  const [major, minor, patch] = version.split('.').map(Number);
  return (major === 22 && (minor > 23 || (minor === 23 && patch >= 4))) || (major === 24 && minor >= 12);
}

export function releaseMetadata(tag, version) {
  const parsed = typeof version === 'string' && SEMVER.exec(version);
  if (!parsed) throw new Error('package.json version 必须是合法 SemVer。');
  if (typeof tag !== 'string' || tag !== `v${version}`) {
    throw new Error(`TAG_NAME 必须与 package.json 一致：v${version}。`);
  }
  return { tag, prerelease: Boolean(parsed[4]), latest: !parsed[4] };
}

export function checkReleaseNotes(notes, version) {
  const meta = releaseMetadata(`v${version}`, version);
  const heading = notes.split(/\r?\n/, 1)[0].trim();
  if (heading !== `# EpoCanvas Docs ${meta.tag}`) {
    throw new Error(`RELEASE_NOTES.md 标题必须为 # EpoCanvas Docs ${meta.tag}`);
  }
  if (meta.prerelease && !/candidate|prerelease|公测|候选/i.test(notes)) {
    throw new Error('预发布说明必须明确标注为候选版本。');
  }
  return meta;
}

/** 生产部署前确认 dist/build-info.json 确实来自当前干净提交，而不是旧构建或脏工作树。 */
export function assertBuildMetadata(metadata, { commit, version }) {
  if (!metadata || metadata.commit !== commit || metadata.version !== version || metadata.dirty) {
    throw new Error('dist/build-info.json 与当前提交或版本不一致，或构建时工作树不干净，拒绝部署。');
  }
}

function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    // git status 的检查不需要更新 index。
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} 失败（${result.status ?? result.signal}）${capture ? `\n${result.stderr?.trim() ?? ''}` : ''}`);
  }
  return capture ? result.stdout.trim() : '';
}

function git(...args) {
  return run('git', args, true);
}

function checkConfig() {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  checkReleaseNotes(readFileSync(path.join(ROOT, 'RELEASE_NOTES.md'), 'utf8'), pkg.version);
  if (pkg.engines?.node !== '^22.23.4 || ^24.12.0' || pkg.engines?.pnpm !== '>=10.0.0 <11.0.0') {
    throw new Error('engines 必须声明 Node ^22.23.4 || ^24.12.0 与 pnpm >=10.0.0 <11.0.0。');
  }
  if (!/^pnpm@10\.\d+\.\d+$/.test(pkg.packageManager ?? '')) {
    throw new Error('packageManager 必须固定为 pnpm@10.x.y。');
  }
  const nodeVersion = readFileSync(path.join(ROOT, '.node-version'), 'utf8').trim();
  if (!/^22\.23\.4$/.test(nodeVersion)) {
    throw new Error('.node-version 必须固定为 22.23.4。');
  }
  if (!supportedNodeVersion(process.versions.node)) {
    throw new Error(`需要 Node 22.23.4+ (22.x) 或 24.12+ (24.x)；当前为 ${process.versions.node}。`);
  }
  const pnpmVersion = process.env.npm_config_user_agent?.match(/^pnpm\/(\S+)/)?.[1];
  if (pnpmVersion && `pnpm@${pnpmVersion}` !== pkg.packageManager) {
    throw new Error(`当前 pnpm ${pnpmVersion} 与 ${pkg.packageManager} 不一致。`);
  }
  // CI 直接读取版本文件，不再维护第二份 Node / pnpm 版本数字。
  for (const name of ['build', 'release']) {
    const workflow = readFileSync(path.join(ROOT, '.github', 'workflows', `${name}.yml`), 'utf8');
    if (!/^\s*node-version-file:\s*['"]?\.node-version['"]?\s*$/m.test(workflow) || /^\s*node-version:\s*/m.test(workflow)) {
      throw new Error(`${name}.yml 必须通过 .node-version 安装 Node。`);
    }
    if (!/^\s*uses:\s*pnpm\/action-setup@/m.test(workflow) || /^\s*version:\s*/m.test(workflow)) {
      throw new Error(`${name}.yml 必须让 pnpm/action-setup 读取 packageManager，不能另写 version。`);
    }
    if (!/^\s*run:\s*pnpm run verify\s*$/m.test(workflow)) {
      throw new Error(`${name}.yml 必须运行统一的 pnpm run verify。`);
    }
  }
  console.log(`[verify-release] 配置一致：Node ${nodeVersion}+，${pkg.packageManager}，package ${pkg.version}`);
  return pkg;
}

function checkDeploy() {
  const branch = git('branch', '--show-current');
  if (branch !== 'main') throw new Error(`仅允许从 main 部署；当前为 ${branch || 'detached HEAD'}。`);
  const status = git('status', '--porcelain=v1', '--untracked-files=all');
  if (status) throw new Error(`工作区不干净，拒绝部署（包括暂存、未暂存及未跟踪文件）：\n${status}`);
  const upstream = git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}');
  if (upstream !== 'origin/main') throw new Error('main 必须跟踪 origin/main。');
  const head = git('rev-parse', 'HEAD');
  const remoteRef = git('ls-remote', '--exit-code', 'origin', 'refs/heads/main').split(/\s+/)[0];
  if (head !== remoteRef) throw new Error(`本地 HEAD ${head} 与远端 origin/main ${remoteRef} 不一致，拒绝部署。`);
  return head;
}

function checkTag(pkg) {
  const status = git('status', '--porcelain=v1', '--untracked-files=all');
  if (status) throw new Error(`工作区不干净，拒绝标签发布：\n${status}`);
  const meta = releaseMetadata(process.env.TAG_NAME, pkg.version);
  if (process.env.GITHUB_REF && process.env.GITHUB_REF !== `refs/tags/${meta.tag}`) {
    throw new Error('GITHUB_REF 与 TAG_NAME 不一致，拒绝发布。');
  }
  const head = git('rev-parse', 'HEAD');
  const tagged = git('rev-parse', '--verify', `refs/tags/${meta.tag}^{commit}`);
  if (head !== tagged) throw new Error('标签没有指向当前检出的提交，拒绝发布。');
  git('merge-base', '--is-ancestor', head, 'refs/remotes/origin/main');
  const committedPackage = JSON.parse(git('show', 'HEAD:package.json'));
  if (committedPackage.version !== pkg.version) throw new Error('工作区 package 版本与标签提交不一致。');
  console.log(`[verify-release] ${meta.tag} 与当前提交及 main 历史一致；prerelease=${meta.prerelease}，latest=${meta.latest}`);
}

function pnpm(...args) {
  // npm_execpath 由 pnpm run 提供，避免 Windows .cmd + shell 拼接，也不触发包管理器下载。
  const cli = process.env.npm_execpath;
  if (!process.env.npm_config_user_agent?.startsWith('pnpm/') || !cli || !/\.[cm]?js$/i.test(cli)) {
    throw new Error('请通过 pnpm run deploy 执行部署，以复用当前 pnpm。');
  }
  run(process.execPath, [cli, ...args]);
}

export function main(args = process.argv.slice(2)) {
  const modes = ['--config', '--tag', '--deploy-check', '--deploy'];
  const mode = args.find((arg) => modes.includes(arg));
  const dryRun = args.includes('--dry-run');
  if (!mode || args.filter((arg) => modes.includes(arg)).length !== 1 || args.some((arg) => !modes.includes(arg) && arg !== '--dry-run') || (dryRun && mode !== '--deploy')) {
    throw new Error('用法：node scripts/verify-release.mjs --config | --tag | --deploy-check | --deploy [--dry-run]');
  }
  const pkg = checkConfig();
  if (mode === '--tag') checkTag(pkg);
  if (mode === '--deploy-check' || mode === '--deploy') {
    const head = checkDeploy();
    console.log(`[verify-release] main 工作区干净：${head}`);
    if (mode === '--deploy') {
      if (dryRun) {
        console.log('[dry-run] 将运行 pnpm run verify，重新检查 main / 工作区 / HEAD，再执行 pnpm exec wrangler pages deploy dist --project-name epocanvas-docs --branch main；本次未运行检查链或发布命令。');
        return;
      }
      pnpm('run', 'verify');
      if (checkDeploy() !== head) throw new Error('验证期间 HEAD 已变化，拒绝部署，请重新运行。');
      assertBuildMetadata(
        JSON.parse(readFileSync(path.join(ROOT, 'dist', 'build-info.json'), 'utf8')),
        { commit: head, version: pkg.version },
      );
      pnpm('exec', 'wrangler', 'pages', 'deploy', 'dist', '--project-name', 'epocanvas-docs', '--branch', 'main');
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`[verify-release] ${error.message}`);
    process.exitCode = 1;
  }
}
