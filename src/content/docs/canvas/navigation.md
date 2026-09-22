---
title: 顶部导航与页面路由
description: EpoCanvas Docs 顶部导航栏配置、动态路径高亮规则、外部版本徽标与历史重定向设置。
---

顶部导航栏是用户在各个功能板块之间穿梭的主要通道。**EpoCanvas Docs** 把所有导航项集中在一个配置文件中，改动一处即可全站生效，并自带精确的当前页面高亮和历史链接重定向机制。

---

## 导航配置中心 (`src/config/navigation.ts`)

所有顶部导航按钮都在 `src/config/navigation.ts` 中以声明式数组维护。每个条目的字段定义如下：

```typescript
// 导航条目属性定义
export interface NavItem {
  id: string; // 唯一标识符
  labelKey: string; // 多语言翻译字典中的键名
  defaultLabel: string; // 默认显示的文本（如"首页"、"产品说明"）
  href: string; // 跳转链接或相对路径
  match?: (pathname: string) => boolean; // 判断当前页面是否应高亮该按钮的规则
  badge?: string; // 额外显示的小胶囊徽标（如版本号 "v1.2.0"）
  isExternal?: boolean; // 是否为外部网页跳转（是则在新窗口打开）
}
```

### 当前官方配置（节选）

```typescript
export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    defaultLabel: '首页',
    href: '/',
    match: (pathname: string) => pathname === '/' || pathname === '',
  },
  {
    id: 'docs',
    labelKey: 'nav.docs',
    defaultLabel: '产品说明',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname === '/canvas' ||
      pathname === '/canvas/' ||
      pathname.includes('about') ||
      pathname.includes('layout') ||
      pathname.includes('search-engine') ||
      pathname.includes('i18n') ||
      pathname.includes('navigation'),
  },
  {
    id: 'quickstart',
    labelKey: 'nav.quickstart',
    defaultLabel: '快速上手',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  // 后续还有 guide（编写规范）、deploy（部署上线）、faq（常见问题）
  // 以及指向 GitHub Releases 的 release 外部条目
];
```

增删导航项只需要在这个数组中添加或删除条目，保存后本地开发服务器会自动热更新。

---

## 动态激活与高亮规则

如果只是简单判断 `pathname.startsWith('/canvas')`，那么当你访问"快速上手"页面 `/canvas/deployment/` 时，"产品说明"和"快速上手"两个按钮可能同时亮起，让人困惑。

因此每个导航项都用 `match` 函数声明自己的高亮范围：

- 访问首页 `/` 时，只有"首页"按钮处于激活状态；
- 访问 `/canvas/layout/`、`/canvas/about/` 等常规文档时，激活"产品说明"按钮；
- 进入 `deployment` 路径的页面时，排他地激活"快速上手"按钮；
- 激活状态的按钮带主题色胶囊背景，与未激活按钮形成明显对比。

新增文档页面时，记得把路径关键字加进对应导航项的 `match` 规则里，否则顶栏不会正确高亮。

---

## 外部链接与版本徽标交互

如果某个导航项指向外部网站（例如 GitHub 仓库的 Releases 页面）：

1. 配置 `isExternal: true`；
2. 系统自动为该链接加上 `target="_blank" rel="noopener noreferrer"` 安全属性，在新标签页打开；
3. 文本旁会跟随一个斜向外的微型箭头图标（`↗`），提示读者点击后将离开当前站点。

版本徽标以胶囊形式展示在按钮内，文字取自 `src/config/navigation.ts` 的 `CURRENT_DOCS_VERSION`，而它直接读 `package.json` 的 `version` 字段，所以发版时只改 `package.json` 一处即可，顶栏自动同步；点击徽标跳转到 GitHub Release 列表。完整发版步骤见 [版本管理与自动化工作流](/canvas/releases/)。

---

## 页面重定向规则 (`astro.config.mjs`)

项目迭代中难免调整文档路径。为了不让读者收藏夹里的旧链接变成 404，可以在 `astro.config.mjs` 的 `redirects` 表中登记新旧路径的对应关系：

```javascript
export default defineConfig({
  redirects: {
    // 本站章节路径语义化重命名后，旧链接全部保留跳转
    '/canvas/rule-engine': '/canvas/cloudflare/',
    '/canvas/dns-setup': '/canvas/layout/',
  },
});
```

Astro 在构建时会为这些路径生成自动跳转页面，读者访问旧地址会被平滑带到新地址，搜索引擎权重也能继承。
### 线上为什么是 301 而不是跳页

Astro 生成的跳转页是 `200` 状态的 meta-refresh 文档，搜索引擎会把新旧地址当成两个页面。Cloudflare Pages 支持站点根目录的 `_redirects` 文件，且优先于静态文件命中，所以 `astro.config.mjs` 里的 `cloudflareRedirectsFile()` 会在构建完成后按同一张 `legacyRedirects` 表写出 `dist/_redirects`：

```text
/mail  /canvas/  301
/mail/  /canvas/  301
```

两条规则只差一个尾斜杠，因为 Cloudflare 按路径精确匹配：带斜杠的请求命中不了不带斜杠的规则，会回落到那个 200 跳页。本地 `pnpm run preview` 不读 `_redirects`，走的仍是 Astro 生成的跳页，两种机制并存、互不影响。

新增旧路径时只登记**不带尾斜杠**的一条即可：Astro 会把它渲染成 `<旧路径>/index.html`，再把带斜杠的写法也写进 `redirects` 配置就会撞成同一条路由，构建期报 route collision 警告（Astro 下个大版本会直接报错中断构建）。
