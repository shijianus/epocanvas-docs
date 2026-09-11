---
title: Cloudflare Pages 部署上线
description: EpoCanvas Docs 基于 Cloudflare Pages 的免费边缘托管指南、本地一键发布命令与自定义域名绑定。
---

# Cloudflare Pages 部署上线

文档撰写完成后，需要发布到公网供用户和团队访问。**EpoCanvas Docs** 推荐使用 **Cloudflare Pages** 进行静态托管。它不需要你购买云服务器或配置 Nginx，而且在全球拥有数百个 CDN 节点，打开速度快，并提供免费的自动 HTTPS 证书。

---

## 为什么推荐 Cloudflare Pages？

- **完全免费且免维护**：静态网站无需常驻后台服务，不需要定期更新操作系统补丁，几乎没有运维负担。
- **全球访问飞快**：借助 Cloudflare 的全球边缘 CDN，国内和海外的读者都能就近获取文档内容。
- **自带免费 SSL**：域名绑定后会自动签发和续期 HTTPS 证书，无需手动配置 Certbot。
- **秒级自动生效**：每次发布新内容只需上传更新的静态文件，几十秒内即可在全球网络同步更新。

---

## 部署方式一：本地终端一键发布 (推荐)

项目已经在 `package.json` 中配置好了一键发布指令，任何时候只要在本地终端运行：

```bash
pnpm run deploy
```

该命令会自动执行以下两步：
1. **自动打包**：运行 `astro build`，将全站编译成静态文件保存在 `dist/` 目录，并生成搜索索引；
2. **直传边缘**：调用 Cloudflare 官方的 `wrangler` 工具，将 `dist/` 中的文件极速同步到 Cloudflare 节点。

终端出现类似如下信息即代表发布成功：
```text
✨ Success! Uploaded files (2.4 sec)
✨ Deployment complete! Take a peek over at:
   https://epocanvas-docs.pages.dev
```

打开该网址即可看到最新的线上文档。

---

## 部署方式二：GitHub 提交自动构建 (CI/CD)

如果你希望团队成员只要向 GitHub 的 `main` 分支提交代码，网站就自动更新，可以开启 Cloudflare 的 Git 联动：

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，在左侧菜单点击 **Workers 和 Pages**；
2. 点击 **创建应用程序** -> 选择 **Pages** -> 点击 **连接到 Git**；
3. 选择你的文档仓库 `epocanvas-docs`；
4. 填写构建设置：
   - **框架预设**：选择 `Astro`；
   - **构建命令 (Build command)**：`pnpm run build`；
   - **输出目录 (Build output directory)**：`dist`；
5. 点击 **保存并部署**。之后每次代码 Push 到仓库，Cloudflare 都会自动拉取并重新编译上线。

---

## 绑定属于你自己的独立域名

除了 Cloudflare 默认分配的 `xxx.pages.dev` 域名外，你可以轻松绑定属于自己的独立域名（例如 `doc.epocanvas.com`）：

1. 在 Cloudflare Pages 项目后台，进入 **自定义域 (Custom domains)** 标签页；
2. 点击 **设置自定义域** 按钮；
3. 输入你的二级域名（例如 `doc.epocanvas.com`），点击继续；
4. 如果你的主域名已经在 Cloudflare 解析，系统会自动帮你添加一条 CNAME 记录；
5. 等待 2~5 分钟，Cloudflare 会自动为该域名签发 SSL 证书，状态变为“活动 (Active)”后，即可通过该独立域名安全访问。

---

## 如何检查线上是否生效？

你可以在电脑终端中通过 `curl` 命令快速测试站点的返回状态：

```bash
curl -sI https://epocanvas-docs.pages.dev | head -n 5
```

如果第一行返回 `HTTP/2 200`，说明线上文档站点运行非常健康。
