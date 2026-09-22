---
title: 常见问题与故障排查 FAQ
description: EpoCanvas Docs 本地运行报错、文档不显示、提示框渲染异常、搜索失效与 Cloudflare Pages 部署的排查清单。
---

在使用、编写或部署 **EpoCanvas Docs** 的过程中遇到异常时，先在这里对号入座。问题按"本地启动 → 文档编写 → 搜索 → 部署"的顺序排列，每个问题都给出原因和验证过的解决办法。

---

## 一、本地启动与安装问题

### Q1：执行 `pnpm run dev` 提示端口 4321 被占用

- **原因**：之前启动的开发服务器没有完全退出，或其他程序占用了 4321 端口。
- **解决办法**：换一个端口启动：

  ```bash
  pnpm run dev -- --port 4322
  ```

### Q2：安装依赖时提示 Sharp 模块编译错误

- **原因**：Sharp 是构建期压缩图片的底层 C++ 模块，Node.js 版本变动后旧缓存可能与之不匹配。
- **解决办法**：清理依赖后重装：

  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

### Q3：执行 `pnpm install` 时报 `packages field missing or empty`

- **原因**：`pnpm-workspace.yaml` 内容为空或格式不完整，pnpm 会把它当作工作区配置文件解析并报错。
- **解决办法**：确保文件包含 `packages` 字段：

  ```yaml
  packages:
    - .
  ```

---

## 二、文档编写与渲染问题

### Q4：新建了一篇 Markdown，但左侧侧边栏看不见它

- **原因**：侧边栏目录是手动声明的，新建文件必须登记到配置中。
- **解决办法**：打开 `astro.config.mjs`，在 `sidebar` 数组的合适分组下追加：

  ```javascript
  { label: '新功能说明', link: '/canvas/new-feature/' }
  ```

### Q5：终端报错 `"title" is required`

- **原因**：Markdown 头部漏写了 `title`，或开头的三个横线 `---` 格式不规范。
- **解决办法**：检查文件最上方的 Frontmatter：

  ```yaml
  ---
  title: 这是文章标题
  description: 这是文章描述
  ---
  ```

### Q6：页面出现了两个一模一样的大标题

- **原因**：正文里又写了一个一级标题 `#`。Frontmatter 的 `title` 已经渲染为大标题，正文再写 `#` 必然重复。
- **解决办法**：删除正文中的 `#` 标题，小节从 `##` 开始。完整规则见[渲染规则详解](/canvas/rendering/#标题规则)。

### Q7：写了 `> [!TIP]` 但提示框没有变色，文字原样显示

- **原因**：GitHub 风格的 `> [!TIP]` 引用块语法不受支持，Markdown 编译器不认识它。
- **解决办法**：改用三冒号语法：

  ```markdown
  :::tip
  这是正确的写法。
  :::
  ```

### Q8：插入的图片显示裂图

- **原因**：图片路径写错，或图片没有放进 `public/` 静态目录。
- **解决办法**：
  1. 确认图片保存在 `public/images/canvas/ui-docs-reading.png`；
  2. 引用时用 `/` 开头的绝对路径：`![描述](/images/canvas/ui-docs-reading.png)`，不要写 `../public/...` 这样的相对路径。

---

## 三、搜索功能问题

### Q9：本地 `pnpm dev` 调试时，全局搜索搜不到刚写的新文章

- **原因**：全站检索依赖构建时生成的 Pagefind 索引；开发模式下 `Ctrl + K` 弹窗不加载索引（打开后没有搜索输入框），全局检索整体不可用，这是框架的既定行为，不是站点故障。
- **解决办法**：完整打包后用预览服务器验证：

  ```bash
  pnpm run build
  pnpm run preview
  ```

  顶栏的页内查找不受此限制，开发时可以直接用它定位当前页内容。

### Q10：按 `Ctrl+K` 搜索弹窗没有弹出

- **原因**：部分输入法、剪贴板工具或截图软件占用了 `Ctrl+K` / `Cmd+K` 快捷键。
- **解决办法**：直接点击搜索框右侧的 `Ctrl K` 小徽标，同样可以打开全站检索弹窗。

---

## 四、Cloudflare Pages 部署问题

### Q11：刚绑定的自定义域名提示 SSL 握手失败 (Error 525)

- **原因**：Cloudflare 为新域名签发 Universal SSL 证书需要 2~5 分钟的全球生效时间。
- **解决办法**：等待几分钟后强制刷新（`Ctrl+F5` / `Cmd+Shift+R`）；期间可先访问 `<项目名>.pages.dev` 默认域名，它始终可用。

### Q12：运行 `pnpm run deploy` 报错 `Project not found`

- **原因**：部署命令中 `--project-name` 参数与 Cloudflare 控制台里的项目名不一致；也可能是本机未登录。
- **解决办法**：
  1. 先执行 `npx wrangler whoami` 确认已登录；
  2. 在 Cloudflare 控制台核对项目名，必要时修改 `package.json` 中 `deploy` 脚本的 `--project-name` 参数。

---

## 五、提交前的本地自检

向 GitHub 推送前，运行以下命令做一次完整自检（类型检查 + 全量构建）：

```bash
pnpm exec astro check && pnpm run build
```

`astro check` 输出 `0 errors`、构建以 `Complete!` 结束时，说明文档没有语法错误，可以放心提交。仓库的 CI（`build.yml`）会在推送后执行同样的构建，本地先通过可以避免 CI 失败。
