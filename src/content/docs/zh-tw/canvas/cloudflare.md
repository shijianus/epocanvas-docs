---
title: Cloudflare Pages 部署上線
description: EpoCanvas Docs 發布上線的完整圖示教學：Wrangler 命令列直傳、Git 自動建置、自訂網域綁定，每一步附真實主控台截圖。
---

文件撰寫完成後，需要發布到公網供團隊和使用者存取。**EpoCanvas Docs** 推薦託管在 **Cloudflare Pages** 上：不需要購買伺服器、不需要設定 Nginx，靜態檔案直傳即可，並自動取得 HTTPS 憑證。本站自身（`docs.epocanvas.com`）就是用本文的方法發布的，以下所有主控台截圖均來自真實部署過程。

---

## 準備工作

### 你需要什麼

| 事項 | 說明 |
| :--- | :--- |
| **Cloudflare 帳號** | 在 [dash.cloudflare.com](https://dash.cloudflare.com/) 免費註冊，Pages 服務無需付費方案 |
| **本機能完整建置** | 先確認能順利跑完 `pnpm run build`，確認 `dist/` 目錄正常產生，參見[快速上手](/canvas/deployment/) |
| **Node.js + pnpm** | 部署指令依賴本機開發環境，版本要求同快速上手章節 |

### 兩種部署方式怎麼選

![Cloudflare Pages 部署雙軌對比圖：左側命令列本機直傳（本站採用），右側 Git 儲存庫自動建置（團隊協作推薦）](/images/canvas/docs-deploy-compare.svg)

*圖：Cloudflare Pages 兩種部署路徑對比。左側透過本機建置後用 Wrangler 直傳邊緣（本站實際採用），右側透過 GitHub Webhook 觸發雲端自動建置。*

| 對比項 | 方式一：命令列直傳 | 方式二：Git 自動建置 |
| :--- | :--- | :--- |
| 操作方式 | 本機執行 `pnpm run deploy` | 推送程式碼到 GitHub 自動觸發 |
| 上手難度 | 低，兩條指令 | 中，需要在主控台完成一次設定 |
| 適合場景 | 首次上線、單人維護、快速更新 | 多人協作、希望「提交即上線」 |
| 本站採用 | ✅ 是（可在主控台驗證） | 未啟用，可隨時補充 |

:::tip
兩種方式可以並存：日常用 Git 自動建置，緊急修錯時用本機 `pnpm run deploy` 直接覆蓋上線。
:::

:::tip[完全不想敲指令？]
[快速上手](/canvas/deployment/)頁提供了 Cloudflare、Vercel、Netlify 三家的一鍵部署按鈕：點一下、授權帳號、確認設定，文件站就發布到你自己的雲帳號了，詳見[一鍵部署](/canvas/deployment/#一鍵部署點一個按鈕就上線)。其中 Cloudflare 按鈕走 Workers 靜態託管，與本頁介紹的 Pages 方式是兩條獨立路徑，對靜態文件站來說存取體驗一致，選一條走即可。
:::

---

## 方式一：本機命令列直傳（首次推薦）

這種方式由本機建置後直接上傳到 Cloudflare，是**本站實際採用**的部署方式。

### 第 1 步：登入 Cloudflare 帳號

專案已預置 Wrangler（Cloudflare 官方命令列工具），首次使用需要瀏覽器授權登入：

```bash
npx wrangler login
```

執行後終端機提示 `Opening a link in your default browser...`，瀏覽器會開啟 Cloudflare 授權頁，點擊 **Allow** 後終端機顯示登入成功。用以下指令確認登入狀態：

```bash
npx wrangler whoami
```

:::caution
如果跳過登入直接執行部署，終端機會提示 `You are not authenticated. Please run 'wrangler login'.`，不會產生任何部署。
:::

### 第 2 步：一鍵建置並上傳

專案在 `package.json` 中預置了一鍵發布指令：

```bash
pnpm run deploy
```

它等價於依序執行兩步：先 `astro build` 把全站編譯到 `dist/` 目錄並產生搜尋索引，再呼叫 `wrangler pages deploy dist` 把產物直傳到 Cloudflare。建置階段的真實輸出如下：

```text
00:06:22 [build] 15 page(s) built in 18.73s
00:06:22 [build] Complete!
```

上傳完成後，Wrangler 會輸出本次部署的預覽位址。首次部署時 Wrangler 會以互動方式詢問專案名稱，直接按 Enter 使用 `package.json` 裡預置的 `epocanvas-docs` 即可。

### 第 3 步：在主控台找到你的專案

開啟 [dash.cloudflare.com](https://dash.cloudflare.com/)，在左側選單點擊 **Compute (Workers & Pages)**，就能看到專案列表。下圖標註了三個關鍵位置：

![Cloudflare 主控台的 Workers & Pages 專案列表，標註了左側選單入口、Create application 按鈕和 epocanvas-docs 專案](/images/canvas/deploy/cf-01-projects-list.png)

*圖：Workers & Pages 專案列表。① 左側選單進入 Workers & Pages；② Create application 按鈕用於建立新專案；③ 我們的 `epocanvas-docs` 專案，顯示存取網域 `epocanvas-docs.pages.dev` 與最近部署時間。*

點擊專案名稱進入專案詳情，**Deployments** 標籤頁展示完整部署歷史：

![epocanvas-docs 專案的部署歷史頁面，標註了正式網域、部署紀錄與狀態](/images/canvas/deploy/cf-02-deployments.png)

*圖：部署歷史頁面。① 專案名；② Deployments 標籤頁；③ 正式網域同時綁定了 `docs.epocanvas.com`（自訂網域）和 `epocanvas-docs.pages.dev`（預設網域）；④ 每條部署紀錄標註了分支與提交資訊；⑤ 狀態與部署時間。*

:::note
每次執行 `pnpm run deploy` 都會在列表頂部新增一條部署紀錄，並自動成為目前正式版本。歷史紀錄保留在列表中，出問題時可以隨時回滾。
:::

---

## 認識直傳專案的建置設定

進入 **Settings** 標籤頁可以看到直傳專案與 Git 專案的區別：

![epocanvas-docs 專案的 Settings 建置設定頁，Git repository 一欄顯示未連接](/images/canvas/deploy/cf-03-settings.png)

*圖：Settings 標籤頁。① Settings 入口；② Git repository 一欄顯示 Connect（未連接）——直傳專案不需要 Git 建置設定，建置完全在你本機完成。*

:::tip
這也解釋了直傳方式的優勢：建置環境就是你的本機電腦，不受 Cloudflare 建置佇列影響；代價是每次更新都必須在部署那台電腦上執行指令。
:::

---

## 方式二：連接 Git 儲存庫自動建置（可選）

如果希望「提交程式碼即自動上線」，可以把專案連接到 GitHub 儲存庫，由 Cloudflare 在雲端自動建置。

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
| 建置指令 | `pnpm run build` |
| 建置輸出目錄 | `dist` |

### 第 4 步：驗證自動建置

點擊 **儲存並部署**，Cloudflare 自動完成首次建置。之後每次向 `main` 分支推送程式碼，Cloudflare 都會自動拉取、建置並上線。每次部署的建置日誌可以在專案的 **Deployments** 標籤頁中點擊對應部署查看。

:::caution
Git 整合專案的 Settings 頁會多出建置設定區塊（框架預設、建置指令等），這與[直傳專案](#認識直傳專案的建置設定)的介面不同——如果你在 Settings 裡找不到建置設定，說明目前專案是直傳專案，屬於正常現象。
:::

---

## 綁定自訂網域

Cloudflare 預設分配的 `xxx.pages.dev` 網域可以直接使用；綁定自己的網域（例如 `docs.epocanvas.com`）只需幾分鐘。

### 第 1 步：開啟自訂網域設定

在專案詳情頁點擊 **Custom domains** 標籤頁，再點擊 **Set up a custom domain**：

![epocanvas-docs 專案的自訂網域頁面，docs.epocanvas.com 已綁定且 SSL 生效](/images/canvas/deploy/cf-04-domains.png)

*圖：Custom domains 標籤頁。① 標籤頁入口；② Set up a custom domain 按鈕；③ 已綁定的 `docs.epocanvas.com`，狀態 Active 且 SSL enabled。*

### 第 2 步：新增網域並等待生效

1. 點擊 **Set up a custom domain**，輸入你的二級網域（如 `docs.epocanvas.com`）；
2. 如果網域 DNS 已託管在 Cloudflare，系統自動新增 CNAME 記錄；託管在別處的網域需要手動加一條 CNAME 記錄指向 `<專案名>.pages.dev`；
3. 等待憑證簽發（通常 2~5 分鐘），狀態變為 **Active**（如上圖 ③）後即可透過新網域存取。

HTTPS 憑證由 Cloudflare 自動簽發和續期，不需要手動申請或設定。

---

## 驗證部署結果

### 命令列檢查 HTTP 狀態

```bash
curl -sI https://epocanvas-docs.pages.dev
```

真實的回傳結果：

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

看到 `200` 即說明站點健康。綁定了自訂網域後，把 URL 換成自己的網域再測一次。

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

憑證簽發需要 2~5 分鐘全球生效時間，等待後強制重新整理即可；期間可先存取 `xxx.pages.dev` 預設網域。

### 執行 `pnpm run deploy` 報錯 `Project not found`？

先執行 `npx wrangler whoami` 確認已登入；再核對 `package.json` 中 `deploy` 腳本的 `--project-name` 與主控台專案名是否一致。

更多排查項見[常見問題與故障排查 FAQ](/canvas/troubleshooting/)。
