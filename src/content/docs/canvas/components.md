---
title: 界面组件与二次开发
description: EpoCanvas Docs 界面组件架构：Starlight 组件覆盖机制、七个定制组件的职责与数据流，以及二次开发的注意事项。
---

**EpoCanvas Docs** 的界面没有从零造轮子，而是在 Starlight 原生组件的基础上做了**定向覆盖**：保留 Starlight 的页面骨架与内容处理能力，替换掉顶栏、侧边栏、目录、搜索等展示组件，以获得想要的三栏布局和交互。本页说明这套组件体系的结构与修改方法。

---

## 组件覆盖机制

Starlight 允许在 `astro.config.mjs` 的 `components` 字段中，把任意原生组件替换为自定义实现。本专案覆盖了 7 个组件：

```javascript
// astro.config.mjs（节选）
components: {
  Header: './src/components/starlight/Header.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
},
```

构建时，Starlight 渲染页面的每个位置都会优先使用这里指定的文件。未被覆盖的组件（如页脚 Footer、移动端菜单）继续使用原生实现。

---

## 七个定制组件的职责

全部源码位于 `src/components/starlight/`，规模与职责如下：

| 组件文件 | 规模 | 职责 |
| :--- | :--- | :--- |
| `Header.astro` | 约 713 行 | 顶栏全部内容：Logo、搜索框、主导航、版本徽标、语言切换、主题切换、GitHub 与 Telegram 入口 |
| `Search.astro` | 约 840 行 | 双模式搜索：顶栏页内查找（高亮与计数）+ `Ctrl+K` 全站检索弹窗（Pagefind UI） |
| `Pagination.astro` | 约 123 行 | 底部"上一页 / 下一页"翻页卡片：扁平细边框、主题色标题、↙/↘ 斜向箭头指示翻页方向 |
| `TwoColumnContent.astro` | 约 77 行 | 正文与右侧目录的双栏骨架，控制右栏固定宽度与滚动 |
| `TableOfContents.astro` | 约 64 行 | "本页目录"标题、图标与目录列表，过滤掉页面自身标题 |
| `PageTitle.astro` | 约 62 行 | 页面大标题（取 Frontmatter 的 `title`）与"最后更新于"时间戳 |
| `Sidebar.astro` | 约 22 行 | 薄封装：复用 Starlight 原生的 `SidebarPersister`，实现换页时侧边栏滚动位置不变 |

---

## 数据流：三个配置文件驱动整个界面

定制组件本身不含业务数据，界面内容由三个配置文件驱动：

```text
astro.config.mjs ──→ sidebar 数组 ──→ Sidebar.astro 渲染左侧目录
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro 渲染顶部导航与高亮
src/utils/i18n.ts ──→ UI_TRANSLATIONS 字典 ──→ 所有带 data-i18n 标记的界面文字
```

- **左侧目录**只认 `astro.config.mjs` 的 `sidebar` 声明，新建文档必须在这里登记；
- **顶部导航**每项的显示文字通过 `labelKey` 到 `i18n.ts` 字典取翻译，`match` 函数决定当前页面高亮哪个按钮；
- **界面文案**（搜索框占位符、"本页目录"标题、主题切换提示等）全部带 `data-i18n` 属性，切换语言时脚本按字典就地替换。

也就是说：想改界面内容，先找对应的配置文件；只有改外观（间距、颜色、图标）才需要动组件源码。

---

## 各组件的关键实现细节

### PageTitle：页面标题与真实更新时间

页面大标题直接读取 Frontmatter 的 `title`，因此**正文中不要再写 `#` 一级标题**。"最后更新于"时间戳来自构建时的 Git 提交历史（`astro.config.mjs` 中开启了 `lastUpdated: true`），每次提交都会自动刷新，无需手动维护。

:::caution
更新时间在构建时从 Git 历史读取，因此：**尚未提交的新文档不会显示日期**（标题下只保留规范署名），提交后重新构建即会出现；如果构建环境是浅克隆（如 CI 中 `fetch-depth: 1`），Git 历史不完整，时间戳同样会缺失。两种情况都不影响构建。
:::

### Sidebar：滚动位置记忆的实现

`Sidebar.astro` 只有 20 余行，核心是复用了 Starlight 官方的 `SidebarPersister` 组件：它会在页面切换时保持侧边栏 DOM 不重建，从而保住滚动条位置。这也是左侧目录"换页不跳动"的原理。

### TableOfContents：本页目录的生成

目录数据由 Starlight 在构建时解析正文标题生成（`##` 与 `###`），组件只负责过滤掉页面标题本身并渲染。滚动高亮由 `starlight-toc` 自定义元素在浏览器端完成，不依赖任何框架。

### TwoColumnContent：右栏宽度的唯一出处

右侧目录栏宽度在 `@media (min-width: 72rem)` 下固定为 `20rem`（超宽屏 `90rem` 以上为 `21rem`），正文区最大宽度相应减去右栏宽度。想调整右栏宽度，改这一个文件即可，不要在其他样式表里零散覆盖。

### Header：导航、主题与语言

- 导航按钮遍历 `navigationConfig` 渲染，激活态样式由 `match` 函数的返回值决定；
- 主题切换写入 LocalStorage 的 `starlight-theme` 键，页面加载时按"本地选择 → 系统偏好"的顺序决定初始主题；
- 语言切换写入 `epocanvas-lang` 键，并对全页 `data-i18n` 元素做字典替换；
- 顶栏右侧的 GitHub 链接来自 `astro.config.mjs` 的 `social.github`，Telegram 链接（`https://t.me/epocanvas`）目前硬编码在组件内，如需修改请直接编辑 `Header.astro`。

### Search：双模式搜索

一个组件内实现了两套搜索（详见[全文搜索与快捷键使用](/canvas/search-engine/)）：

1. **页内查找**：顶栏输入框，回车在当前页的匹配文字间跳转，高亮由脚本打标记实现；
2. **全站检索**：`<dialog>` 弹窗 + Pagefind 默认 UI，索引在 `pnpm run build` 阶段生成。

### Pagination：翻页卡片

上一页 / 下一页数据由 Starlight 根据 `sidebar` 顺序在构建时算好（`Astro.locals.starlightRoute.pagination`），组件只负责渲染：两张等宽卡片、细边框无阴影、标题用主题色，↙ / ↘ 斜向箭头在悬停时沿翻页方向位移。箭头是内联 SVG 路径，站点若用于 RTL 语言会自动镜像方向。

---

## 二次开发注意事项

:::caution
覆盖组件意味着放弃了 Starlight 原生组件的后续更新。升级 Starlight 版本时，组件的 props 与 `Astro.locals.starlightRoute` 结构可能变化，升级后必须对全部 7 个覆盖组件做回归测试。
:::

- **改样式优先用 CSS 变量**：颜色、字体、布局尺寸集中在 `src/styles/custom.css` 的 `:root` 变量里，见[站点全局配置与样式定制](/canvas/configuration/)，多数定制不需要动组件；
- **改交互才动组件**：新增按钮、调整结构时，保持现有的 `data-i18n` 标记习惯，否则多语言切换会漏掉新元素；
- **改完务必本地验证**：`pnpm run dev` 检查交互，`pnpm run build` 确认类型与构建通过（本地命令见[常见问题 FAQ](/canvas/troubleshooting/)）。

常见的具体定制操作，直接查阅[常见定制场景速查](/canvas/recipes/)。
