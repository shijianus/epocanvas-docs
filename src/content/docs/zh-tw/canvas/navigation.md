---
title: 頂部導覽與頁面路由
description: EpoCanvas Docs 頂部導覽列設定、動態路徑高亮規則、外部版本徽標與歷史重新導向設定。
---

頂部導覽列是使用者在各個功能板塊之間穿梭的主要通道。**EpoCanvas Docs** 把所有導覽項集中在一個設定檔中，改動一處即可全站生效，並自帶精確的目前頁面高亮和歷史連結重新導向機制。

---

## 導覽設定中心 (`src/config/navigation.ts`)

所有頂部導覽按鈕都在 `src/config/navigation.ts` 中以宣告式陣列維護。每個條目的欄位定義如下：

```typescript
// 導覽條目屬性定義
export interface NavItem {
  id: string; // 唯一識別碼
  labelKey: string; // 多語系翻譯字典中的鍵名
  defaultLabel: string; // 預設顯示的文字（如「首頁」、「產品說明」）
  href: string; // 跳轉連結或相對路徑
  match?: (pathname: string) => boolean; // 判斷目前頁面是否應高亮該按鈕的規則
  badge?: string; // 額外顯示的小膠囊徽標（如版本號 "v1.2.0"）
  isExternal?: boolean; // 是否為外部網頁跳轉（是則在新視窗開啟）
}
```

### 目前官方設定（節選）

```typescript
export const navigationConfig: NavItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    defaultLabel: '首页',
    href: '/',
    match: (pathname: string) => pathname === '/' || pathname === '',
  },
  {
    id: 'docs',
    labelKey: 'nav.docs',
    defaultLabel: '产品说明',
    href: '/canvas/',
    match: (pathname: string) =>
      pathname === '/canvas' ||
      pathname === '/canvas/' ||
      pathname.includes('about') ||
      pathname.includes('layout') ||
      pathname.includes('search-engine') ||
      pathname.includes('i18n') ||
      pathname.includes('navigation'),
  },
  {
    id: 'quickstart',
    labelKey: 'nav.quickstart',
    defaultLabel: '快速上手',
    href: '/canvas/deployment/',
    match: (pathname: string) => pathname.includes('deployment'),
  },
  // 後續還有 guide（編寫規範）、deploy（部署上線）、faq（常見問題）
  // 以及指向 GitHub Releases 的 release 外部條目
];
```

增刪導覽項只需要在這個陣列中新增或刪除條目，儲存後本機開發伺服器會自動熱更新。

---

## 動態啟用與高亮規則

如果只是簡單判斷 `pathname.startsWith('/canvas')`，那麼當你存取「快速上手」頁面 `/canvas/deployment/` 時，「產品說明」和「快速上手」兩個按鈕可能同時亮起，讓人困惑。

因此每個導覽項都用 `match` 函式宣告自己的高亮範圍：

- 存取首頁 `/` 時，只有「首頁」按鈕處於啟用狀態；
- 存取 `/canvas/layout/`、`/canvas/about/` 等一般文件時，啟用「產品說明」按鈕；
- 進入 `deployment` 路徑的頁面時，排他地啟用「快速上手」按鈕；
- 啟用狀態的按鈕帶主題色膠囊背景，與未啟用按鈕形成明顯對比。

新增文件頁面時，記得把路徑關鍵字加進對應導覽項的 `match` 規則裡，否則頂欄不會正確高亮。

---

## 外部連結與版本徽標互動

如果某個導覽項指向外部網站（例如 GitHub 儲存庫的 Releases 頁面）：

1. 設定 `isExternal: true`；
2. 系統自動為該連結加上 `target="_blank" rel="noopener noreferrer"` 安全屬性，在新分頁開啟；
3. 文字旁會跟隨一個斜向外的微型箭頭圖示（`↗`），提示讀者點擊後將離開目前網站。

版本徽標（`badge: 'v1.2.0'`）以膠囊形式展示在按鈕內，發新版本時記得同步修改，詳見 [版本管理與自動化工作流程](/canvas/releases/)。

---

## 頁面重新導向規則 (`astro.config.mjs`)

專案迭代中難免調整文件路徑。為了不讓讀者書籤裡的舊連結變成 404，可以在 `astro.config.mjs` 的 `redirects` 表中登記新舊路徑的對應關係：

```javascript
export default defineConfig({
  redirects: {
    // 本站章節路徑語意化重新命名後，舊連結全部保留跳轉
    '/canvas/rule-engine': '/canvas/cloudflare/',
    '/canvas/dns-setup': '/canvas/layout/',
  },
});
```

Astro 在建置時會為這些路徑產生自動跳轉頁面，讀者存取舊網址會被平滑帶到新網址，搜尋引擎權重也能繼承。
