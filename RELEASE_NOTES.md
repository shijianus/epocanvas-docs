# EpoCanvas Docs v1.2.0 Release Notes

**发布版本**: `v1.2.0`  
**发布时间**: 2026-09-11  
**站点地址**: [https://doc.epocanvas.com](https://doc.epocanvas.com) / [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)  
**源码仓库**: [https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)

---

## 🌟 重大更新与版本说明

本版本对 **EpoCanvas Docs** 官方文档站点进行了全方位的去套话、规范化重构：
- 建立了工作区专属的 **产品说明写作规范技能 (`product-docs-writing`)** 与 **`AGENTS.md` 工程规范**，坚决摒弃虚浮假大空的 AI 八股套话；
- 全站内容 100% 聚焦于 **EpoCanvas Docs 产品使用与开发说明**，语言平实通俗、结构清晰合理、步骤详实可操作；
- 完整覆盖产品简介、3 分钟快速上手、界面阅读体验、全文搜索技巧、多语言切换、Markdown 排版指南、配置与定制开发、Cloudflare Pages 部署以及常见问题 FAQ。

---

## 🚀 核心章节与更新明细

1. **产品简介与核心价值 (`/canvas/`)**：清晰介绍专案定位、解决的实际痛点（页面重、导航难、搜索依赖外网、多语言刷新）、核心功能一览与常用文档工具对比表。
2. **快速上手 (3分钟运行) (`/canvas/deployment/`)**：环境要求、3 步克隆与启动开发服务、日常常用开发指令表、核心配置文件指引。
3. **页面布局与阅读体验 (`/canvas/dns-setup/`)**：三栏式排版各区域交互详解（顶栏、左侧目录、正文面包屑、右侧大纲随动高亮）、深浅色主题切换与手机端响应式适配。
4. **全文搜索与快捷键使用 (`/canvas/search-engine/`)**：快捷键 `Cmd+K` / `Ctrl+K` 唤起使用技巧、搜索结果高亮、Pagefind 本地静态搜索原理解析。
5. **多语言支持与阅读切换 (`/canvas/ai-hub/`)**：支持 10 种全球主流语言列表、零刷新瞬间就地置换机制、新功能词条添加教程。
6. **顶部导航与页面路由 (`/canvas/oauth-provider/`)**：`src/config/navigation.ts` 导航配置模型、动态路径高亮规则、外部版本链接与 301 重定向。
7. **Markdown 编写与排版指南 (`/canvas/system-config/`)**：文档文件存放位置、Frontmatter 必填与选填属性、标准 Markdown 语法与图片存放路径规范。
8. **提示框、代码块与图表示例 (`/canvas/workbench/`)**：5 种彩色提示框（Note/Tip/Important/Warning/Caution）、Shiki 代码高亮、文件名标签、增量 Diff 代码对比与 Mermaid 流程图/时序图原生绘制。
9. **站点全局配置与样式定制 (`/canvas/api-reference/`)**：`astro.config.mjs` 基础信息配置、左侧目录分组调整、CSS 主题颜色修改与 Logo 替换。
10. **Cloudflare Pages 部署上线 (`/canvas/rule-engine/`)**：本地 `pnpm run deploy` 一键直传、GitHub 提交自动触发构建、独立域名绑定与免费 SSL 证书。
11. **版本管理与自动化工作流 (`/canvas/security-rbac/`)**：SemVer 语义化版本号规则、发布新版本 3 步操作流程、GitHub Actions 自动化流水线。
12. **常见问题与故障排查 FAQ (`/canvas/troubleshooting/`)**：精选本地运行报错、图片裂图、搜索搜不到、部署域名 SSL 提示等 9 大高频问题与明确解决方案。

---

## 🛠️ 规范与工作区技能支持
- 新增 [`.agents/skills/product-docs-writing/SKILL.md`](file:///home/shijian/projects/epocanvas-docs/.agents/skills/product-docs-writing/SKILL.md)：设立产品文档与技术写作反 AI 假大空规范。
- 新增 [`AGENTS.md`](file:///home/shijian/projects/epocanvas-docs/AGENTS.md)：工作区级别全局写作规范约束。
