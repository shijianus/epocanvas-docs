---
title: UI コンポーネントとカスタム開発
description: EpoCanvas Docs の UI コンポーネントアーキテクチャ。Starlight コンポーネントのオーバーライド機構、カスタムコンポーネントの役割とデータフロー、カスタマイズ時の注意点。
---

**EpoCanvas Docs** の UI はゼロから作ったものではなく、Starlight のネイティブコンポーネントをベースに**ピンポイントでオーバーライド**したものです。Starlight のページ骨格とコンテンツ処理の能力を残しつつ、トップバー・サイドバー・目次・検索などの表示コンポーネントを差し替えることで、狙いどおりの 3 カラムレイアウトとインタラクションを実現しています。このページでは、このコンポーネント体系の構造と変更方法を説明します。

---

## コンポーネントのオーバーライド機構

以下のように `astro.config.mjs` の `components` に登録します。完全な一覧は現在の設定を参照してください。

```javascript
// astro.config.mjs（抜粋）
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

ビルド時は登録したカスタム実装を優先します。未登録のコンポーネントは Starlight の標準実装を使います。

---

## カスタムオーバーライドの役割

ソースは `src/components/starlight/` にあり、主な役割は以下のとおりです。

| コンポーネントファイル | 役割 |
| :--- | :--- |
| `Header.astro` | トップバーの全内容: ロゴ、検索ボックス、メインナビ、バージョン バッジ、言語切替、テーマ切替、GitHub と Telegram への入口 |
| `Search.astro` | 2 モード検索: トップバーのページ内検索（ハイライトとカウント）+ `Ctrl+K` のサイト全体検索ポップアップ（Pagefind UI） |
| `Pagination.astro` | 下部の「前のページ / 次のページ」カード。フラットな細枠、テーマカラーのタイトル、↙/↘ の斜め矢印でページ送りの方向を表示 |
| `TwoColumnContent.astro` | 本文と右側目次の 2 カラム骨格。右カラムの固定幅とスクロールを制御 |
| `TableOfContents.astro` | 「目次」の見出し、アイコンと目次リスト。ページ自身のタイトルは除外 |
| `PageTitle.astro` | ページの大きな見出し（Frontmatter の `title` を使用）と「最終更新」タイムスタンプ |
| `Sidebar.astro` | 薄いラッパー。Starlight 公式の `SidebarPersister` を再利用し、ページ移動時にサイドバーのスクロール位置を維持 |
| `SkipLink.astro` | キーボードフォーカス時にスキップリンクを表示し、本文タイトル `_top` にフォーカスを移す |
| `MobileMenuToggle.astro` | モバイルのサイドバー開閉と状態同期。Esc で閉じてボタンへフォーカスを戻す |

---

## データフロー: 3 つの設定ファイルが UI 全体を駆動

カスタムコンポーネント自体は業務データを持たず、UI の内容は 3 つの設定ファイルによって駆動されます:

```text
astro.config.mjs ──→ locales + sidebar 配列 ──→ Sidebar.astro が左側カタログをレンダリング（各言語は対応する訳語ラベルを使用）
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro がトップナビとハイライトをレンダリング（リンクは自動的に言語プレフィックス付き）
src/utils/i18n.ts ──→ UI_TRANSLATIONS 辞書 ──→ 各コンポーネントはビルド時に現在の言語で語句を取得
```

- **左側カタログ**は `astro.config.mjs` の `sidebar` 宣言のみを参照します。新規ドキュメントは必ずここに登録する必要があり、各エントリの `translations` フィールドで 10 言語分のメニュー文言を提供します。
- **トップナビ**の各項目の表示文言は `labelKey` で `i18n.ts` の辞書から翻訳を取得し、`match` 関数が現在ページでどのボタンをハイライトするかを決定します（判定の前に言語プレフィックスを除去します）。
- **UI 文言**（検索ボックスのプレースホルダー、「目次」の見出し、テーマ切替の案内など）は、各コンポーネントが `getTranslation(key, lang)` を呼び出してビルド時に対応する言語を直接出力します。ページ内に実行時の置換スクリプトはありません。

つまり、UI の内容を変えたい場合はまず対応する設定ファイルを探し、見た目（余白・色・アイコン）だけを変える場合にのみコンポーネントのソースコードを触ります。

---

## 各コンポーネントの実装のポイント

### PageTitle: ページタイトルと実際の更新日時

ページの大見出しは Frontmatter の `title` を直接読むため、**本文に `#` のレベル 1 見出しを書かないでください**。`astro.config.mjs` の `lastUpdated: true` が有効で、Frontmatter の日付で上書きしていない場合、ビルド時にそのファイルを最後に変更した Git コミットの時刻を読み込みます。リポジトリのすべてのコミットやビルドの時刻ではなく、他のファイルだけを変更しても本ページの日付は変わりません。

:::caution
未コミットの新規ドキュメントには読める Git 履歴がないため、日付は表示されません。既存ファイルの未コミットの変更も、コミット日時を変えません。シャロークローン（`fetch-depth: 1` など）では、履歴が切れた境界のコミット日時が表示されたり、日付を取得できなかったりするため、完全な履歴として扱えません。正確な日付が必要なら完全な Git 履歴を使用してください（CI では `fetch-depth: 0`）。日付の取得失敗でビルドが失敗することはありません。
:::

### Sidebar: スクロール位置記憶の仕組み

`Sidebar.astro` は Starlight の `SidebarPersister` を再利用し、ページ移動後のサイドバーのスクロール位置を復元します。モバイルメニューの開閉とフォーカスは `MobileMenuToggle.astro` が扱います。

### TableOfContents: 目次の生成

目次データは、Starlight がビルド時に本文の見出し（`##` と `###`）を解析して生成します。コンポーネントはページ自身のタイトルを除外してレンダリングするだけです。スクロール時のハイライトは `starlight-toc` カスタム要素がブラウザ側で処理し、フレームワークには依存しません。

### TwoColumnContent: 右カラム幅の唯一の定義元

右側目次カラムの幅は `@media (min-width: 72rem)` で `20rem` に固定され（超ワイド画面の `90rem` 以上では `21rem`）、本文エリアの最大幅はそこから右カラム幅が差し引かれます。右カラム幅を調整したい場合は、この 1 ファイルだけを変更すればよく、他のスタイルシートに点在する形で上書きしないでください。

### Header: ナビ、テーマ、言語

- ナビボタンは `navigationConfig` を走査してレンダリングされ、アクティブ状態のスタイルは `match` 関数の戻り値で決まります。リンクは `localizedHref()` により現在言語のプレフィックスが自動付加されます。
- テーマ切替は LocalStorage の `starlight-theme` キーに書き込まれ、ページ読み込み時は「ローカルでの選択 → システム設定」の順に初期テーマを決定します。
- 言語ドロップダウンの各項目は、現在ページの対応言語版への実リンクです。クリックするとそのまま遷移し、追加の状態保存はありません。
- トップバー右側の GitHub と Telegram の両アイコンは `src/components/starlight/Header.astro` に直接書き込まれています。アドレスを変えるにはこのファイルを編集してください。Telegram は `@epocanvas` アカウントページを指し、ツールチップの文言は語条 `social.telegram` です。`astro.config.mjs` の `social` が制御するのはサイドバー下部のアイコン群で、両者は互いに影響しません。

### Search: 2 モード検索

1 つのコンポーネント内に 2 つの検索を実装しています（詳しくは[全文検索とショートカットキーの使い方](/canvas/search-engine/)を参照）:

1. **ページ内検索**: トップバーの入力ボックス。Enter キーで現在ページ内の一致文字列間を移動し、ハイライトはスクリプトがマークを打つことで実現します。
2. **サイト全体検索**: `<dialog>` ポップアップ + Pagefind のデフォルト UI。index は `pnpm run build` の段階で生成されます。

ページ内入力欄は表示幅 `64rem` 以上のみです。それ未満ではサイト全体検索ボタンだけが残ります。現在の記事にはブラウザーのページ内検索を使えます。画像と異なる場合は現在の画面を優先してください。

### Pagination: ページ送りカード

前 / 次のページのデータは、Starlight がビルド時に `sidebar` の順序に基づいて計算済みで（`Astro.locals.starlightRoute.pagination`）、コンポーネントはレンダリングだけを担当します。同幅の 2 枚のカード、細枠で影なし、タイトルはテーマカラー、↙ / ↘ の斜め矢印はホバー時にページ送りの方向へ移動します。矢印はインライン SVG パスで、サイトを RTL 言語で使う場合は自動的に方向が反転します。

---

## カスタマイズ時の注意点

:::caution
コンポーネントをオーバーライドすると、Starlight ネイティブコンポーネントの今後の更新を取り込めなくなります。Starlight をバージョンアップする際は、コンポーネントの props や `Astro.locals.starlightRoute` の構造が変わる可能性があるため、アップグレード後はオーバーライドした コンポーネントすべてでリグレッションテストを行う必要があります。
:::

- **スタイル変更はまず CSS 変数で**: 色・フォント・レイアウトサイズは `src/styles/custom.css` の `:root` 変数に集約されています。[サイト全体の設定とスタイルのカスタマイズ](/canvas/configuration/)を参照してください。多くのカスタマイズはコンポーネントを触る必要がありません。
- **インタラクションを変えるときだけコンポーネントを触る**: ボタンの追加や構造の調整の際は、UI 文言を `getTranslation(key, lang)` で取得し、`i18n.ts` に 10 言語分の語句を追加します。漏れた言語は fallback で中国語が表示されます。
- **変更後は必ずローカルで検証**: `pnpm run dev` でインタラクションを確認し、`pnpm run verify` で型チェックとビルドの通過を確認します（ローカル用コマンドは[よくある質問とトラブルシューティング](/canvas/troubleshooting/)を参照）。

具体的なカスタマイズ手順は、[よくあるカスタマイズ早見表](/canvas/recipes/)を参照してください。
