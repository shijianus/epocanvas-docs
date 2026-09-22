---
title: 快速上手 (3 分鐘執行)
description: EpoCanvas Docs 本機環境準備、安裝相依套件、啟動本機開發伺服器與常用操作指令速查。
---

把這套文件站跑起來有兩條路，按你的目的選一條即可：

- **只想立刻看到一個線上站點**：不用安裝任何環境，直接跳到下面的[一鍵部署](#一鍵部署點一個按鈕就上線)小節，點一下按鈕，兩分鐘後就能拿到屬於你自己的網址；
- **想寫文件、改內容**：先按 [準備工作](#準備工作) 把專案在本機跑起來，邊改邊看效果，寫完後再用[常用指令](#常用開發指令速查)裡的部署指令發布。

---

## 一鍵部署：點一個按鈕就上線

下面的按鈕來自 Cloudflare、Vercel、Netlify 三家的官方「部署按鈕」。點擊後會開啟對應平台的部署精靈，平台自動把這個儲存庫 clone 到你自己的 GitHub 帳號下，然後自動完成雲端建置和發布。全程只需要一個 GitHub 帳號，不需要在電腦上安裝 Node.js、pnpm，也不需要敲任何指令。

### 部署到 Cloudflare（建議）

[![Deploy to Cloudflare](/images/canvas/deploy/badge-cloudflare.svg)](https://deploy.workers.cloudflare.com/?url=https://github.com/shijianus/epocanvas-docs)

點擊按鈕後，精靈分三步走：

1. **授權登入**：依次登入 GitHub 和 Cloudflare。兩者都有免費方案，沒有帳號就現場註冊一個；
2. **Clone 儲存庫**：Cloudflare 自動把這個儲存庫複製一份到你的 GitHub 帳號下，之後的所有內容修改都在你自己的儲存庫裡進行；
3. **確認設定並部署**：精靈最後會顯示一個設定頁，按下表確認無誤後點擊 Deploy：

| 設定項 | 精靈裡預設顯示什麼 | 怎麼處理 |
| :--- | :--- | :--- |
| 儲存庫名稱 / 專案名稱 | 預填 `epocanvas-docs` | 保持預設 |
| 建置指令 | 自動識別為本儲存庫的 `pnpm run build` | 保持預設 |
| 部署指令 | 預填 `pnpm run deploy` | **改成 `npx wrangler deploy`** |

:::caution
部署指令務必改成 `npx wrangler deploy`。預填的 `pnpm run deploy` 是本站維護者保留的 Cloudflare Pages 直傳指令，它部署到的是寫死的專案名稱，在按鈕部署流程裡會直接報錯。
:::

首次部署時，Cloudflare 偵測到儲存庫裡沒有 Workers 設定檔，會自動識別出這是 Astro 靜態站點，並向你的儲存庫發起一個自動產生的設定 Pull Request（PR）——把它合併即可，之後每次推送都會自動建置上線。從點擊按鈕到看到網址，順利的話兩三分鐘。

部署完成後，Cloudflare 會分配一個 `https://epocanvas-docs.<你的子網域>.workers.dev` 形式的公開網址，自帶 HTTPS 憑證。想換成自己的網域，在控制台進入 Workers & Pages → 你的專案 → **Settings** → **Domains & Routes** 新增即可。 本站的線上實例可直接對照：Pages 預設網域 [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev) 與自訂網域 [https://docs.epocanvas.com](https://docs.epocanvas.com)。

### 部署到 Vercel 和 Netlify

習慣用其他平台的話，下面兩個按鈕做的是同一件事，兩個平台都能自動識別 Astro 專案，不需要手動填任何建置設定：

[![Deploy with Vercel](/images/canvas/deploy/badge-vercel.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshijianus%2Fepocanvas-docs)

[![Deploy to Netlify](/images/canvas/deploy/badge-netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/shijianus/epocanvas-docs)

- **Vercel**：點擊按鈕 → 授權 GitHub → 保持預設選項點擊 Deploy。完成後得到 `epocanvas-docs.vercel.app` 網域，個人 Hobby 方案免費；
- **Netlify**：點擊按鈕 → 連接 GitHub → 平台自動 clone 儲存庫並完成首次建置。完成後得到 `epocanvas-docs.netlify.app` 網域，免費額度夠用。

:::note
三個按鈕的機制相同：把儲存庫 clone 到你的 GitHub 帳號，並設定好「推送程式碼就自動重新建置上線」的持續部署。選一個平台用就好，不需要重複部署。本站自身採用 Cloudflare Pages 直傳方式託管（見 [Cloudflare Pages 部署上線](/canvas/cloudflare/)），與上述按鈕路徑互不影響——對靜態文件站來說，兩種託管方式讀者看到的存取體驗是一致的。
:::

---

## 準備工作

一鍵部署適合「先把站點發出去」，但撰寫和修改文件終究要在本機進行。如果打算動手寫內容，請先確認你的電腦上安裝了以下基礎開發環境：

| 工具 | 建議版本 | 檢查指令 | 說明 |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.20.8`（建議 20.3+ 或 22 LTS） | `node -v` | 執行 JavaScript 與建置靜態頁面的基礎環境 |
| **pnpm** | `>= 9`（CI 環境使用 10） | `pnpm -v` | 建議使用的套件管理器，安裝速度快且節省硬碟空間 |
| **Git** | 最新穩定版 | `git --version` | 用於拉取程式碼與版本管理 |

:::tip
如果你的電腦上還沒安裝 `pnpm`，可以透過 Node.js 自帶的 npm 快速全域安裝：

```bash
npm install -g pnpm
```
:::

---

## 3 步在本機跑起來

### 第一步：Clone 程式碼儲存庫到本機

打開終端機（Terminal），執行以下指令 clone 專案程式碼並進入專案資料夾：

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
```

### 第二步：安裝專案相依套件

在專案根目錄下執行安裝指令：

```bash
pnpm install
```

pnpm 會自動根據 `pnpm-lock.yaml` 下載所需的前端相依套件，包含 Astro、Starlight 和本機圖片處理模組，通常幾十秒即可完成。安裝結束時終端機會顯示總耗時：

```text
Done in 1m 3.2s using pnpm v9.15.9
```

### 第三步：啟動本機開發預覽伺服器

相依套件安裝完成後，執行啟動指令：

```bash
pnpm run dev
```

終端機將輸出類似如下的資訊（首次啟動需要預編譯相依套件，耗時幾秒）：

```text
astro  v5.18.2  ready in 5152 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

watching for file changes...
```

此時打開瀏覽器存取 `http://localhost:4321`，就能看到完整的文件站點了。修改任意 `.md` 檔案儲存後，瀏覽器頁面會自動重新整理顯示最新內容。

![快速上手頁面在本機開發伺服器中的實際渲染效果](/images/canvas/ui-quickstart.png)

*圖：`http://localhost:4321/canvas/deployment/` 的實際渲染效果，即你現在正在閱讀的這一頁。*

---

## 常用開發指令速查

在日常撰寫文件或維護專案時，主要使用以下幾個指令：

| 指令 | 適用場景 | 詳細說明 |
| :--- | :--- | :--- |
| `pnpm run dev` | **日常寫文件** | 啟動本機除錯服務，支援熱更新（HMR）。修改任意 `.md` 檔案後，瀏覽器會自動重新整理更新內容。 |
| `pnpm run build` | **打包測試** | 在本機完整編譯全站靜態頁面，並在 `dist/` 目錄下產生 HTML、CSS 以及 Pagefind 搜尋索引。 |
| `pnpm run preview` | **預覽打包產物** | 本機啟動輕量 Web 伺服器來執行 `dist/` 產物，用於在正式發布前檢查連結和樣式是否正常。 |
| `pnpm run deploy` | **一鍵發布上線** | 先自動執行 build，再呼叫 Wrangler 工具將 `dist/` 推送到 Cloudflare Pages 線上正式環境。 |

完整的發布步驟與線上驗證方法，請閱讀 **[Cloudflare Pages 部署上線](/canvas/cloudflare/)**。

---

## 核心設定檔在哪裡？

如果需要修改網站的基礎資訊，主要關注以下幾個檔案：

- **網站名稱與目錄選單**：修改根目錄下的 `astro.config.mjs`。你可以修改網站的 `title`（站點標題）、`site`（線上網域）以及 `sidebar`（左側目錄選單）。
- **頂部導覽欄按鈕**：修改 `src/config/navigation.ts`。在這裡可以增減頂部的「首頁」、「產品說明」等按鈕及其跳轉路徑。
- **頁面顏色與字體樣式**：修改 `src/styles/custom.css`。在這裡可以調整淺色和深色模式下的主題顏色。
- **新增文件**：直接在 `src/content/docs/canvas/` 目錄下新增 `.md` 檔案，並登記到側邊欄，詳見 [Markdown 撰寫與排版指南](/canvas/markdown/)。

---

## 下一步

本機服務成功執行後，你可以繼續了解：

- **[頁面佈局與閱讀體驗](/canvas/layout/)**：了解頂欄、側邊欄和內文介面的佈局細節。
- **[渲染規則詳解](/canvas/rendering/)**：搞清楚 Markdown 是如何被渲染成最終頁面的，避免踩到排版語法的陷阱。
- **[Cloudflare Pages 部署上線](/canvas/cloudflare/)**：把文件發布到網際網路並綁定獨立網域。
