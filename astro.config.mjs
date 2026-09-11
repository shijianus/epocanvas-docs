import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://doc.epocanvas.com',
	integrations: [
		starlight({
			title: 'EpoCanvas Docs',
			description: 'EpoCanvas 全栈技术、架构与产品运维指南',
			defaultLocale: 'root',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			logo: {
				src: './public/images/logo.svg',
				replacesTitle: false,
			},
			favicon: '/favicon.svg',
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'icon',
						type: 'image/svg+xml',
						href: '/favicon.svg',
					},
				},
			],
			social: {
				github: 'https://github.com/shijianus/epocanvas-docs',
			},
			customCss: ['./src/styles/custom.css'],
			// Local Component Overrides for Clean Documentation Theme
			components: {
				Header: './src/components/starlight/Header.astro',
				Sidebar: './src/components/starlight/Sidebar.astro',
				TableOfContents: './src/components/starlight/TableOfContents.astro',
				PageTitle: './src/components/starlight/PageTitle.astro',
				TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
				Search: './src/components/starlight/Search.astro',
			},
			sidebar: [
				{
					label: '产品概览与入门',
					items: [
						{ label: '产品简介与核心价值', link: '/canvas/' },
						{ label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
					],
				},
				{
					label: '核心功能与使用指南',
					items: [
						{ label: '页面布局与阅读体验', link: '/canvas/dns-setup/' },
						{ label: '全文搜索与快捷键使用', link: '/canvas/search-engine/' },
						{ label: '多语言支持与阅读切换', link: '/canvas/ai-hub/' },
						{ label: '顶部导航与页面路由', link: '/canvas/oauth-provider/' },
					],
				},
				{
					label: '文档编写与内容管理',
					items: [
						{ label: 'Markdown 编写与排版指南', link: '/canvas/system-config/' },
						{ label: '提示框、代码块与图表示例', link: '/canvas/workbench/' },
					],
				},
				{
					label: '配置与二次开发',
					items: [
						{ label: '站点全局配置与样式定制', link: '/canvas/api-reference/' },
					],
				},
				{
					label: '发布与运维部署',
					items: [
						{ label: 'Cloudflare Pages 部署上线', link: '/canvas/rule-engine/' },
						{ label: '版本管理与自动化工作流', link: '/canvas/security-rbac/' },
						{ label: '常见问题与故障排查 FAQ', link: '/canvas/troubleshooting/' },
					],
				},
			],
		}),
	],
	redirects: {
		'/mail': '/canvas',
	},
});

