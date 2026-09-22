---
title: SEO 与性能优化
description: EpoCanvas Docs 内置的 SEO 能力（meta 标签、Open Graph、sitemap、robots.txt）与性能机制说明，以及提交搜索引擎的方法。
---

文档写出来是给人看的，前提是能被搜到、打开要快。**EpoCanvas Docs** 在构建层面内置了一套开箱即用的 SEO 能力和性能机制，本页说明它们分别是什么、如何验证，以及上线后还需要做的几件事。

---

## 内置的 SEO 能力

以下能力全部在构建时自动生效，不需要额外配置：

| 能力 | 实现方式 | 验证方法 |
| :--- | :--- | :--- |
| 页面标题 | `<title>文章标题 \| EpoCanvas Docs</title>`，取自 Frontmatter | 查看网页源码或浏览器标签页 |
| 页面描述 | `<meta name="description">`，取自 Frontmatter 的 `description` | 查看源码 |
| Open Graph 标签 | `og:title`、`og:type`、`og:url`、`og:locale`、`og:description`，分享到社交平台时展示卡片 | 粘贴链接到聊天工具预览 |
| Canonical 链接 | 每页自动生成 `<link rel="canonical">`，指向主域名 | 查看源码 |
| Sitemap | 构建时自动生成 `sitemap-index.xml` | 访问 `/sitemap-index.xml` |
| robots.txt | 项目内置 `public/robots.txt`，放行全部爬虫并声明 sitemap 位置 | 访问 `/robots.txt` |

:::tip
Frontmatter 的 `title` 和 `description` 是搜索引擎展示的主要素材。写文档时务必填写简短准确的 `description`，这是 SEO 最重要的单点优化。
:::

### Canonical 与镜像域名

站点主域名为 `docs.epocanvas.com`，`<site>` 配置与其保持一致，每页的 canonical 与 `og:url` 都指向主域名。即使内容同时通过 `epocanvas-docs.pages.dev` 镜像访问，搜索引擎也会把权重归一到主域名，不会判定为重复内容。

---

## 性能机制

### 纯静态输出，无框架运行时

构建产物是纯 HTML + CSS。页面导航、阅读、目录滚动高亮都不需要下载任何前端框架（React/Vue 等运行时体积为零），只有搜索、主题切换、语言切换等交互组件按需加载少量脚本。首屏渲染不等待 JavaScript，弱网与低端设备同样流畅。

### 图片体积在源头控制

本站没有启用构建期图片处理：`astro.config.mjs` 把 `image.service` 设为 `passthroughImageService()`，`public/` 下的图片原样拷贝进 `dist/`，既不压缩也不改尺寸。之所以不用 sharp，是因为它在 pnpm 的隔离目录结构下解析不到原生依赖，冷缓存环境（CI、首次构建）会直接报 `MissingSharp` 中断构建。体积因此在提交前控制：界面截图统一 1440 像素宽并先离线压好，架构图一律用 SVG 矢量图。

### 搜索索引按需加载

Pagefind 在 `pnpm run build` 时生成高压缩的索引分片。读者打开页面时不会下载任何索引；只有真正使用全站检索时，浏览器才按关键词拉取对应分片（几 KB 到几十 KB），不影响首屏速度。

### 如何验证性能

1. 打开浏览器开发者工具的 **Network** 面板，刷新页面，查看首屏传输体积；
2. 在 Chrome 无痕窗口运行 **Lighthouse** 审计（Performance 类别），确认分数；
3. 用 `curl -sI https://docs.epocanvas.com` 检查响应头中 `Cache-Control` 等 CDN 缓存策略是否生效。

---

## 上线后建议做的三件事

部署完成（参见 [Cloudflare Pages 部署上线](/canvas/cloudflare/)）后，建议按顺序完成：

### 1. 提交 Sitemap 到 Google Search Console

1. 打开 [Google Search Console](https://search.google.com/search-console)，添加资源 `docs.epocanvas.com`；
2. 按提示通过 DNS TXT 记录验证域名所有权（域名在 Cloudflare 托管时几分钟即可生效）；
3. 在左侧"站点地图"中提交 `https://docs.epocanvas.com/sitemap-index.xml`。

### 2. 验证收录效果

上线一周后，在 Google 用 `site:docs.epocanvas.com` 检索，确认文章已被收录；在 Search Console 的"网页"报告中查看已编入索引的页面数量是否与文档数量一致。

### 3. 定期检查死链

文档改版、路径重命名后，站外引用的旧链接可能失效。可以在 Search Console 的"网页"报告中查看"未找到 (404)"条目，并在 `astro.config.mjs` 的 `redirects` 表中为高访问量的失效路径补充跳转。

:::caution
`epocanvas-docs.pages.dev` 镜像域名仅作为备用访问入口，canonical 已保证搜索引擎只收录主域名。请勿在站外主动传播镜像地址，避免读者收藏一个不受你控制的域名。
:::
