---
title: サイト全体の設定とスタイルのカスタマイズ
description: EpoCanvas Docs の主要設定ファイルの変更ガイド、サイドバーメニューの調整、ブランドロゴの差し替えとテーマカラーのカスタマイズ。
---

**EpoCanvas Docs** を自チームのドキュメントサイトとして使いたい場合や、サイトタイトル・ロゴ・ディレクトリ構成・テーマカラーを調整したい場合は、この章でよく使うカスタマイズの入り口を紹介します。設定を変更して保存すると、ローカル開発サーバーが自動的にホットリロードし、ブラウザにすぐ反映されます。

---

## 1. サイトの基本情報 (`astro.config.mjs`)

ルートディレクトリにある `astro.config.mjs` は、ドキュメントサイト全体のメイン設定ファイルです。サイト情報に直接関係するオプションは以下のとおりです（コメントに変更のタイミングを記載しています）:

```javascript
export default defineConfig({
  // サイトの本番環境ドメイン。SEO のリンクと Sitemap 生成に影響します
  site: 'https://docs.epocanvas.com',

  integrations: [
    starlight({
      // サイトタイトル。ブラウザのタブとトップバーに表示されます
      title: 'EpoCanvas Docs',
      // サイトの説明。検索エンジンの結果スニペットに使われます
      description: 'EpoCanvas 全栈技术、架构与产品运维指南',

      // トップバー左側のロゴ画像パス
      logo: {
        src: './public/images/logo.svg',
        replacesTitle: false, // true にするとロゴのみ表示し、タイトル文字を非表示にします
      },

      // 右上の GitHub リポジトリへのリンク
      social: {
        github: 'https://github.com/shijianus/epocanvas-docs',
      },

      // カスタムスタイルシートのエントリ
      customCss: ['./src/styles/custom.css'],

      // サイドバーのディレクトリ（次のセクションを参照）
      sidebar: [/* ... */],
    }),
  ],

  // 旧パスのリダイレクト表。リンク切れを防ぎます
  redirects: { '/mail': '/canvas/' },
});
```

---

## 2. 左側のカタログメニューを変更するには？

左側のドキュメントカテゴリは、`astro.config.mjs` 内の Starlight 設定にある `sidebar` 配列で制御されます:

```javascript
sidebar: [
  // グループ 1: 製品概要
  {
    label: '产品概览与入门',       // グループ名
    items: [
      { label: '产品简介与核心价值', link: '/canvas/' },
      { label: '快速上手 (3分钟运行)', link: '/canvas/deployment/' },
    ],
  },
  // グループ 2: 自分の業務用グループを追加できます
  {
    label: '用户指南',
    items: [
      { label: '账号注册与登录', link: '/canvas/login/' },
    ],
  },
];
```

- **`label`**: サイドバーに表示されるカテゴリ名や記事名。Frontmatter の `title` と異なる名前（たとえばより短い表示名）にできます。
- **`link`**: 記事のアクセスパス。`src/content/docs/` 配下のファイル位置に対応します。

:::warning
新しく作成した `.md` ファイルは、`sidebar` 配列に登録しないと左側のカタログに表示されません。ファイルだけ作って登録しないのは、初心者が最もよく踏む落とし穴です。
:::

---

## 3. ブランドのテーマカラーをカスタマイズ (`src/styles/custom.css`)

サイトのすべての色は CSS 変数で制御されており、`src/styles/custom.css` で定義されています。ファイルの先頭が light mode の変数、`:root[data-theme='dark']` ブロックが dark mode の変数です:

```css
:root {
  /* ブランドのメインカラー（light mode） */
  --sl-color-accent: #2563eb;
  --sl-color-accent-low: rgba(37, 99, 235, 0.08);  /* 選択項目の薄い背景色 */
  --sl-color-accent-high: #1d4ed8;                  /* リンクとハイライト文字 */

  /* ページの背景色と区切り線 */
  --sl-color-bg: #ffffff;
  --sl-color-hairline: #e2e8f0;
}

:root[data-theme='dark'] {
  /* dark mode は同名の変数を使い、色値だけを差し替えます */
  --sl-color-accent: #3b82f6;
  --sl-color-accent-low: rgba(59, 130, 246, 0.12);
  --sl-color-accent-high: #60a5fa;

  --sl-color-bg: #0b0f19;
  --sl-color-hairline: #1e293b;
}
```

たとえばサイト全体のメインカラーを元気な緑に変えたい場合は、light と dark の両ブロックにある `--sl-color-accent` を `#10b981` 系の色値に変更するだけで、ボタン・選択状態・リンクが自動的に連動して変わります。

レイアウトのサイズもこのファイルの先頭にまとめて定義されています:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 左側カタログの幅 */
  --sl-content-width: 60rem;    /* 本文の最大幅 */
  --sl-nav-height: 3.5rem;      /* トップバーの高さ */
}
```

---

## 4. サイトのロゴを差し替える

1. ブランドのロゴベクター画像を用意します（`.svg` 推奨、鮮明な `.png` でも可）。
2. `public/images/logo.svg` として上書き保存します（トップページの大きな画像は `src/assets/logo.svg`）。
3. ブラウザを更新すると、トップバーとトップページのアイコンが自動的に差し替わります。

:::tip
2 つのロゴは用途が異なります: `public/images/logo.svg` はトップバー用、`src/assets/logo.svg` はトップページ右側の装飾用の大きな画像です。両方を同時に差し替えることをおすすめします。
:::
