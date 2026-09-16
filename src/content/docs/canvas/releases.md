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
## [v1.2.1] - 2026-09-14

### 修复
- 修正部署章节中的命令拼写错误。
- 更新界面截图至最新版本。
```

### 第二步：更新 package.json 版本号

导航栏版本徽标已与 `package.json` 的 `version` 字段自动联动，作为全站版本单一数据源（Single Source of Truth）。在 `package.json` 中更新版本号（或执行 `pnpm version patch`），顶栏徽标会自动同步为最新版本号，无需在多处手动修改：

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
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
          # 同名 release 已存在时（例如重新推送 tag，或 tag 删除后旧 release 转为草稿）先删掉，再按当前 RELEASE_NOTES.md 重新发布
          gh release delete "${TAG_NAME}" --yes 2>/dev/null || true
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

## 4. 内容协作工作流

多人维护文档时，按"分支 → 审查 → 合并 → 发布"的固定流程协作，保证线上内容始终可 build：

```text
main 分支（始终可发布，对应线上站点）
  │
  ├─ 1. 从 main 拉出功能分支        git checkout -b docs/new-guide
  ├─ 2. 编写/修改 Markdown
  ├─ 3. 本地自检                    pnpm exec astro check && pnpm run build
  ├─ 4. 推送分支并开 Pull Request   触发 CI 构建
  ├─ 5. 审查通过后合并到 main       触发线上自动部署
  └─ 6. 需要发版时打 v* 标签        触发 GitHub Release 流水线
```

### Pull Request 审查要点

CI（`build.yml`）只保证"能构建通过"，以下问题需要人工审查：

- **链接有效性**：新增的站内链接、锚点能否跳转；改路径的文档是否登记了重定向；
- **渲染效果**：提示框用的 `:::` 语法、代码块标注在页面上显示是否正常（CI 不检查视觉）；
- **图文对应**：新增截图是否有说明文字、是否清晰；
- **命名规范**：文件名小写加中划线，Frontmatter 的 `title`、`description` 完整。

### 分工建议

| 角色 | 职责 |
| :--- | :--- |
| 文档作者 | 编写内容、本地自检、发起 PR |
| 审查者 | 核对渲染效果与链接，合并代码 |
| 发布管理员 | 打版本标签、维护 `RELEASE_NOTES.md`、同步导航栏版本徽标 |

---

## 5. CI 构建检查

仓库配置了 `.github/workflows/build.yml`，在每次推送到 `main` 分支和每个 Pull Request 上自动执行依赖安装与全量构建，提前暴露断链、Frontmatter 错误等构建期问题。提交前在本地跑一遍同样的检查，可以避免推送后 CI 失败：

```bash
pnpm exec astro check && pnpm run build
```
