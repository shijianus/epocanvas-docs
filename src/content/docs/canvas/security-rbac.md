---
title: 版本管理与自动化工作流
description: EpoCanvas Docs 版本号命名规范、版本更新发布步骤与 GitHub Actions 自动化工作流。
---

# 版本管理与自动化工作流

为了让读者清楚地知道“当前文档对应的是产品的哪个版本”，以及让开发团队能够有条不紊地追踪文档修改历史，**EpoCanvas Docs** 采用标准、清晰的版本管理流程。

---

## 1. 语义化版本号规则 (SemVer)

文档站的版本号采用行业通用的 `v主版本.次版本.修订号` 格式（例如当前为 `v1.2.0`）：

| 变更类型 | 示例 | 触发场景说明 |
| :--- | :--- | :--- |
| **主版本号 (Major)** | `v2.0.0` | 文档系统发生重大底层重构（例如升级 Astro 主版本、彻底更换全新布局）。 |
| **次版本号 (Minor)** | `v1.2.0` | 新增了大型文档分类章节、新增多语言支持、或进行了设计系统升级。 |
| **修订号 (Patch)** | `v1.2.1` | 修正文档中的错别字、修改代码示例、调整小样式或修复小问题。 |

---

## 2. 发布新版本的标准 3 步流程

当你完成了一批文档的编写或修改，准备发布一个正式版本时，按照以下 3 步操作即可：

### 第一步：记录更新说明 (`RELEASE_NOTES.md`)
在项目根目录的 `RELEASE_NOTES.md` 文件中追加记录，写清楚本次更新了什么，例如：

```markdown
## [v1.2.0] - 2026-09-11

### 新增
- 增加了多语言无刷新切换功能说明。
- 增加了全文搜索与快捷键使用指南。

### 修复
- 修正了快速开始章节中的命令拼写错误。
```

### 第二步：同步修改导航栏上的版本徽标
打开 `src/config/navigation.ts`，将右侧徽标的文案同步修改为最新的版本号：

```typescript
{
  id: 'releases',
  labelKey: 'nav.releases',
  defaultLabel: 'v1.2.0',
  href: 'https://github.com/shijianus/epocanvas-docs/releases',
  isExternal: true,
  badge: 'v1.2.0', // 保持与当前发布版本一致
}
```

### 第三步：提交代码并打上 Git 标签
在终端执行以下 Git 命令：

```bash
# 1. 提交所有改动
git add .
git commit -m "chore(release): bump version to v1.2.0"
git push origin main

# 2. 打上对应的版本标签
git tag v1.2.0

# 3. 将标签推送到 GitHub
git push origin v1.2.0
```

---

## 3. GitHub Actions 自动化流水线

在项目的 `.github/workflows/release.yml` 文件中，已经预置了自动化发布流水线：

```yaml
name: Release & Deployment Pipeline

on:
  push:
    tags:
      - 'v*' # 当你推送以 'v' 开头的标签时自动运行

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - name: 自动创建 GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body_path: RELEASE_NOTES.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

一旦你推上了 `v1.2.0` 标签，GitHub 会自动启动虚拟机：
1. 校验代码完整性并运行编译测试；
2. 自动在 GitHub 仓库的 **Releases** 页面发布新版本，并附带 `RELEASE_NOTES.md` 中的说明；
3. 读者点击顶部的版本徽标时，就能直接在 GitHub 查看发布包和历史版本归档。
