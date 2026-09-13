# 架构图原片归档

`zh-CN/` 下的 6 张 SVG 是 `public/images/canvas/` 中同名文件的原始中文版留档，
作为各语言本地化版本（`public/images/canvas/<locale>/`）的修改基准。
后续需要调整图内文案时：改这里的原文件 → 重跑 `node scripts/generate-diagram-locales.mjs`
→ 构建后各语言页面自动生效。

| 文件 | 引用页面 |
| --- | --- |
| docs-architecture.svg | index / about |
| docs-deploy-compare.svg | cloudflare |
| docs-i18n-workflow.svg | i18n |
| docs-layout-3tier.svg | layout / about |
| docs-render-pipeline.svg | rendering |
| docs-search-flow.svg | search-engine |

翻译表位置：`scripts/diagram-i18n/<lang>.mjs`（键 = 中文原文，值 = 对应语言文案）。
