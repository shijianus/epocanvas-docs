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
		defaultLabel: '文档',
		href: '/canvas/',
		match: (pathname: string) =>
			pathname.startsWith('/canvas') &&
			!pathname.includes('deployment') &&
			!pathname.includes('api-reference'),
	},
	{
		id: 'deployment',
		labelKey: 'nav.deployment',
		defaultLabel: '部署',
		href: '/canvas/deployment/',
		match: (pathname: string) => pathname.includes('deployment'),
	},
	{
		id: 'api',
		labelKey: 'nav.api',
		defaultLabel: 'API 参考',
		href: '/canvas/api-reference/',
		match: (pathname: string) => pathname.includes('api-reference'),
	},
	{
		id: 'releases',
		labelKey: 'nav.releases',
		defaultLabel: 'v1.2.0',
		href: 'https://github.com/shijianus/epocanvas-docs/releases',
		isExternal: true,
		badge: 'v1.2.0',
	},
];

