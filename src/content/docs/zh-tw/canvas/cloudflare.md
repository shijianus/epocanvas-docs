---
title: Cloudflare Pages 部署上線
description: Cloudflare Pages 部署指南：Wrangler 直傳、選用 Git 整合、自訂網域與發布後檢查。
---

本頁介紹如何將靜態文件部署至 **Cloudflare Pages**。步驟依儲存庫腳本撰寫；主控台截圖是既有範例，不是本次候選版本的部署或測試紀錄。介面若有差異，以目前主控台為準。建置及上線是否成功，須查看實際指令輸出與部署狀態，不能由本文推斷。

---

## 準備工作

### 你需要什麼

| 事項 | 說明 |
| :--- | :--- |
| **Cloudflare 帳號** | 在 [dash.cloudflare.com](https://dash.cloudflare.com/) 免費註冊，Pages 服務無需付費方案 |
| **本機能完整建置** | 先確認能順利跑完 `pnpm run verify`，確認 `dist/` 目錄正常產生，參見[快速上手](/canvas/deployment/) |
| **Node.js + pnpm** | 部署指令依賴本機開發環境，版本要求同快速上手章節 |

### 兩種部署方式怎麼選

![Wrangler 本機直傳與 Git 整合建置的部署路徑示意](/images/canvas/docs-deploy-compare.svg)

*圖：左側在本機建置並用 Wrangler 上傳，右側由 Git 整合觸發雲端建置。圖示不代表兩條路徑已於本次修訂中實測。*

| 對比項 | 方式一：命令列直傳 | 方式二：Git 自動建置 |
| :--- | :--- | :--- |
| 操作方式 | 本機執行 `pnpm run deploy` | 推送程式碼到 GitHub 自動觸發 |
| 上手難度 | 低，兩條指令 | 中，需要在主控台完成一次設定 |
| 適合場景 | 首次上線、單人維護、快速更新 | 多人協作、希望「提交即上線」 |
| 發布檢查 | 通過完整 verify 後才上傳 | 須在雲端建置指令配置完整 verify |

:::tip
建立專案時先選擇 Direct Upload 或 Git 整合。不能假設直傳專案可直接改為 Git 專案；改用 Git 整合時應建立對應專案。緊急使用 Wrangler 發布也不能略過發布檢查。
:::

:::tip[完全不想敲指令？]
[快速上手](/canvas/deployment/)頁提供了 Cloudflare、Vercel、Netlify 三家的一鍵部署按鈕：點一下、授權帳號、確認設定，文件站就發布到你自己的雲帳號了，詳見[一鍵部署](/canvas/deployment/#一鍵部署點一個按鈕就上線)。其中 Cloudflare 按鈕走 Workers 靜態託管，與本頁介紹的 Pages 方式是兩條獨立路徑，對靜態文件站來說存取體驗一致，選一條走即可。
:::

---

## 方式一：本機命令列直傳（首次推薦）

此方式在本機建置後用 Wrangler 上傳。`pnpm run deploy` 面向維護者的 `epocanvas-docs` 專案，不是任意 fork 可直接使用的通用部署按鈕。

### 第 1 步：登入 Cloudflare 帳號

專案已預置 Wrangler（Cloudflare 官方命令列工具），首次使用需要瀏覽器授權登入：

```bash
pnpm exec wrangler login
```

執行後終端機提示 `Opening a link in your default browser...`，瀏覽器會開啟 Cloudflare 授權頁，點擊 **Allow** 後終端機顯示登入成功。用以下指令確認登入狀態：

```bash
pnpm exec wrangler whoami
```

:::caution
需要有效的 Cloudflare 登入或權杖權限。認證失敗時先檢查 `wrangler whoami`、帳號與專案權限；錯誤文字可能隨版本變化。
:::

### 第 2 步：一鍵建置並上傳

專案在 `scripts/verify-release.mjs` 中預置了一鍵發布指令：

先執行 `pnpm exec wrangler login` 授權。`scripts/verify-release.mjs` 要求位於 `main`、工作區乾淨（包含未追蹤檔案）、上游為 `origin/main`，且 HEAD 與遠端實際提交相同。`pnpm run deploy` 通過完整 `pnpm run verify` 後會再次檢查 Git，再呼叫 Wrangler。專案名定義在腳本中，使用自己的專案須先調整發布設定。

```bash
pnpm run deploy
```

`pnpm run deploy` 會執行設定檢查、Astro 型別檢查、建置、測試及內容/產物檢查，全部通過才上傳。僅檢查部署前置條件可用下列指令；它仍會讀取遠端 Git 參照，但不執行完整驗證、建置或上傳，dry-run 成功不等於測試通過。

```bash
pnpm run deploy --dry-run
```

上傳成功後 Wrangler 才輸出部署網址。目前腳本指定 `--project-name epocanvas-docs --branch main`，須確認帳號內存在該專案且正式分支設定正確。

### 第 3 步：在主控台找到你的專案

開啟 [dash.cloudflare.com](https://dash.cloudflare.com/)，在左側選單點擊 **Compute (Workers & Pages)**，就能看到專案列表。下圖標註了三個關鍵位置：

![Cloudflare 主控台的 Workers & Pages 專案列表，標註了左側選單入口、Create application 按鈕和 epocanvas-docs 專案](/images/canvas/deploy/cf-01-projects-list.png)

*圖：Workers & Pages 專案列表。① 左側選單進入 Workers & Pages；② Create application 按鈕用於建立新專案；③ 我們的 `epocanvas-docs` 專案，顯示存取網域 `epocanvas-docs.pages.dev` 與最近部署時間。*

點擊專案名稱進入專案詳情，**Deployments** 標籤頁展示完整部署歷史：

![epocanvas-docs 專案的部署歷史頁面，標註了正式網域、部署紀錄與狀態](/images/canvas/deploy/cf-02-deployments.png)

*圖：部署歷史頁面。① 專案名；② Deployments 標籤頁；③ 正式網域同時綁定了 `docs.epocanvas.com`（自訂網域）和 `epocanvas-docs.pages.dev`（預設網域）；④ 每條部署紀錄標註了分支與提交資訊；⑤ 狀態與部署時間。*

:::note
只有上傳成功才會新增部署紀錄。請在 Deployments 核對狀態、分支、提交與正式網域；指令被拒絕或驗證失敗不代表線上已更新。
:::

---

## 認識直傳專案的建置設定

進入 **Settings** 標籤頁可以看到直傳專案與 Git 專案的區別：

![epocanvas-docs 專案的 Settings 建置設定頁，Git repository 一欄顯示未連接](/images/canvas/deploy/cf-03-settings.png)

*圖：Settings 標籤頁。① Settings 入口；② Git repository 一欄顯示 Connect（未連接）——直傳專案不需要 Git 建置設定，建置完全在你本機完成。*

:::tip
直傳不依賴雲端建置佇列，但部署機器須符合 Node、pnpm、Git 與認證要求，不限於特定電腦。
:::

---

## 方式二：連接 Git 儲存庫自動建置（可選）

若需要推送觸發建置，請建立 Git 整合 Pages 專案並連接儲存庫。以下為設定指南，不代表此路徑已啟用或已於本次驗證。

### 第 1 步：進入建立流程

在 Workers & Pages 專案列表頁點擊右上角 **Create application** 按鈕（見[方式一第 3 步](#第-3-步在主控台找到你的專案)的圖示標註 ②），選擇 **Pages** 標籤頁。

### 第 2 步：連接 Git 儲存庫

1. 在建立介面選擇 **Connect to Git**；
2. 授權 Cloudflare 存取你的 GitHub 帳號；
3. 在儲存庫列表中選擇文件儲存庫 `epocanvas-docs`；
4. 點擊 **開始設定**。

### 第 3 步：填寫建置設定

在「設定建置和部署」中填寫以下設定：

| 設定項 | 填寫值 |
| :--- | :--- |
| 框架預設 | `Astro` |
| 建置指令 | `pnpm install --frozen-lockfile && pnpm run verify` |
| 建置輸出目錄 | `dist` |
| Node.js | `22.23.4`，與 `.node-version` 一致 |
| pnpm | `10.34.5`，與 `packageManager` 一致 |

### 第 4 步：驗證自動建置

先確認雲端環境安裝所需 Node 與 pnpm，再按 **儲存並部署** 並查看 Deployments 日誌。安裝、完整驗證與上傳都成功才算部署成功。後續 `main` 推送是否觸發，依專案的正式分支與自動部署開關而定；GitHub CI 成功不會自動替你部署 Pages。

:::caution
Git 整合專案的 Settings 頁會多出建置設定區塊（框架預設、建置指令等），這與[直傳專案](#認識直傳專案的建置設定)的介面不同——如果你在 Settings 裡找不到建置設定，說明目前專案是直傳專案，屬於正常現象。
:::

---

## 綁定自訂網域

Cloudflare 提供 `<專案名>.pages.dev` 網域，也可綁定自訂網域。以下為範例，DNS 與憑證生效時間以實際狀態為準。

### 第 1 步：開啟自訂網域設定

在專案詳情頁點擊 **Custom domains** 標籤頁，再點擊 **Set up a custom domain**：

![epocanvas-docs 專案的自訂網域頁面，docs.epocanvas.com 已綁定且 SSL 生效](/images/canvas/deploy/cf-04-domains.png)

*圖：Custom domains 標籤頁。① 標籤頁入口；② Set up a custom domain 按鈕；③ 已綁定的 `docs.epocanvas.com`，狀態 Active 且 SSL enabled。*

### 第 2 步：新增網域並等待生效

1. 點擊 **Set up a custom domain**，輸入你的二級網域（如 `docs.epocanvas.com`）；
2. 如果網域 DNS 已託管在 Cloudflare，系統自動新增 CNAME 記錄；託管在別處的網域需要手動加一條 CNAME 記錄指向 `<專案名>.pages.dev`；
3. 等待 DNS 驗證與憑證簽發，狀態為 **Active** 後再測試新網域；不保證固定幾分鐘內完成。

HTTPS 憑證由 Cloudflare 自動簽發和續期，不需要手動申請或設定。

---

## 驗證部署結果

### 命令列檢查 HTTP 狀態

```bash
curl -sI https://epocanvas-docs.pages.dev
```

回應範例（日期與狀態以實際請求為準）：

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200` 只代表此 URL 回應成功，不代表譯文、資源、搜尋與最新內容正確。請繼續完成下表檢查，並分別檢查預設與自訂網域。

### 瀏覽器逐項確認

| 檢查項 | 預期結果 |
| :--- | :--- |
| 首頁與任意文件頁能開啟 | 頁面完整渲染，無白屏 |
| 新修改的內容已生效 | 剛編輯的章節內容線上可見 |
| `Ctrl+K` 全站搜尋 | 能搜到最新文章（索引隨建置產生） |
| 深淺色主題切換 | 切換正常且重新整理後保持 |

---

## 常見部署問題

### 部署後線上內容沒有更新？

瀏覽器強制重新整理（`Ctrl+F5` / `Cmd+Shift+R`）排除快取；仍不更新時到主控台 Deployments 頁確認最新一條紀錄的時間，再用 `curl -sI` 對比部署預覽網域。

### 自訂網域提示 SSL 交握失敗 (Error 525)？

先檢查 Custom domains 的驗證與憑證狀態，再核對 DNS、代理設定與錯誤詳情。不要只等待固定幾分鐘；可用預設 `pages.dev` 網域對照排查。

### 執行 `pnpm run deploy` 報錯 `Project not found`？

先執行 `pnpm exec wrangler whoami` 確認已登入；再核對 `scripts/verify-release.mjs` 中的 `--project-name` 與主控台專案名是否一致。

更多排查項見[常見問題與故障排查 FAQ](/canvas/troubleshooting/)。
