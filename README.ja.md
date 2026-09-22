# EpoCanvas Docs

[![Release](https://img.shields.io/github/v/release/shijianus/epocanvas-docs?color=3b82f6&style=flat-square)](https://github.com/shijianus/epocanvas-docs/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/shijianus/epocanvas-docs/build.yml?branch=main&style=flat-square)](https://github.com/shijianus/epocanvas-docs/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](./LICENSE)
[![EpoCanvas Docs](https://img.shields.io/badge/EpoCanvas-Docs-2563EB?style=flat-square)](https://docs.epocanvas.com)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [Français](./README.fr.md) | [Español](./README.es.md) | [Deutsch](./README.de.md) | [Português](./README.pt.md) | [Русский](./README.ru.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

EpoCanvas Docs は、EpoCanvas プロジェクトの公式ドキュメントサイトです。Astro 5 と Starlight を基盤とし、3 カラムの閲覧レイアウト、2 モードの検索、コンテンツ全体の多言語対応を最初から備えています。すべてのコンテンツは標準的な Markdown で書かれ、Cloudflare Pages に公開されます。

**公開サイト**: [https://docs.epocanvas.com](https://docs.epocanvas.com)（ミラー: [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)）

## プレビュー

![EpoCanvas Docs のドキュメントホームページ](./public/images/canvas/ui-home-landing.png)

サイトは 3 カラム構成です。左側にカテゴリーナビゲーション、中央に本文、右側に現在のページの目次を表示します。ダークテーマが既定で、システム設定に追従し、トップバーから手動で切り替えられます。

## 特徴

- **3 カラムの閲覧レイアウト** — 本文の行長は長文読書に適した幅に制限。ページを移動してもサイドバーのスクロール位置は保持され、右側の目次はスクロールに合わせて現在のセクションをハイライトします。
- **2 モードの検索** — トップバーの検索ボックスは現在のページ内を検索し、`Ctrl+K` / `Cmd+K` で Pagefind ベースのサイト全体検索ダイアログを開きます。インデックスはビルド時に生成され、検索はすべてブラウザー内で完結するため、外部ネットワークへの接続がないイントラネット環境でも動作します。
- **コンテンツ全体の多言語対応** — UI と各記事の本文は 10 言語で提供されます: 簡体字中国語（既定）、繁体字中国語、英語、日本語、韓国語、スペイン語、フランス語、ドイツ語、ロシア語、ポルトガル語。言語ごとに独立した URL プレフィックス（例: `/ja/`）を持ち、訳が未整備のページは 404 ではなく中国語版へ自動フォールバックします。
- **Markdown 拡張** — 4 種類のコールアウト（`:::note`、`:::tip`、`:::caution`、`:::danger`）のほか、Shiki によるコードハイライト（ファイル名ラベル・行ハイライト・diff 表示付き）。
- **ワンコマンドでのデプロイ** — サイトは静的ファイルにビルドされ、コマンド 1 つで Cloudflare Pages に公開できます。カスタムドメインと HTTPS 証明書は自動で設定されます。

## 必要環境

- Node.js 20.3+ または 22+（最低 18.20.8）
- pnpm 10

## クイックスタート

```bash
git clone https://github.com/shijianus/epocanvas-docs.git
cd epocanvas-docs
pnpm install
pnpm run dev
```

ブラウザーで `http://localhost:4321` を開きます。開発サーバーが動作している間、Markdown の変更はすぐにページへ反映されます。

### コマンド

| コマンド | 説明 |
| :--- | :--- |
| `pnpm run dev` | ホットリロード付きのローカル開発サーバーを起動 |
| `pnpm run build` | 静的サイトを `dist/` にビルドし、検索インデックスを生成 |
| `pnpm run preview` | ビルド結果をローカルでプレビュー |
| `pnpm run deploy` | ビルドして Cloudflare Pages へ公開 |

## プロジェクト構成

```text
epocanvas-docs/
├── public/images/canvas/       # ドキュメントで使うスクリーンショットと図
├── src/
│   ├── components/starlight/   # オーバーライドした Starlight コンポーネント（Header、Sidebar など）
│   ├── config/navigation.ts    # トップナビゲーションバーの設定
│   ├── content/docs/           # 言語別のドキュメント本文（canvas/ = 中国語、en/ ja/ … = 翻訳）
│   ├── styles/custom.css       # テーマカラーとレイアウトのスタイル
│   └── utils/i18n.ts           # UI 文言と言語レジストリ
├── astro.config.mjs            # サイト設定: タイトル、サイドバー、リダイレクト
├── AGENTS.md                   # 技術文書の執筆ガイドライン
├── LICENSE
└── package.json
```

## ドキュメントの執筆

1. `src/content/docs/canvas/` の下に新しい `.md` ファイルを作成します。
2. ファイル先頭に frontmatter を追加します:

   ```yaml
   ---
   title: ドキュメントのタイトル
   description: ページの 1 文説明
   ---
   ```

3. `astro.config.mjs` の `sidebar` 配列にページを登録します。未登録のページはナビゲーションに表示されません。
4. 画像は `public/images/canvas/` に置き、絶対パスで参照します:

   ```markdown
   ![代替テキスト](/images/canvas/your-image.png)
   ```

コミット前に `pnpm run build` を実行し、サイトがエラーなくビルドできることを確認してください。

## デプロイ

サイトは Cloudflare Pages でホストしています:

- **ローカルからの公開** — 最初に `wrangler login` で認証すると、以降は `pnpm run deploy` でビルドと公開が完了します。
- **カスタムドメイン** — Cloudflare のコンソールで Pages プロジェクト `epocanvas-docs` を開き、*Custom domains* にドメインを追加します。CNAME レコードと SSL 証明書は自動で設定されます。

## コントリビュート

Issue と Pull Request を歓迎します。PR を送る前にローカルで `pnpm run build` を実行し、ビルドが通ることを確認してください。

## ライセンス

[MIT](./LICENSE)
