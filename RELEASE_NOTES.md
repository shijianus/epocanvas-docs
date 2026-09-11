# EpoCanvas Docs v1.2.0 Release Notes

**发布版本**: `v1.2.0`  
**发布时间**: 2026-09-11  
**站点地址**: [https://doc.epocanvas.com](https://doc.epocanvas.com) / [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)  
**源码仓库**: [https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)

---

## 🌟 重大更新与里程碑概述

本版本对 **EpoCanvas Docs 官方文档工程**（`epocanvas-docs`）完成了彻底的重构与官方文档体系的全面确立：
将专案全面聚焦于 **EpoCanvas Docs 文档构建系统本身**，系统化梳理了从 Astro 5 + Starlight 核心底座、组件覆写引擎、3-Tier 三栏响应式拓扑、10 国语言客户端动态国际化、Pagefind 零服务端静态倒排检索，到 Cloudflare Pages 全球 Anycast 边缘部署与 GitHub Actions CI/CD 自动化流水线的完整工程实现。

---

## 🚀 核心架构与功能更新明细

### 1. EpoCanvas Docs 官方文档体系重构
- **全面聚焦 EpoCanvas Docs 工程建设**：
  - **专案架构总览 (`/canvas/`)**：四层系统模型（Core Runtime -> Content Engine -> Ejected Components -> Edge Delivery），与传统文档框架横向基准对比。
  - **快速上手与环境初始化 (`/canvas/deployment/`)**：Node.js 20 LTS、pnpm 工具链、`astro.config.mjs` 参数详解与本地 HMR 调试指南。
  - **Starlight 组件覆写体系 (`/canvas/workbench/`)**：深度接管 Header, Sidebar, PageTitle, Search, TOC, TwoColumnContent 6 大核心定制组件与运行时上下文。
  - **UI 设计系统与三栏布局 (`/canvas/dns-setup/`)**：极简 3-Tier 页面拓扑（18rem + min(100%, 54rem) + 20rem）、CSS 设计令牌与深浅色模式自适应。
  - **内容集合与写作规范 (`/canvas/system-config/`)**：Astro 5 Content Layer 类型安全模式、Frontmatter 规范、5 级警示块与原生 Mermaid 图表。
  - **Pagefind 静态全文检索 (`/canvas/search-engine/`)**：构建期倒排索引切片、WebAssembly 毫秒级打分、Cmd+K 全局快捷键模态。
  - **动态多语言与国际化架构 (`/canvas/ai-hub/`)**：10 种全球主流语言即时免刷新切换、双层降级容灾与客户端毫秒级 DOM 置换。
  - **声明式导航与路由控制 (`/canvas/oauth-provider/`)**：NavItem 模型、动态路由激活函数、shijianus-blog 标准 Tooltip 与 HTTP 301 重定向。
  - **Cloudflare Pages 边缘即时部署 (`/canvas/rule-engine/`)**：Serverless 边缘托管、Wrangler CLI 一键直传与自定义域名 SSL 证书管理。
  - **自动化 CI/CD 与版本发布 (`/canvas/security-rbac/`)**：GitHub Actions 流水线、SemVer 2.0.0 规范与版本打标发布标准流程。
  - **二次开发与生态扩展指南 (`/canvas/api-reference/`)**：自定义 Astro 组件扩展、Remark/Rehype 编译管线与性能极致调优。
  - **生产运维与故障排查手册 (`/canvas/troubleshooting/`)**：Astro 构建报错、Pagefind 索引缺失、404/重定向死循环排查决策树与自愈脚本。

### 2. 高保真矢量架构图全面升级
为全套技术文档配套打造了 6 组现代高分辨率矢量架构拓扑图：
- `docs-architecture.svg`：EpoCanvas Docs 四层系统工程架构图
- `docs-layout-3tier.svg`：三栏式响应布局体系视口拓扑图
- `docs-component-overrides.svg`：Starlight 组件覆写与运行时注入拓扑图
- `docs-search-engine.svg`：Pagefind 静态全文检索流水线图
- `docs-release-pipeline.svg`：自动化 CI/CD 与 Cloudflare 边缘分发流水线图
- `docs-i18n-workflow.svg`：客户端动态多语言国际化架构时序图

### 3. 构建与部署成果
- 全站 14 个静态页面构建耗时稳定在 11 秒左右，Pagefind 静态索引 100% 成功生成。
- Cloudflare Pages 边缘节点自动同步更新，`https://epocanvas-docs.pages.dev` 与 `https://doc.epocanvas.com` 实时返回 HTTP/2 200。
