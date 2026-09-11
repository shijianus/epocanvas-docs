---
title: 版本管理与自动化工作流
description: EpoCanvas Docs 版本号命名规范、版本更新的标准发布步骤与 GitHub Actions 自动发布流水线。
---

为了让读者清楚"当前文档对应产品的哪个版本"，也让团队有条理地追踪修改历史，**EpoCanvas Docs** 采用语义化版本号与固定的发布流程。

---

## 1. 语义化版本号规则 (SemVer)

版本号采用 `v主版本.次版本.修订号` 格式（当前为 `v1.2.0`）：

| 变更类型 | 示例 | 触发场景 |
| :--- | :--- | :--- |
| **主版本号 (Major)** | `v2.0.0` | 文档系统重大重构（如升级 Astro 主版本、彻底更换布局）。 |
| **次版本号 (Minor)** | `v1.2.0` | 新增文档章节、新增多语言、设计系统升级等较大功能。 |
| **修订号 (Patch)** | `v1.2.1` | 修正错别字、更新代码示例、调整小样式等小改动。 |

---

## 2. 发布新版本的标准 3 步流程

### 第一步：记录更新说明 (`RELEASE_NOTES.md`)

在项目根目录的 `RELEASE_NOTES.md` 中写清本次更新内容，这份文件会作为 GitHub Release 的说明文字：

```markdown
## [v1.2.1] - 2026-09-18

### 修复
- 修正部署章节中的命令拼写错误。
- 更新界面截图至最新版本。
```

### 第二步：同步导航栏版本徽标

打开 `src/config/navigation.ts`，把 release 条目的文案同步为最新版本号：

```typescript
{
  id: 'release',
  labelKey: 'nav.release',
  defaultLabel: 'v1.2.1',
  href: 'https://github.com/shijianus/epocanvas-docs/releases',
  isExternal: true,
  badge: 'v1.2.1', // 保持与当前发布版本一致
}
```

### 第三步：提交代码并打上 Git 标签

```bash
# 1. 提交所有改动
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. 打上对应的版本标签并推送
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. GitHub Actions 自动发布流水线

项目在 `.github/workflows/release.yml` 中预置了自动发布工作流，实际内容如下：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # 推送以 v 开头的标签时自动触发

permissions:
  contents: write

jobs:
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG_NAME="${{ github.ref_name }}"
          echo "Publishing release for tag: ${TAG_NAME}"
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

推上 `v1.2.1` 标签后，GitHub 会自动启动流水线：

1. 检出仓库代码；
2. 以 `RELEASE_NOTES.md` 为说明，在仓库的 **Releases** 页面创建正式版本并标记为 latest；
3. 读者点击顶栏的版本徽标即可查看所有历史版本归档。

:::note
这条流水线只负责创建 GitHub Release，**不执行站点部署**。线上更新由 Cloudflare Pages 的 Git 自动构建（或本地 `pnpm run deploy`）完成，两者互不依赖，详见 [Cloudflare Pages 部署上线](/canvas/cloudflare/)。
:::

---

## 4. CI 构建检查

仓库还配置了 `.github/workflows/build.yml`，在每次推送到 `main` 分支时自动执行依赖安装与全量构建，提前暴露断链、Frontmatter 错误等构建期问题。提交前在本地跑一遍同样的检查，可以避免推送后 CI 失败：

```bash
pnpm exec astro check && pnpm run build
```
