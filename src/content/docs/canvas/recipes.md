---
title: 常见定制场景速查
description: EpoCanvas Docs 高频定制操作速查：新增文档、导航按钮、界面语言、主题色、Logo、布局尺寸与搜索文案的完整步骤。
---

本页把最常见的定制需求整理成"按步骤照做即可"的速查手册。每条配方的改动位置都已标注到具体文件；动手前建议先了解[渲染规则](/canvas/rendering/)和[组件体系](/canvas/components/)，能少走弯路。

---

## 配方 1：新增一篇文档

1. 在 `src/content/docs/canvas/` 下新建 `.md` 文件（小写英文加中划线命名，如 `user-guide.md`）；
2. 文件开头写好 Frontmatter：

   ```yaml
   ---
   title: 用户使用指南
   description: 一句话说明本篇讲什么，会展示在搜索结果与分享卡片里。
   ---
   ```

3. 打开 `astro.config.mjs`，在 `sidebar` 数组的目标分组下登记：

   ```javascript
   { label: '用户使用指南', link: '/canvas/user-guide/' }
   ```

4. 保存后本地预览确认出现在左侧目录，再执行 `pnpm run deploy` 发布。

:::warning
只建文件不登记 `sidebar`，页面可以访问但不会出现在左侧目录里——这是新手最常踩的坑。
:::

---

## 配方 2：新增一个顶部导航按钮

1. 打开 `src/config/navigation.ts`，向 `navigationConfig` 数组追加条目：

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: '博客',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // 站外链接在新窗口打开
   },
   ```

2. 打开 `src/utils/i18n.ts`，为 `nav.blog` 补充 10 种语言的翻译词条；
3. 保存后顶栏立即出现新按钮；站内链接如需参与导航高亮，为其配置 `match` 函数。

---

## 配方 3：调整页面高亮规则

页面路径变化导致顶栏高亮错误时，修改 `navigation.ts` 中对应条目的 `match` 函数：

```typescript
match: (pathname: string) =>
  pathname === '/canvas/' || pathname.includes('layout'),
```

规则是精确匹配优先、`includes` 兜底，多个按钮的 `match` 不要有交集，否则会出现两个按钮同时高亮。

---

## 配方 4：更换品牌主题色

1. 打开 `src/styles/custom.css`；
2. 同时修改浅色（`:root`）与深色（`:root[data-theme='dark']`）两个块中的主色三件套：

   ```css
   --sl-color-accent: #10b981;      /* 主色：按钮、选中态 */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* 选中项浅背景 */
   --sl-color-accent-high: #047857; /* 链接与高亮文字 */
   ```

3. 保存后全站按钮、高亮、链接自动换色。只改一处会导致另一种主题下配色脱节。

---

## 配方 5：替换 Logo

| 位置 | 文件 | 用途 |
| :--- | :--- | :--- |
| 顶栏左侧 | `public/images/logo.svg` | 内页顶栏图标，路径配置在 `astro.config.mjs` 的 `logo.src` |
| 首页大图 | `src/assets/logo.svg` | 落地页右侧装饰图 |

两处建议同时替换。Logo 用 SVG 矢量格式；`astro.config.mjs` 中 `logo.replacesTitle` 设为 `true` 可隐藏标题文字只留图标。

---

## 配方 6：调整布局尺寸

布局三要素集中在 `src/styles/custom.css` 顶部：

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 左侧目录宽度 */
  --sl-content-width: 60rem;    /* 正文最大宽度 */
  --sl-nav-height: 3.5rem;      /* 顶栏高度 */
}
```

:::caution
右侧目录栏的宽度不在这些变量里，它由 `src/components/starlight/TwoColumnContent.astro` 中的 `20rem` 控制（超宽屏 `21rem`）。调整右栏宽度时，同一文件里正文区的 `max-width: calc(100% - 20rem)` 也要同步修改。
:::

---

## 配方 7：修改搜索框提示文字

搜索框占位符、按钮提示等文案都走多语言字典。打开 `src/utils/i18n.ts`，修改 `search.placeholder` 等词条：

```typescript
'search.placeholder': {
  'zh-CN': '搜索文档与指令...',
  en: 'Search docs and commands...',
  // 其余语言同理
},
```

保存后本地热更新立即可见，无需构建。

---

## 配方 8：为站点添加验证类 `<head>` 标签

接入 Google Search Console、百度站长平台等服务时需要往 `<head>` 注入验证标签。打开 `astro.config.mjs`，在 Starlight 配置的 `head` 数组中追加：

```javascript
head: [
  // 已有的 favicon 配置 ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: '验证字符串',
    },
  },
],
```

保存并重新部署后，用平台提供的验证按钮检测。更多上线后的搜索引擎配置见 [SEO 与性能优化](/canvas/seo/)。

---

## 改动后的通用检查流程

无论做哪类定制，提交前按此顺序验证：

```bash
pnpm run dev      # 1. 浏览器逐页查看效果
pnpm exec astro check && pnpm run build   # 2. 类型检查 + 完整构建
pnpm run preview  # 3. 预览构建产物，确认无异常后再发布
```

发布方式见 [Cloudflare Pages 部署上线](/canvas/cloudflare/)。
