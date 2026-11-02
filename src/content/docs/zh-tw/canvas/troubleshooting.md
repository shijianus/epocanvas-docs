---
title: 常見問題與故障排查 FAQ
description: EpoCanvas Docs 本機執行報錯、文件不顯示、提示框渲染異常、搜尋失效與 Cloudflare Pages 部署的排查清單。
---

在使用、撰寫或部署 **EpoCanvas Docs** 的過程中遇到異常時，先在這裡查找對應問題。問題按「本機啟動 → 文件撰寫 → 搜尋 → 部署」的順序排列，列出常見原因與排查步驟；請結合實際錯誤和檢查結果判斷，本文不是本次候選版本逐項實測通過的紀錄。

---

## 一、本機啟動與安裝問題

### Q1：執行 `pnpm run dev` 提示連接埠 4321 被佔用

- **原因**：之前啟動的開發伺服器未完全關閉，或其他程式佔用了 4321 連接埠。
- **解決辦法**：換一個連接埠啟動：

  ```bash
  pnpm run dev --port 4322
  ```

### Q2：安裝相依套件時出現錯誤
- **原因**：目前站點使用 passthrough 圖片服務，不在執行階段做圖片最佳化。先查看終端機的具體錯誤，常見原因是 Node.js 或 pnpm 版本不符合專案需求。
- **解決辦法**：確認 Node.js 22.x ≥ 22.23.4 / 24.x ≥ 24.12.0 與 pnpm 10.34.5，保留 `pnpm-lock.yaml` 後執行可重現安裝：
  ```bash
  pnpm install --frozen-lockfile
  ```

### Q3：執行 `pnpm install` 時報 `packages field missing or empty`

- **原因**：`pnpm-workspace.yaml` 內容為空或格式不完整，pnpm 會把它當作工作區設定檔解析並報錯。
- **解決辦法**：確保檔案包含 `packages` 欄位：

  ```yaml
  packages:
    - .
  ```

---

## 二、文件撰寫與渲染問題

### Q4：新建了一篇 Markdown，但左側側邊欄看不見它

- **原因**：側邊欄目錄是手動宣告的，新建檔案必須登記到設定中。
- **解決辦法**：開啟 `astro.config.mjs`，在 `sidebar` 陣列的合適分組下追加：

  ```javascript
  { label: '新功能說明', link: '/canvas/new-feature/' }
  ```

### Q5：終端機報錯 `"title" is required`

- **原因**：Markdown 開頭漏寫了 `title`，或起首的三個橫線 `---` 格式不規範。
- **解決辦法**：檢查檔案最上方的 Frontmatter：

  ```yaml
  ---
  title: 這是文章標題
  description: 這是文章描述
  ---
  ```

### Q6：頁面出現了兩個一模一樣的大標題

- **原因**：內文裡又寫了一個一級標題 `#`。Frontmatter 的 `title` 已經渲染為大標題，內文再寫 `#` 必然重複。
- **解決辦法**：刪除內文中的 `#` 標題，小節從 `##` 開始。完整規則見[渲染規則詳解](/canvas/rendering/#標題規則)。

### Q7：寫了 `> [!TIP]` 但提示框沒有變色，文字原樣顯示

- **原因**：GitHub 風格的 `> [!TIP]` 引用區塊語法不受支援，Markdown 編譯器不認識它。
- **解決辦法**：改用三冒號語法：

  ```markdown
  :::tip
  這是正確的寫法。
  :::
  ```

### Q8：插入的圖片顯示破圖

- **原因**：圖片路徑寫錯，或圖片沒有放進 `public/` 靜態目錄。
- **解決辦法**：
  1. 確認圖片儲存在 `public/images/canvas/ui-docs-reading.png`；
  2. 引用時用 `/` 開頭的絕對路徑：`![描述](/images/canvas/ui-docs-reading.png)`，不要寫 `../public/...` 這樣的相對路徑。

---

## 三、搜尋功能問題

### Q9：本機 `pnpm dev` 除錯時，全域搜尋搜不到剛寫的新文章

- **原因**：全站檢索依賴建置時產生的 Pagefind 索引；開發模式下 `Ctrl + K` 彈窗不會載入索引（打開後沒有搜尋輸入框），全域檢索整體無法使用，這是框架的既定行為，不是站點故障。
- **解決辦法**：完整打包後用預覽伺服器驗證：

  ```bash
  pnpm run build
  pnpm run preview
  ```

  頂欄的頁內尋找不受此限制，開發時可以直接用它定位目前頁內容。

### Q10：按 `Ctrl+K` 搜尋彈窗沒有彈出

- **原因**：部分輸入法、剪貼簿工具或截圖軟體佔用了 `Ctrl+K` / `Cmd+K` 快捷鍵。
- **解決辦法**：直接點擊搜尋框右側的 `Ctrl K` 小徽標，同樣可以開啟全站檢索彈窗。

---

## 四、Cloudflare Pages 部署問題

### Q11：剛綁定的自訂網域提示 SSL 交握失敗 (Error 525)

- **原因**：不能只憑 Error 525 就判斷為憑證正在簽發；應結合網域驗證、憑證狀態、DNS 記錄、代理設定與錯誤詳情排查。
- **解決辦法**：先查看 **Custom domains** 中的網域驗證與憑證狀態，再檢查 DNS 和代理設定，並用預設 `pages.dev` 網域比較。不要只等待固定幾分鐘；兩個網域是否可用都應以實際請求結果為準，參見[部署排查](/canvas/cloudflare/)。

### Q12：執行 `pnpm run deploy` 報錯 `Project not found`

- **原因**：部署指令中 `--project-name` 參數與 Cloudflare 主控台裡的專案名不一致；也可能是本機未登入。
- **解決辦法**：
  1. 先執行 `npx wrangler whoami` 確認已登入；
  2. 在 Cloudflare 主控台核對專案名，必要時修改 `scripts/verify-release.mjs` 中的 `--project-name` 參數。

先執行一次 `npx wrangler login` 完成授權，再執行 `pnpm run deploy`。部署由 `scripts/verify-release.mjs` 執行；非 `main` 分支、工作區不乾淨，或 HEAD 與遠端 `origin/main` 的實際提交不一致時會被拒絕。腳本先執行 `pnpm run verify`，通過後才呼叫 Wrangler。專案名定義在此腳本中，不在 `package.json`。

---

## 五、提交前的本機自我檢查

向 GitHub 推送前，執行以下統一自檢指令，涵蓋測試、設定檢查、Astro 型別檢查、建置及內容/產物檢查：

```bash
pnpm run verify
```

只有 `pnpm run verify` 的所有階段通過且結束代碼為 0，才表示這些自動檢查通過；單獨看到 `0 errors` 或 `Complete!` 不代表完整自檢結束。CI（`build.yml`）執行同一套驗證，頁面視覺效果仍需人工確認。
