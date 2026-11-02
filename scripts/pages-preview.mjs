import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PROJECT = 'epocanvas-docs';
const PREVIEW_BRANCH = 'beta-preview';

export function assertPreviewSource({ branch, upstream, commit, remoteCommit, version, dirty, productionBranch }) {
	if (dirty) throw new Error('预览部署要求工作区干净。');
	if (!branch || upstream !== `origin/${branch}`) throw new Error('候选必须跟踪 origin 下的同名分支。');
	if (typeof productionBranch !== 'string' || !productionBranch) throw new Error('未能确认 Pages 生产分支，拒绝上传。');
	if (branch === productionBranch || PREVIEW_BRANCH === productionBranch) throw new Error('拒绝使用生产分支发布预览。');
	if (commit !== remoteCommit) throw new Error('本地候选提交与实际远端分支不一致。');
	if (!/^\d+\.\d+\.\d+-beta\.\d+$/.test(version)) throw new Error('预览版本必须使用 X.Y.Z-beta.N 格式。');
}

export function assertPreviewBuild({ branch, upstream, commit, remoteCommit, version, metadata, dirty, productionBranch }) {
	assertPreviewSource({ branch, upstream, commit, remoteCommit, version, dirty, productionBranch });
	if (!metadata || metadata.dirty || metadata.commit !== commit || metadata.version !== version) {
		throw new Error('构建产物未对应当前干净的候选提交，请重新运行 pnpm run verify。');
	}
}

export async function runPreview({ mode, version, readSource, readProject, verify, readMetadata, deploy }) {
	const before = await readSource();
	const project = await readProject();
	assertPreviewSource({ ...before, version, productionBranch: project.productionBranch });
	console.log(`[pages-preview] ${project.name}: ${version}, ${before.commit}, preview branch ${PREVIEW_BRANCH}; production ${project.productionBranch} unchanged`);
	if (mode === 'check') {
		console.log('[pages-preview] 源分支预检通过；未检查或承诺 dist 构建产物有效。');
		return;
	}

	await verify();
	const after = await readSource();
	const currentProject = await readProject();
	if (after.branch !== before.branch || after.upstream !== before.upstream || after.commit !== before.commit || after.dirty) {
		throw new Error('验证期间候选分支、提交或工作树发生变化，拒绝上传。');
	}

	const metadata = await readMetadata();
	assertPreviewBuild({ ...after, version, metadata, productionBranch: currentProject.productionBranch });
	await deploy({ commit: before.commit, version });
}

function git(...args) {
	return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
}
async function projectInfo() {
	const token = process.env.CLOUDFLARE_API_TOKEN;
	const account = process.env.CLOUDFLARE_ACCOUNT_ID;
	if (!token || !account) throw new Error('需要现有 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID；不会自动登录或创建项目。');
	const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/pages/projects/${PROJECT}`, {
		headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
		signal: AbortSignal.timeout(30000),
	});
	if (!response.ok) throw new Error(`Pages 只读预检失败（HTTP ${response.status}），不进行创建或上传。`);
	const payload = await response.json();
	if (!payload.success || payload.result?.name !== PROJECT || payload.result?.subdomain !== `${PROJECT}.pages.dev`) throw new Error('Pages 项目身份不匹配。');
	return { name: payload.result.name, productionBranch: payload.result.production_branch };
}

async function main() {
	const args = process.argv.slice(2);
	if (args.length !== 1 || !['--check', '--deploy'].includes(args[0])) throw new Error('用法：node scripts/pages-preview.mjs --check | --deploy');
	const mode = args[0] === '--check' ? 'check' : 'deploy';
	const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
	let cli;
	if (mode === 'deploy') {
		cli = process.env.npm_execpath;
		if (!cli || !process.env.npm_config_user_agent?.startsWith('pnpm/')) throw new Error('请通过 pnpm run deploy:preview 执行。');
	}
	await runPreview({
		mode,
		version: pkg.version,
		readSource: () => {
			const branch = git('branch', '--show-current');
			const upstream = git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}');
			const dirty = Boolean(git('status', '--porcelain', '--untracked-files=all'));
			const commit = git('rev-parse', 'HEAD');
			const remoteBranch = upstream.replace(/^origin\//, '');
			const remoteCommit = git('ls-remote', '--exit-code', 'origin', `refs/heads/${remoteBranch}`).split(/\s+/)[0];
			return { branch, upstream, dirty, commit, remoteCommit };
		},
		readProject: projectInfo,
		verify: () => execFileSync(process.execPath, [cli, 'run', 'verify'], { cwd: ROOT, stdio: 'inherit' }),
		readMetadata: () => JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'build-info.json'), 'utf8')),
		deploy: ({ commit, version }) => execFileSync(process.execPath, [cli, 'exec', 'wrangler', 'pages', 'deploy', 'dist', '--project-name', PROJECT, '--branch', PREVIEW_BRANCH, '--commit-hash', commit, '--commit-message', `Preview ${version}`, '--commit-dirty=false'], {
			cwd: ROOT, stdio: 'inherit', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' },
		}),
	});
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main().catch((error) => {
		console.error(`[pages-preview] ${error.message}`);
		process.exitCode = 1;
	});
}
