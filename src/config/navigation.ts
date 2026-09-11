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
			pathname.includes('dns-setup') ||
			pathname.includes('search-engine') ||
			pathname.includes('ai-hub') ||
			pathname.includes('oauth-provider'),
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
		href: '/canvas/system-config/',
		match: (pathname: string) =>
			pathname.includes('system-config') ||
			pathname.includes('workbench') ||
			pathname.includes('api-reference'),
	},
	{
		id: 'deploy',
		labelKey: 'nav.deploy',
		defaultLabel: '部署上线',
		href: '/canvas/rule-engine/',
		match: (pathname: string) =>
			pathname.includes('rule-engine') ||
			pathname.includes('security-rbac'),
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
		labelKey: 'nav.release',
		defaultLabel: 'v1.2.0',
		href: 'https://github.com/shijianus/epocanvas-docs/releases',
		isExternal: true,
		badge: 'v1.2.0',
	},
];
