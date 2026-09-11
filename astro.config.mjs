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
					label: '专案概览与架构',
					items: [
						{ label: 'EpoCanvas Docs 架构总览', link: '/canvas/' },
						{ label: '快速上手与环境初始化', link: '/canvas/deployment/' },
					],
				},
				{
					label: '架构内核与组件覆写',
					items: [
						{ label: 'Starlight 组件覆写体系', link: '/canvas/workbench/' },
						{ label: 'UI 设计系统与三栏布局', link: '/canvas/dns-setup/' },
						{ label: '内容集合与写作规范', link: '/canvas/system-config/' },
					],
				},
				{
					label: '核心功能与引擎机制',
					items: [
						{ label: 'Pagefind 静态全文检索', link: '/canvas/search-engine/' },
						{ label: '动态多语言与国际化架构', link: '/canvas/ai-hub/' },
						{ label: '声明式导航与路由策略', link: '/canvas/oauth-provider/' },
					],
				},
				{
					label: '部署与发布运维',
					items: [
						{ label: 'Cloudflare Pages 边缘部署', link: '/canvas/rule-engine/' },
						{ label: '自动化 CI/CD 与版本发布', link: '/canvas/security-rbac/' },
					],
				},
				{
					label: '扩展定制与问题排查',
					items: [
						{ label: '二次开发与生态扩展指南', link: '/canvas/api-reference/' },
						{ label: '生产运维与故障排查手册', link: '/canvas/troubleshooting/' },
					],
				},
			],
		}),
	],
	redirects: {
		'/mail': '/canvas',
	},
});

