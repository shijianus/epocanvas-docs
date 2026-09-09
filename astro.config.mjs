import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://doc.epocanvas.com',
	integrations: [
		starlight({
			title: 'EpoCanvas Docs',
			description: 'EpoCanvas Ecosystem Technical Documentation & Protocol Specifications',
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
				github: 'https://github.com/shijianus/epocanvas',
			},
			customCss: ['./src/styles/custom.css'],
			// Local Component Overrides for Clean Documentation Theme
			components: {
				Header: './src/components/starlight/Header.astro',
				Sidebar: './src/components/starlight/Sidebar.astro',
				TableOfContents: './src/components/starlight/TableOfContents.astro',
				PageTitle: './src/components/starlight/PageTitle.astro',
				TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
			},
			// Multi-Section Partitioned Sidebar Definitions
			sidebar: [
				{
					label: 'EpoMail',
					items: [
						{ label: '项目概览', link: '/mail/' },
						{
							label: '部署指南',
							items: [
								{ label: '界面与服务部署', link: '/mail/deployment/' },
								{ label: '域名与 DNS 解析', link: '/mail/dns-setup/' },
							],
						},
						{
							label: '系统配置',
							items: [
								{ label: '系统设置与服务集成', link: '/mail/system-config/' },
							],
						},
					],
				},
				{
					label: 'EpoCanvas (Chat)',
					autogenerate: { directory: 'chat' },
				},
				{
					label: 'ECCP Protocol Spec',
					autogenerate: { directory: 'eccp' },
				},
			],
		}),
	],
});
