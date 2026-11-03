---
title: よくあるカスタマイズ早見表
description: EpoCanvas Docs の頻出カスタマイズ操作早見表。新規ドキュメント、ナビボタン、UI 言語、テーマカラー、ロゴ、レイアウトサイズ、検索文言を変更する完全な手順。
---

このページでは、最もよくあるカスタマイズ要件を「手順どおりに進めるだけでできる」早見マニュアルにまとめています。各レシピの変更箇所は具体的なファイルまで明記してあります。作業を始める前に[レンダリングのルール](/canvas/rendering/)と[コンポーネント体系](/canvas/components/)を一読しておくと、回り道をせずに済みます。

---

## レシピ 1: 新しいドキュメントを 1 つ追加する

1. `src/content/docs/canvas/` の下に新しい `.md` ファイルを作成します（小文字の英語とハイフンで命名します。例: `user-guide.md`）。
2. ファイルの先頭に Frontmatter を書きます:

   ```yaml
   ---
   title: ユーザーガイド
   description: このページの内容を一言で説明します。検索結果やシェアカードに表示されます。
   ---
   ```

3. `astro.config.mjs` を開き、`sidebar` 配列の対象グループに登録します:

   ```javascript
   { label: 'ユーザーガイド', link: '/canvas/user-guide/' }
   ```

4. 残り 9 言語の `src/content/docs/<locale>/canvas/user-guide.md` に対応する翻訳を用意し、サイドバーの `translations` と翻訳が必要な画像も揃えます。翻訳が欠けると公開前チェックに失敗します。
5. ローカルでナビゲーションと本文を確認して `pnpm run verify` を実行し、`pnpm run preview` でビルド成果物を確認します。
6. レビューとマージ後、管理者がクリーンな `main` から公開します。`origin/main` を追跡し、HEAD がリモートのコミットと一致している必要があります。`pnpm exec wrangler login` で認証してから `pnpm run deploy` を実行します。自分の fork では、まず[デプロイガイド](/canvas/cloudflare/)に従って対象プロジェクトを設定し、管理者用の公開設定をそのまま使わないでください。

:::caution
ファイルだけ作成して `sidebar` に登録しないと、ページにはアクセスできるものの左側カタログには表示されません。これは初心者が最もよく踏む落とし穴です。
:::

---

## レシピ 2: トップナビのボタンを 1 つ追加する

1. `src/config/navigation.ts` を開き、`navigationConfig` 配列にエントリを追加します:

   ```typescript
   {
     id: 'blog',
     labelKey: 'nav.blog',
     defaultLabel: 'ブログ',
     href: 'https://blog.epocanvas.com',
     isExternal: true,          // 外部リンクは新しいウィンドウで開きます
   },
   ```

2. `src/utils/i18n.ts` を開き、`nav.blog` に 10 言語分の翻訳語句を追加します。
3. 保存すると、トップバーにすぐ新しいボタンが表示されます。サイト内リンクがナビのハイライト対象になるようにするには、`match` 関数を設定します。

---

## レシピ 3: ページのハイライトルールを調整する

ページのパスが変わってトップバーのハイライトが正しく動かなくなった場合は、`navigation.ts` の該当エントリの `match` 関数を修正します:

```typescript
// 新しいページの slug を許可リストに追加。isCanvasPage は言語プレフィックスを先に除去します
match: isCanvasPage(['layout', 'navigation']),
```

`isCanvasPage` は slug の完全一致で判定します。`includes` の部分一致に戻さないでください。複数ボタンの `match` は重複させないでください。重複すると 2 つのボタンが同時に点灯します。

---

## レシピ 4: ブランドのテーマカラーを変える

1. `src/styles/custom.css` を開きます。
2. light（`:root`）と dark（`:root[data-theme='dark']`）の両ブロックで、メインカラーの 3 点セットを同時に修正します:

   ```css
   --sl-color-accent: #10b981;      /* メインカラー: ボタン、選択状態 */
   --sl-color-accent-low: rgba(16, 185, 129, 0.1);  /* 選択項目の薄い背景 */
   --sl-color-accent-high: #047857; /* リンクとハイライト文字 */
   ```

3. 保存すると、サイト全体のボタン・ハイライト・リンクが自動的に色を変えます。1 か所だけ変更すると、もう一方のテーマで配色が不揃いになります。

---

## レシピ 5: ロゴを差し替える

| 位置 | ファイル | 用途 |
| :--- | :--- | :--- |
| トップバー左側 | `public/images/logo.svg` | 下位ページのトップバーアイコン。パスは `astro.config.mjs` の `logo.src` で設定 |
| トップページの大画像 | `src/assets/logo.svg` | ランディングページ右側の装飾画像 |

両方を同時に差し替えることをおすすめします。ロゴは SVG ベクター形式を使います。`astro.config.mjs` の `logo.replacesTitle` を `true` にすると、タイトル文字を隠してアイコンだけを表示できます。

---

## レシピ 6: レイアウトサイズを調整する

レイアウトの 3 要素は `src/styles/custom.css` の先頭にまとめられています:

```css
:root {
  --sl-sidebar-width: 16.5rem;  /* 左側カタログの幅 */
  --sl-content-width: 60rem;    /* 本文の最大幅 */
  --sl-nav-height: 3.5rem;      /* トップバーの高さ */
}
```

:::caution
右側目次カラムの幅はこれらの変数には含まれず、`src/components/starlight/TwoColumnContent.astro` 内の `20rem` で制御されています（超ワイド画面では `21rem`）。右カラムの幅を調整するときは、同じファイル内にある本文エリアの `max-width: calc(100% - 20rem)` も同時に変更してください。
:::

---

## レシピ 7: 検索ボックスの案内文言を変更する

検索ボックスのプレースホルダーやボタンの案内などの UI 文言は、`src/utils/i18n.ts` の多言語辞書にあります。ファイルを開き、「言語 → 語句キー」の 2 階層構造に従って `search.placeholder` などの語句を修正します:

```typescript
// ファイルパス: src/utils/i18n.ts
export const UI_TRANSLATIONS = {
  'zh-CN': {
    'search.placeholder': '搜索文档与指令...',
    // ...この言語の他の語句
  },
  en: {
    'search.placeholder': 'Search documentation...',
    // ...この言語の他の語句
  },
  // 残り 8 言語も同様
};
```

`getTranslation` は現在の言語にある空でない値を優先します。キーがない場合や値が空の場合にだけ中国語へフォールバックし、中国語もなければキー名を表示します。更新しなかった既存の翻訳は古い値のままなので、変更は全 10 言語に反映してください。保存後はローカルのホットリロードで確認でき、ビルドは不要です。

---

## レシピ 8: サイトに検証用の `<head>` タグを追加する

Google Search Console や百度（Baidu）のウェブマスターツールなどのサービスを導入する際は、`<head>` に検証タグを注入する必要があります。`astro.config.mjs` を開き、Starlight 設定の `head` 配列に追加します:

```javascript
head: [
  // 既存の favicon 設定 ...
  {
    tag: 'meta',
    attrs: {
      name: 'google-site-verification',
      content: '検証用文字列',
    },
  },
],
```

保存して再デプロイしたら、各プラットフォームの検証ボタンで確認します。公開後の検索エンジン設定の詳細は [SEO とパフォーマンス最適化](/canvas/seo/) を参照してください。

---

## 変更後の共通チェック手順

どの種類のカスタマイズでも、コミット前にこの順序で検証します:

```bash
pnpm run dev      # 1. ブラウザでページごとに表示を確認
pnpm run verify   # 2. テスト、設定チェック、Astro 型チェック、ビルド、コンテンツと成果物の検査を実行
pnpm run preview  # 3. ビルド成果物をプレビューし、異常がないことを確認してから公開
```

公開方法は [Cloudflare Pages へのデプロイ](/canvas/cloudflare/) を参照してください。
