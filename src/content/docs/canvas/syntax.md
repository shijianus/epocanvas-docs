---
title: 提示框、代码块与图表示例
description: EpoCanvas Docs 4 种彩色提示框、代码块标题与行高亮、diff 对比与图表插入的实际用法和真实渲染效果。
---

编写高质量的技术文档，不仅需要清晰的文字，还需要醒目的重点提示、格式规整的代码范例和一目了然的示意图。本页所有示例都是实际生效的语法，你看到的效果就是渲染结果——本文本身就是一个活的示例页。

---

## 1. 四种彩色提示框

提示框使用三冒号语法：`:::类型` 开头、`:::` 结尾，中间写内容。本站基于 Starlight，支持 **note、tip、caution、danger** 四种类型。

### 语法与实际效果对照

:::note
**note（补充说明）**：用于介绍背景知识、补充设计细节或提示前置依赖。
:::

:::tip
**tip（实用技巧）**：用于分享提高操作效率的小妙招或最佳实践。
:::

:::caution
**caution（注意警告）**：提示可能存在的兼容性冲突、潜在错误或需要特别留意的操作。
:::

:::danger
**danger（高危提醒）**：涉及数据丢失、生产环境覆盖或不可逆操作的最高级别警示。
:::

### 提示框内可以放任意内容

提示框内部可以继续使用列表、代码块、表格等语法：

:::tip[安装提速]
使用 pnpm 安装依赖比 npm 快得多：

```bash
npm install -g pnpm
```
:::

:::caution
两个常见的无效写法，请注意避开：

- GitHub 风格的 `> [!NOTE]` 引用块语法不受支持，会原样显示成普通引用块；
- `:::important` 与 `:::warning` **不是本站支持的类型**，不会报错，但会静默渲染成普通段落，没有任何提示框样式。

从 GitHub 文档迁移时，请把 `> [!NOTE]` 改写为 `:::note`，`> [!WARNING]` 改写为 `:::caution`，`> [!CAUTION]` 改写为 `:::danger`。
:::

---

## 2. 代码块高级排版

### 2.1 文件名标题与指定行高亮

在代码围栏首行标注 `title="文件路径"`，并用 `{行号}` 高亮重点行：

````markdown
```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs', // 这一行会被高亮背景强调
  version: '1.2.0',
};
```
````

**渲染效果：**

```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.2.0',
};
```

### 2.2 增量代码对比 (diff)

展示配置升级或代码重构时，用 `diff` 语言让改动一目了然，`-` 开头的行显示为删除、`+` 开头的行显示为新增：

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**渲染效果：**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 2.3 终端命令

`bash`、`sh`、`powershell` 等终端语言会渲染为终端风格的深色边框：

```bash
pnpm run build
```

---

## 3. 图表怎么插入？

当前版本**不内置 Mermaid 等文字图表渲染**。直接书写 ` ```mermaid ` 围栏只会按普通代码块显示源码，不会生成图形。

推荐的做法是：在 [mermaid.live](https://mermaid.live) 等工具中编写并导出 **SVG 矢量图**，保存到 `public/images/canvas/` 后按图片语法插入。本站的架构图、语言切换流程图都是这样制作的：

![系统架构示意图](/images/canvas/docs-architecture.svg)

*图：以 SVG 图片形式插入的架构示意图，任意缩放不模糊。*

如果确实需要让 Mermaid 源码直接渲染成图，需要在工程中引入额外的渲染插件（如 `rehype-mermaid`），属于二次开发范畴，请评估维护成本后再引入。

---

## 4. 其他实用排版

- 行内代码：`pnpm run dev`，渲染为主题色等宽字体；
- 键盘按键：<kbd>Ctrl</kbd> + <kbd>K</kbd>，渲染为键帽样式；
- 任务清单：

```markdown
- [x] 支持语法高亮
- [x] 支持一键复制
- [ ] 内置 Mermaid 渲染（规划中）
```

渲染为带勾选状态的列表项。

### 4.1 脚注

需要标注资料来源或补充说明时，可以使用 GFM 脚注语法：

````markdown
静态索引由 Pagefind 在构建时生成[^pagefind]。

[^pagefind]: [Pagefind 官方文档](https://pagefind.app/) — 面向静态站点的本地搜索库。
````

**渲染效果：** 正文末尾会出现带序号的上标跳转标记[^pagefind-demo]，点击平滑跳转到页面底部的脚注列表。

[^pagefind-demo]: 这就是本页底部渲染出来的脚注本体。

灵活运用提示框、代码标注和示意图，可以大幅提升技术文档的阅读舒适度与专业感。完整的语法约定请阅读 **[渲染规则详解](/canvas/rendering/)**。
