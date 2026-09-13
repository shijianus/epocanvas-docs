---
title: SEO 與效能最佳化
description: EpoCanvas Docs 內建的 SEO 能力（meta 標籤、Open Graph、sitemap、robots.txt）與效能機制說明，以及提交搜尋引擎的方法。
---

文件寫出來是給人看的，前提是能被搜到、開啟要快。**EpoCanvas Docs** 在建置層面內建了一套開箱即用的 SEO 能力和效能機制，本頁說明它們分別是什麼、如何驗證，以及上線後還需要做的幾件事。

---

## 內建的 SEO 能力

以下能力全部在建置時自動生效，不需要額外設定：

| 能力 | 實現方式 | 驗證方法 |
| :--- | :--- | :--- |
| 頁面標題 | `<title>文章標題 \| EpoCanvas Docs</title>`，取自 Frontmatter | 查看網頁原始碼或瀏覽器分頁 |
| 頁面描述 | `<meta name="description">`，取自 Frontmatter 的 `description` | 查看原始碼 |
| Open Graph 標籤 | `og:title`、`og:type`、`og:url`、`og:locale`、`og:description`，分享到社群平台時展示卡片 | 貼上連結到聊天工具預覽 |
| Canonical 連結 | 每頁自動產生 `<link rel="canonical">`，指向主網域 | 查看原始碼 |
| Sitemap | 建置時自動產生 `sitemap-index.xml` | 存取 `/sitemap-index.xml` |
| robots.txt | 專案內建 `public/robots.txt`，放行全部爬蟲並宣告 sitemap 位置 | 存取 `/robots.txt` |

:::tip
Frontmatter 的 `title` 和 `description` 是搜尋引擎展示的主要素材。寫文件時務必填寫簡短準確的 `description`，這是 SEO 最重要的單點最佳化。
:::

### Canonical 與鏡像網域

站點主網域為 `docs.epocanvas.com`，`<site>` 設定與其保持一致，每頁的 canonical 與 `og:url` 都指向主網域。即使內容同時透過 `epocanvas-docs.pages.dev` 鏡像存取，搜尋引擎也會把權重歸一到主網域，不會判定為重複內容。

---

## 效能機制

### 純靜態輸出，無框架執行環境

建置產物是純 HTML + CSS。頁面導覽、閱讀、目錄捲動高亮都不需要下載任何前端框架（React/Vue 等執行環境體積為零），只有搜尋、主題切換、語言切換等互動元件按需載入少量腳本。首屏渲染不等待 JavaScript，弱網路與低階裝置同樣流暢。

### 圖片建置期壓縮

透過 `public/` 引用的靜態資源在部署時由 CDN 分發；建置工具鏈內建 sharp 影像處理模組，為後續引入建置期圖片最佳化預留了能力。目前規範要求截圖寬度控制在 1440 像素左右、示意圖優先 SVG，從源頭控制圖片體積。

### 搜尋索引按需載入

Pagefind 在 `pnpm run build` 時產生高壓縮的索引分片。讀者開啟頁面時不會下載任何索引；只有真正使用全站檢索時，瀏覽器才按關鍵字拉取對應分片（幾 KB 到幾十 KB），不影響首屏速度。

### 如何驗證效能

1. 開啟瀏覽器開發者工具的 **Network** 面板，重新整理頁面，查看首屏傳輸體積；
2. 在 Chrome 無痕視窗執行 **Lighthouse** 審核（Performance 類別），確認分數；
3. 用 `curl -sI https://docs.epocanvas.com` 檢查回應標頭中 `Cache-Control` 等 CDN 快取策略是否生效。

---

## 上線後建議做的三件事

部署完成（參見 [Cloudflare Pages 部署上線](/canvas/cloudflare/)）後，建議按順序完成：

### 1. 提交 Sitemap 到 Google Search Console

1. 開啟 [Google Search Console](https://search.google.com/search-console)，新增資源 `docs.epocanvas.com`；
2. 按提示透過 DNS TXT 記錄驗證網域所有權（網域在 Cloudflare 託管時幾分鐘即可生效）；
3. 在左側「站點地圖」中提交 `https://docs.epocanvas.com/sitemap-index.xml`。

### 2. 驗證收錄效果

上線一週後，在 Google 用 `site:docs.epocanvas.com` 檢索，確認文章已被收錄；在 Search Console 的「網頁」報告中查看已編入索引的頁面數量是否與文件數量一致。

### 3. 定期檢查失效連結

文件改版、路徑重新命名後，站外引用的舊連結可能失效。可以在 Search Console 的「網頁」報告中查看「未找到 (404)」條目，並在 `astro.config.mjs` 的 `redirects` 表中為高存取量的失效路徑補充跳轉。

:::caution
`epocanvas-docs.pages.dev` 鏡像網域僅作為備用存取入口，canonical 已保證搜尋引擎只收錄主網域。請勿在站外主動傳播鏡像位址，避免讀者收藏一個不受你控制的網域。
:::
