---
title: 声明式导航系统与路由控制
description: EpoCanvas Docs 统一导航模型、动态激活匹配算法、Tooltip 交互标准与重定向规则。
---

# 声明式导航系统与路由控制

> [!NOTE]
> **EpoCanvas Docs** 采用高度解耦的 **声明式导航模型（Declarative Navigation Model）**。站点全局导航栏、侧边栏大纲及外部版本链接均由单一配置源驱动，结合精确的路由匹配算法与现代 Web 交互标准，确保用户在复杂的跨章节阅览中拥有清晰的位置感知。

---

## 1. 导航模型与接口规范 (`src/config/navigation.ts`)

为了杜绝在各模板文件中硬编码链接地址，所有导航条目统一遵循 TypeScript `NavItem` 接口规范：

```typescript
export interface NavItem {
  id: string; // 唯一条目标识符
  labelKey: string; // 国际化 i18n 映射键名
  defaultLabel: string; // 默认中文回退文本
  href: string; // 目标跳转 URL 路径
  match?: (pathname: string) => boolean; // 动态激活判断函数
  badge?: string; // 胶囊版本徽标（如 'v1.2.0'）
  isExternal?: boolean; // 标识是否为外部跳转链接
}
```

### 生产环境配置实例：
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
    id: 'api',
    labelKey: 'nav.api',
    defaultLabel: 'API 参考',
    href: '/canvas/api-reference/',
    match: (pathname: string) => pathname.includes('api-reference'),
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

## 2. 动态路由匹配与激活算法 (Active Route Matching)

在服务端渲染与静态构建过程中，`Header.astro` 通过读取 `Astro.url.pathname` 并对每个条目调用 `match()` 函数：

```astro
{
  navigationConfig.map((item) => {
    const isActive = item.match ? item.match(pathname) : pathname === item.href;
    return (
      <a
        href={item.href}
        class:list={['nav-btn', { active: isActive }]}
        data-i18n={item.labelKey}
      >
        {getTranslation(item.labelKey, initialLang)}
      </a>
    );
  })
}
```

### 匹配防重叠优势：
- 传统单纯依据 `pathname.startsWith('/canvas')` 的粗暴匹配，会导致当用户访问 `/canvas/deployment/` 时，同时激活“文档”与“部署”两个按钮；
- 采用闭包排他匹配函数 `!pathname.includes('deployment')`，彻底保证了全站导航高亮状态在任意深层子路由下的唯一性与精确度。

---

## 3. 交互标准与 Tooltip 规范 (Inherited from shijianus-blog)

EpoCanvas Docs 继承了前序精品开源专案（shijianus-blog）经过充分验证的交互体验标准：

1. **版本胶囊徽标与外链标识**：
   - 外部跳转（如 GitHub Releases）自动追加 `target="_blank" rel="noopener noreferrer"` 安全属性；
   - 按钮右侧伴随微型向上外斜箭头图标（`↗`），明确告知用户即将跨域跳转；
2. **规范化原生 Tooltip 提示**：
   - 通过 `title="查看 GitHub Release 版本记录"` 与 `data-i18n-title="nav.releases"` 声明原生悬停气泡；
   - 在移动端自动屏蔽 Tooltip，避免遮挡触控屏幕；
3. **触觉与视觉反馈动效**：
   - 按钮应用 `transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)`；
   - Hover 时背景微亮，Active 时赋予高亮胶囊底色与微投影，点击瞬间施加 `transform: scale(0.97)` 弹性微动。

---

## 4. 路径重定向引擎配置 (`astro.config.mjs`)

为保持历史外链、搜索引擎收录以及旧版路由的平滑过渡，专案在 `astro.config.mjs` 中预置了高性能重定向表：

```javascript
export default defineConfig({
  redirects: {
    // 将历史陈旧的邮件模块根路径安全重定向至数字画布中枢
    '/mail': '/canvas',
    '/mail/setup': '/canvas/deployment',
  },
});
```

Astro 在构建期会自动为上述规则生成符合 HTTP 规范的 `301 Moved Permanently` 静态 HTML 跳转标记与 Cloudflare Pages `_redirects` 规则，确保 SEO 权重无损传递。
