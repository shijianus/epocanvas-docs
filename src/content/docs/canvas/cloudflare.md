---
title: Cloudflare Pages 部署上线
description: Cloudflare Pages 部署指南：Wrangler 直传、可选 Git 集成、自定义域名与发布后检查。
---

本页介绍如何把静态文档部署到 **Cloudflare Pages**。以下步骤依据仓库脚本编写；控制台截图是既有示例，不是本次候选版本的部署或测试记录。界面如有差异，以当前控制台为准。是否构建通过、是否上线，须查看实际命令输出与部署状态，不能由本文推断。

---

## 准备工作

### 你需要什么

| 事项 | 说明 |
| :--- | :--- |
| **Cloudflare 账号** | 在 [dash.cloudflare.com](https://dash.cloudflare.com/) 免费注册，Pages 服务无需付费计划 |
| **本地能完整构建** | 先跑通 `pnpm run verify`，确认 `dist/` 目录正常生成，参见[快速上手](/canvas/deployment/) |
| **Node.js + pnpm** | 部署命令依赖本地开发环境，版本要求同快速上手章节 |

### 两种部署方式怎么选

![Wrangler 本地直传与 Git 集成构建的部署路径示意](/images/canvas/docs-deploy-compare.svg)

*图：两条部署路径。左侧在本地构建并用 Wrangler 上传，右侧由 Git 集成触发云端构建。图示不代表两条路径已在本次修订中实测。*

| 对比项 | 方式一：命令行直传 | 方式二：Git 自动构建 |
| :--- | :--- | :--- |
| 操作方式 | 本地执行 `pnpm run deploy` | 推送代码到 GitHub 自动触发 |
| 上手难度 | 低，两条命令 | 中，需要在控制台完成一次配置 |
| 适合场景 | 首次上线、单人维护、快速更新 | 多人协作、希望"提交即上线" |
| 发布检查 | 脚本通过完整 verify 后才上传 | 需在云端构建命令中配置完整 verify |

:::tip
创建项目时先选择 Direct Upload 或 Git 集成。不能假设现有直传项目可以直接切换为 Git 项目；改用 Git 集成时应创建相应项目。即使用 Wrangler 紧急发布，也不能跳过仓库的发布检查。
:::

:::tip[完全不想敲命令？]
[快速上手](/canvas/deployment/)页提供了 Cloudflare、Vercel、Netlify 三家的一键部署按钮：点一下、授权账号、确认配置，文档站就发布到你自己的云账号了，详见[一键部署](/canvas/deployment/#一键部署点一个按钮就上线)。其中 Cloudflare 按钮走 Workers 静态托管，与本页介绍的 Pages 方式是两条独立路径，对静态文档站来说访问体验一致，选一条走即可。
:::

---

## 方式一：本地命令行直传（首次推荐）

此方式在本地构建，再通过 Wrangler 上传。仓库的 `pnpm run deploy` 面向维护者的 `epocanvas-docs` 项目，不是任意 fork 都能直接复用的通用部署按钮。

### 第 1 步：登录 Cloudflare 账号

项目已预置 Wrangler（Cloudflare 官方命令行工具），首次使用需要浏览器授权登录：

```bash
pnpm exec wrangler login
```

执行后终端提示 `Opening a link in your default browser...`，浏览器会打开 Cloudflare 授权页，点击 **Allow** 后终端显示登录成功。用以下命令确认登录状态：

```bash
pnpm exec wrangler whoami
```

:::caution
需要有效的 Cloudflare 登录或令牌权限。认证失败时先检查 `wrangler whoami`、账号和项目权限；错误文字可能随 Wrangler 版本变化。
:::

### 第 2 步：一键构建并上传

项目在 `scripts/verify-release.mjs` 中预置了一键发布命令：

先运行 `pnpm exec wrangler login` 授权。`pnpm run deploy` 由 `scripts/verify-release.mjs` 执行，要求在 `main`、工作区干净（包括未跟踪文件）、上游为 `origin/main`，且 HEAD 与远端实际提交一致。脚本运行完整 `pnpm run verify` 后还会重新检查 Git 状态，再调用 Wrangler。项目名在脚本中定义；使用自己的项目须先调整发布配置，不能上传到别人的项目。

```bash
pnpm run deploy
```

`pnpm run deploy` 会运行配置检查、Astro 类型检查、构建、测试及内容/产物检查，通过后才上传。只想核对部署前置条件时，可运行下列命令；它仍会读取远端 Git 引用，但不会运行完整验证、构建或上传，不能把 dry-run 成功当作测试通过。

```bash
pnpm run deploy --dry-run
```

上传成功后，Wrangler 才会输出部署地址。当前脚本显式指定 `--project-name epocanvas-docs --branch main`，仍需确认目标账号内存在该项目且生产分支配置正确。

### 第 3 步：在控制台找到你的项目

打开 [dash.cloudflare.com](https://dash.cloudflare.com/)，在左侧菜单点击 **Compute (Workers & Pages)**，就能看到项目列表。下图标注了三个关键位置：

![Cloudflare 控制台的 Workers & Pages 项目列表，标注了左侧菜单入口、Create application 按钮和 epocanvas-docs 项目](/images/canvas/deploy/cf-01-projects-list.png)

*图：Workers & Pages 项目列表。① 左侧菜单进入 Workers & Pages；② Create application 按钮用于创建新项目；③ 我们的 `epocanvas-docs` 项目，显示访问域名 `epocanvas-docs.pages.dev` 与最近部署时间。*

点击项目名称进入项目详情，**Deployments** 标签页展示完整部署历史：

![epocanvas-docs 项目的部署历史页面，标注了生产域名、部署记录与状态](/images/canvas/deploy/cf-02-deployments.png)

*图：部署历史页面。① 项目名；② Deployments 标签页；③ 生产域名同时绑定了 `docs.epocanvas.com`（自定义域名）和 `epocanvas-docs.pages.dev`（默认域名）；④ 每条部署记录标注了分支与提交信息；⑤ 状态与部署时间。*

:::note
只有实际上传成功才会产生新部署记录。请在 Deployments 核对状态、分支、提交与生产域名；脚本被拒绝或验证失败时，不应认为线上已经更新。
:::

---

## 认识直传项目的构建配置

进入 **Settings** 标签页可以看到直传项目与 Git 项目的区别：

![epocanvas-docs 项目的 Settings 构建配置页，Git repository 一栏显示未连接](/images/canvas/deploy/cf-03-settings.png)

*图：Settings 标签页。① Settings 入口；② Git repository 一栏显示 Connect（未连接）——直传项目不需要 Git 构建配置，构建完全在你本地完成。*

:::tip
直传不依赖云端构建队列，但部署机器仍需满足 Node、pnpm、Git 和认证要求，不限于某一台电脑。
:::

---

## 方式二：连接 Git 仓库自动构建（可选）

如果需要推送触发构建，请创建 Git 集成的 Pages 项目并连接仓库。下列为配置指南，不代表本仓库已启用或本次已验证这条路径。

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
| 构建命令 | `pnpm install --frozen-lockfile && pnpm run verify` |
| 构建输出目录 | `dist` |
| Node.js | `22.23.4`，与 `.node-version` 一致 |
| pnpm | `10.34.5`，与 `packageManager` 一致 |

### 第 4 步：验证自动构建

在云端构建环境确认所需 Node 与 pnpm 已安装后，点击 **保存并部署**，查看 Deployments 日志。只有安装、完整验证和上传都成功，才算部署成功。后续是否由 `main` 推送触发，取决于项目配置的生产分支和自动部署开关；单独的 GitHub CI 成功不会替你部署 Pages。

:::caution
Git 集成项目的 Settings 页会多出构建配置区块（框架预设、构建命令等），这与[直传项目](#认识直传项目的构建配置)的界面不同——如果你在 Settings 里找不到构建配置，说明当前项目是直传项目，属于正常现象。
:::

---

## 绑定自定义域名

Cloudflare 会提供 `<项目名>.pages.dev` 域名，也可绑定自己的域名。以下域名仅为示例，DNS 与证书生效时间以实际状态为准。

### 第 1 步：打开自定义域设置

在项目详情页点击 **Custom domains** 标签页，再点击 **Set up a custom domain**：

![epocanvas-docs 项目的自定义域名页面，docs.epocanvas.com 已绑定且 SSL 生效](/images/canvas/deploy/cf-04-domains.png)

*图：Custom domains 标签页。① 标签页入口；② Set up a custom domain 按钮；③ 已绑定的 `docs.epocanvas.com`，状态 Active 且 SSL enabled。*

### 第 2 步：添加域名并等待生效

1. 点击 **Set up a custom domain**，输入你的二级域名（如 `docs.epocanvas.com`）；
2. 如果域名 DNS 已托管在 Cloudflare，系统自动添加 CNAME 记录；托管在别处的域名需要手动加一条 CNAME 记录指向 `<项目名>.pages.dev`；
3. 等待 DNS 验证与证书签发，状态变为 **Active** 后再测试新域名；不要把固定几分钟当作完成保证。

HTTPS 证书由 Cloudflare 自动签发和续期，不需要手动申请或配置。

---

## 验证部署结果

### 命令行检查 HTTP 状态

```bash
curl -sI https://epocanvas-docs.pages.dev
```

响应示例（日期和状态以实际请求为准）：

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200` 仅说明这个 URL 响应成功，不能证明译文、资源、搜索或最新内容正确。请继续完成下表检查，并分别检查默认域名与自定义域名。

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

先查看 Custom domains 中的域名验证与证书状态，再检查 DNS 记录、代理配置及错误详情。不要只等待固定几分钟；默认 `pages.dev` 域名可用于对比排查。

### 运行 `pnpm run deploy` 报错 `Project not found`？

先执行 `pnpm exec wrangler whoami` 确认已登录；再核对 `scripts/verify-release.mjs` 中的 `--project-name` 与控制台项目名是否一致。

更多排查项见[常见问题与故障排查 FAQ](/canvas/troubleshooting/)。
