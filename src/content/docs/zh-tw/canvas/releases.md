---
title: 版本管理與自動化工作流程
description: EpoCanvas Docs 版本號命名規範、版本更新的標準發布步驟與 GitHub Actions 自動發布流水線。
---

為了讓讀者清楚「目前文件對應產品的哪個版本」，也讓團隊有條理地追蹤修改歷史，**EpoCanvas Docs** 採用語意化版本號與固定的發布流程。

---

## 1. 語意化版本號規則 (SemVer)

版本號採用 `v主版本.次版本.修訂號` 格式（目前為 `v1.2.0`）：

| 變更類型 | 範例 | 觸發情境 |
| :--- | :--- | :--- |
| **主版本號 (Major)** | `v2.0.0` | 文件站系統重大重構（如升級 Astro 主版本、徹底更換佈局）。 |
| **次版本號 (Minor)** | `v1.2.0` | 新增文件章節、新增多語系、設計系統升級等較大功能。 |
| **修訂號 (Patch)** | `v1.2.1` | 修正錯別字、更新程式碼範例、調整小樣式等小改動。 |

---

## 2. 發布新版本的標準 3 步流程

### 第一步：記錄更新說明 (`RELEASE_NOTES.md`)

在專案根目錄的 `RELEASE_NOTES.md` 中寫清本次更新內容，這份檔案會作為 GitHub Release 的說明文字：

```markdown
## [v1.2.1] - 2026-09-18

### 修復
- 修正部署章節中的指令拼字錯誤。
- 更新介面截圖至最新版本。
```

### 第二步：更新 package.json 版本號

導覽列版本徽標已與 `package.json` 的 `version` 欄位自動連動，作為全站版本的單一資料來源（Single Source of Truth）。在 `package.json` 中更新版本號（或執行 `pnpm version patch`），頂欄徽標會自動同步為最新版本號，無需在多處手動修改：

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### 第三步：提交程式碼並打上 Git 標籤

```bash
# 1. 提交所有改動
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. 打上對應的版本標籤並推送
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. GitHub Actions 自動發布流水線

專案在 `.github/workflows/release.yml` 中預置了自動發布工作流程，實際內容如下：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # 推送以 v 開頭的標籤時自動觸發

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

推上 `v1.2.1` 標籤後，GitHub 會自動啟動流水線：

1. 檢出儲存庫程式碼；
2. 以 `RELEASE_NOTES.md` 為說明，在儲存庫的 **Releases** 頁面建立正式版本並標記為 latest；
3. 讀者點擊頂欄的版本徽標即可查看所有歷史版本歸檔。

:::note
這條流水線只負責建立 GitHub Release，**不執行網站部署**。線上更新由 Cloudflare Pages 的 Git 自動建置（或本機 `pnpm run deploy`）完成，兩者互不依賴，詳見 [Cloudflare Pages 部署上線](/canvas/cloudflare/)。
:::

---

## 4. 內容協作工作流程

多人維護文件時，按「分支 → 審查 → 合併 → 發布」的固定流程協作，保證線上內容始終可建置：

```text
main 分支（始終可發布，對應線上網站）
  │
  ├─ 1. 從 main 拉出功能分支        git checkout -b docs/new-guide
  ├─ 2. 編寫/修改 Markdown
  ├─ 3. 本機自檢                    pnpm exec astro check && pnpm run build
  ├─ 4. 推送分支並開 Pull Request   觸發 CI 建置
  ├─ 5. 審查通過後合併到 main       觸發線上自動部署
  └─ 6. 需要發版時打 v* 標籤        觸發 GitHub Release 流水線
```

### Pull Request 審查要點

CI（`build.yml`）只保證「能建置通過」，以下問題需要人工審查：

- **連結有效性**：新增的站內連結、錨點能否跳轉；改路徑的文件是否登記了重新導向；
- **渲染效果**：提示框用的 `:::` 語法、程式碼區塊標註在頁面上顯示是否正常（CI 不檢查視覺）；
- **圖文對應**：新增截圖是否有說明文字、是否清晰；
- **命名規範**：檔案名小寫加連字號，Frontmatter 的 `title`、`description` 完整。

### 分工建議

| 角色 | 職責 |
| :--- | :--- |
| 文件作者 | 編寫內容、本機自檢、發起 PR |
| 審查者 | 核對渲染效果與連結，合併程式碼 |
| 發布管理員 | 打版本標籤、維護 `RELEASE_NOTES.md`、同步導覽列版本徽標 |

---

## 5. CI 建置檢查

儲存庫設定了 `.github/workflows/build.yml`，在每次推送到 `main` 分支和每個 Pull Request 上自動執行依賴安裝與全量建置，提前暴露斷鏈、Frontmatter 錯誤等建置期問題。提交前在本機跑一遍同樣的檢查，可以避免推送後 CI 失敗：

```bash
pnpm exec astro check && pnpm run build
```
