# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)

[English](./README.md) | 简体中文 | [繁體中文](./README.zh-TW.md) | [Français](./README.fr.md)

EpoCanvas Docs 是 EpoCanvas 项目的官方文档站点，基于 Astro 5 与 Starlight 构建，内置三栏阅读布局、双模式搜索与多语言界面。全部内容以标准 Markdown 编写，可发布至 Cloudflare Pages。

**在线站点**：[https://docs.epocanvas.com](https://docs.epocanvas.com)（备用地址：[https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)）

## 界面预览

![EpoCanvas Docs 文档站首页](./public/images/canvas/ui-home-landing.png)

站点采用三栏布局：左侧为分类导航，中间为正文，右侧为当前页面的目录。默认深色主题，跟随系统设置，也可在顶栏手动切换。

## 功能特性

- **三栏阅读布局**：正文行宽经过限制，适合长文阅读；左侧导航在页面切换时保持滚动位置，右侧目录随滚动高亮当前小节。
- **双模式搜索**：顶栏搜索框负责在当前页面内查找，`Ctrl+K` / `Cmd+K` 呼出基于 Pagefind 的全站检索弹窗。索引在构建时生成，检索完全在浏览器内完成，不依赖第三方搜索服务，托管在无外网的内网环境同样可用。
- **界面多语言**：界面提供 10 种语言——简体中文（默认）、繁体中文、英语、日语、韩语、西班牙语、法语、德语、俄语、葡萄牙语。切换时文字就地更新，无需重新加载页面。
- **Markdown 扩展**：支持 `:::note`、`:::tip`、`:::caution`、`:::danger` 四种提示框；代码块支持 Shiki 语法高亮、文件名标签、指定行高亮与 diff 渲染。
- **一键部署**：站点构建为纯静态文件，通过单条命令发布到 Cloudflare Pages，自定义域名与 HTTPS 证书自动配置。

## 环境要求

- Node.js 20 或更高版本（支持 18.17+）
- pnpm 10

## 快速开始

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

在浏览器中打开 `http://localhost:4321`。开发服务器运行期间，Markdown 的修改会实时反映到页面上。

### 常用命令

| 命令 | 说明 |
| :--- | :--- |
| `pnpm run dev` | 启动本地开发服务器，支持热更新 |
| `pnpm run build` | 将静态站点构建至 `dist/`，并生成搜索索引 |
| `pnpm run preview` | 本地预览构建产物 |
| `pnpm run deploy` | 构建并发布至 Cloudflare Pages |

## 目录结构

```text
epocanvas-docs/
├── public/images/canvas/       # 文档所使用的截图与图示
├── src/
│   ├── components/starlight/   # 覆写的 Starlight 组件（Header、Sidebar 等）
│   ├── config/navigation.ts    # 顶部导航栏配置
│   ├── content/docs/           # 文档正文，以 Markdown 编写
│   ├── styles/custom.css       # 主题配色与布局样式
│   └── utils/i18n.ts           # 客户端翻译词典
├── astro.config.mjs            # 站点配置：标题、侧边栏、重定向
├── AGENTS.md                   # 技术写作规范
├── LICENSE
└── package.json
```

## 编写文档

1. 在 `src/content/docs/canvas/` 下新建 `.md` 文件；
2. 在文件开头添加 frontmatter：

   ```yaml
   ---
   title: 文档标题
   description: 本页的一句话说明
   ---
   ```

3. 在 `astro.config.mjs` 的 `sidebar` 数组中注册该页面；未注册的页面不会出现在导航中。
4. 图片存放于 `public/images/canvas/`，正文中以绝对路径引用：

   ```markdown
   ![替代文字](/images/canvas/your-image.png)
   ```

提交前请先在本地执行 `pnpm run build`，确认站点可以完整构建、无报错。

## 部署

站点托管于 Cloudflare Pages：

- **本地发布**：先执行一次 `wrangler login` 完成授权，之后运行 `pnpm run deploy` 即可构建并发布。
- **自定义域名**：在 Cloudflare 控制台打开 Pages 项目 `epocanvas-docs`，在 *Custom domains* 中添加域名，CNAME 记录与 SSL 证书会自动配置。

## 参与贡献

欢迎提交 Issue 与 Pull Request。提交 PR 前请在本地运行 `pnpm run build` 并确认构建通过。

## 许可证

[MIT](./LICENSE)
