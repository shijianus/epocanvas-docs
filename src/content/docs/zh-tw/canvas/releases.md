---
title: 版本管理與自動化工作流程
description: EpoCanvas Docs 版本號命名規範、版本更新的標準發布步驟與 GitHub Actions 自動發布流水線。
---

為了讓讀者清楚「目前文件對應產品的哪個版本」，也讓團隊有條理地追蹤修改歷史，**EpoCanvas Docs** 採用語意化版本號與固定的發布流程。

![發布流程示意圖：修改內容、在本機執行 pnpm run verify、提交審查、合併到 main、建立 v* 標籤五個檢查點；建立標籤只會建立 GitHub Release，網站部署需在 main 上另行執行 pnpm run deploy](/images/canvas/docs-release-flow.svg)

---

## 1. 語意化版本號規則 (SemVer)

穩定版採用 `vMAJOR.MINOR.PATCH`；預發布附加識別碼，如目前候選 `v1.3.2-beta.1`。候選版號不代表已建立 Release 或部署正式環境。

| 變更類型 | 範例 | 觸發情境 |
| :--- | :--- | :--- |
| **主版本號 (Major)** | `v2.0.0` | 文件站系統重大重構（如升級 Astro 主版本、徹底更換佈局）。 |
| **次版本號 (Minor)** | `v1.2.0` | 新增文件章節、新增多語系、設計系統升級等較大功能。 |
| **修訂號 (Patch)** | `v1.2.1` | 修正錯別字、更新程式碼範例、調整小樣式等小改動。 |

---

## 2. 發布新版本的標準 3 步流程

### 第一步：記錄更新說明 (`RELEASE_NOTES.md`)

在專案根目錄的 `RELEASE_NOTES.md` 中寫清本次更新內容，這份檔案會作為 GitHub Release 的說明文字。首行必須嚴格為 `# EpoCanvas Docs v<版本號>`，且版號與 `package.json` 一致；`verify:config` 會檢查此格式。下例僅示範格式，實際發版須換成尚未使用的版號；預發布還須在內文標明 `candidate` 或 `prerelease`。

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### 修復
- 修正部署章節中的指令拼字錯誤。
- 更新介面截圖至最新版本。
```

### 第二步：更新 package.json 版本號

導覽列版本徽標已與 `package.json` 的 `version` 欄位自動連動，作為全站版本的單一資料來源（Single Source of Truth）。在 `package.json` 中更新版本號（或執行 `pnpm version patch --no-git-tag-version`），頂欄徽標會自動同步為最新版本號，無需在多處手動修改：

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

自動發布以 [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml) 為準，此處不複製完整 YAML。推送 `v*` 標籤時觸發工作流。打標籤前可在本機執行以下指令；它不會寫入 GitHub Release，也不會部署網站：

```bash
pnpm run verify
```

1. `validate` job 使用 `contents: read` 唯讀權限，先執行 `pnpm run verify` 完整驗證。
2. 驗證通過後，只有 `publish` job 取得 `contents: write` 權限，以 `RELEASE_NOTES.md` 為說明建立或更新 GitHub Release。
3. 已有 Release 原位非破壞更新，不刪除後重建。穩定版本由 GitHub 按版本決定 `Latest`；預發布不標記為 `Latest`。讀者可透過頂欄版本徽標查看歷史版本。

:::note
此工作流只建立或更新 GitHub Release，不自動部署網站。合併到 `main` 也不會自動部署；線上更新由本機 `pnpm run deploy` 或另行設定的託管平台 Git 整合完成，詳見 [Cloudflare Pages 部署上線](/canvas/cloudflare/)。
:::

---

## 4. 內容協作工作流程

多人維護文件時，按「分支 → 審查 → 合併 → 發布」的固定流程協作，保證線上內容始終可建置：

```text
main 分支（發布來源；線上內容僅在部署後更新）
  │
  ├─ 1. 從 main 拉出功能分支        git checkout -b docs/new-guide
  ├─ 2. 編寫/修改 Markdown
  ├─ 3. 本機自檢                    pnpm run verify
  ├─ 4. 推送分支並開 Pull Request   觸發 CI 完整驗證
  ├─ 5. 審查通過後合併到 main       不會自動部署線上網站
  └─ 6. 需要發版時打 v* 標籤        觸發 GitHub Release 流水線
```

### Pull Request 審查要點

CI（`build.yml`）執行 `pnpm run verify`，涵蓋測試、設定檢查、Astro 型別檢查、建置及內容/產物檢查；視覺效果仍需人工審查：

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

`.github/workflows/build.yml` 在推送到 `main` 與 Pull Request 時執行完整驗證。CI 使用 `.node-version` 固定的 Node.js 22.23.4 和 pnpm 10.34.5。提交前在本機執行相同的自檢指令：

```bash
pnpm run verify
```
