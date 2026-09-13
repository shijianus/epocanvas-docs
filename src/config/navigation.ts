import pkg from '../../package.json';

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
		match: (pathname: string) =>
			pathname === '/canvas' ||
			pathname === '/canvas/' ||
			pathname.includes('about') ||
			pathname.includes('layout') ||
			pathname.includes('search-engine') ||
			pathname.includes('i18n') ||
			pathname.includes('navigation'),
	},
	{
		id: 'quickstart',
		labelKey: 'nav.quickstart',
		defaultLabel: '快速上手',
		href: '/canvas/deployment/',
		match: (pathname: string) => pathname.includes('deployment'),
	},
	{
		id: 'guide',
		labelKey: 'nav.guide',
		defaultLabel: '编写规范',
		href: '/canvas/markdown/',
		match: (pathname: string) =>
			pathname.includes('markdown') ||
			pathname.includes('rendering') ||
			pathname.includes('syntax') ||
			pathname.includes('configuration') ||
			pathname.includes('components') ||
			pathname.includes('recipes'),
	},
	{
		id: 'deploy',
		labelKey: 'nav.deploy',
		defaultLabel: '部署上线',
		href: '/canvas/cloudflare/',
		match: (pathname: string) =>
			pathname.includes('cloudflare') ||
			pathname.includes('seo') ||
			pathname.includes('releases'),
	},
	{
		id: 'faq',
		labelKey: 'nav.faq',
		defaultLabel: '常见问题',
		href: '/canvas/troubleshooting/',
		match: (pathname: string) => pathname.includes('troubleshooting'),
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
