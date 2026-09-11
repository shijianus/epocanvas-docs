---
title: Cloudflare Pages 部署上线
description: EpoCanvas Docs 发布上线的完整操作手册：Wrangler 命令行直传、Git 自动构建、自定义域名绑定与线上结果验证。
---

文档撰写完成后，需要发布到公网供团队和用户访问。**EpoCanvas Docs** 推荐托管在 **Cloudflare Pages** 上：不需要购买服务器、不需要配置 Nginx，静态文件直传即可，并自动获得 HTTPS 证书。本站自身的线上地址 [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev) 就是用本文的方法发布的。

---

## 准备工作

| 事项 | 说明 |
| :--- | :--- |
| **Cloudflare 账号** | 在 [dash.cloudflare.com](https://dash.cloudflare.com/) 免费注册，Pages 服务无需付费计划 |
| **本地能完整构建** | 先跑通 `pnpm run build`，确认 `dist/` 目录正常生成，参见[快速上手](/canvas/deployment/) |
| **Node.js + pnpm** | 部署命令依赖本地开发环境，版本要求同快速上手章节 |

---

## 部署方式一：本地命令行直传（首次推荐）

这种方式由本机构建后直接上传，适合首次上线和快速更新。

### 第一步：登录 Cloudflare 账号

项目已预置 Wrangler（Cloudflare 官方命令行工具），首次使用需要浏览器授权登录：

```bash
npx wrangler login
```

执行后终端提示 `Opening a link in your default browser...`，浏览器会打开 Cloudflare 授权页，点击 **Allow** 后终端显示成功信息。可以用以下命令确认登录状态：

```bash
npx wrangler whoami
```

:::caution
如果跳过登录直接执行部署，终端会提示 `You are not authenticated. Please run 'wrangler login'.`，不会产生任何部署。
:::

### 第二步：一键构建并上传

项目在 `package.json` 中预置了一键发布命令：

```bash
pnpm run deploy
```

它等价于依次执行两步：先 `astro build` 把全站编译到 `dist/` 目录并生成搜索索引，再调用 `wrangler pages deploy dist` 把产物直传到 Cloudflare。构建阶段的真实输出如下：

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

上传完成后，Wrangler 会输出本次部署的预览地址。首次部署时 Wrangler 还会交互式询问项目名称，直接回车使用 `package.json` 里预置的 `epocanvas-docs` 即可。

### 第三步：在浏览器确认上线结果

打开 `https://<你的项目名>.pages.dev`，看到文档站正常渲染即部署成功。本站的真实上线效果：

![部署完成后的线上站点真实渲染效果](/images/canvas/deploy-live-site.png)

*图：部署完成后访问线上地址的实际渲染效果，与本地构建产物完全一致。*

---

## 部署方式二：连接 Git 仓库自动构建

如果希望"提交代码即自动上线"，可以把 Cloudflare Pages 连接到 GitHub 仓库：

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，左侧菜单进入 **Workers 和 Pages**；
2. 点击 **创建** → 选择 **Pages** 标签 → **连接到 Git**；
3. 授权 GitHub 后选择文档仓库 `epocanvas-docs`；
4. 在"设置构建和部署"中填写：

| 配置项 | 填写值 |
| :--- | :--- |
| 框架预设 | `Astro` |
| 构建命令 | `pnpm run build` |
| 构建输出目录 | `dist` |

5. 点击 **保存并部署**，Cloudflare 自动完成首次构建。

之后每次向 `main` 分支推送代码，Cloudflare 都会自动拉取、构建并上线，无需本地操作。每次部署的构建日志可以在控制台的**部署**标签页中查看。

:::tip
两种方式可以并存：日常写文档用 Git 自动构建，紧急修错时用本地 `pnpm run deploy` 直接覆盖上线。
:::

---

## 绑定自定义域名

Cloudflare 默认分配的 `xxx.pages.dev` 域名可以直接使用；绑定自己的域名（例如 `doc.epocanvas.com`）只需几分钟：

1. 在 Cloudflare Pages 项目后台进入**自定义域**标签页；
2. 点击**设置自定义域**，输入你的二级域名（如 `doc.epocanvas.com`）；
3. 如果域名 DNS 已托管在 Cloudflare，系统自动添加 CNAME 记录；托管在别处的域名需要手动加一条 CNAME 记录指向 `<项目名>.pages.dev`；
4. 等待证书签发（通常 2~5 分钟），状态变为**活动**后即可通过新域名访问。

HTTPS 证书由 Cloudflare 自动签发和续期，不需要手动申请或配置。

---

## 验证部署结果

### 命令行检查 HTTP 状态

```bash
curl -sI https://epocanvas-docs.pages.dev
```

真实的返回结果：

```text
HTTP/1.1 200 OK
Date: Fri, 11 Sep 2026 15:32:39 GMT
Content-Type: text/html; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Origin: *
Cache-Control: public, max-age=0, must-revalidate
```

看到 `HTTP/1.1 200 OK` 即说明站点健康。绑定了自定义域名后，把 URL 换成自己的域名再测一次。

### 浏览器逐项确认

| 检查项 | 预期结果 |
| :--- | :--- |
| 首页与任意文档页能打开 | 页面完整渲染，无白屏 |
| 新修改的内容已生效 | 刚编辑的章节内容在线上可见 |
| `Ctrl+K` 全站搜索 | 能搜到最新文章（索引随构建生成） |
| 深浅色主题切换 | 切换正常且刷新后保持 |

---

## 日常更新流程

上线后的日常维护就是"改文档 → 发布"两步：

```bash
# 1. 本地确认渲染无误
pnpm run dev

# 2. 提交到 GitHub（若配置了 Git 自动构建，推送后自动上线）
git add . && git commit -m "docs: 更新部署章节" && git push origin main

# 3. 或者本地直接重新发布
pnpm run deploy
```

发布完成后用上面的 `curl` 命令或浏览器确认新内容已生效。
