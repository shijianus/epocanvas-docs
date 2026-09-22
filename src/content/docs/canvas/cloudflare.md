---
title: Cloudflare Pages 部署上线
description: EpoCanvas Docs 发布上线的完整图示教程：Wrangler 命令行直传、Git 自动构建、自定义域名绑定，每一步附真实控制台截图。
---

文档撰写完成后，需要发布到公网供团队和用户访问。**EpoCanvas Docs** 推荐托管在 **Cloudflare Pages** 上：不需要购买服务器、不需要配置 Nginx，静态文件直传即可，并自动获得 HTTPS 证书。本站自身（`docs.epocanvas.com`）就是用本文的方法发布的，以下所有控制台截图均来自真实部署过程。

---

## 准备工作

### 你需要什么

| 事项 | 说明 |
| :--- | :--- |
| **Cloudflare 账号** | 在 [dash.cloudflare.com](https://dash.cloudflare.com/) 免费注册，Pages 服务无需付费计划 |
| **本地能完整构建** | 先跑通 `pnpm run build`，确认 `dist/` 目录正常生成，参见[快速上手](/canvas/deployment/) |
| **Node.js + pnpm** | 部署命令依赖本地开发环境，版本要求同快速上手章节 |

### 两种部署方式怎么选

![Cloudflare Pages 部署双轨对比图：左侧命令行本地直传（本站采用），右侧 Git 仓库自动构建（团队协作推荐）](/images/canvas/docs-deploy-compare.svg)

*图：Cloudflare Pages 两种部署路径对比。左侧通过本机构建后用 Wrangler 直传边缘（本站实际采用），右侧通过 GitHub Webhook 触发云端自动构建。*

| 对比项 | 方式一：命令行直传 | 方式二：Git 自动构建 |
| :--- | :--- | :--- |
| 操作方式 | 本地执行 `pnpm run deploy` | 推送代码到 GitHub 自动触发 |
| 上手难度 | 低，两条命令 | 中，需要在控制台完成一次配置 |
| 适合场景 | 首次上线、单人维护、快速更新 | 多人协作、希望"提交即上线" |
| 本站采用 | ✅ 是（可在控制台验证） | 未启用，可随时补充 |

:::tip
两种方式可以并存：日常用 Git 自动构建，紧急修错时用本地 `pnpm run deploy` 直接覆盖上线。
:::

:::tip[完全不想敲命令？]
[快速上手](/canvas/deployment/)页提供了 Cloudflare、Vercel、Netlify 三家的一键部署按钮：点一下、授权账号、确认配置，文档站就发布到你自己的云账号了，详见[一键部署](/canvas/deployment/#一键部署点一个按钮就上线)。其中 Cloudflare 按钮走 Workers 静态托管，与本页介绍的 Pages 方式是两条独立路径，对静态文档站来说访问体验一致，选一条走即可。
:::

---

## 方式一：本地命令行直传（首次推荐）

这种方式由本机构建后直接上传到 Cloudflare，是**本站实际采用**的部署方式。

### 第 1 步：登录 Cloudflare 账号

项目已预置 Wrangler（Cloudflare 官方命令行工具），首次使用需要浏览器授权登录：

```bash
npx wrangler login
```

执行后终端提示 `Opening a link in your default browser...`，浏览器会打开 Cloudflare 授权页，点击 **Allow** 后终端显示登录成功。用以下命令确认登录状态：

```bash
npx wrangler whoami
```

:::caution
如果跳过登录直接执行部署，终端会提示 `You are not authenticated. Please run 'wrangler login'.`，不会产生任何部署。
:::

### 第 2 步：一键构建并上传

项目在 `package.json` 中预置了一键发布命令：

```bash
pnpm run deploy
```

它等价于依次执行两步：先 `astro build` 把全站编译到 `dist/` 目录并生成搜索索引，再调用 `wrangler pages deploy dist` 把产物直传到 Cloudflare。构建阶段的真实输出如下：

```text
23:54:01 [build] 181 page(s) built in 20.78s
23:54:01 [build] Complete!
```

上传完成后，Wrangler 会输出本次部署的预览地址。项目名称已由 `deploy` 脚本通过 `--project-name epocanvas-docs` 预先指定，部署过程中不会再交互式询问。

### 第 3 步：在控制台找到你的项目

打开 [dash.cloudflare.com](https://dash.cloudflare.com/)，在左侧菜单点击 **Compute (Workers & Pages)**，就能看到项目列表。下图标注了三个关键位置：

![Cloudflare 控制台的 Workers & Pages 项目列表，标注了左侧菜单入口、Create application 按钮和 epocanvas-docs 项目](/images/canvas/deploy/cf-01-projects-list.png)

*图：Workers & Pages 项目列表。① 左侧菜单进入 Workers & Pages；② Create application 按钮用于创建新项目；③ 我们的 `epocanvas-docs` 项目，显示访问域名 `epocanvas-docs.pages.dev` 与最近部署时间。*

点击项目名称进入项目详情，**Deployments** 标签页展示完整部署历史：

![epocanvas-docs 项目的部署历史页面，标注了生产域名、部署记录与状态](/images/canvas/deploy/cf-02-deployments.png)

*图：部署历史页面。① 项目名；② Deployments 标签页；③ 生产域名同时绑定了 `docs.epocanvas.com`（自定义域名）和 `epocanvas-docs.pages.dev`（默认域名）；④ 每条部署记录标注了分支与提交信息；⑤ 状态与部署时间。*

:::note
每次执行 `pnpm run deploy` 都会在列表顶部新增一条部署记录，并自动成为当前生产版本。历史记录保留在列表中，出问题时可以随时回滚。
:::

---

## 认识直传项目的构建配置

进入 **Settings** 标签页可以看到直传项目与 Git 项目的区别：

![epocanvas-docs 项目的 Settings 构建配置页，Git repository 一栏显示未连接](/images/canvas/deploy/cf-03-settings.png)

*图：Settings 标签页。① Settings 入口；② Git repository 一栏显示 Connect（未连接）——直传项目不需要 Git 构建配置，构建完全在你本地完成。*

:::tip
这也解释了直传方式的优势：构建环境就是你的本地电脑，不受 Cloudflare 构建队列影响；代价是每次更新都必须在部署那台电脑上执行命令。
:::

---

## 方式二：连接 Git 仓库自动构建（可选）

如果希望"提交代码即自动上线"，可以把项目连接到 GitHub 仓库，由 Cloudflare 在云端自动构建。

### 第 1 步：进入创建流程

在 Workers & Pages 项目列表页点击右上角 **Create application** 按钮（见[方式一第 3 步](#第-3-步在控制台找到你的项目)的图示标注 ②），选择 **Pages** 标签页。

### 第 2 步：连接 Git 仓库

1. 在创建界面选择 **Connect to Git**；
2. 授权 Cloudflare 访问你的 GitHub 账号；
3. 在仓库列表中选择文档仓库 `epocanvas-docs`；
4. 点击 **开始设置**。

### 第 3 步：填写构建配置

在"设置构建和部署"中填写以下配置：

| 配置项 | 填写值 |
| :--- | :--- |
| 框架预设 | `Astro` |
| 构建命令 | `pnpm run build` |
| 构建输出目录 | `dist` |

### 第 4 步：验证自动构建

点击 **保存并部署**，Cloudflare 自动完成首次构建。之后每次向 `main` 分支推送代码，Cloudflare 都会自动拉取、构建并上线。每次部署的构建日志可以在项目的 **Deployments** 标签页中点击对应部署查看。

:::caution
Git 集成项目的 Settings 页会多出构建配置区块（框架预设、构建命令等），这与[直传项目](#认识直传项目的构建配置)的界面不同——如果你在 Settings 里找不到构建配置，说明当前项目是直传项目，属于正常现象。
:::

---

## 绑定自定义域名

Cloudflare 默认分配的 `epocanvas-docs.pages.dev` 域名可以直接使用；绑定自己的域名（例如 `docs.epocanvas.com`）只需几分钟。

### 第 1 步：打开自定义域设置

在项目详情页点击 **Custom domains** 标签页，再点击 **Set up a custom domain**：

![epocanvas-docs 项目的自定义域名页面，docs.epocanvas.com 已绑定且 SSL 生效](/images/canvas/deploy/cf-04-domains.png)

*图：Custom domains 标签页。① 标签页入口；② Set up a custom domain 按钮；③ 已绑定的 `docs.epocanvas.com`，状态 Active 且 SSL enabled。*

### 第 2 步：添加域名并等待生效

1. 点击 **Set up a custom domain**，输入你的二级域名（如 `docs.epocanvas.com`）；
2. 如果域名 DNS 已托管在 Cloudflare，系统自动添加 CNAME 记录；托管在别处的域名需要手动加一条 CNAME 记录指向 `<项目名>.pages.dev`；
3. 等待证书签发（通常 2~5 分钟），状态变为 **Active**（如上图 ③）后即可通过新域名访问。

HTTPS 证书由 Cloudflare 自动签发和续期，不需要手动申请或配置。

---

## 验证部署结果

### 命令行检查 HTTP 状态

```bash
curl -sI https://epocanvas-docs.pages.dev
```

真实的返回结果：

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

看到 `200` 即说明站点健康。绑定了自定义域名后，把 URL 换成自己的域名再测一次。

### 浏览器逐项确认

| 检查项 | 预期结果 |
| :--- | :--- |
| 首页与任意文档页能打开 | 页面完整渲染，无白屏 |
| 新修改的内容已生效 | 刚编辑的章节内容在线上可见 |
| `Ctrl+K` 全站搜索 | 能搜到最新文章（索引随构建生成） |
| 深浅色主题切换 | 切换正常且刷新后保持 |

---

## 常见部署问题

### 部署后线上内容没有更新？

浏览器强刷（`Ctrl+F5` / `Cmd+Shift+R`）排除缓存；仍不更新时到控制台 Deployments 页确认最新一条记录的时间，再用 `curl -sI` 对比部署预览域名。

### 自定义域名提示 SSL 握手失败 (Error 525)？

证书签发需要 2~5 分钟全球生效时间，等待后强刷即可；期间可先访问 `epocanvas-docs.pages.dev` 默认域名。

### 运行 `pnpm run deploy` 报错 `Project not found`？

先执行 `npx wrangler whoami` 确认已登录；再核对 `package.json` 中 `deploy` 脚本的 `--project-name` 与控制台项目名是否一致。

更多排查项见[常见问题与故障排查 FAQ](/canvas/troubleshooting/)。
