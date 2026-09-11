---
title: 顶部导航与页面路由
description: EpoCanvas Docs 顶部导航栏配置、动态路径高亮规则、外部版本徽标与历史重定向设置。
---

# 顶部导航与页面路由

顶部导航栏是用户在各个大功能板块之间穿梭的主要通道。**EpoCanvas Docs** 将所有导航项集中在统一的配置文件中，改动一处即可全站生效，并自带精准的当前页面高亮和防失效跳转机制。

---

## 导航配置中心 (`src/config/navigation.ts`)

所有的顶部导航按钮都在 `src/config/navigation.ts` 中以声明式数组的形式维护：

```typescript
// 导航条目属性定义
export interface NavItem {
  id: string; // 唯一标识符
  labelKey: string; // 多语言翻译字典中的键名
  defaultLabel: string; // 默认显示的文本（如"首页"、"文档"）
  href: string; // 跳转链接或相对路径
  match?: (pathname: string) => boolean; // 判断当前页面是否应高亮该按钮的规则
  badge?: string; // 额外显示的小胶囊徽标（如版本号 "v1.2.0"）
  isExternal?: boolean; // 是否为外部网页跳转（是则在新窗口打开）
}
```

### 当前官方配置示例：
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
    defaultLabel: '文档',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname.startsWith('/canvas') &&
      !pathname.includes('deployment') &&
      !pathname.includes('api-reference'),
  },
  {
    id: 'deployment',
    labelKey: 'nav.deployment',
    defaultLabel: '部署',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  {
    id: 'releases',
    labelKey: 'nav.releases',
    defaultLabel: 'v1.2.0',
    href: 'https://github.com/shijianus/epocanvas-docs/releases',
    isExternal: true,
    badge: 'v1.2.0',
  },
];
```

---

## 动态激活与高亮规则

在传统网站中，如果只是简单判断 `pathname.startsWith('/canvas')`，那么当你访问“部署”页面 `/canvas/deployment/` 时，“文档”和“部署”两个按钮可能会同时亮起，让人感到困惑。

EpoCanvas Docs 采用了精确的闭包判断逻辑：
- 访问首页 `/` 时，只有“首页”按钮处于激活状态；
- 访问常规文档时，激活“文档”按钮；
- 当进入包含 `deployment` 的页面时，排他地激活“部署”按钮；
- 激活状态的按钮带有柔和的主题色胶囊背景与明显的对比度提示。

---

## 外部链接与版本徽标交互

如果某个导航项是指向外部网站（例如 GitHub 仓库或更新日志）：
1. 配置 `isExternal: true`；
2. 系统会自动为该链接加上 `target="_blank" rel="noopener noreferrer"` 安全属性，防止恶意钓鱼或窃取窗口权限；
3. 文本右侧会自动跟随一个斜向上的微型外跳箭头图标（`↗`），直观告知读者点击后将在新标签页中打开。

---

## 页面重定向规则 (`astro.config.mjs`)

在项目迭代过程中，有时需要调整或精简某些旧文档的路径。为了防止读者收藏的历史书签失效出现 404 错误，可以在 `astro.config.mjs` 中添加重定向表：

```javascript
export default defineConfig({
  redirects: {
    // 当读者访问旧的 /mail 地址时，自动平滑跳转到新的 /canvas 页面
    '/mail': '/canvas',
  },
});
```

Astro 会在构建时自动为这些路径生成规范的 HTTP 301 永久重定向标签，即保护了用户体验，也确保搜索引擎的权重无缝继承。
