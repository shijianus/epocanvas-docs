---
title: 二次开发与生态扩展指南
description: EpoCanvas Docs 自定义 Astro 组件扩展、样式插件定制、Remark/Rehype 插件集成与性能调优指南。
---

# 二次开发与生态扩展指南

> [!NOTE]
> **EpoCanvas Docs** 具备极高的可扩展性。开发者不仅可以基于本专案快速构建衍生站点的官方技术文档，还能自由注入自定义 Astro 交互组件、扩展 Markdown 编译管线，或集成数学公式与图像灯箱画廊等生态插件。

---

## 1. 架构扩展分层拓扑

专案提供了清晰的扩展插槽与钩子，允许在不侵入 Starlight 内核的前提下完成功能叠加：

![EpoCanvas Docs 四层系统工程架构](/images/canvas/docs-architecture.svg)

---

## 2. 自定义 Astro 交互组件开发

在文档中嵌入自定义交互组件是提升读者实践体验的重要方式。

### 2.1 创建通用卡片组件示例 (`src/components/MetricCard.astro`)：
```astro
---
interface Props {
  title: string;
  value: string;
  trend?: string;
}

const { title, value, trend } = Astro.props;
---

<div class="metric-card">
  <div class="metric-title">{title}</div>
  <div class="metric-value">{value}</div>
  {trend && <div class="metric-trend">{trend}</div>}
</div>

<style>
  .metric-card {
    padding: 1.25rem;
    border-radius: 0.5rem;
    background-color: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-hairline);
    margin: 1rem 0;
  }
  .metric-title {
    font-size: 0.875rem;
    color: var(--sl-color-gray-3);
  }
  .metric-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--sl-color-text-accent);
    margin-top: 0.25rem;
  }
  .metric-trend {
    font-size: 0.75rem;
    color: var(--sl-color-accent-high);
    margin-top: 0.25rem;
  }
</style>
```

### 2.2 在 MDX 文档中直接引入使用：
```mdx
---
title: 性能基准测试
---

import MetricCard from '../../components/MetricCard.astro';

<MetricCard title="平均 TTFB" value="38ms" trend="同比缩短 42%" />
```

---

## 3. Remark 与 Rehype 编译管线扩展

Astro 允许在 `astro.config.mjs` 中轻松注入丰富的 Markdown 处理器插件：

### 3.1 引入数学公式支持 (KaTeX)
若文档需要撰写严谨的算法与加密学公式，可集成 `remark-math` 与 `rehype-katex`：

```bash
pnpm add remark-math rehype-katex katex
```

在 `astro.config.mjs` 中配置：
```javascript
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  // 在 customCss 中引入 KaTeX 官方样式
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css', 'katex/dist/katex.min.css'],
    }),
  ],
});
```

配置完成后即可在 Markdown 中直接书写 LaTeX 复杂公式：
```markdown
$$
\mathcal{H}(m) = \text{Argon2id}(m, \text{salt}, t=3, m=65536, p=4)
$$
```

---

## 4. 性能极致调优最佳实践

为保持全站 **Lighthouse 性能得分 > 98 分**，请遵循以下工程准则：

### 4.1 静态图像资产优化
- 优先采用 `.svg` 矢量格式保存架构拓扑图、交互流程图与系统模型；
- 位图必须经过 Sharp 预先优化，建议宽度不超过 `1920px`，并转换为现代 `.webp` 格式；
- 严禁在页面中直接引入未经压缩的几十兆 RAW 原始图。

### 4.2 客户端 JavaScript 体积控制
- 坚持 **纯静态优先（Static-First）** 原则，避免在正文页面无节制引入大型前端框架（如 React / Vue 全家桶）；
- 尽量使用原生 Web API（如 `IntersectionObserver`、`localStorage`、`fetch`、CSS 动画）实现轻量交互。

---

## 5. 贡献代码与 Pull Request 流程规范

若为本专案贡献新功能或修正，请严格遵循分支工作流：
1. **Fork 仓库** 到个人 GitHub 空间；
2. 基于 `main` 分支创建特性分支（如 `feature/dark-mode-polish` 或 `fix/typo-deployment`）；
3. 本地运行 `pnpm run build` 确保构建通过且 Pagefind 索引正常生成；
4. 提交清晰规范的 Git Commit 信息（遵循 Conventional Commits 规范）；
5. 向主仓库的 `main` 分支发起 Pull Request 并附带详细变更描述与效果截图。
