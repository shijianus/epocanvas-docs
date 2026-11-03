# 架构图原片归档

`zh-CN/` 下的同名 SVG 是 `public/images/canvas/` 中同名文件的中文版归档，不是生成器的输入。
生成器实际读取 `public/images/canvas/docs-*.svg`，并结合翻译表写入 `public/images/canvas/<locale>/`。
需要调整图内文案时，修改 `public/images/canvas/` 中的中文原图，同步本目录的归档与各语言翻译表，再运行 `node scripts/generate-diagram-locales.mjs`。
检查生成器报告中的缺译项，并人工核对图中文字与布局后重新构建；只改归档再运行生成器不会更新页面使用的图片。

| 文件 | 引用页面 |
| --- | --- |
| docs-architecture.svg | index / syntax |
| docs-deploy-compare.svg | cloudflare |
| docs-i18n-workflow.svg | i18n |
| docs-layout-3tier.svg | layout |
| docs-render-pipeline.svg | rendering |
| docs-search-flow.svg | search-engine |
| docs-release-flow.svg | releases |

翻译表位置：`scripts/diagram-i18n/<lang>.mjs`（键 = 中文原文，值 = 对应语言文案）。
