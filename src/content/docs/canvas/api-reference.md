---
title: 站点全局配置与样式定制
description: EpoCanvas Docs 核心配置文件修改指南、侧边栏菜单调整、品牌 Logo 替换与主题颜色定制。
---

# 站点全局配置与样式定制

如果你想把 **EpoCanvas Docs** 用于你自己的团队专案，或者调整现有的网站标题、Logo 图标、目录结构与主题色，本章节将指导你如何进行快速定制。

---

## 1. 站点基本信息配置 (`astro.config.mjs`)

根目录下的 `astro.config.mjs` 是整个文档站的主配置文件。打开该文件，你可以修改以下常用选项：

```javascript
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  // 1. 站点的生产环境域名（影响 SEO 链接与 Sitemap）
  site: 'https://doc.epocanvas.com',

  integrations: [
    starlight({
      // 2. 网站的大标题与副标题描述
      title: 'EpoCanvas Docs',
      description: 'EpoCanvas 官方技术与产品使用指南',

      // 3. 网站左上角的 Logo 图标路径
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // 设置为 true 则隐藏文字只显示 Logo 图片
      },

      // 4. 右上角的 GitHub 仓库链接
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

      // 5. 引入的自定义样式表
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
```

---

## 2. 如何修改左侧目录菜单？

左侧的文档分类目录由 `astro.config.mjs` 中的 `sidebar` 数组控制。你可以非常直观地增删章节：

```javascript
sidebar: [
  // 分组一：产品概览
  {
    label: '产品概览与入门',
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // 分组二：你可以新增属于自己的业务模块
  {
    label: '用户指南',
    items: [
      { label: '账号注册与登录', link: '/canvas/login/' },
      { label: '协同画布基本操作', link: '/canvas/workbench/' },
    ],
  },
];
```

- **`label`**：在侧边栏上显示的中文分类名称或文章名称；
- **`link`**：文章对应的访问 URL 路径（以 `/` 开头和结尾）。

保存修改后，本地正在运行的预览服务会自动热更新，侧边栏会立刻刷新显示。

---

## 3. 自定义品牌主题色 (`src/styles/custom.css`)

EpoCanvas Docs 所有的色彩都是通过 CSS 变量（Variables）控制的。打开 `src/styles/custom.css`，你可以轻松替换为自己品牌的专属色调：

```css
:root {
  /* 品牌核心主色调（默认采用充满科技感的经典蓝） */
  --sl-color-accent: #3b82f6; /* 主色 */
  --sl-color-accent-low: #1e3a8a; /* 浅色半透明背景色 */
  --sl-color-accent-high: #93c5fd; /* 悬浮高亮与链接亮色 */

  /* 深色模式默认背景 */
  --sl-color-bg: #0b0f19;
  --sl-color-bg-sidebar: #0f172a;
  --sl-color-hairline: #1e293b; /* 分割线颜色 */
}

/* 浅色模式自适应重载 */
:root[data-theme='light'] {
  --sl-color-accent: #2563eb;
  --sl-color-bg: #ffffff;
  --sl-color-bg-sidebar: #f8fafc;
  --sl-color-hairline: #e2e8f0;
}
```

例如，如果你希望将全站主色调改为活力绿，只需要将 `--sl-color-accent` 改为绿色代码（如 `#10b981`）即可，按钮、高亮选中框与图标会自动同步变色。

---

## 4. 替换站点 Logo

1. 准备一张你自己的品牌 Logo 矢量图（推荐 `.svg` 格式，也可以使用清晰的 `.png`）；
2. 将图片保存到项目的 `public/images/logo.svg`；
3. 刷新浏览器，顶栏左侧的图标便会自动替换。
