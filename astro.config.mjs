import { defineConfig, passthroughImageService } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import starlight from '@astrojs/starlight';

// Starlight 默认把 <table> 渲染成 block 滚动盒，内容不足一屏时边框内会留一大块空白。
// 这里给每张表包一层 .table-wrapper：滚动交给外层，表格本身保持 table 布局铺满宽度。
function rehypeWrapTables() {
	const walk = (node) => {
		if (!node || !Array.isArray(node.children)) return;
		for (let i = 0; i < node.children.length; i++) {
			const child = node.children[i];
			walk(child);
			if (child.type === 'element' && child.tagName === 'table') {
				node.children[i] = {
					type: 'element',
					tagName: 'div',
					properties: { className: ['table-wrapper'] },
					children: [child],
				};
				i++;
			}
		}
	};
	return (tree) => walk(tree);
}

// 非默认语言页面的 Markdown 正文里会出现 /canvas/xxx 这类站点内链，
// 直接渲染会跳回中文页。这里按源文件所在的语言目录，把以 / 开头的内链
// 自动加上语言前缀（如 /en/canvas/xxx）；已是带前缀或外链/锚点的不处理。
const LOCALE_DIRS = ['zh-tw', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt'];
// 翻译页里的架构图引用 /images/canvas/docs-*.svg（中文原图）。
// 若 public/images/canvas/<语言>/ 下存在同名本地化图，则把 src 改写为该语言版本；
// 不存在就保留原图（自动回退），新增图无需同步维护所有语言。
const localizedImageCache = new Map();
function hasLocalizedImage(dir, base) {
	const key = dir + '/' + base;
	if (!localizedImageCache.has(key)) {
		localizedImageCache.set(key, fs.existsSync(path.join(process.cwd(), 'public', 'images', 'canvas', dir, base)));
	}
	return localizedImageCache.get(key);
}
function rehypeLocalizeDiagramImages() {
	return (tree, file) => {
		const filePath = (file.path || file.history?.[0] || '').replace(/\\/g, '/');
		const match = filePath.match(/\/content\/docs\/([^/]+)\//);
		const dir = match && match[1];
		if (!dir || !LOCALE_DIRS.includes(dir)) return;
		const walk = (node) => {
			if (!node || !Array.isArray(node.children)) return;
			for (const child of node.children) {
				if (child.type === 'element' && child.tagName === 'img') {
					const src = child.properties?.src;
					if (typeof src === 'string' && src.startsWith('/images/canvas/')) {
						const base = src.slice('/images/canvas/'.length);
						if (base && !base.startsWith('/') && hasLocalizedImage(dir, base)) {
							child.properties.src = '/images/canvas/' + dir + '/' + base;
						}
					}
				}
				walk(child);
			}
		};
		walk(tree);
	};
}
function rehypeLocalizeInternalLinks() {
	return (tree, file) => {
		const path = (file.path || file.history?.[0] || '').replace(/\\/g, '/');
		const match = path.match(/\/content\/docs\/([^/]+)\//);
		const dir = match && match[1];
		if (!dir || !LOCALE_DIRS.includes(dir)) return;
		const walk = (node) => {
			if (!node || !Array.isArray(node.children)) return;
			for (const child of node.children) {
				if (child.type === 'element' && child.tagName === 'a') {
					const href = child.properties?.href;
					if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
						const firstSegment = href.slice(1).split('/')[0];
						if (!LOCALE_DIRS.includes(firstSegment)) {
							child.properties.href = '/' + dir + href;
						}
					}
				}
				walk(child);
			}
		};
		walk(tree);
	};
}

// Starlight 的 ::: 提示框标签（Note/Tip…）在 remark 阶段按「绝对路径」推断语言，
// 而本机构建传给 remark 的文件路径是相对路径，导致所有语言都回落到默认语言的中文标签。
// 这里在 rehype 阶段按文件路径重新判断语言，把「提示/注意/警告/危险」四个默认标签
// 替换为 Starlight 自带翻译文件里对应语言的文案；带自定义标题的提示框不受影响。
const ASIDE_FALLBACK_LABELS = { note: 'Note', tip: 'Tip', caution: 'Caution', danger: 'Danger' };
const DEFAULT_ASIDE_LABELS = ['提示', '注意', '警告', '危险'];
const STARLIGHT_TRANSLATIONS_DIR = path.join(process.cwd(), 'node_modules', '@astrojs', 'starlight', 'translations');
const LOCALE_TRANSLATION_FILES = {
	'zh-CN': 'zh-CN.json',
	'zh-tw': 'zh-TW.json',
	ja: 'ja.json',
	ko: 'ko.json',
	es: 'es.json',
	fr: 'fr.json',
	de: 'de.json',
	ru: 'ru.json',
	pt: 'pt.json',
};
const asideLabelsCache = new Map();
function asideLabelsFor(dir) {
	if (asideLabelsCache.has(dir)) return asideLabelsCache.get(dir);
	let labels = ASIDE_FALLBACK_LABELS;
	const translationFile = LOCALE_TRANSLATION_FILES[dir];
	if (translationFile) {
		try {
			const dict = JSON.parse(fs.readFileSync(path.join(STARLIGHT_TRANSLATIONS_DIR, translationFile), 'utf8'));
			labels = {
				note: dict['aside.note'] ?? ASIDE_FALLBACK_LABELS.note,
				tip: dict['aside.tip'] ?? ASIDE_FALLBACK_LABELS.tip,
				caution: dict['aside.caution'] ?? ASIDE_FALLBACK_LABELS.caution,
				danger: dict['aside.danger'] ?? ASIDE_FALLBACK_LABELS.danger,
			};
		} catch {
			// 翻译文件缺失时使用英文兜底
		}
	}
	asideLabelsCache.set(dir, labels);
	return labels;
}
function rehypeLocalizeAsides() {
	return (tree, file) => {
		const filePath = (file.path || file.history?.[0] || '').replace(/\\/g, '/');
		const match = filePath.match(/\/content\/docs\/([^/]+)\//);
		// 根目录文件（src/content/docs/canvas/…）捕获到的是 'canvas'，不属于任何语言目录，按默认语言处理
		const dir = match && LOCALE_DIRS.includes(match[1]) ? match[1] : 'zh-CN';
		const labels = asideLabelsFor(dir);
		const walk = (node) => {
			if (!node || !Array.isArray(node.children)) return;
			for (const child of node.children) {
				if (child.type === 'element' && child.tagName === 'aside') {
					const classNames = child.properties?.className;
					const classList = Array.isArray(classNames) ? classNames : String(classNames ?? '').split(/\s+/);
					const variant = classList.find((c) => c.startsWith('starlight-aside--'))?.slice('starlight-aside--'.length);
					if (variant && labels[variant]) {
						const title = child.children.find(
							(el) => el.type === 'element' && el.tagName === 'p' && String(el.properties?.className ?? '').includes('starlight-aside__title')
						);
						if (title) {
							const currentText = title.children
								.filter((el) => el.type === 'text')
								.map((el) => el.value)
								.join('');
							// 仅当标题仍是默认语言注入的四个标签之一时才替换，保留作者自定义标题
							if (DEFAULT_ASIDE_LABELS.includes(currentText.trim())) {
								child.properties['aria-label'] = labels[variant];
								title.children = title.children.map((el) =>
									el.type === 'text' ? { type: 'text', value: labels[variant] } : el
								);
							}
						}
					}
				}
				walk(child);
			}
		};
		walk(tree);
	};
}

// remark-rehype 给脚注区块注入的标题（#footnote-label，进入目录）与返回链接的
// aria-label 是写死的英文（Footnotes / Back to reference N），不随页面语言变化。
// 这里按源文件的语言目录替换为对应语言的文案；没有脚注的文件不受影响。
const FOOTNOTE_LABELS = {
	'zh-CN': '脚注',
	'zh-tw': '註腳',
	en: 'Footnotes',
	ja: '脚注',
	ko: '각주',
	es: 'Notas al pie',
	fr: 'Notes de bas de page',
	de: 'Fußnoten',
	ru: 'Сноски',
	pt: 'Notas de rodapé',
};
const FOOTNOTE_BACK_LABELS = {
	'zh-CN': '返回引注 {n}',
	'zh-tw': '返回引註 {n}',
	en: 'Back to reference {n}',
	ja: '注釈 {n} に戻る',
	ko: '각주 {n}로 돌아가기',
	es: 'Volver a la referencia {n}',
	fr: 'Retour à la référence {n}',
	de: 'Zurück zu Verweis {n}',
	ru: 'Вернуться к сноске {n}',
	pt: 'Voltar à referência {n}',
};
function rehypeLocalizeFootnotes() {
	return (tree, file) => {
		const filePath = (file.path || file.history?.[0] || '').replace(/\\/g, '/');
		const match = filePath.match(/\/content\/docs\/([^/]+)\//);
		const dir = match && LOCALE_DIRS.includes(match[1]) ? match[1] : 'zh-CN';
		const backLabel = FOOTNOTE_BACK_LABELS[dir] ?? FOOTNOTE_BACK_LABELS.en;
		const walk = (node) => {
			if (!node || !Array.isArray(node.children)) return;
			for (const child of node.children) {
				if (child.type === 'element') {
					if (
						child.tagName === 'section' &&
						child.properties?.dataFootnotes != null
					) {
						const heading = child.children.find(
							(el) => el.type === 'element' && el.properties?.id === 'footnote-label'
						);
						if (heading) {
							heading.children = [{ type: 'text', value: FOOTNOTE_LABELS[dir] ?? FOOTNOTE_LABELS.en }];
						}
					}
					if (child.tagName === 'a' && child.properties?.dataFootnoteBackref != null) {
						const ref = /^Back to reference (\d+)(?:-(\d+))?$/.exec(
							String(child.properties.ariaLabel ?? '')
						);
						if (ref) {
							child.properties.ariaLabel = backLabel
								.replace('{n}', ref[1] + (ref[2] ? '-' + ref[2] : ''));
						}
					}
				}
				walk(child);
			}
		};
		walk(tree);
	};
}

// 早期版本的文档路径已重命名，这里保留旧链接的跳转，避免收藏夹和外部引用失效。
// 键一律不带尾斜杠：Astro 会自动生成 <旧路径>/index.html 跳转页，
// 同一批路径再登记一次带斜杠的写法会与它撞成同一条路由（构建期 9 条
// route collision 警告，Astro 下个大版本会直接报错）。
// 尾斜杠的请求由构建后写出的 Cloudflare Pages _redirects 兜住，见下方
// cloudflareRedirectsFile()：那里按路径精确匹配，所以两种写法都要发。
const legacyRedirects = {
	'/mail': '/canvas/',
	'/canvas/dns-setup': '/canvas/layout/',
	'/canvas/ai-hub': '/canvas/i18n/',
	'/canvas/oauth-provider': '/canvas/navigation/',
	'/canvas/system-config': '/canvas/markdown/',
	'/canvas/workbench': '/canvas/syntax/',
	'/canvas/api-reference': '/canvas/configuration/',
	'/canvas/rule-engine': '/canvas/cloudflare/',
	'/canvas/security-rbac': '/canvas/releases/',
};

// Astro 静态模式只会为 redirects 生成 meta-refresh HTML 页（200 状态，SEO 不友好）。
// Cloudflare Pages 原生 _redirects 支持 301 且优先于静态文件命中，这里在构建完成后
// 额外写出该文件；两种机制并存——线上走 301，本地 preview 仍用 meta-refresh 页。
// Cloudflare 按路径精确匹配规则，所以每条旧路径在这里展开成带/不带尾斜杠两行。
function cloudflareRedirectsFile() {
	return {
		name: 'epo-cloudflare-redirects',
		hooks: {
			'astro:build:done': async ({ dir }) => {
				const lines = Object.entries(legacyRedirects).flatMap(([from, to]) => [
					`${from}  ${to}  301`,
					`${from}/  ${to}  301`,
				]);
				await fs.promises.writeFile(path.join(fileURLToPath(dir), '_redirects'), lines.join('\n') + '\n', 'utf8');
			},
		},
	};
}

// Starlight 已在每个页面 head 输出全部语言版本的 <link rel="alternate" hreflang=…>，
// 唯独缺一条 x-default（告诉搜索引擎语言都不匹配时展示哪个版本）。这里在构建完成后
// 按产物目录找到每个页面的默认语言（简体中文根路径）版本，补注这一条；
// 页面本身没有根路径版本（理论上不该发生）或 meta-refresh 跳转页则跳过。
function hreflangXDefault() {
	return {
		name: 'epo-hreflang-x-default',
		hooks: {
			'astro:build:done': async ({ dir }) => {
				const outDir = fileURLToPath(dir);
				const files = [];
				const walk = (rel) => {
					const abs = rel ? path.join(outDir, rel) : outDir;
					for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
						const relChild = rel ? rel + '/' + entry.name : entry.name;
						if (entry.isDirectory()) walk(relChild);
						else if (entry.name === 'index.html') files.push(relChild);
					}
				};
				walk('');
				let injected = 0;
				for (const rel of files) {
					// 产物路径 → 路由路径：canvas/…/index.html → /canvas/…/，en/canvas/…/index.html → /en/canvas/…/
					const segments = ('/' + rel.replace(/(^|\/)index\.html$/, '')).split('/').filter(Boolean);
					if (segments.length && LOCALE_DIRS.includes(segments[0].toLowerCase())) segments.shift();
					const base = segments.join('/');
					const file = path.join(outDir, rel);
					let html = await fs.promises.readFile(file, 'utf8');
					if (html.includes('hreflang="x-default"')) continue;
					if (!fs.existsSync(path.join(outDir, base, 'index.html'))) continue;
					const canonicalIdx = html.indexOf('rel="canonical"');
					if (canonicalIdx === -1) continue;
					const link = `<link rel="alternate" hreflang="x-default" href="https://docs.epocanvas.com${base ? '/' + base : ''}/">`;
					const insertAt = html.indexOf('>', canonicalIdx) + 1;
					html = html.slice(0, insertAt) + link + html.slice(insertAt);
					await fs.promises.writeFile(file, html, 'utf8');
					injected++;
				}
				console.log(`[epo-hreflang-x-default] injected x-default into ${injected} page(s)`);
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.epocanvas.com',
	// 站点唯一走 astro:assets 管线的图片是各语言首页 hero 的 SVG logo，全站没有 <Image> 调用，
	// SVG 不需要光栅化优化。默认 sharp 服务在 pnpm 隔离布局下解析不到原生依赖，
	// 冷缓存（CI / 首次构建）会直接报 MissingSharp；passthrough 服务产物不变且构建确定。
	image: { service: passthroughImageService() },
	redirects: legacyRedirects,
	// 关闭 Astro 开发工具栏（页面底部 id="dev-toolbar-root" 的悬浮图标），纯文档站点用不到它
	devToolbar: {
		enabled: false,
	},
	markdown: {
		rehypePlugins: [rehypeWrapTables, rehypeLocalizeInternalLinks, rehypeLocalizeDiagramImages, rehypeLocalizeAsides, rehypeLocalizeFootnotes],
	},
	integrations: [
		cloudflareRedirectsFile(),
		hreflangXDefault(),
		starlight({
				title: 'EpoCanvas Docs',
				description: 'EpoCanvas 全栈技术、架构与产品运维指南',
				// 简体中文是默认语言，占用 URL 根路径；其余语言各有独立目录与译文。
				// 某篇文档缺少某语言译文时，Starlight 会自动用默认语言内容兜底，不会 404。
				defaultLocale: 'root',
				locales: {
					root: {
						label: '简体中文',
						lang: 'zh-CN',
					},
					'zh-tw': {
						label: '繁體中文',
						lang: 'zh-TW',
					},
					en: {
						label: 'English',
						lang: 'en',
					},
					ja: {
						label: '日本語',
						lang: 'ja',
					},
					ko: {
						label: '한국어',
						lang: 'ko',
					},
					es: {
						label: 'Español',
						lang: 'es',
					},
					fr: {
						label: 'Français',
						lang: 'fr',
					},
					de: {
						label: 'Deutsch',
						lang: 'de',
					},
					ru: {
						label: 'Русский',
						lang: 'ru',
					},
					pt: {
						label: 'Português',
						lang: 'pt',
					},
				},
			logo: {
				src: './public/images/logo.svg',
				replacesTitle: false,
			},
			favicon: '/favicon.svg',
			// 内置 404 固定按默认语言渲染；改用 src/pages/404.astro 自定义页，
			// 由浏览器语言选择提示文案（src/pages/404.astro 顶部有实现说明）。
			disable404Route: true,
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
			// 页面"最后更新于"时间戳取自构建时的 Git 提交历史
			lastUpdated: true,
			customCss: ['./src/styles/custom.css'],
			// Local Component Overrides for Clean Documentation Theme
			components: {
				Header: './src/components/starlight/Header.astro',
				Sidebar: './src/components/starlight/Sidebar.astro',
				TableOfContents: './src/components/starlight/TableOfContents.astro',
				PageTitle: './src/components/starlight/PageTitle.astro',
				TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
				Search: './src/components/starlight/Search.astro',
				Pagination: './src/components/starlight/Pagination.astro',
			},
			// 侧边栏分组与条目的多语言文案，键为各语言的 BCP-47 代码；
			// 中文标签写在 sidebar 的 label 里，其余语言从这里取。
			sidebar: (() => {
				const SIDEBAR_I18N = {
				'产品概览与入门': {
					'zh-TW': '產品概覽與入門', en: 'Overview & Getting Started', ja: '製品概要とスタートガイド', ko: '제품 개요 및 시작하기', es: 'Presentación y primeros pasos', fr: 'Présentation et premiers pas', de: 'Überblick & Einstieg', ru: 'Обзор и начало работы', pt: 'Visão geral e primeiros passos',
				},
				'核心功能与使用指南': {
					'zh-TW': '核心功能與使用指南', en: 'Core Features & Guides', ja: '主要機能と使い方ガイド', ko: '핵심 기능 및 사용 가이드', es: 'Funciones principales y guías de uso', fr: 'Fonctionnalités principales et guides', de: 'Kernfunktionen & Anleitungen', ru: 'Основные функции и руководства', pt: 'Recursos principais e guias',
				},
				'文档编写与内容管理': {
					'zh-TW': '文件撰寫與內容管理', en: 'Writing & Content', ja: '執筆とコンテンツ管理', ko: '문서 작성 및 콘텐츠 관리', es: 'Redacción y gestión de contenido', fr: 'Rédaction et gestion du contenu', de: 'Schreiben & Content-Verwaltung', ru: 'Написание и управление контентом', pt: 'Redação e gestão de conteúdo',
				},
				'配置与二次开发': {
					'zh-TW': '設定與客製化', en: 'Configuration & Customization', ja: '設定とカスタマイズ', ko: '설정 및 커스터마이징', es: 'Configuración y personalización', fr: 'Configuration et personnalisation', de: 'Konfiguration & Anpassung', ru: 'Конфигурация и кастомизация', pt: 'Configuração e personalização',
				},
				'发布与运维部署': {
					'zh-TW': '發布與維運部署', en: 'Deployment & Maintenance', ja: 'リリースとデプロイ運用', ko: '배포 및 운영', es: 'Publicación y despliegue', fr: 'Publication et mise en production', de: 'Veröffentlichung & Betrieb', ru: 'Публикация и развёртывание', pt: 'Publicação e implantação',
				},
				'这是什么': {
					'zh-TW': '這是什麼', en: 'What Is This', ja: 'これは何？', ko: '이것은 무엇인가', es: 'Qué es esto', fr: 'Qu\'est-ce que c\'est', de: 'Was ist das', ru: 'Что это такое', pt: 'O que é isto',
				},
				'产品简介与核心价值': {
					'zh-TW': '產品簡介與核心價值', en: 'Product Overview & Core Value', ja: '製品概要とコアバリュー', ko: '제품 소개 및 핵심 가치', es: 'Descripción del producto y valor clave', fr: 'Présentation du produit et valeur essentielle', de: 'Produktüberblick & Kernwerte', ru: 'Обзор продукта и ключевые преимущества', pt: 'Visão geral do produto e valor central',
				},
				'快速上手 (3分钟运行)': {
					'zh-TW': '快速上手 (3 分鐘執行)', en: 'Quickstart (Up and Running in 3 Minutes)', ja: 'クイックスタート (3分で起動)', ko: '빠른 시작 (3분 만에 실행)', es: 'Inicio rápido (en marcha en 3 minutos)', fr: 'Démarrage rapide (en 3 minutes)', de: 'Schnellstart (in 3 Minuten starten)', ru: 'Быстрый старт (запуск за 3 минуты)', pt: 'Início rápido (a funcionar em 3 minutos)',
				},
				'页面布局与阅读体验': {
					'zh-TW': '頁面佈局與閱讀體驗', en: 'Page Layout & Reading Experience', ja: 'ページレイアウトと閲覧体験', ko: '페이지 레이아웃과 읽기 경험', es: 'Diseño de página y experiencia de lectura', fr: 'Mise en page et confort de lecture', de: 'Seitenlayout & Leseerlebnis', ru: 'Макет страницы и удобство чтения', pt: 'Layout da página e experiência de leitura',
				},
				'全文搜索与快捷键使用': {
					'zh-TW': '全文搜尋與快捷鍵使用', en: 'Full-Text Search & Keyboard Shortcuts', ja: '全文検索とショートカットキー', ko: '전체 텍스트 검색 및 단축키', es: 'Búsqueda de texto completo y atajos de teclado', fr: 'Recherche plein texte et raccourcis clavier', de: 'Volltextsuche & Tastenkürzel', ru: 'Полнотекстовый поиск и горячие клавиши', pt: 'Pesquisa de texto completo e atalhos de teclado',
				},
				'多语言支持与阅读切换': {
					'zh-TW': '多語系支援與閱讀切換', en: 'Multilingual Support & Language Switching', ja: '多言語対応と言語切り替え', ko: '다국어 지원 및 언어 전환', es: 'Soporte multilingüe y cambio de idioma', fr: 'Prise en charge multilingue et changement de langue', de: 'Mehrsprachigkeit & Sprachwechsel', ru: 'Многоязычность и переключение языков', pt: 'Suporte a vários idiomas e troca de idioma',
				},
				'顶部导航与页面路由': {
					'zh-TW': '頂部導覽與頁面路由', en: 'Top Navigation & Page Routing', ja: 'トップナビゲーションとページルーティング', ko: '상단 내비게이션과 페이지 라우팅', es: 'Navegación superior y enrutado de páginas', fr: 'Navigation supérieure et routage des pages', de: 'Obere Navigation & Seitenrouting', ru: 'Верхняя навигация и маршрутизация страниц', pt: 'Navegação superior e roteamento de páginas',
				},
				'Markdown 编写与排版指南': {
					'zh-TW': 'Markdown 撰寫與排版指南', en: 'Markdown Authoring & Formatting Guide', ja: 'Markdown 執筆と整形ガイド', ko: 'Markdown 작성 및 서식 가이드', es: 'Guía de redacción y formato en Markdown', fr: 'Guide de rédaction et de mise en forme Markdown', de: 'Markdown-Leitfaden für Text und Formatierung', ru: 'Руководство по написанию и форматированию Markdown', pt: 'Guia de escrita e formatação em Markdown',
				},
				'渲染规则详解': {
					'zh-TW': '渲染規則詳解', en: 'How Rendering Works', ja: 'レンダリングルールの詳細', ko: '렌더링 규칙 상세', es: 'Reglas de renderizado en detalle', fr: 'Règles de rendu en détail', de: 'Renderregeln im Detail', ru: 'Подробно о правилах рендеринга', pt: 'Regras de renderização em detalhes',
				},
				'提示框、代码块与图表示例': {
					'zh-TW': '提示框、程式碼區塊與圖表範例', en: 'Asides, Code Blocks & Diagrams', ja: '吹き出し・コードブロック・図表の例', ko: '콜아웃, 코드 블록 및 다이어그램 예시', es: 'Avisos, bloques de código y diagramas de ejemplo', fr: 'Exemples d\'encadrés, blocs de code et diagrammes', de: 'Hinweisboxen, Codeblöcke & Diagramme', ru: 'Примеры выносок, блоков кода и диаграмм', pt: 'Avisos, blocos de código e diagramas de exemplo',
				},
				'站点全局配置与样式定制': {
					'zh-TW': '站點全域設定與樣式定製', en: 'Site Configuration & Style Customization', ja: 'サイト全体の設定とスタイルのカスタマイズ', ko: '사이트 전역 설정 및 스타일 커스터마이징', es: 'Configuración del sitio y personalización de estilos', fr: 'Configuration du site et personnalisation des styles', de: 'Site-Konfiguration & Stil-Anpassung', ru: 'Конфигурация сайта и настройка стилей', pt: 'Configuração do site e personalização de estilos',
				},
				'界面组件与二次开发': {
					'zh-TW': '介面元件與二次開發', en: 'UI Components & Custom Development', ja: 'UI コンポーネントとカスタム開発', ko: 'UI 컴포넌트와 커스텀 개발', es: 'Componentes de interfaz y desarrollo a medida', fr: 'Composants d\'interface et développement personnalisé', de: 'UI-Komponenten & eigene Anpassungen', ru: 'Компоненты интерфейса и доработка', pt: 'Componentes de interface e desenvolvimento personalizado',
				},
				'常见定制场景速查': {
					'zh-TW': '常見客製場景速查', en: 'Common Customization Recipes', ja: 'よくあるカスタマイズ早見表', ko: '자주 하는 커스터마이징 모음', es: 'Recetas de personalización habituales', fr: 'Recettes de personnalisation courantes', de: 'Häufige Anpassungsrezepte', ru: 'Шпаргалка по типовым доработкам', pt: 'Receitas de personalização comuns',
				},
				'Cloudflare Pages 部署上线': {
					'zh-TW': 'Cloudflare Pages 部署上線', en: 'Deploying to Cloudflare Pages', ja: 'Cloudflare Pages へのデプロイ', ko: 'Cloudflare Pages 배포', es: 'Despliegue en Cloudflare Pages', fr: 'Déploiement sur Cloudflare Pages', de: 'Veröffentlichung auf Cloudflare Pages', ru: 'Развёртывание на Cloudflare Pages', pt: 'Implantação no Cloudflare Pages',
				},
				'SEO 与性能优化': {
					'zh-TW': 'SEO 與效能最佳化', en: 'SEO & Performance Optimization', ja: 'SEO とパフォーマンス最適化', ko: 'SEO 및 성능 최적화', es: 'SEO y optimización del rendimiento', fr: 'SEO et optimisation des performances', de: 'SEO & Performance-Optimierung', ru: 'SEO и оптимизация производительности', pt: 'SEO e otimização de desempenho',
				},
				'版本管理与自动化工作流': {
					'zh-TW': '版本管理與自動化工作流程', en: 'Versioning & Automation Workflows', ja: 'バージョン管理と自動化ワークフロー', ko: '버전 관리 및 자동화 워크플로', es: 'Gestión de versiones y flujos automatizados', fr: 'Gestion des versions et workflows automatisés', de: 'Versionsverwaltung & automatisierte Workflows', ru: 'Управление версиями и автоматизация', pt: 'Gestão de versões e fluxos de trabalho automatizados',
				},
				'常见问题与故障排查 FAQ': {
					'zh-TW': '常見問題與故障排查 FAQ', en: 'FAQ & Troubleshooting', ja: 'よくある質問とトラブルシューティング', ko: '자주 묻는 질문과 문제 해결 FAQ', es: 'Preguntas frecuentes y solución de problemas', fr: 'FAQ et résolution des problèmes', de: 'FAQ & Fehlerbehebung', ru: 'Частые вопросы и устранение неполадок', pt: 'FAQ e solução de problemas',
				},
			};
			const t = (label) => ({ label, translations: SIDEBAR_I18N[label] ?? {} });

			return [
				{
					...t('产品概览与入门'),
					items: [
						{ ...t('这是什么'), link: '/canvas/about/' },
						{ ...t('产品简介与核心价值'), link: '/canvas/' },
						{ ...t('快速上手 (3分钟运行)'), link: '/canvas/deployment/' },
					],
				},
				{
					...t('核心功能与使用指南'),
					items: [
						{ ...t('页面布局与阅读体验'), link: '/canvas/layout/' },
						{ ...t('全文搜索与快捷键使用'), link: '/canvas/search-engine/' },
						{ ...t('多语言支持与阅读切换'), link: '/canvas/i18n/' },
						{ ...t('顶部导航与页面路由'), link: '/canvas/navigation/' },
					],
				},
				{
					...t('文档编写与内容管理'),
					items: [
						{ ...t('Markdown 编写与排版指南'), link: '/canvas/markdown/' },
						{ ...t('渲染规则详解'), link: '/canvas/rendering/' },
						{ ...t('提示框、代码块与图表示例'), link: '/canvas/syntax/' },
					],
				},
				{
					...t('配置与二次开发'),
					items: [
						{ ...t('站点全局配置与样式定制'), link: '/canvas/configuration/' },
						{ ...t('界面组件与二次开发'), link: '/canvas/components/' },
						{ ...t('常见定制场景速查'), link: '/canvas/recipes/' },
					],
				},
				{
					...t('发布与运维部署'),
					items: [
						{ ...t('Cloudflare Pages 部署上线'), link: '/canvas/cloudflare/' },
						{ ...t('SEO 与性能优化'), link: '/canvas/seo/' },
						{ ...t('版本管理与自动化工作流'), link: '/canvas/releases/' },
						{ ...t('常见问题与故障排查 FAQ'), link: '/canvas/troubleshooting/' },
					],
				},
			];
			})(),
		}),
	],
});

