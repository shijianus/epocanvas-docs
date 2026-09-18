import pkg from '../../package.json';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';

export const CURRENT_DOCS_VERSION = `v${pkg.version}`;

export interface NavItem {
	id: string;
	labelKey: string;
	defaultLabel: string;
	href: string;
	match?: (pathname: string) => boolean;
	badge?: string;
	isExternal?: boolean;
}

// 各语言在 URL 里的目录前缀（简体中文为根路径，无前缀）。
const LOCALE_DIRS = SUPPORTED_LANGUAGES.map((lang) => lang.dir).filter(Boolean);

/**
 * 取页面 slug：先剥掉语言前缀（如 /en/），再取 /canvas/ 后的第一段。
 * 返回 null 表示不是 canvas 文档页（如站点首页）；'' 表示 canvas 索引页。
 * 用精确段匹配做导航高亮，避免 includes 子串匹配在新页面 slug
 * 恰好包含旧子串时（如 i18n-guide 撞上 i18n）把高亮点错。
 */
function canvasSlug(pathname: string): string | null {
	const segments = pathname.split('/').filter(Boolean);
	if (segments.length > 0 && LOCALE_DIRS.includes(segments[0].toLowerCase())) {
		segments.shift();
	}
	if (segments[0] !== 'canvas') return null;
	return segments[1] ?? '';
}

function isCanvasPage(slugs: string[]): (pathname: string) => boolean {
	return (pathname) => {
		const slug = canvasSlug(pathname);
		return slug !== null && slugs.includes(slug);
	};
}

export const navigationConfig: NavItem[] = [
	{
		id: 'home',
		labelKey: 'nav.home',
		defaultLabel: '首页',
		href: '/',
		match: (pathname: string) => pathname === '/' || pathname === '',
	},
	{
		id: 'docs',
		labelKey: 'nav.docs',
		defaultLabel: '产品说明',
		href: '/canvas/',
		match: isCanvasPage(['', 'about', 'layout', 'search-engine', 'i18n', 'navigation']),
	},
	{
		id: 'quickstart',
		labelKey: 'nav.quickstart',
		defaultLabel: '快速上手',
		href: '/canvas/deployment/',
		match: isCanvasPage(['deployment']),
	},
	{
		id: 'guide',
		labelKey: 'nav.guide',
		defaultLabel: '编写规范',
		href: '/canvas/markdown/',
		match: isCanvasPage(['markdown', 'rendering', 'syntax', 'configuration', 'components', 'recipes']),
	},
	{
		id: 'deploy',
		labelKey: 'nav.deploy',
		defaultLabel: '部署上线',
		href: '/canvas/cloudflare/',
		match: isCanvasPage(['cloudflare', 'seo', 'releases']),
	},
	{
		id: 'faq',
		labelKey: 'nav.faq',
		defaultLabel: '常见问题',
		href: '/canvas/troubleshooting/',
		match: isCanvasPage(['troubleshooting']),
	},
	{
		id: 'release',
		labelKey: 'nav.releases',
		defaultLabel: CURRENT_DOCS_VERSION,
		href: 'https://github.com/shijianus/epocanvas-docs/releases',
		isExternal: true,
		badge: CURRENT_DOCS_VERSION,
	},
];
