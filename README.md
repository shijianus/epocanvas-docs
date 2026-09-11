# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Live-f38020.svg?style=flat-square)](https://epocanvas-docs.pages.dev)

> 专为 **EpoCanvas** 生态打造的官方技术文档站点系统。基于 **Astro 5** 与 **Starlight** 构建，开箱自带清晰的三栏排版、全文秒级搜索、10 种语言免刷新切换以及一键部署到 Cloudflare Pages。

🌐 **在线体验文档**：[https://doc.epocanvas.com](https://doc.epocanvas.com) 或 [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)

---

## 📸 真实界面展示

![EpoCanvas Docs 官方文档首页](./public/images/canvas/ui-home-landing.png)

---

## 🌟 核心特性

- **三栏式清晰排版**：左侧分类导航目录 + 中央适宜行宽正文阅读区 + 右侧随动高亮文章大纲（TOC），阅读长文章不迷航，切换页面保持侧边栏滚动位置。
- **开箱即用的本地全文搜索**：内置 Pagefind 轻量静态搜索引擎，无需依赖外部云服务，按下 <kbd>Cmd+K</kbd> / <kbd>Ctrl+K</kbd> 即可秒级搜索正文与标题，离线可用。
- **10 种语言免刷新切换**：支持简体中文、繁体中文、英语、日语、韩语、德语、法语、西班牙语、俄语与阿拉伯语，就地更新界面文字，零白屏等待。
- **增强型 Markdown 排版**：原生支持 5 种彩色提示框（Note/Tip/Important/Warning/Caution）、Shiki 代码语法高亮、增量代码对比（Diff）以及 Mermaid 文字流程图与时序图。
- **极速静态构建与边缘托管**：基于 Astro 5 静态编译内核，一键直传发布到 Cloudflare Pages，全球 CDN Anycast 加速，免费自动配置 HTTPS 证书。
- **务实严谨的文风规范**：内置 `product-docs-writing` 规范与 `AGENTS.md` 规则，坚决拒绝 AI 假大空黑话，讲人话、重实操。

---

## 🚀 3分钟快速上手

### 前置环境要求
- **Node.js**：`>= 18.14.1`（推荐 Node 20 LTS）
- **pnpm**：`>= 8.6.0`（推荐使用 pnpm，或 npm / yarn）
- **Git**：用于拉取代码

### 步骤 1：克隆仓库并安装依赖
```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
```

### 步骤 2：启动本地开发预览
```bash
pnpm run dev
```
打开浏览器访问 `http://localhost:4321`，即可开始编写 Markdown 并实时查看热更新效果。

### 常用命令清单
| 命令 | 说明 |
| :--- | :--- |
| `pnpm run dev` | 启动本地调试服务器（支持 HMR 实时热重载） |
| `pnpm run build` | 编译全站静态 HTML 页面并生成 Pagefind 搜索索引 |
| `pnpm run preview` | 本地预览编译后的静态产物（`dist/` 目录） |
| `pnpm run deploy` | 一键打包并推送到 Cloudflare Pages 线上生产环境 |

---

## 📂 专案目录结构

```text
epocanvas-docs/
├── .agents/skills/         # 工作区专属技能 (如 product-docs-writing 写作规范)
├── public/                 # 静态资源存放目录
│   └── images/canvas/      # 真实 UI 截图与系统架构矢量图
├── src/
│   ├── components/starlight/ # 覆写的 Starlight 核心定制组件
│   ├── config/navigation.ts  # 顶部全局导航栏配置
│   ├── content/docs/         # 文档正文 Markdown 文件
│   │   ├── index.mdx         # 文档站首页 Landing Page
│   │   └── canvas/           # 12 大核心功能说明与指南
│   ├── styles/custom.css     # 全局 CSS 变量、深浅色模式与三栏布局样式
│   └── utils/i18n.ts         # 10 国语言客户端翻译字典
├── astro.config.mjs        # 站点核心配置文件 (标题、侧边栏菜单、重定向)
├── AGENTS.md               # 工作区技术写作反 AI 八股规范约束
├── LICENSE                 # 开源许可证 (MIT)
├── package.json            # 依赖包与运行命令
└── RELEASE_NOTES.md        # 版本发布与更新日志
```

---

## 📝 编写与扩展文档

1. **新建文档**：在 `src/content/docs/canvas/` 目录下创建 `.md` 文件；
2. **头部元数据**：必须包含标准的 Frontmatter 信息：
   ```yaml
   ---
   title: 你的文档标题
   description: 简短的一句话描述
   ---
   ```
3. **注册侧边栏**：打开 `astro.config.mjs`，在 `sidebar` 数组的对应分组下添加你的文档链接；
4. **插入图片**：将图片保存在 `public/images/canvas/`，在 Markdown 中使用以 `/` 开头的绝对路径引用：
   ```markdown
   ![说明文字](/images/canvas/your-image.png)
   ```

---

## 🌐 部署到 Cloudflare Pages

本项目针对 Cloudflare Pages 进行了深度适配：

### 本地一键发布
确保本地已安装 Wrangler 并通过授权，运行：
```bash
pnpm run deploy
```

### 绑定自定义独立域名
1. 登录 Cloudflare 控制台，进入 Pages 项目 `epocanvas-docs`；
2. 在 **自定义域 (Custom domains)** 中添加 `doc.epocanvas.com`；
3. 系统将自动配置 CNAME 解析与 Universal SSL 证书。

---

## 🤝 参与贡献与开发规范

欢迎任何形式的建议、Issue 反馈与 Pull Request！
在提交 PR 前，请确保本地运行以下检查：

```bash
pnpm exec astro check && pnpm run build
```

所有文档编写请严格遵循 [`AGENTS.md`](./AGENTS.md) 与 [`.agents/skills/product-docs-writing/SKILL.md`](./.agents/skills/product-docs-writing/SKILL.md) 规定的**讲人话、重实操、反虚浮**的写作准则。

---

## 📄 开源许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。
