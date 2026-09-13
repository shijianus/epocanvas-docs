---
title: 常見問題與故障排查 FAQ
description: EpoCanvas Docs 本機執行報錯、文件不顯示、提示框渲染異常、搜尋失效與 Cloudflare Pages 部署的排查清單。
---

在使用、撰寫或部署 **EpoCanvas Docs** 的過程中遇到異常時，先在這裡對號入座。問題按「本機啟動 → 文件撰寫 → 搜尋 → 部署」的順序排列，每個問題都給出原因和驗證過的解決辦法。

---

## 一、本機啟動與安裝問題

### Q1：執行 `pnpm run dev` 提示連接埠 4321 被佔用

- **原因**：之前啟動的開發伺服器未完全關閉，或其他程式佔用了 4321 連接埠。
- **解決辦法**：換一個連接埠啟動：

  ```bash
  pnpm run dev -- --port 4322
  ```

### Q2：安裝相依套件時提示 Sharp 模組編譯錯誤

- **原因**：Sharp 是建置期壓縮圖片的底層 C++ 模組，Node.js 版本變動後舊快取可能與之不匹配。
- **解決辦法**：清理相依套件後重裝：

  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
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
  1. 確認圖片儲存在 `public/images/canvas/your-pic.png`；
  2. 引用時用 `/` 開頭的絕對路徑：`![描述](/images/canvas/your-pic.png)`，不要寫 `../public/...` 這樣的相對路徑。

---

## 三、搜尋功能問題

### Q9：本機 `pnpm dev` 除錯時，全域搜尋搜不到剛寫的新文章

- **原因**：全站檢索彈窗依賴 Pagefind 索引，而索引只在 `pnpm run build` 時產生；開發伺服器為了保持熱更新速度不會即時重建索引。
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

- **原因**：Cloudflare 為新網域簽發 Universal SSL 憑證需要 2~5 分鐘的全球生效時間。
- **解決辦法**：等待幾分鐘後強制重新整理（`Ctrl+F5` / `Cmd+Shift+R`）；期間可先存取 `<專案名>.pages.dev` 預設網域，它始終可用。

### Q12：執行 `pnpm run deploy` 報錯 `Project not found`

- **原因**：部署指令中 `--project-name` 參數與 Cloudflare 主控台裡的專案名不一致；也可能是本機未登入。
- **解決辦法**：
  1. 先執行 `npx wrangler whoami` 確認已登入；
  2. 在 Cloudflare 主控台核對專案名，必要時修改 `package.json` 中 `deploy` 腳本的 `--project-name` 參數。

---

## 五、提交前的本機自我檢查

向 GitHub 推送前，執行以下指令做一次完整自我檢查（型別檢查 + 全量建置）：

```bash
pnpm exec astro check && pnpm run build
```

`astro check` 輸出 `0 errors`、建置以 `Complete!` 結束時，說明文件沒有語法錯誤，可以放心提交。儲存庫的 CI（`build.yml`）會在推送後執行同樣的建置，本機先通過可以避免 CI 失敗。
