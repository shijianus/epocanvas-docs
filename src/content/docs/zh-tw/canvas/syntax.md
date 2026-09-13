---
title: 提示框、程式碼區塊與圖表範例
description: EpoCanvas Docs 4 種彩色提示框、程式碼區塊標題與行高亮、diff 對比與圖表插入的實際用法和真實渲染效果。
---

編寫高品質的技術文件，不僅需要清晰的文字，還需要醒目的重點提示、格式規整的程式碼範例和一目瞭然的示意圖。本頁所有範例都是實際生效的語法，你看到的效果就是渲染結果——本文本身就是一個活的範例頁。

---

## 1. 四種彩色提示框

提示框使用三冒號語法：`:::類型` 開頭、`:::` 結尾，中間寫內容。本站基於 Starlight，支援 **note、tip、caution、danger** 四種類型。

### 語法與實際效果對照

:::note
**note（補充說明）**：用於介紹背景知識、補充設計細節或提示前置依賴。
:::

:::tip
**tip（實用技巧）**：用於分享提高操作效率的小妙招或最佳實踐。
:::

:::caution
**caution（注意警告）**：提示可能存在的相容性衝突、潛在錯誤或需要特別留意的操作。
:::

:::danger
**danger（高風險提醒）**：涉及資料遺失、正式環境覆蓋或不可逆操作的最高級別警示。
:::

### 提示框內可以放任意內容

提示框內部可以繼續使用列表、程式碼區塊、表格等語法：

:::tip[安裝提速]
使用 pnpm 安裝依賴比 npm 快得多：

```bash
npm install -g pnpm
```
:::

:::caution
兩個常見的無效寫法，請注意避開：

- GitHub 風格的 `> [!NOTE]` 引用區塊語法不受支援，會原樣顯示成普通引用區塊；
- `:::important` 與 `:::warning` **不是本站支援的類型**，不會報錯，但會靜默渲染成普通段落，沒有任何提示框樣式。

從 GitHub 文件遷移時，請把 `> [!NOTE]` 改寫為 `:::note`，`> [!WARNING]` 改寫為 `:::caution`，`> [!CAUTION]` 改寫為 `:::danger`。
:::

---

## 2. 程式碼區塊進階排版

### 2.1 檔案名標題與指定行高亮

在程式碼圍欄首行標註 `title="檔案路徑"`，並用 `{行號}` 高亮重點行：

````markdown
```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs', // 這一行會被高亮背景強調
  version: '1.2.0',
};
```
````

**渲染效果：**

```typescript title="src/config/site.ts" {2}
export const siteConfig = {
  name: 'EpoCanvas Docs',
  version: '1.2.0',
};
```

### 2.2 增量程式碼對比 (diff)

展示設定升級或程式碼重構時，用 `diff` 語言讓改動一目瞭然，`-` 開頭的行顯示為刪除、`+` 開頭的行顯示為新增：

````markdown
```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```
````

**渲染效果：**

```diff
  export default defineConfig({
-   site: 'http://localhost:3000',
+   site: 'https://docs.epocanvas.com',
  });
```

### 2.3 終端指令

`bash`、`sh`、`powershell` 等終端語言會渲染為終端風格的深色邊框：

```bash
pnpm run build
```

---

## 3. 圖表怎麼插入？

目前版本**不內建 Mermaid 等文字圖表渲染**。直接書寫 ` ```mermaid ` 圍欄只會按普通程式碼區塊顯示原始碼，不會產生圖形。

建議的做法是：在 [mermaid.live](https://mermaid.live) 等工具中編寫並匯出 **SVG 向量圖**，儲存到 `public/images/canvas/` 後按圖片語法插入。本站的架構圖、語言切換流程圖都是這樣製作的：

![系統架構示意圖](/images/canvas/docs-architecture.svg)

*圖：以 SVG 圖片形式插入的架構示意圖，任意縮放不模糊。*

如果確實需要讓 Mermaid 原始碼直接渲染成圖，需要在專案中引入額外的渲染外掛（如 `rehype-mermaid`），屬於二次開發範疇，請評估維護成本後再引入。

---

## 4. 其他實用排版

- 行內程式碼：`pnpm run dev`，渲染為主題色等寬字體；
- 鍵盤按鍵：<kbd>Ctrl</kbd> + <kbd>K</kbd>，渲染為鍵帽樣式；
- 任務清單：

```markdown
- [x] 支援語法高亮
- [x] 支援一鍵複製
- [ ] 內建 Mermaid 渲染（規劃中）
```

渲染為帶勾選狀態的列表項。

### 4.1 腳註

需要標註資料來源或補充說明時，可以使用 GFM 腳註語法：

````markdown
靜態索引由 Pagefind 在建置時產生[^pagefind]。

[^pagefind]: [Pagefind 官方文件](https://pagefind.app/) — 面向靜態網站的本機搜尋函式庫。
````

**渲染效果：** 內文結尾會出現帶序號的上標跳轉標記[^pagefind-demo]，點擊平滑跳轉到頁面底部的腳註列表。

[^pagefind-demo]: 這就是本頁底部渲染出來的腳註本體。

靈活運用提示框、程式碼標註和示意圖，可以大幅提升技術文件的閱讀舒適度與專業感。完整的語法約定請閱讀 **[渲染規則詳解](/canvas/rendering/)**。
