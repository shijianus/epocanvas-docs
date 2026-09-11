---
title: 快速上手 (3分钟运行)
description: EpoCanvas Docs 本地环境准备、安装依赖、启动本地开发服务与常用操作命令速查。
---

# 快速上手 (3分钟运行)

本章节将带你在本地电脑上快速把 **EpoCanvas Docs** 跑起来。整个过程只需要几行命令，完成之后你就可以在浏览器中一边修改 Markdown 文件，一边实时查看排版渲染效果。

---

## 准备工作

在开始之前，请确认你的电脑上安装了以下基础开发环境：

| 工具 | 推荐版本 | 检查命令 | 说明 |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.14.1`（推荐 20 LTS） | `node -v` | 运行 JavaScript 与构建静态页面的底座环境 |
| **pnpm** | `>= 8.6.0`（推荐 9.x） | `pnpm -v` | 推荐使用的包管理器，安装速度快且节省硬盘空间 |
| **Git** | 最新稳定版 | `git --version` | 用于拉取代码与版本管理 |

> [!TIP]
> 如果你的电脑上还没安装 `pnpm`，可以通过 Node.js 自带的 npm 快速全局安装：
> ```bash
> npm install -g pnpm
> ```

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
pnpm 会自动根据 `pnpm-lock.yaml` 下载所需的前端依赖，包含 Astro、Starlight 和本地图片处理模块，通常几十秒即可完成。

### 第三步：启动本地开发预览服务器
依赖安装完成后，运行启动指令：

```bash
pnpm run dev
```

终端将输出类似如下的信息：
```text
  🚀  astro  v5.x.x started in 320ms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

此时打开浏览器，访问 `http://localhost:4321`，就能看到完整的文档站点了！

---

## 常用开发命令速查

在日常编写文档或维护专案时，主要使用以下几个命令：

| 命令 | 适用场景 | 详细说明 |
| :--- | :--- | :--- |
| `pnpm run dev` | **日常写文档** | 启动本地调试服务，支持热更新（HMR）。修改任意 `.md` 文件后，浏览器会自动刷新更新内容。 |
| `pnpm run build` | **打包测试** | 在本地完整编译全站静态页面，并在 `dist/` 目录下生成 HTML、CSS 以及 Pagefind 搜索索引。 |
| `pnpm run preview` | **预览打包产物** | 本地启动轻量 Web 服务器来运行 `dist/` 产物，用于在正式发布前检查链接和样式是否正常。 |
| `pnpm run deploy` | **一键发布上线** | 先自动运行 build，再调用 Wrangler 工具直接将文档推送到 Cloudflare Pages 线上生产环境。 |

---

## 核心配置文件在哪里？

如果需要修改网站的基础信息，主要关注以下几个文件：

- **网站名称与目录菜单**：修改根目录下的 `astro.config.mjs`。你可以修改网站的 `title`（站点标题）、`site`（线上域名）以及 `sidebar`（左侧目录菜单）。
- **顶部导航栏按钮**：修改 `src/config/navigation.ts`。在这里可以增减顶部的“首页”、“文档”、“部署”等按钮及其跳转路径。
- **页面颜色与字体样式**：修改 `src/styles/custom.css`。在这里可以调整浅色和深色模式下的主题颜色。
- **添加新文档**：直接在 `src/content/docs/canvas/` 目录下新建 `.md` 文件即可。

---

## 常见启动问题排查

### 1. 启动时提示端口 `4321` 被占用
**原因**：本地之前启动的服务没有正常关闭，或者有其他程序正在使用 4321 端口。  
**解决办法**：你可以通过 `--port` 参数指定一个新端口启动：
```bash
pnpm run dev -- --port 4322
```

### 2. 执行 `pnpm install` 提示 Sharp 模块编译异常
**原因**：Sharp 是用于在构建期压缩优化图片的底层 C++ 模块，当本地 Node.js 版本与之前的缓存不匹配时可能出现此提示。  
**解决办法**：清理 node_modules 后重新安装：
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 下一步

本地服务成功运行后，你可以继续了解：
- **[页面布局与阅读体验](/canvas/dns-setup/)**：了解顶部、侧边栏和正文界面的布局细节。
- **[Markdown 编写与排版指南](/canvas/system-config/)**：学习如何在文档中编写漂亮的排版、代码块和图表。
