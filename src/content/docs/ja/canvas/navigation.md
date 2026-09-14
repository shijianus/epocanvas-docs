---
title: トップナビゲーションとページルーティング
description: EpoCanvas Docs のトップナビゲーションバーの設定、動的なパスハイライトのルール、外部バージョンバッジと過去リンクのリダイレクト設定。
---

トップナビゲーションバーは、ユーザーが各機能セクションの間を行き来するための主な通路です。**EpoCanvas Docs** ではすべてのナビゲーション項目を 1 つの設定ファイルに集めており、1 か所の変更だけでサイト全体に反映されます。さらに、現在のページを正確にハイライトする仕組みと、過去のリンクのリダイレクト機構も組み込まれています。

---

## ナビゲーション設定の一元管理 (`src/config/navigation.ts`)

トップバーのナビゲーションボタンはすべて、`src/config/navigation.ts` 内で宣言的な配列として管理されています。各エントリーのフィールド定義は次のとおりです。

```typescript
// ナビゲーションエントリーのプロパティ定義
export interface NavItem {
  id: string; // 一意の識別子
  labelKey: string; // 多言語翻訳辞書内のキー名
  defaultLabel: string; // デフォルトで表示するテキスト（例：「ホーム」「製品概要」）
  href: string; // ジャンプ先のリンクまたは相対パス
  match?: (pathname: string) => boolean; // 現在のページでこのボタンをハイライトすべきかを判定するルール
  badge?: string; // 追加で表示する小さなカプセル型バッジ（例：バージョン番号 "v1.2.0"）
  isExternal?: boolean; // 外部 Web ページへの遷移かどうか（true の場合は新しいウィンドウで開く）
}
```

### 現在の公式設定（抜粋）

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
  // この先には guide（執筆ガイドライン）、deploy（デプロイ）、faq（よくある質問）などもある
  // また、GitHub Releases を指す release の外部エントリーもある
];
```

ナビゲーション項目の追加・削除は、この配列にエントリーを追加・削除するだけで行えます。保存するとローカル開発サーバーが自動的にホットリロードします。

---

## 動的なアクティブ化とハイライトのルール

単純に `pathname.startsWith('/canvas')` だけを判定していると、「クイックスタート」ページの `/canvas/deployment/` にアクセスしたときに「製品概要」と「クイックスタート」の 2 つのボタンが同時に点灯してしまい、混乱を招きます。

そこで各ナビゲーション項目は、`match` 関数で自分のハイライト範囲を宣言しています。

- ホーム `/` にアクセスしたときは「ホーム」ボタンだけがアクティブになります。
- `/canvas/layout/`、`/canvas/about/` などの通常のドキュメントにアクセスしたときは「製品概要」ボタンがアクティブになります。
- `deployment` パスのページに入ったときは「クイックスタート」ボタンだけが排他的にアクティブになります。
- アクティブなボタンにはテーマカラーのカプセル状の背景が付き、非アクティブなボタンと明確に区別できます。

新しいドキュメントページを追加するときは、パスのキーワードを対応するナビゲーション項目の `match` ルールに加えるのを忘れないでください。忘れるとトップバーが正しくハイライトされません。

---

## 外部リンクとバージョンバッジの挙動

あるナビゲーション項目が外部サイト（たとえば GitHub リポジトリの Releases ページ）を指している場合は、次のようになります。

1. `isExternal: true` を設定します。
2. システムがそのリンクに `target="_blank" rel="noopener noreferrer"` のセキュリティ属性を自動的に付け、新しいタブで開きます。
3. テキストの横に斜め向きの小さな矢印アイコン（`↗`）が表示され、クリックすると現在のサイトを離れることが読者に伝わります。

バージョンバッジ（`badge: 'v1.2.0'`）はカプセルの形でボタン内に表示されます。新しいバージョンをリリースしたら忘れずに更新してください。詳細は [バージョン管理と自動化ワークフロー](/canvas/releases/) を参照してください。

---

## ページのリダイレクト規則 (`astro.config.mjs`)

プロジェクトの反復の中では、ドキュメントのパスを調整することは避けられません。読者のブックマークにある古いリンクが 404 にならないように、`astro.config.mjs` の `redirects` テーブルに新旧パスの対応を登録できます。

```javascript
export default defineConfig({
  redirects: {
    // サイト内の章パスを意味の分かる名前に変更した後も、旧リンクはすべてリダイレクトを維持する
    '/canvas/rule-engine': '/canvas/cloudflare',
    '/canvas/dns-setup': '/canvas/layout',
  },
});
```

Astro はビルド時にこれらのパスの自動転送ページを生成します。読者が古いアドレスにアクセスすると新しいアドレスへスムーズに案内され、検索エンジンの評価も引き継がれます。
