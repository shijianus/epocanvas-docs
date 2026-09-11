# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)

EpoCanvas 的官方文档站点，基于 Astro 5 和 Starlight 搭建。三栏布局、全文搜索、多语言切换这些能力开箱即用，内容就是普通的 Markdown 文件，改完一条命令就能发布到 Cloudflare Pages。

在线访问：[https://doc.epocanvas.com](https://doc.epocanvas.com)（备用地址 [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)）

## 界面

![EpoCanvas Docs 文档站首页](./public/images/canvas/ui-home-landing.png)

左侧是分类导航，中间是正文，右侧是当前页面的目录。默认深色主题，跟随系统设置，也可以在右上角手动切换。

## 功能

- **三栏布局**：正文行宽做了限制，长文阅读不累。切换页面时侧边栏记住滚动位置，右侧目录会随滚动高亮当前小节。
- **全文搜索**：索引在构建时生成，搜索全部在浏览器里完成，`Ctrl+K` / `Cmd+K` 呼出。不依赖第三方搜索服务，内网环境同样可用。
- **多语言**：界面支持简体中文、繁体中文、英语、日语、韩语、德语、法语、西班牙语、俄语、阿拉伯语共 10 种语言，切换后文字就地更新，页面不刷新，阅读位置保持不变。
- **排版扩展**：Note / Tip / Important / Warning / Caution 五种提示框；代码块支持 Shiki 高亮、文件名标签、指定行高亮和 diff 展示；Mermaid 可直接在 Markdown 里画流程图和时序图。
- **部署**：纯静态输出，托管在 Cloudflare Pages，绑定自定义域名后证书自动配置。

## 快速上手

环境要求：Node.js 20 或更高版本（18.17+ 也可以），pnpm 10。

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

打开 `http://localhost:4321`，修改 Markdown 后页面会实时更新。

### 常用命令

| 命令 | 用途 |
| :--- | :--- |
| `pnpm run dev` | 启动本地开发服务，带热更新 |
| `pnpm run build` | 构建静态页面到 `dist/`，同时生成搜索索引 |
| `pnpm run preview` | 本地预览构建产物 |
| `pnpm run deploy` | 构建并发布到 Cloudflare Pages |

## 目录结构

```text
epocanvas-docs/
├── public/images/canvas/       # 文档里用到的截图和示意图
├── src/
│   ├── components/starlight/   # 覆写的 Starlight 组件（Header、Sidebar 等）
│   ├── config/navigation.ts    # 顶部导航栏配置
│   ├── content/docs/           # 文档正文，全部是 Markdown
│   ├── styles/custom.css       # 主题色与布局样式
│   └── utils/i18n.ts           # 多语言翻译字典
├── astro.config.mjs            # 站点配置：标题、侧边栏、重定向
├── AGENTS.md                   # 技术写作规范
├── LICENSE
└── package.json
```

## 写一篇新文档

1. 在 `src/content/docs/canvas/` 下新建 `.md` 文件；
2. 文件开头写好 frontmatter：

   ```yaml
   ---
   title: 文档标题
   description: 一句话说明这篇文档讲什么
   ---
   ```

3. 打开 `astro.config.mjs`，在 `sidebar` 对应的分组里加上这篇文档的链接，否则侧边栏不会显示；
4. 图片放到 `public/images/canvas/`，正文里用绝对路径引用：

   ```markdown
   ![说明文字](/images/canvas/your-image.png)
   ```

写完先在本地跑一遍 `pnpm run build`，确认没有报错再提交。

## 发布

站点托管在 Cloudflare Pages，两种发布方式：

- **本地发布**：先 `wrangler login` 完成授权，之后执行 `pnpm run deploy` 即可构建并上传；
- **绑定域名**：在 Cloudflare 控制台进入 Pages 项目 `epocanvas-docs`，在 Custom domains 里添加域名，CNAME 解析和 SSL 证书会自动配好。

## 参与

发现文档错误或者有改进建议，欢迎提 Issue 和 PR。提交 PR 前请在本地跑一下 `pnpm run build` 确认构建通过。

## 许可证

[MIT](./LICENSE)
