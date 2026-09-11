---
title: 常见问题与故障排查 FAQ
description: EpoCanvas Docs 本地运行报错、文档排版遗漏、搜索失效与 Cloudflare Pages 部署排查清单。
---

# 常见问题与故障排查 FAQ

在使用、编写或部署 **EpoCanvas Docs** 的过程中，如果遇到异常情况，不用慌张。本手册整理了开发者最常遇到的几类问题及其对应的快速解决办法。

---

## 一、 本地启动与安装问题

### Q1: 执行 `pnpm run dev` 提示端口 4321 被占用
- **原因**：本地之前启动的开发服务器未完全退出，或者有其他程序正在使用 4321 端口。
- **解决办法**：在命令后加上 `--port` 参数指定一个空闲端口，例如：
  ```bash
  pnpm run dev -- --port 4322
  ```

### Q2: 安装依赖时提示 Sharp 模块编译错误
- **原因**：Sharp 是用于在本地压缩图片的底层模块，如果你的 Node.js 版本发生过变动，可能导致旧缓存冲突。
- **解决办法**：清理本地依赖缓存并重新安装：
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

---

## 二、 文档编写与排版问题

### Q3: 新建了一篇 Markdown，但在左侧侧边栏看不见它？
- **原因**：侧边栏的目录结构是手动声明管理的，新建文件后需要将其登记在配置文件中。
- **解决办法**：打开根目录下的 `astro.config.mjs`，找到 `sidebar` 数组，在合适的分组下追加你的新文档路径即可，例如：
  ```javascript
  { label: '新功能说明', link: '/canvas/new-feature/' }
  ```

### Q4: 终端报错 `[AstroContentError] "title" is required`
- **原因**：Markdown 头部漏写了 `title` 属性，或者开头的三个横线 `---` 格式不规范。
- **解决办法**：打开报错的文件，检查最上方是否包含规范的 Frontmatter：
  ```yaml
  ---
  title: 这是文章标题
  description: 这是文章描述
  ---
  ```

### Q5: 插入的图片在页面上显示“裂图”（无法加载）
- **原因**：图片文件路径写错，或者没有把图片放进 `public/` 静态目录。
- **解决办法**：
  1. 确保图片保存在 `public/images/canvas/your-pic.png`；
  2. 在 Markdown 中引用时，路径必须以 `/` 开头：`![描述](/images/canvas/your-pic.png)`。千万不要写成相对路径 `../public/...`。

---

## 三、 全文搜索功能问题

### Q6: 为什么我在本地 `pnpm dev` 调试时，搜不到刚才写的新文章？
- **原因**：为了保持本地写文档时的极速响应，开发服务器在 HMR 实时热重载时不会反复遍历编译庞大的静态索引。
- **解决办法**：当你需要完整测试搜索功能时，在终端运行一次打包命令：
  ```bash
  pnpm run build
  pnpm run preview
  ```
  Pagefind 会在 `build` 阶段完整扫描所有新文章并生成索引，此时打开 `http://localhost:4321` 即可测试完整的全文搜索。

### Q7: 键盘按下 `Cmd+K` 搜索弹窗没有呼出
- **原因**：你的电脑上可能有某些输入法、剪贴板管理工具或截图软件占用了 `Cmd+K` / `Ctrl+K` 快捷键。
- **解决办法**：直接用鼠标点击顶栏中间的搜索框，同样可以瞬间呼出搜索弹窗。

---

## 四、 Cloudflare Pages 部署问题

### Q8: 刚绑定的独立域名访问提示 `SSL 握手失败 (Error 525)`
- **原因**：在 Cloudflare 添加新域名后，系统向权威 CA 机构申请 Universal SSL 免费证书通常需要 2~5 分钟的全球广播时间。
- **解决办法**：
  1. 耐心等待 3 分钟后按强制刷新（Ctrl+F5 或 Cmd+Shift+R）；
  2. 也可以先直接访问官方分配的 `https://epocanvas-docs.pages.dev` 域名，该域名自带默认泛域名证书，永远都是即时可用的。

### Q9: 运行 `pnpm run deploy` 报错 `Project not found`
- **原因**：本地部署命令中的 `--project-name` 参数与你在 Cloudflare 控制台创建的项目名称不一致。
- **解决办法**：确认你的项目在 Cloudflare 中的名称，或在 `package.json` 的 `deploy` 脚本中将项目名修改一致。

---

## 五、 本地一键自检命令

在向 GitHub 提交代码前，建议运行以下一键自检指令，它会自动检查类型、执行全量编译并确认产物健康：

```bash
pnpm exec astro check && pnpm run build
```

如果输出 `[build] Complete!`，说明你的文档站点没有任何语法错误，可以放心提交发布。
