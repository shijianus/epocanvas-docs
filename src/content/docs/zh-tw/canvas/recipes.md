---
title: 常見客製場景速查
description: EpoCanvas Docs 高頻客製操作速查：新增文件、導覽按鈕、介面語言、主題色、Logo、版面尺寸與搜尋文案的完整步驟。
---

本頁把最常見的客製需求整理成「按步驟照做即可」的速查手冊。每條配方的改動位置都已標註到具體檔案；動手前建議先了解[渲染規則](/canvas/rendering/)和[元件體系](/canvas/components/)，能少走彎路。

---

## 配方 1：新增一篇文件

1. 在 `src/content/docs/canvas/` 下新建 `.md` 檔案（小寫英文加中劃線命名，如 `user-guide.md`）；
2. 檔案開頭寫好 Frontmatter：

   ```yaml
   ---
   title: 使用者使用指南
   description: 一句話說明本篇講什麼，會展示在搜尋結果與分享卡片裡。
   ---
   ```

3. 開啟 `astro.config.mjs`，在 `sidebar` 陣列的目標分組下登記：

   ```javascript
   { label: '使用者使用指南', link: '/canvas/user-guide/' }
   ```

4. 在其餘 9 個語言目錄的 `src/content/docs/<locale>/canvas/user-guide.md` 完成對應譯文，並補齊側邊欄的 `translations` 與需要翻譯的圖片；缺譯會使發布檢查失敗。
5. 在本機確認導覽與內文後執行 `pnpm run verify`，再用 `pnpm run preview` 檢查建置產物。
6. 審查並合併改動後，由維護者從乾淨的 `main` 發布：該分支須追蹤 `origin/main`，HEAD 須與遠端提交一致。先用 `pnpm exec wrangler login` 授權，再執行 `pnpm run deploy`。自己的 fork 須先按[部署指南](/canvas/cloudflare/)調整目標專案，不能直接沿用維護者的發布設定。

:::caution
只建檔案不登記 `sidebar`，頁面可以存取但不會出現在左側目錄裡——這是新手最常踩的雷。
:::

---

## 配方 2：新增一個頂部導覽按鈕

1. 開啟 `src/config/navigation.ts`，向 `navigationConfig` 陣列追加條目：

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: '部落格',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // 站外連結在新視窗開啟
   },
   ```

2. 開啟 `src/utils/i18n.ts`，為 `nav.blog` 補充 10 種語言的翻譯詞條；
3. 儲存後頂欄立即出現新按鈕；站內連結如需參與導覽高亮，為其設定 `match` 函式。

---

## 配方 3：調整頁面高亮規則

頁面路徑變化導致頂欄高亮錯誤時，修改 `navigation.ts` 中對應條目的 `match` 函式：

```typescript
// 把新頁面的 slug 加進白名單；isCanvasPage 會先去掉語言前綴
match: isCanvasPage(['layout', 'navigation']),
```

`isCanvasPage` 按精確 slug 判斷，不要改回 `includes` 子字串比對；多個按鈕的 `match` 不要有交集，否則會出現兩個按鈕同時高亮。

---

## 配方 4：更換品牌主題色

1. 開啟 `src/styles/custom.css`；
2. 同時修改淺色（`:root`）與深色（`:root[data-theme='dark']`）兩個區塊中的主色三件套：

   ```css
   --sl-color-accent: #10b981;      /* 主色：按鈕、選取態 */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* 選取項淺背景 */
   --sl-color-accent-high: #047857; /* 連結與高亮文字 */
   ```

3. 儲存後全站按鈕、高亮、連結自動換色。只改一處會導致另一種主題下配色脫節。

---

## 配方 5：替換 Logo

| 位置 | 檔案 | 用途 |
| :--- | :--- | :--- |
| 頂欄左側 | `public/images/logo.svg` | 內頁頂欄圖示，路徑設定在 `astro.config.mjs` 的 `logo.src` |
| 首頁大圖 | `src/assets/logo.svg` | 落地頁右側裝飾圖 |

兩處建議同時替換。Logo 用 SVG 向量格式；`astro.config.mjs` 中 `logo.replacesTitle` 設為 `true` 可隱藏標題文字只留圖示。

---

## 配方 6：調整版面尺寸

版面三要素集中在 `src/styles/custom.css` 頂部：

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 左側目錄寬度 */
  --sl-content-width: 60rem;    /* 內文最大寬度 */
  --sl-nav-height: 3.5rem;      /* 頂欄高度 */
}
```

:::caution
右側目錄欄的寬度不在這些變數裡，它由 `src/components/starlight/TwoColumnContent.astro` 中的 `20rem` 控制（超寬螢幕 `21rem`）。調整右欄寬度時，同一檔案裡內文區的 `max-width: calc(100% - 20rem)` 也要同步修改。
:::

---

## 配方 7：修改搜尋框提示文字

搜尋框佔位符、按鈕提示等介面文案都來自 `src/utils/i18n.ts` 的多語言字典。開啟該檔案，按「語言 → 詞條鍵」的兩級結構修改 `search.placeholder` 等詞條：

```typescript
// 檔案路徑: src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ...該語言的其他詞條
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ...該語言的其他詞條
  },
  // 其餘 8 種語言同理
};
```

`getTranslation` 優先使用目前語言既有的非空值；只有缺少該鍵或值為空時才回退中文，中文也缺失時顯示鍵名。未同步修改的既有譯文仍顯示舊值，因此改詞條時須同步全部 10 種語言。儲存後本機熱更新可見，無需建置。

---

## 配方 8：為站點新增驗證類 `<head>` 標籤

接入 Google Search Console、百度站長平台等服務時需要往 `<head>` 注入驗證標籤。開啟 `astro.config.mjs`，在 Starlight 設定的 `head` 陣列中追加：

```javascript
head: [
  // 既有的 favicon 設定 ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: '驗證字串',
    },
  },
],
```

儲存並重新部署後，用平台提供的驗證按鈕檢測。更多上線後的搜尋引擎設定見 [SEO 與效能最佳化](/canvas/seo/)。

---

## 改動後的通用檢查流程

無論做哪類客製，提交前按此順序驗證：

```bash
pnpm run dev      # 1. 瀏覽器逐頁查看效果
pnpm run verify   # 2. 執行測試、設定檢查、Astro 型別檢查、建置及內容/產物檢查
pnpm run preview  # 3. 預覽建置產物，確認無異常後再發布
```

發布方式見 [Cloudflare Pages 部署上線](/canvas/cloudflare/)。
