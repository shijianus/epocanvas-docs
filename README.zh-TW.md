# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built_with-Astro_5-orange.svg?style=flat-square)](https://astro.build)

[English](./README.md) | [简体中文](./README.zh-CN.md) | 繁體中文 | [Français](./README.fr.md)

EpoCanvas Docs 是 EpoCanvas 專案的官方技術文件站點，基於 Astro 5 與 Starlight 建置，內建三欄閱讀版面、雙模式搜尋與多語系介面。所有內容以標準 Markdown 撰寫，可發布至 Cloudflare Pages。

**線上站點**：[https://docs.epocanvas.com](https://docs.epocanvas.com)（備用位址：[https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)）

## 介面預覽

![EpoCanvas Docs 文件站首頁](./public/images/canvas/ui-home-landing.png)

站點採用三欄版面：左側為分類導覽，中間為內文，右側為目前頁面的目錄。預設深色主題，會跟隨系統設定，也可在頂欄手動切換。

## 功能特性

- **三欄閱讀版面**：內文行寬經過限制，適合長篇閱讀；左側導覽列在切換頁面時保留捲動位置，右側目錄會隨捲動高亮目前小節。
- **雙模式搜尋**：頂欄搜尋框負責在目前頁面內尋找，`Ctrl+K` / `Cmd+K` 呼叫基於 Pagefind 的全站檢索彈窗。索引於建置時產生，檢索完全在瀏覽器內完成，不依賴第三方搜尋服務，託管在無對外網路的內部網路環境同樣可用。
- **介面多語系**：介面提供 10 種語言——簡體中文（預設）、繁體中文、英文、日文、韓文、西班牙文、法文、德文、俄文、葡萄牙文。切換時文字就地更新，無須重新載入頁面。
- **Markdown 擴充**：支援 `:::note`、`:::tip`、`:::caution`、`:::danger` 四種提示框；程式碼區塊支援 Shiki 語法高亮、檔名標籤、指定行高亮與 diff 顯示。
- **一鍵部署**：站點建置為純靜態檔案，透過單一指令發布至 Cloudflare Pages，自訂網域與 HTTPS 憑證自動設定。

## 環境需求

- Node.js 20 或以上版本（支援 18.17+）
- pnpm 10

## 快速開始

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

在瀏覽器中開啟 `http://localhost:4321`。開發伺服器執行期間，Markdown 的修改會即時反映到頁面上。

### 常用指令

| 指令 | 說明 |
| :--- | :--- |
| `pnpm run dev` | 啟動本地開發伺服器，支援熱更新 |
| `pnpm run build` | 將靜態站點建置至 `dist/`，並產生搜尋索引 |
| `pnpm run preview` | 本地預覽建置成果 |
| `pnpm run deploy` | 建置並發布至 Cloudflare Pages |

## 目錄結構

```text
epocanvas-docs/
├── public/images/canvas/       # 文件所使用的截圖與圖示
├── src/
│   ├── components/starlight/   # 覆寫的 Starlight 元件（Header、Sidebar 等）
│   ├── config/navigation.ts    # 頂部導覽列設定
│   ├── content/docs/           # 文件內文，以 Markdown 撰寫
│   ├── styles/custom.css       # 主題配色與版面樣式
│   └── utils/i18n.ts           # 用戶端翻譯詞典
├── astro.config.mjs            # 站點設定：標題、側邊欄、重新導向
├── AGENTS.md                   # 技術寫作規範
├── LICENSE
└── package.json
```

## 撰寫文件

1. 在 `src/content/docs/canvas/` 下新增 `.md` 檔案；
2. 在檔案開頭加入 frontmatter：

   ```yaml
   ---
   title: 文件標題
   description: 本頁的一句話說明
   ---
   ```

3. 在 `astro.config.mjs` 的 `sidebar` 陣列中註冊該頁面；未註冊的頁面不會出現在導覽中。
4. 圖片存放於 `public/images/canvas/`，內文中以絕對路徑引用：

   ```markdown
   ![替代文字](/images/canvas/your-image.png)
   ```

提交前請先在本地執行 `pnpm run build`，確認站點可以完整建置、無錯誤。

## 部署

站點託管於 Cloudflare Pages：

- **本地發布**：先執行一次 `wrangler login` 完成授權，之後執行 `pnpm run deploy` 即可建置並發布。
- **自訂網域**：在 Cloudflare 控制台開啟 Pages 專案 `epocanvas-docs`，在 *Custom domains* 中新增網域，CNAME 記錄與 SSL 憑證會自動設定。

## 參與貢獻

歡迎提交 Issue 與 Pull Request。提交 PR 前請在本地執行 `pnpm run build` 並確認建置通過。

## 授權條款

[MIT](./LICENSE)
