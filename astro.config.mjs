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
				{ label: '系统概览与架构', link: '/canvas/' },
				{
					label: '部署与环境搭建',
					items: [
						{ label: '全栈部署指南', link: '/canvas/deployment/' },
						{ label: '域名解析与网络配置', link: '/canvas/dns-setup/' },
					],
				},
				{
					label: '核心功能指南',
					items: [
						{ label: '画布工作台与交互引擎', link: '/canvas/workbench/' },
						{ label: '双引擎检索与语法规范', link: '/canvas/search-engine/' },
					],
				},
				{
					label: '规则引擎与安全体系',
					items: [
						{ label: '智能流式规则引擎', link: '/canvas/rule-engine/' },
						{ label: '身份认证与 RBAC 权限', link: '/canvas/security-rbac/' },
					],
				},
				{
					label: 'AI 枢纽与扩展集成',
					items: [
						{ label: 'AI Hub 与多模型池', link: '/canvas/ai-hub/' },
						{ label: 'OAuth 2.0 / OIDC 认证中心', link: '/canvas/oauth-provider/' },
						{ label: '系统全局设置与服务集成', link: '/canvas/system-config/' },
					],
				},
				{
					label: '开发者参考与运维',
					items: [
						{ label: '开放 REST API 参考', link: '/canvas/api-reference/' },
						{ label: '故障排查与运维最佳实践', link: '/canvas/troubleshooting/' },
					],
				},
			],
		}),
	],
	redirects: {
		'/mail': '/canvas',
	},
});

