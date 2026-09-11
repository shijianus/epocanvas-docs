---
title: 自动化 CI/CD 与版本发布管理
description: EpoCanvas Docs 基于 GitHub Actions 的自动化持续集成流水线、语义化版本（SemVer）与发布声明规范。
---

# 自动化 CI/CD 与版本发布管理

> [!NOTE]
> **EpoCanvas Docs** 严格遵循工业级 **语义化版本规范（Semantic Versioning 2.0.0）** 与 **自动化 CI/CD 持续交付流程**。通过 Git 标签（Git Tag）事件驱动 GitHub Actions 流水线，实现代码类型静态检查、构建制品验证、自动化 GitHub Release 归档与 Cloudflare Pages 生产边缘部署的一键闭环。

---

## 1. 自动化发布流水线全景

当维护者推送符合版本规范的 Git 标签时，系统将自动化执行以下生命周期节点：

![自动化 CI/CD 与 Cloudflare 边缘分发流水线](/images/canvas/docs-release-pipeline.svg)

---

## 2. GitHub Actions 工作流编排 (`.github/workflows/release.yml`)

专案在 `.github/workflows/release.yml` 中定义了无状态的自动化发布任务：

```yaml
name: Release & Deployment Pipeline

on:
  push:
    tags:
      - 'v*' # 仅当推送形如 v1.2.0 的版本标签时触发

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码仓库
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 配置 pnpm 环境
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: 安装 Node.js 20 LTS 运行环境
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: 安装全量工程依赖
        run: pnpm install --frozen-lockfile

      - name: 执行 TypeScript 与 Astro 模式校验
        run: pnpm exec astro check

      - name: 执行生产环境全量静态构建
        run: pnpm run build

      - name: 校验 Pagefind 索引产物完整性
        run: |
          test -f dist/pagefind/pagefind.wasm || exit 1
          echo "Pagefind 静态索引校验通过"

      - name: 自动创建 GitHub Release 归档
        uses: softprops/action-gh-release@v2
        with:
          body_path: RELEASE_NOTES.md
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 3. 语义化版本命名规范 (Semantic Versioning 2.0.0)

EpoCanvas Docs 版本号严格遵循 `vMAJOR.MINOR.PATCH` 格式：

| 版本级别 | 触发场景说明 | 示例版本 | 影响范围 |
| :--- | :--- | :--- | :--- |
| **MAJOR (主版本)** | 核心技术底座大重构（如 Astro 4 升级到 Astro 5）、重写核心三栏布局、破坏性路由变更 | `v2.0.0` | 全站组件与配置均需迁移 |
| **MINOR (次版本)** | 新增大型文档模块（如新增多语言体系）、引入全新组件（如 Pagefind 检索）、设计系统大改版 | `v1.2.0` | 向下兼容，扩展功能体系 |
| **PATCH (修订版本)** | 修正技术文档中的拼写错漏、样式小微调、修复个别浏览器兼容性细节、常规依赖安全修补 | `v1.2.1` | 完全向下兼容的小修小补 |

---

## 4. 标准发布操作流程指南 (Release Runbook)

为确保线上发布安全可控，发布新版本时请按顺序执行以下标准作业程序：

### 步骤 1：更新版本变更日志
在专案根目录的 [`RELEASE_NOTES.md`](file:///home/shijian/projects/epocanvas-docs/RELEASE_NOTES.md) 中追加本版本的更新摘要：

```markdown
## [v1.2.0] - 2026-09-11

### Added
- 新增 EpoCanvas Docs 官方文档系统架构设计说明。
- 引入 Pagefind 静态全文检索系统与快捷键 Cmd+K 支持。
- 引入 10 国语言客户端秒级无刷新动态国际化切换器。

### Changed
- 彻底移除旧版邮件相关残留文件与主题样式。
- 采用自适应三栏式文档拓扑结构与全新设计令牌。
```

### 步骤 2：更新导航配置与版本徽标
在 `src/config/navigation.ts` 中将 `badge` 与 `defaultLabel` 同步为新版本号（如 `v1.2.0`）。

### 步骤 3：提交代码并打上 Git Tag
```bash
# 1. 提交所有变更到 main 分支
git add .
git commit -m "chore(release): prepare v1.2.0 release"
git push origin main

# 2. 创建轻量附注标签
git tag -a v1.2.0 -m "Release v1.2.0: EpoCanvas Docs official architecture overhaul"

# 3. 推送标签至 GitHub 触发 CI/CD
git push origin v1.2.0
```

### 步骤 4：线上验证与监控
标签推送后，可在 GitHub 仓库的 **Actions** 与 **Releases** 页面查看自动化构建状态。构建完成后，直接访问生产环境 `https://doc.epocanvas.com` 验证新版本生效情况。
