---
title: 快速上手 (3分钟运行)
description: EpoCanvas Docs 本地环境准备、安装依赖、启动本地开发服务与常用操作命令速查。
---

把这套文档站跑起来有两条路，按你的目的选一条即可：

- **只想立刻看到一个线上站点**：不用装任何环境，直接跳到下面的[一键部署](#一键部署点一个按钮就上线)小节，点一下按钮，两分钟后就能拿到属于你自己的网址；
- **想写文档、改内容**：先按 [准备工作](#准备工作) 把项目在本地跑起来，边改边看效果，写完后再用[常用命令](#常用开发命令速查)里的部署命令发布。

---

## 一键部署：点一个按钮就上线

下面的按钮来自 Cloudflare、Vercel、Netlify 三家的官方"部署按钮"。点击后会打开对应平台的部署向导，平台自动把这个仓库克隆到你自己的 GitHub 账号下，然后自动完成云端构建和发布。全程只需要一个 GitHub 账号，不需要在电脑上安装 Node.js、pnpm，也不需要敲任何命令。

### 部署到 Cloudflare（推荐）

[![Deploy to Cloudflare](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

点击按钮后，向导分三步走：

1. **授权登录**：依次登录 GitHub 和 Cloudflare。两者都有免费套餐，没有账号就现场注册一个；
2. **克隆仓库**：Cloudflare 自动把这个仓库复制一份到你的 GitHub 账号下，之后的所有内容修改都在你自己的仓库里进行；
3. **确认配置并部署**：向导最后会展示一个配置页，按下表确认无误后点击 Deploy：

| 配置项 | 向导里默认显示什么 | 怎么处理 |
| :--- | :--- | :--- |
| 仓库名 / 项目名 | 预填 `epocanvas-docs` | 保持默认 |
| 构建命令 | 自动识别为本仓库的 `pnpm run build` | 保持默认 |
| 部署命令 | 预填 `pnpm run deploy` | **改成 `npx wrangler deploy`** |

:::caution
部署命令务必改成 `npx wrangler deploy`。预填的 `pnpm run deploy` 是本站维护者保留的 Cloudflare Pages 直传命令，它部署到的是写死的项目名，在按钮部署流程里会直接报错。
:::

首次部署时，Cloudflare 检测到仓库里没有 Workers 配置文件，会自动识别出这是 Astro 静态站点，并向你的仓库发起一个自动生成的配置 Pull Request（PR）——把它合并即可，之后每次推送都会自动构建上线。从点击按钮到看到网址，顺利的话两三分钟。

部署完成后，Cloudflare 会分配一个 `https://epocanvas-docs.<你的子域名>.workers.dev` 形式的公网地址，自带 HTTPS 证书。想换成自己的域名，在控制台进入 Workers & Pages → 你的项目 → **Settings** → **Domains & Routes** 添加即可。 本站的线上实例可以直接对照：Pages 默认域名 [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev) 与自定义域名 [https://docs.epocanvas.com](https://docs.epocanvas.com)。

### 部署到 Vercel 和 Netlify

习惯用其他平台的话，下面两个按钮做的是同一件事，两个平台都能自动识别 Astro 项目，不需要手动填任何构建配置：

[![Deploy with Vercel](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Deploy to Netlify](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel**：点击按钮 → 授权 GitHub → 保持默认选项点击 Deploy。完成后得到 `epocanvas-docs.vercel.app` 域名，个人 Hobby 计划免费；
- **Netlify**：点击按钮 → 连接 GitHub → 平台自动克隆仓库并完成首次构建。完成后得到 `epocanvas-docs.netlify.app` 域名，免费档够用。

:::note
三个按钮的机制相同：把仓库克隆到你的 GitHub 账号，并配好"推送代码就自动重新构建上线"的持续部署。选一个平台用就好，不需要重复部署。本站自身采用 Cloudflare Pages 直传方式托管（见 [Cloudflare Pages 部署上线](/canvas/cloudflare/)），与上述按钮路径互不影响——对静态文档站来说，两种托管方式读者看到的访问体验是一致的。
:::

---

## 准备工作

一键部署适合"先把站点发出去"，但撰写和修改文档总归要在本地进行。如果打算动手写内容，请先确认你的电脑上安装了以下基础开发环境：

| 工具 | 要求版本 | 检查命令 | 说明 |
| :--- | :--- | :--- | :--- |
| **Node.js** | 22.x ≥ 22.23.4 / 24.x ≥ 24.12.0 | `node -v` | 运行 JavaScript 与构建静态页面的环境 |
| **pnpm** | `10.34.5` | `pnpm -v` | 项目固定使用的包管理器版本 |
| **Git** | 最新稳定版 | `git --version` | 用于拉取代码与版本管理 |

CI 使用 `.node-version` 固定的 Node.js 22.23.4。 Node.js: `^22.23.4 || ^24.12.0`; pnpm: `10.34.5`.

:::tip
如果你的电脑上还没安装 `pnpm`，可以通过 Node.js 自带的 npm 快速全局安装：

```bash
npm install -g pnpm@10.34.5
```
:::

---

## 3步在本地跑起来

### 第一步：克隆代码仓库到本地

打开终端（Terminal），执行以下命令克隆项目代码并进入项目文件夹：

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### 第二步：安装项目依赖

在项目根目录下执行安装命令：

```bash
pnpm install
```

pnpm 会按 `pnpm-lock.yaml` 下载 Astro、Starlight 等依赖。以下是安装完成输出的示例，并非本次实测；耗时取决于网络、缓存和机器：

```text
Done in 1m 3.2s using pnpm v10.34.5
```

### 第三步：启动本地开发预览服务器

依赖安装完成后，运行启动指令：

```bash
pnpm run dev
```

终端将输出类似如下的信息（首次启动需要预编译依赖，耗时几秒）：

```text
astro  v7.4.4  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

此时打开浏览器访问 `http://localhost:4321`，就能看到完整的文档站点了。修改任意 `.md` 文件保存后，浏览器页面会自动刷新显示最新内容。

![快速上手页面在本地开发服务器中的真实渲染效果](/images/canvas/ui-quickstart.png)

*图：`http://localhost:4321/canvas/deployment/` 的实际渲染效果，即你现在正在阅读的这一页。*

---

## 常用开发命令速查

在日常编写文档或维护项目时，主要使用以下几个命令：

| 命令 | 适用场景 | 详细说明 |
| :--- | :--- | :--- |
| `pnpm run dev` | **日常写文档** | 启动本地调试服务，支持热更新（HMR）。修改任意 `.md` 文件后，浏览器会自动刷新更新内容。 |
| `pnpm run build` | **打包测试** | 在本地完整编译全站静态页面，并在 `dist/` 目录下生成 HTML、CSS 以及 Pagefind 搜索索引。 |
| `pnpm run verify` | **完整自检** | 执行测试、配置检查、Astro 类型检查、构建及内容/产物检查 |
| `pnpm run preview` | **预览打包产物** | 本地启动轻量 Web 服务器来运行 `dist/` 产物，用于在正式发布前检查链接和样式是否正常。 |
| `pnpm run deploy` | **一键发布上线** | 检查部署前置条件，通过 verify 后发布至 Cloudflare Pages |

先执行一次 `npx wrangler login` 完成授权，再运行 `pnpm run deploy`。部署由 `scripts/verify-release.mjs` 执行；非 `main` 分支、工作区不干净，或 HEAD 与远端 `origin/main` 的实际提交不一致时会被拒绝。脚本先运行 `pnpm run verify`，通过后才调用 Wrangler。项目名定义在此脚本中，不在 `package.json`。

完整的发布步骤与线上验证方法，请阅读 **[Cloudflare Pages 部署上线](/canvas/cloudflare/)**。

---

## 核心配置文件在哪里？

如果需要修改网站的基础信息，主要关注以下几个文件：

- **网站名称与目录菜单**：修改根目录下的 `astro.config.mjs`。你可以修改网站的 `title`（站点标题）、`site`（线上域名）以及 `sidebar`（左侧目录菜单）。
- **顶部导航栏按钮**：修改 `src/config/navigation.ts`。在这里可以增减顶部的"首页"、"产品说明"等按钮及其跳转路径。
- **页面颜色与字体样式**：修改 `src/styles/custom.css`。在这里可以调整浅色和深色模式下的主题颜色。
- **添加新文档**：直接在 `src/content/docs/canvas/` 目录下新建 `.md` 文件，并登记到侧边栏，详见 [Markdown 编写与排版指南](/canvas/markdown/)。

---

## 下一步

本地服务成功运行后，你可以继续了解：

- **[页面布局与阅读体验](/canvas/layout/)**：了解顶栏、侧边栏和正文界面的布局细节。
- **[渲染规则详解](/canvas/rendering/)**：搞清楚 Markdown 是如何被渲染成最终页面的，避免踩排版语法坑。
- **[Cloudflare Pages 部署上线](/canvas/cloudflare/)**：把文档发布到公网并绑定独立域名。
