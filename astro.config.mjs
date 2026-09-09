import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://doc.epocanvas.com',
	integrations: [
		starlight({
			title: 'EpoCanvas Docs',
			description: 'Unified End-to-End Encrypted Ecosystem Documentation & Protocol Specifications',
			social: {
				github: 'https://github.com/shijianus/epocanvas',
			},
			customCss: ['./src/styles/custom.css'],
			// EJECT MODE: Local Component Overrides for Full Customization
			components: {
				Header: './src/components/starlight/Header.astro',
				Sidebar: './src/components/starlight/Sidebar.astro',
				TableOfContents: './src/components/starlight/TableOfContents.astro',
				PageTitle: './src/components/starlight/PageTitle.astro',
				TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
			},
			// Multi-Project Segregated Sidebar
			sidebar: [
				{
					label: 'EpoCanvas (Chat)',
					badge: { text: 'E2EE IM', variant: 'tip' },
					autogenerate: { directory: 'chat' },
				},
				{
					label: 'EpoMail Service',
					badge: { text: 'Encrypted Mail', variant: 'note' },
					autogenerate: { directory: 'mail' },
				},
				{
					label: 'ECCP Protocol Spec',
					badge: { text: 'RFC Standards', variant: 'caution' },
					autogenerate: { directory: 'eccp' },
				},
			],
		}),
	],
});
