---
title: UI 设计系统与三栏式布局体系
description: EpoCanvas Docs 极简三栏式页面拓扑、设计令牌（Design Tokens）、深浅色主题自适应与字体排版规范。
---

# UI 设计系统与三栏式布局体系

> [!NOTE]
> **EpoCanvas Docs** 采用现代极简主义设计语言，通过结构清晰的 **三栏式响应布局（3-Tier Responsive Layout）** 与模块化的 **CSS 设计令牌（Design Tokens）**，实现了高对比度、无视觉干扰且自适应深浅色主题的沉浸式技术文档阅览环境。

---

## 1. 三栏式页面拓扑结构规范

三栏式布局旨在最大化技术文档的信息密度与定位效率。左侧负责全局导航树，中央提供宽敞的阅读纵深，右侧则展示当前页面标题大纲：

![EpoCanvas Docs 三栏式响应布局体系](/images/canvas/docs-layout-3tier.svg)

### 视口栅格参数分配：
```
+-----------------------------------------------------------------------------------+
|                           Header (高度: 3.5rem / 56px)                             |
+---------------------+---------------------------------------+---------------------+
|                     |                                       |                     |
|  Left Navigation    |       Central Main Article            |   Right Outline     |
|      Sidebar        |           Reading Pane                |        (TOC)        |
|                     |                                       |                     |
|   宽度: 18rem        |        宽度: min(100%, 54rem)         |     宽度: 20rem     |
|   (~288px 固定)     |        (响应式弹性伸缩居中)           |     (~320px 固定)   |
|   独立滚动持久化    |        沉浸式阅读与代码排版           |     视口交叉高亮    |
|                     |                                       |                     |
+---------------------+---------------------------------------+---------------------+
```

---

## 2. 设计令牌体系与 CSS 变量规范 (`src/styles/custom.css`)

EpoCanvas Docs 将全站的颜色、间距、边框与阴影完全解耦为 CSS 自定义属性（Variables），所有组件均直接引用设计令牌，确保主题切换时零闪烁：

### 2.1 核心颜色令牌定义：

```css
:root {
  /* 基础品牌主色调 - 优雅科技蓝与深邃紫 */
  --sl-color-accent-low: #1e3a8a;
  --sl-color-accent: #3b82f6;
  --sl-color-accent-high: #93c5fd;

  /* 深色主题 (默认 Dark Mode) 基础背景与文字 */
  --sl-color-bg: #0b0f19;
  --sl-color-bg-nav: rgba(11, 15, 25, 0.85);
  --sl-color-bg-sidebar: #0f172a;
  --sl-color-hairline: #1e293b;

  --sl-color-text: #f8fafc;
  --sl-color-text-accent: #60a5fa;
  --sl-color-gray-1: #e2e8f0;
  --sl-color-gray-2: #cbd5e1;
  --sl-color-gray-3: #94a3b8;
  --sl-color-gray-4: #64748b;
  --sl-color-gray-5: #475569;
  --sl-color-gray-6: #1e293b;
}

/* 浅色主题 (Light Mode) 变量自适应重载 */
:root[data-theme='light'] {
  --sl-color-accent-low: #dbeafe;
  --sl-color-accent: #2563eb;
  --sl-color-accent-high: #1d4ed8;

  --sl-color-bg: #ffffff;
  --sl-color-bg-nav: rgba(255, 255, 255, 0.85);
  --sl-color-bg-sidebar: #f8fafc;
  --sl-color-hairline: #e2e8f0;

  --sl-color-text: #0f172a;
  --sl-color-text-accent: #2563eb;
  --sl-color-gray-1: #1e293b;
  --sl-color-gray-2: #334155;
  --sl-color-gray-3: #64748b;
  --sl-color-gray-4: #94a3b8;
  --sl-color-gray-5: #cbd5e1;
  --sl-color-gray-6: #f1f5f9;
}
```

---

## 3. 字体排印规范 (Typography Standards)

为了保证多语言与代码阅读的清晰度，排版体系融合了三套顶级字体族：

| 用途分类 | 字体配置 (Font Family Fallback) | 设计考量与特性 |
| :--- | :--- | :--- |
| **标题展示字体** | `'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif` | 现代几何字体，字母结构清晰，富有工程美感 |
| **正文阅读字体** | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | 业界公认顶级屏幕阅读字体，高 x-height，抗疲劳 |
| **代码与等宽字体** | `'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace` | 支持编程连字（Ligatures），字符间距开阔，提升代码可读性 |

---

## 4. 响应式断点系统 (Responsive Breakpoints)

EpoCanvas Docs 针对不同尺寸的终端设备制定了细致的分流适配逻辑：

| 断点阈值 (Breakpoint) | 设备形态 | 布局适配规则 |
| :--- | :--- | :--- |
| **`>= 72rem (1152px)`** | 宽屏桌面显示器 | 激活标准 **三栏式网格**（左导航 + 中正文 + 右固定目录） |
| **`48rem ~ 72rem`** | 平板 / 笔记本竖屏 | 隐藏右侧大纲目录（收缩为正文顶部折叠下拉），保持左侧导航与中央正文两栏 |
| **`< 48rem (768px)`** | 移动端智能手机 | 隐藏左右固定边栏，主视口全宽单栏呈现，通过顶部导航栏汉堡抽屉触发侧边栏 |

---

## 5. 无障碍可访问性 (a11y) 与交互动效

1. **色彩对比度要求**：在深浅双模式下，正文文字与背景的对比度均达到 `7:1` 以上，严格满足 WCAG AAA 级可访问性标准；
2. **键盘焦点捕获（Focus Rings）**：所有可交互元素（链接、按钮、搜索框）均配置了统一的轮廓线样式的焦点环：
   ```css
   :focus-visible {
     outline: 2px solid var(--sl-color-accent);
     outline-offset: 2px;
   }
   ```
3. **平滑滚动与视觉过渡**：大纲目录与页面内锚点跳转统一开启 `scroll-behavior: smooth`，并在切换深浅主题时施加 `transition: background-color 0.2s ease` 缓动过渡，避免强光瞬闪。
