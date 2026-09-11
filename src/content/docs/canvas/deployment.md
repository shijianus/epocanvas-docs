---
title: 快速上手 (3分钟运行)
description: EpoCanvas Docs 本地环境准备、安装依赖、启动本地开发服务与常用操作命令速查。
---

本章节将带你在本地电脑上把 **EpoCanvas Docs** 跑起来。整个过程只需要几行命令，完成之后你就可以在浏览器中一边修改 Markdown 文件，一边实时查看排版渲染效果。

---

## 准备工作

在开始之前，请确认你的电脑上安装了以下基础开发环境：

| 工具 | 推荐版本 | 检查命令 | 说明 |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.14.1`（推荐 20 LTS） | `node -v` | 运行 JavaScript 与构建静态页面的底座环境 |
| **pnpm** | `>= 9`（CI 环境使用 10） | `pnpm -v` | 推荐使用的包管理器，安装速度快且节省硬盘空间 |
| **Git** | 最新稳定版 | `git --version` | 用于拉取代码与版本管理 |

:::tip
如果你的电脑上还没安装 `pnpm`，可以通过 Node.js 自带的 npm 快速全局安装：

```bash
npm install -g pnpm
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

pnpm 会自动根据 `pnpm-lock.yaml` 下载所需的前端依赖，包含 Astro、Starlight 和本地图片处理模块，通常几十秒即可完成。安装结束时终端会显示总耗时：

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### 第三步：启动本地开发预览服务器

依赖安装完成后，运行启动指令：

```bash
pnpm run dev
```

终端将输出类似如下的信息（首次启动需要预编译依赖，耗时几秒）：

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

此时打开浏览器访问 `http://localhost:4321`，就能看到完整的文档站点了。修改任意 `.md` 文件保存后，浏览器页面会自动刷新显示最新内容。

![快速上手页面在本地开发服务器中的真实渲染效果](/images/canvas/ui-quickstart.png)

*图：`http://localhost:4321/canvas/deployment/` 的实际渲染效果，即你现在正在阅读的这一页。*

---

## 常用开发命令速查

在日常编写文档或维护专案时，主要使用以下几个命令：

| 命令 | 适用场景 | 详细说明 |
| :--- | :--- | :--- |
| `pnpm run dev` | **日常写文档** | 启动本地调试服务，支持热更新（HMR）。修改任意 `.md` 文件后，浏览器会自动刷新更新内容。 |
| `pnpm run build` | **打包测试** | 在本地完整编译全站静态页面，并在 `dist/` 目录下生成 HTML、CSS 以及 Pagefind 搜索索引。 |
| `pnpm run preview` | **预览打包产物** | 本地启动轻量 Web 服务器来运行 `dist/` 产物，用于在正式发布前检查链接和样式是否正常。 |
| `pnpm run deploy` | **一键发布上线** | 先自动执行 build，再调用 Wrangler 工具将 `dist/` 推送到 Cloudflare Pages 线上生产环境。 |

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
