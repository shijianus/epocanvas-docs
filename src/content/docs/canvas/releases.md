---
title: 版本管理与自动化工作流
description: EpoCanvas Docs 版本号命名规范、版本更新的标准发布步骤与 GitHub Actions 自动发布流水线。
---

为了让读者清楚"当前文档对应产品的哪个版本"，也让团队有条理地追踪修改历史，**EpoCanvas Docs** 采用语义化版本号与固定的发布流程。

---

## 1. 语义化版本号规则 (SemVer)

稳定版采用 `vMAJOR.MINOR.PATCH`；预发布附加标识，如当前候选 `v1.3.2-beta.1`。候选版本号不代表已创建 Release 或部署生产环境。

| 变更类型 | 示例 | 触发场景 |
| :--- | :--- | :--- |
| **主版本号 (Major)** | `v2.0.0` | 文档系统重大重构（如升级 Astro 主版本、彻底更换布局）。 |
| **次版本号 (Minor)** | `v1.2.0` | 新增文档章节、新增多语言、设计系统升级等较大功能。 |
| **修订号 (Patch)** | `v1.2.1` | 修正错别字、更新代码示例、调整小样式等小改动。 |

---

## 2. 发布新版本的标准 3 步流程

### 第一步：记录更新说明 (`RELEASE_NOTES.md`)

在项目根目录的 `RELEASE_NOTES.md` 中写清本次更新内容，这份文件会作为 GitHub Release 的说明文字。首行必须严格为 `# EpoCanvas Docs v<版本号>`，且版本号与 `package.json` 一致；`verify:config` 会检查此格式。下例仅演示格式，实际发版须替换成尚未使用的版本号；预发布还须在正文标明 `candidate` 或 `prerelease`。

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### 修复
- 修正部署章节中的命令拼写错误。
- 更新界面截图至最新版本。
```

### 第二步：更新 package.json 版本号

导航栏版本徽标已与 `package.json` 的 `version` 字段自动联动，作为全站版本单一数据源（Single Source of Truth）。在 `package.json` 中更新版本号（或执行 `pnpm version patch --no-git-tag-version`），顶栏徽标会自动同步为最新版本号，无需在多处手动修改：

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

自动发布以 [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml) 为准，此处不复制完整 YAML。推送 `v*` 标签时触发工作流。打标签前可在本地运行以下命令；它不会写入 GitHub Release，也不会部署站点：

```bash
pnpm run verify
```

1. `validate` job 使用 `contents: read` 只读权限，先运行 `pnpm run verify` 完整验证。
2. 验证通过后，只有 `publish` job 获得 `contents: write` 权限，以 `RELEASE_NOTES.md` 为说明创建或更新 GitHub Release。
3. 已有 Release 原位非破坏更新，不删除后重建。稳定版本由 GitHub 按版本确定 `Latest`；预发布不标记为 `Latest`。读者可通过顶栏版本徽标查看历史版本。

:::note
这条工作流只创建或更新 GitHub Release，不自动部署站点。合并到 `main` 也不会自动部署；线上更新由本地 `pnpm run deploy` 或另行配置的托管平台 Git 集成完成，详见 [Cloudflare Pages 部署上线](/canvas/cloudflare/)。
:::

---

## 4. 内容协作工作流

多人维护文档时，按"分支 → 审查 → 合并 → 发布"的固定流程协作，保证线上内容始终可 build：

```text
main 分支（发布源；线上内容仅在部署后更新）
  │
  ├─ 1. 从 main 拉出功能分支        git checkout -b docs/new-guide
  ├─ 2. 编写/修改 Markdown
  ├─ 3. 本地自检                    pnpm run verify
  ├─ 4. 推送分支并开 Pull Request   触发 CI 完整验证
  ├─ 5. 审查通过后合并到 main       不会自动部署线上站点
  └─ 6. 需要发版时打 v* 标签        触发 GitHub Release 流水线
```

### Pull Request 审查要点

CI（`build.yml`）运行 `pnpm run verify`，涵盖测试、配置检查、Astro 类型检查、构建及内容/产物检查；视觉效果仍需人工审查：

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

`.github/workflows/build.yml` 在推送到 `main` 和 Pull Request 时运行完整验证。CI 使用 `.node-version` 固定的 Node.js 22.23.4 和 pnpm 10.34.5。提交前在本地运行相同的自检命令：

```bash
pnpm run verify
```
