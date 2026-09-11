---
title: 站点全局配置与样式定制
description: EpoCanvas Docs 核心配置文件修改指南、侧边栏菜单调整、品牌 Logo 替换与主题颜色定制。
---

如果你想把 **EpoCanvas Docs** 用作自己团队的文档站，或者调整网站标题、Logo、目录结构与主题色，本章节介绍常用的定制入口。所有配置改动保存后，本地开发服务器会自动热更新，浏览器立即可见。

---

## 1. 站点基本信息 (`astro.config.mjs`)

根目录下的 `astro.config.mjs` 是整个文档站的主配置文件。与站点信息直接相关的选项如下（注释标明了修改时机）：

```javascript
export default defineConfig({
  // 站点的生产环境域名，影响 SEO 链接与 Sitemap 生成
  site: 'https://docs.epocanvas.com',

  integrations: [
    starlight({
      // 网站标题，显示在浏览器标签页与顶栏
      title: 'EpoCanvas Docs',
      // 站点描述，用于搜索引擎结果摘要
      description: 'EpoCanvas 全栈技术、架构与产品运维指南',

      // 顶栏左侧的 Logo 图片路径
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // 设为 true 则只显示 Logo、隐藏标题文字
      },

      // 右上角的 GitHub 仓库链接
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

      // 自定义样式表入口
      customCss: ['./src/styles/custom.css'],

      // 侧边栏目录（见下一节）
      sidebar: [/* ... */],
    }),
  ],

  // 旧路径跳转表，防止链接失效
  redirects: { '/mail': '/canvas' },
});
```

---

## 2. 如何修改左侧目录菜单？

左侧的文档分类目录由 `astro.config.mjs` 中 Starlight 配置的 `sidebar` 数组控制：

```javascript
sidebar: [
  // 分组一：产品概览
  {
    label: '产品概览与入门',       // 分组名称
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // 分组二：你可以新增自己的业务分组
  {
    label: '用户指南',
    items: [
      { label: '账号注册与登录', link: '/canvas/login/' },
    ],
  },
];
```

- **`label`**：侧边栏上显示的分类名或文章名，可以与 Frontmatter 的 `title` 不同（例如用更短的显示名）；
- **`link`**：文章的访问路径，对应 `src/content/docs/` 下的文件位置。

:::warning
新建的 `.md` 文件必须登记到 `sidebar` 数组中才会出现在左侧目录里，只创建文件不登记是新手最常踩的坑。
:::

---

## 3. 自定义品牌主题色 (`src/styles/custom.css`)

站点所有颜色都由 CSS 变量控制，定义在 `src/styles/custom.css`。文件顶部是浅色模式变量，`:root[data-theme='dark']` 块是深色模式变量：

```css
:root {
  /* 品牌主色（浅色模式） */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* 选中项浅色背景 */
  --sl-color-accent-high: #1d4ed8;                  /* 链接与高亮文字 */

  /* 页面底色与分割线 */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* 深色模式使用同名变量，只需替换色值 */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

例如想把全站主色换成活力绿，把浅色与深色两个块里的 `--sl-color-accent` 改为 `#10b981` 系列色值即可，按钮、选中态、链接会自动同步变色。

布局尺寸也在这份文件顶部集中定义：

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 左侧目录宽度 */
  --sl-content-width: 60rem;    /* 正文最大宽度 */
  --sl-nav-height: 3.5rem;      /* 顶栏高度 */
}
```

---

## 4. 替换站点 Logo

1. 准备一张品牌 Logo 矢量图（推荐 `.svg`，也可以用清晰的 `.png`）；
2. 覆盖保存为 `public/images/logo.svg`（首页大图在 `src/assets/logo.svg`）；
3. 刷新浏览器，顶栏与首页的图标自动替换。

:::tip
两处 Logo 用途不同：`public/images/logo.svg` 用于顶栏，`src/assets/logo.svg` 用于首页右侧的装饰大图，建议同时替换。
:::
