---
title: 界面组件与二次开发
description: EpoCanvas Docs 界面组件架构：Starlight 组件覆盖机制、定制组件的职责与数据流，以及二次开发的注意事项。
---

**EpoCanvas Docs** 的界面没有从零造轮子，而是在 Starlight 原生组件的基础上做了**定向覆盖**：保留 Starlight 的页面骨架与内容处理能力，替换掉顶栏、侧边栏、目录、搜索等展示组件，以获得想要的三栏布局和交互。本页说明这套组件体系的结构与修改方法。

---

## 组件覆盖机制

以下是 `astro.config.mjs` 的 `components` 注册方式；完整清单以当前配置为准。

```javascript
// astro.config.mjs（节选）
components: {
  Header: './src/components/starlight/Header.astro',
  MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
  SkipLink: './src/components/starlight/SkipLink.astro',
},
```

构建时优先使用已注册的自定义组件，未覆盖的组件继续使用 Starlight 原生实现。

---

## 自定义覆盖组件的职责

源码位于 `src/components/starlight/`，主要职责如下。

| 组件文件 | 职责 |
| :--- | :--- |
| `Header.astro` | 顶栏全部内容：Logo、搜索框、主导航、版本徽标、语言切换、主题切换、GitHub 与 Telegram 入口 |
| `Search.astro` | 双模式搜索：顶栏页内查找（高亮与计数）+ `Ctrl+K` 全站检索弹窗（Pagefind UI） |
| `Pagination.astro` | 底部"上一页 / 下一页"翻页卡片：扁平细边框、主题色标题、↙/↘ 斜向箭头指示翻页方向 |
| `TwoColumnContent.astro` | 正文与右侧目录的双栏骨架，控制右栏固定宽度与滚动 |
| `TableOfContents.astro` | "本页目录"标题、图标与目录列表，过滤掉页面自身标题 |
| `PageTitle.astro` | 页面大标题（取 Frontmatter 的 `title`）与"最后更新于"时间戳 |
| `Sidebar.astro` | 薄封装：复用 Starlight 原生的 `SidebarPersister`，实现换页时侧边栏滚动位置不变 |
| `SkipLink.astro` | 键盘聚焦时显示跳转链接，将焦点移到正文标题 `_top` |
| `MobileMenuToggle.astro` | 移动端侧边栏开关，同步展开状态，支持 Esc 关闭并归还焦点 |

---

## 数据流：三个配置文件驱动整个界面

定制组件本身不含业务数据，界面内容由三个配置文件驱动：

```text
astro.config.mjs ──→ locales + sidebar 数组 ──→ Sidebar.astro 渲染左侧目录（各语言取对应译文标签）
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro 渲染顶部导航与高亮（链接自动带语言前缀）
src/utils/i18n.ts ──→ UI_TRANSLATIONS 字典 ──→ 各组件在构建期按当前语言取词条
```

- **左侧目录**只认 `astro.config.mjs` 的 `sidebar` 声明，新建文档必须在这里登记；每个条目的 `translations` 字段提供 10 种语言的菜单文字；
- **顶部导航**每项的显示文字通过 `labelKey` 到 `i18n.ts` 字典取翻译，`match` 函数决定当前页面高亮哪个按钮（匹配前会先去掉语言前缀）；
- **界面文案**（搜索框占位符、"本页目录"标题、主题切换提示等）由各组件调用 `getTranslation(key, lang)` 在构建期直接输出对应语言，页面里没有运行时替换脚本。

也就是说：想改界面内容，先找对应的配置文件；只有改外观（间距、颜色、图标）才需要动组件源码。

---

## 各组件的关键实现细节

### PageTitle：页面标题与真实更新时间

页面大标题直接读取 Frontmatter 的 `title`，因此**正文中不要再写 `#` 一级标题**。当前 `astro.config.mjs` 开启了 `lastUpdated: true`；未用 Frontmatter 日期覆盖时，“最后更新于”在构建时读取最后修改该文件的 Git 提交时间，不是每次仓库提交或每次构建的时间。仅修改其他文件不会刷新本页日期。

:::caution
未提交的新文档没有可读取的 Git 历史，因此不显示日期；已有文件的未提交修改也不会改变其提交日期。浅克隆（如 `fetch-depth: 1`）可能把历史截断处的提交日期当作更新时间，也可能无法读取日期，不能把它当成完整历史。需要准确日期时使用完整 Git 历史（CI 中设置 `fetch-depth: 0`）。读取日期失败不影响构建。
:::

### Sidebar：滚动位置记忆的实现

`Sidebar.astro` 复用 Starlight 的 `SidebarPersister`，在换页后恢复侧边栏滚动位置。移动端菜单的开关与焦点由 `MobileMenuToggle.astro` 处理。

### TableOfContents：本页目录的生成

目录数据由 Starlight 在构建时解析正文标题生成（`##` 与 `###`），组件只负责过滤掉页面标题本身并渲染。滚动高亮由 `starlight-toc` 自定义元素在浏览器端完成，不依赖任何框架。

### TwoColumnContent：右栏宽度的唯一出处

右侧目录栏宽度在 `@media (min-width: 72rem)` 下固定为 `20rem`（超宽屏 `90rem` 以上为 `21rem`），正文区最大宽度相应减去右栏宽度。想调整右栏宽度，改这一个文件即可，不要在其他样式表里零散覆盖。

### Header：导航、主题与语言

- 导航按钮遍历 `navigationConfig` 渲染，激活态样式由 `match` 函数的返回值决定，链接通过 `localizedHref()` 自动加上当前语言前缀；
- 主题切换写入 LocalStorage 的 `starlight-theme` 键，页面加载时按"本地选择 → 系统偏好"的顺序决定初始主题；
- 语言下拉菜单里每一项都是指向当前页面对应语言版本的真实链接，点击即跳转，没有额外的状态存储；
- 顶栏右侧的 GitHub 与 Telegram 图标都硬编码在 `src/components/starlight/Header.astro` 内，改地址直接编辑该文件；Telegram 指向 `@epocanvas` 账号页，悬停提示即语言词条 `social.telegram`。`astro.config.mjs` 的 `social` 控制的是侧边栏底部那组社交图标，两处互不影响。

### Search：双模式搜索

一个组件内实现了两套搜索（详见[全文搜索与快捷键使用](/canvas/search-engine/)）：

1. **页内查找**：顶栏输入框，回车在当前页的匹配文字间跳转，高亮由脚本打标记实现；
2. **全站检索**：`<dialog>` 弹窗 + Pagefind 默认 UI，索引在 `pnpm run build` 阶段生成。

页内输入框仅在视口宽度至少 `64rem` 时显示；更窄时只保留全站搜索按钮。查找当前文章可使用浏览器自带功能。截图若与当前布局不同，以实际界面为准。

### Pagination：翻页卡片

上一页 / 下一页数据由 Starlight 根据 `sidebar` 顺序在构建时算好（`Astro.locals.starlightRoute.pagination`），组件只负责渲染：两张等宽卡片、细边框无阴影、标题用主题色，↙ / ↘ 斜向箭头在悬停时沿翻页方向位移。箭头是内联 SVG 路径，站点若用于 RTL 语言会自动镜像方向。

---

## 二次开发注意事项

:::caution
覆盖组件意味着放弃了 Starlight 原生组件的后续更新。升级 Starlight 版本时，组件的 props 与 `Astro.locals.starlightRoute` 结构可能变化，升级后必须对全部覆盖组件做回归测试。
:::

- **改样式优先用 CSS 变量**：颜色、字体、布局尺寸集中在 `src/styles/custom.css` 的 `:root` 变量里，见[站点全局配置与样式定制](/canvas/configuration/)，多数定制不需要动组件；
- **改交互才动组件**：新增按钮、调整结构时，界面文字用 `getTranslation(key, lang)` 取词并在 `i18n.ts` 里补齐 10 种语言词条，漏补的语言会回退显示中文；
- **改完务必本地验证**：`pnpm run dev` 检查交互，`pnpm run verify` 确认类型与构建通过（本地命令见[常见问题 FAQ](/canvas/troubleshooting/)）。

常见的具体定制操作，直接查阅[常见定制场景速查](/canvas/recipes/)。
