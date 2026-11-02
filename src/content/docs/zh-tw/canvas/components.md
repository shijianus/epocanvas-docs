---
title: 介面元件與二次開發
description: EpoCanvas Docs 介面元件架構：Starlight 元件覆蓋機制、定製元件的職責與資料流，以及二次開發的注意事項。
---

**EpoCanvas Docs** 的介面沒有從零造輪子，而是在 Starlight 原生元件的基礎上做了**定向覆蓋**：保留 Starlight 的頁面骨架與內容處理能力，替換掉頂欄、側邊欄、目錄、搜尋等展示元件，以獲得想要的三欄版面和互動。本頁說明這套元件體系的結構與修改方法。

---

## 元件覆蓋機制

以下為 `astro.config.mjs` 的 `components` 註冊方式；完整清單以目前設定為準。

```javascript
// astro.config.mjs（節選）
components: {
  Header: './src/components/starlight/Header.astro',
  MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
  SkipLink: './src/components/starlight/SkipLink.astro',
},
```

建置時優先使用已註冊的自訂元件，未覆蓋者繼續使用 Starlight 原生實作。

---

## 自訂覆蓋元件的職責

原始碼位於 `src/components/starlight/`，主要職責如下。

| 元件檔案 | 職責 |
| :--- | :--- |
| `Header.astro` | 頂欄全部內容：Logo、搜尋框、主導覽、版本徽標、語言切換、主題切換、GitHub 與 Telegram 入口 |
| `Search.astro` | 雙模式搜尋：頂欄頁內尋找（高亮與計數）+ `Ctrl+K` 全站檢索彈窗（Pagefind UI） |
| `Pagination.astro` | 底部「上一頁 / 下一頁」翻頁卡片：扁平細邊框、主題色標題、↙/↘ 斜向箭頭指示翻頁方向 |
| `TwoColumnContent.astro` | 內文與右側目錄的雙欄骨架，控制右欄固定寬度與捲動 |
| `TableOfContents.astro` | 「本頁目錄」標題、圖示與目錄列表，過濾掉頁面自身標題 |
| `PageTitle.astro` | 頁面大標題（取 Frontmatter 的 `title`）與「最後更新於」時間戳記 |
| `Sidebar.astro` | 薄封裝：複用 Starlight 原生的 `SidebarPersister`，實現換頁時側邊欄捲動位置不變 |
| `SkipLink.astro` | 鍵盤聚焦時顯示跳轉連結，將焦點移到內文標題 `_top` |
| `MobileMenuToggle.astro` | 行動版側邊欄開關，同步展開狀態，支援 Esc 關閉並歸還焦點 |

---

## 資料流：三個設定檔驅動整個介面

定製元件本身不含業務資料，介面內容由三個設定檔驅動：

```text
astro.config.mjs ──→ locales + sidebar 陣列 ──→ Sidebar.astro 渲染左側目錄（各語言取對應譯文標籤）
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro 渲染頂部導覽與高亮（連結自動帶語言前綴）
src/utils/i18n.ts ──→ UI_TRANSLATIONS 字典 ──→ 各元件在建置期按當前語言取詞條
```

- **左側目錄**只認 `astro.config.mjs` 的 `sidebar` 宣告，新建文件必須在這裡登記；每個條目的 `translations` 欄位提供 10 種語言的選單文字；
- **頂部導覽**每項的顯示文字透過 `labelKey` 到 `i18n.ts` 字典取翻譯，`match` 函式決定目前頁面高亮哪個按鈕（比對前會先去掉語言前綴）；
- **介面文案**（搜尋框佔位符、「本頁目錄」標題、主題切換提示等）由各元件呼叫 `getTranslation(key, lang)` 在建置期直接輸出對應語言，頁面裡沒有執行期替換腳本。

也就是說：想改介面內容，先找對應的設定檔；只有改外觀（間距、顏色、圖示）才需要動元件原始碼。

---

## 各元件的關鍵實作細節

### PageTitle：頁面標題與真實更新時間

頁面大標題直接讀取 Frontmatter 的 `title`，因此**內文中不要再寫 `#` 一級標題**。目前 `astro.config.mjs` 開啟了 `lastUpdated: true`；未以 Frontmatter 日期覆寫時，「最後更新於」在建置時讀取最後修改該檔案的 Git 提交時間，不是每次儲存庫提交或每次建置的時間。只修改其他檔案不會更新本頁日期。

:::caution
未提交的新文件沒有可讀取的 Git 歷史，因此不顯示日期；既有檔案的未提交修改也不會改變其提交日期。淺複製（如 `fetch-depth: 1`）可能把歷史截斷處的提交日期當作更新時間，也可能無法讀取日期，不能當成完整歷史。需要準確日期時使用完整 Git 歷史（CI 中設定 `fetch-depth: 0`）。讀取日期失敗不影響建置。
:::

### Sidebar：捲動位置記憶的實作

`Sidebar.astro` 沿用 Starlight 的 `SidebarPersister`，換頁後恢復側邊欄捲動位置。行動版選單的開關與焦點由 `MobileMenuToggle.astro` 處理。

### TableOfContents：本頁目錄的產生

目錄資料由 Starlight 在建置時解析內文標題產生（`##` 與 `###`），元件只負責過濾掉頁面標題本身並渲染。捲動高亮由 `starlight-toc` 自訂元素在瀏覽器端完成，不依賴任何框架。

### TwoColumnContent：右欄寬度的唯一出處

右側目錄欄寬度在 `@media (min-width: 72rem)` 下固定為 `20rem`（超寬螢幕 `90rem` 以上為 `21rem`），內文區最大寬度相應減去右欄寬度。想調整右欄寬度，改這一個檔案即可，不要在其他樣式表裡零散覆蓋。

### Header：導覽、主題與語言

- 導覽按鈕遍歷 `navigationConfig` 渲染，啟用態樣式由 `match` 函式的回傳值決定，連結透過 `localizedHref()` 自動加上目前語言前綴；
- 主題切換寫入 LocalStorage 的 `starlight-theme` 鍵，頁面載入時按「本機選擇 → 系統偏好」的順序決定初始主題；
- 語言下拉選單裡每一項都是指向目前頁面對應語言版本的真實連結，點擊即跳轉，沒有額外的狀態儲存；
- 頂欄右側的 GitHub 與 Telegram 圖示都硬編碼在 `src/components/starlight/Header.astro` 內，改地址直接編輯該檔案；Telegram 指向 `@epocanvas` 帳號頁，懸停提示即語言詞條 `social.telegram`。`astro.config.mjs` 的 `social` 控制的是側欄底部那組社交圖示，兩處互不影響。

### Search：雙模式搜尋

一個元件內實作了兩套搜尋（詳見[全文搜尋與快捷鍵使用](/canvas/search-engine/)）：

1. **頁內尋找**：頂欄輸入框，按 Enter 在目前頁的比對文字間跳轉，高亮由腳本打標記實現；
2. **全站檢索**：`<dialog>` 彈窗 + Pagefind 預設 UI，索引在 `pnpm run build` 階段產生。

頁內輸入框僅在視窗至少 `64rem` 時顯示；更窄時只保留全站搜尋按鈕。查找目前文章可使用瀏覽器內建功能。截圖若與目前版面不同，以實際介面為準。

### Pagination：翻頁卡片

上一頁 / 下一頁資料由 Starlight 根據 `sidebar` 順序在建置時算好（`Astro.locals.starlightRoute.pagination`），元件只負責渲染：兩張等寬卡片、細邊框無陰影、標題用主題色，↙ / ↘ 斜向箭頭在游標懸停時沿翻頁方向位移。箭頭是內聯 SVG 路徑，站點若用於 RTL 語言會自動鏡像方向。

---

## 二次開發注意事項

:::caution
覆蓋元件意味著放棄了 Starlight 原生元件的後續更新。升級 Starlight 版本時，元件的 props 與 `Astro.locals.starlightRoute` 結構可能變化，升級後必須對全部覆蓋元件做迴歸測試。
:::

- **改樣式優先用 CSS 變數**：顏色、字型、版面尺寸集中在 `src/styles/custom.css` 的 `:root` 變數裡，見[站點全域設定與樣式定製](/canvas/configuration/)，多數定製不需要動元件；
- **改互動才動元件**：新增按鈕、調整結構時，介面文字用 `getTranslation(key, lang)` 取詞並在 `i18n.ts` 裡補齊 10 種語言詞條，漏補的語言會回退顯示中文；
- **改完務必本機驗證**：`pnpm run dev` 檢查互動，`pnpm run verify` 確認型別與建置通過（本機指令見[常見問題與故障排查 FAQ](/canvas/troubleshooting/)）。

常見的具體定製操作，直接查閱[常見客製場景速查](/canvas/recipes/)。
