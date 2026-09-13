---
title: 站點全域設定與樣式定製
description: EpoCanvas Docs 核心設定檔修改指南、側邊欄選單調整、品牌 Logo 替換與主題顏色定製。
---

如果你想把 **EpoCanvas Docs** 用作自己團隊的文件站，或者調整網站標題、Logo、目錄結構與主題色，本章節介紹常用的定製入口。所有設定變更儲存後，本機開發伺服器會自動熱更新，瀏覽器立即可見。

---

## 1. 站點基本資訊 (`astro.config.mjs`)

根目錄下的 `astro.config.mjs` 是整個文件站的主設定檔。與站點資訊直接相關的選項如下（註解標明了修改時機）：

```javascript
export default defineConfig({
  // 站點的正式環境網域，影響 SEO 連結與 Sitemap 產生
  site: 'https://docs.epocanvas.com',

  integrations: [
    starlight({
      // 網站標題，顯示在瀏覽器分頁與頂欄
      title: 'EpoCanvas Docs',
      // 站點描述，用於搜尋引擎結果摘要
      description: 'EpoCanvas 全端技術、架構與產品維運指南',

      // 頂欄左側的 Logo 圖片路徑
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // 設為 true 則只顯示 Logo、隱藏標題文字
      },

      // 右上角的 GitHub 儲存庫連結
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

      // 自訂樣式表入口
      customCss: ['./src/styles/custom.css'],

      // 側邊欄目錄（見下一節）
      sidebar: [/* ... */],
    }),
  ],

  // 舊路徑跳轉表，防止連結失效
  redirects: { '/mail': '/canvas' },
});
```

---

## 2. 如何修改左側目錄選單？

左側的文件分類目錄由 `astro.config.mjs` 中 Starlight 設定的 `sidebar` 陣列控制：

```javascript
sidebar: [
  // 分組一：產品概覽
  {
    label: '產品概覽與入門',       // 分組名稱
    items: [
      { label: '產品簡介與核心價值', link: '/canvas/' },
      { label: '快速上手 (3分鐘執行)', link: '/canvas/deployment/' },
    ],
  },
  // 分組二：你可以新增自己的業務分組
  {
    label: '使用者指南',
    items: [
      { label: '帳號註冊與登入', link: '/canvas/login/' },
    ],
  },
];
```

- **`label`**：側邊欄上顯示的分類名或文章名，可以與 Frontmatter 的 `title` 不同（例如用更短的顯示名）；
- **`link`**：文章的存取路徑，對應 `src/content/docs/` 下的檔案位置。

:::warning
新建的 `.md` 檔案必須登記到 `sidebar` 陣列中才會出現在左側目錄裡，只建立檔案不登記是新手最常踩的坑。
:::

---

## 3. 自訂品牌主題色 (`src/styles/custom.css`)

站點所有顏色都由 CSS 變數控制，定義在 `src/styles/custom.css`。檔案頂部是淺色模式變數，`:root[data-theme='dark']` 區塊是深色模式變數：

```css
:root {
  /* 品牌主色（淺色模式） */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* 選取項淺色背景 */
  --sl-color-accent-high: #1d4ed8;                  /* 連結與高亮文字 */

  /* 頁面底色與分割線 */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* 深色模式使用同名變數，只需替換色值 */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

例如想把全站主色換成活力綠，把淺色與深色兩個區塊裡的 `--sl-color-accent` 改為 `#10b981` 系列色值即可，按鈕、選取態、連結會自動同步變色。

版面尺寸也在這份檔案頂部集中定義：

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 左側目錄寬度 */
  --sl-content-width: 60rem;    /* 內文最大寬度 */
  --sl-nav-height: 3.5rem;      /* 頂欄高度 */
}
```

---

## 4. 替換站點 Logo

1. 準備一張品牌 Logo 向量圖（推薦 `.svg`，也可以用清晰的 `.png`）；
2. 覆蓋儲存為 `public/images/logo.svg`（首頁大圖在 `src/assets/logo.svg`）；
3. 重新整理瀏覽器，頂欄與首頁的圖示自動替換。

:::tip
兩處 Logo 用途不同：`public/images/logo.svg` 用於頂欄，`src/assets/logo.svg` 用於首頁右側的裝飾大圖，建議同時替換。
:::
