---
title: Cloudflare Pages へのデプロイ
description: Cloudflare Pages のデプロイ手順。Wrangler、任意の Git 連携、独自ドメインと公開後の確認。
---

このページはリポジトリのスクリプトに基づき、静的ドキュメントを **Cloudflare Pages** に公開する手順を説明します。画面は既存の参考画像で、今回の候補版のデプロイやテスト記録ではありません。相違があれば現在の管理画面を優先してください。検証や公開の成功は、実際のログとデプロイ状態で確認する必要があります。

---

## 準備作業

### 必要なもの

| 項目 | 説明 |
| :--- | :--- |
| **Cloudflare アカウント** | [dash.cloudflare.com](https://dash.cloudflare.com/) で無料登録できます。Pages サービスに有料プランは不要です |
| **ローカルでビルドが通ること** | まず `pnpm run verify` を実行して `dist/` ディレクトリが正常に生成されることを確認します。[クイックスタート](/canvas/deployment/) を参照 |
| **Node.js + pnpm** | デプロイコマンドはローカル開発環境に依存します。バージョン要件はクイックスタートの章と同じです |

### 2 つのデプロイ方法の選び方

![Wrangler のローカルアップロードと Git 連携ビルドの経路](/images/canvas/docs-deploy-compare.svg)

*図：左はローカルビルドと Wrangler アップロード、右は Git 連携によるクラウドビルドです。今回の修訂で実測したことを示す図ではありません。*

| 比較項目 | 方法 1: コマンドライン直接アップロード | 方法 2: Git 自動ビルド |
| :--- | :--- | :--- |
| 操作方法 | ローカルで `pnpm run deploy` を実行 | GitHub にコードをプッシュすると自動でトリガー |
| 取りかかりの難易度 | 低い。コマンド 2 つ | 中。コンソールでの設定が 1 回必要 |
| 向いている場面 | 初回公開、一人での保守、素早い更新 | 複数人での協業、「コミットしたら即公開」したい場合 |
| 公開前検証 | 完全な verify に成功してからアップロード | クラウドのビルドコマンドに完全な verify を設定 |

:::tip
作成時に Direct Upload か Git 連携を選びます。既存の直送プロジェクトをそのまま Git 連携に変更できるとは限りません。経路を変える場合は対応するプロジェクトを作成します。緊急時も公開前検証は省略しません。
:::

:::tip[コマンドをまったく打ちたくない場合]
[クイックスタート](/canvas/deployment/) のページでは、Cloudflare・Vercel・Netlify の 3 社のワンクリックデプロイボタンを紹介しています。クリックしてアカウントを認可し、設定を確認するだけで、ドキュメントサイトが自分のクラウドアカウントに公開されます。詳しくは[ワンクリックデプロイ](/canvas/deployment/#ワンクリックデプロイボタン1つで公開)を参照してください。なお Cloudflare のボタンは Workers の静的ホスティングを使うもので、このページで紹介する Pages 方式とは別の独立した経路です。静的ドキュメントサイトであれば閲覧体験は同じなので、どちらか一方を選んで進めてください。
:::

---

## 方法 1: ローカルコマンドラインからの直接アップロード（初回におすすめ）

ローカルでビルドし、Wrangler でアップロードする方式です。`pnpm run deploy` は保守担当の `epocanvas-docs` 用で、すべての fork がそのまま使える汎用コマンドではありません。

### ステップ 1: Cloudflare アカウントにログインする

プロジェクトには Wrangler（Cloudflare 公式の CLI ツール）がプリセットされています。初回利用時はブラウザで認可してログインします:

```bash
pnpm exec wrangler login
```

実行するとターミナルに `Opening a link in your default browser...` と表示され、ブラウザで Cloudflare の認可ページが開きます。**Allow** をクリックすると、ターミナルにログイン成功が表示されます。次のコマンドでログイン状態を確認できます:

```bash
pnpm exec wrangler whoami
```

:::caution
有効な Cloudflare ログインまたはトークン権限が必要です。認証失敗時は `wrangler whoami`、アカウントとプロジェクト権限を確認します。エラー文言はバージョンによって異なります。
:::

### ステップ 2: ワンクリックでビルドとアップロード

プロジェクトの `scripts/verify-release.mjs` にはワンクリック公開コマンドがプリセットされています:

`pnpm exec wrangler login` で認証します。`scripts/verify-release.mjs` は `main`、未追跡ファイルを含め変更のない作業ツリー、`origin/main` の上流設定、リモート実コミットと一致する HEAD を要求します。`pnpm run deploy` は完全な `pnpm run verify` 後に Git を再検査してから Wrangler を実行します。プロジェクト名はスクリプト内にあり、再利用前に自分の公開先を設定してください。

```bash
pnpm run deploy
```

`pnpm run deploy` は設定・Astro 型検査、ビルド、テスト、内容と成果物の検査に成功してからアップロードします。前提条件だけの確認には以下を使えます。リモート Git 参照は読みますが、完全検証・ビルド・アップロードは実行しません。dry-run 成功はテスト成功ではありません。

```bash
pnpm run deploy --dry-run
```

アップロード成功後に Wrangler が URL を出力します。スクリプトは `--project-name epocanvas-docs --branch main` を指定するため、アカウント内のプロジェクトと本番ブランチ設定を確認してください。

### ステップ 3: コンソールでプロジェクトを見つける

[dash.cloudflare.com](https://dash.cloudflare.com/) を開き、左メニューの **Compute (Workers & Pages)** をクリックするとプロジェクト一覧が表示されます。次の図には 3 つの重要な位置を注記しています:

![Cloudflare コンソールの Workers & Pages プロジェクト一覧。左メニューの入口、Create application ボタン、epocanvas-docs プロジェクトに注記](/images/canvas/deploy/cf-01-projects-list.png)

*図: Workers & Pages のプロジェクト一覧。① 左メニューから Workers & Pages へ移動する。② Create application ボタンで新規プロジェクトを作成する。③ 自分たちの `epocanvas-docs` プロジェクト。アクセス用ドメイン `epocanvas-docs.pages.dev` と最新のデプロイ時刻が表示される。*

プロジェクト名をクリックして詳細ページに入ると、**Deployments** タブにデプロイ履歴の全体が表示されます:

![epocanvas-docs プロジェクトのデプロイ履歴ページ。本番ドメイン、デプロイ記録、ステータスに注記](/images/canvas/deploy/cf-02-deployments.png)

*図: デプロイ履歴ページ。① プロジェクト名。② Deployments タブ。③ 本番ドメインには `docs.epocanvas.com`（カスタムドメイン）と `epocanvas-docs.pages.dev`（デフォルトドメイン）の両方がバインドされている。④ 各デプロイ記録にはブランチとコミット情報が付いている。⑤ ステータスとデプロイ時刻。*

:::note
アップロードが成功した場合のみ記録が作られます。Deployments で状態、ブランチ、コミット、本番ドメインを確認します。コマンド拒否や検証失敗は公開済みを意味しません。
:::

---

## 直接アップロードプロジェクトのビルド設定

**Settings** タブを開くと、直接アップロードプロジェクトと Git プロジェクトの違いがわかります:

![epocanvas-docs プロジェクトの Settings ビルド設定ページ。Git repository の項目に未接続と表示](/images/canvas/deploy/cf-03-settings.png)

*図: Settings タブ。① Settings の入口。② Git repository の項目に Connect（未接続）と表示されている。直接アップロードプロジェクトには Git ビルド設定が不要で、ビルドは完全にローカルで完結する。*

:::tip
クラウドのビルド待ちを避けられますが、実行機には所定の Node、pnpm、Git と認証情報が必要です。特定の PC だけに限定されません。
:::

---

## 方法 2: Git リポジトリを接続して自動ビルド（任意）

push によるビルドが必要なら Git 連携 Pages プロジェクトを作り、リポジトリを接続します。以下は設定手順であり、有効化済みや今回検証済みという記録ではありません。

### ステップ 1: 作成フローに入る

Workers & Pages のプロジェクト一覧ページで右上の **Create application** ボタンをクリックし（[方法 1 のステップ 3](#ステップ-3-コンソールでプロジェクトを見つける) の図の注記 ② を参照）、**Pages** タブを選択します。

### ステップ 2: Git リポジトリを接続する

1. 作成画面で **Connect to Git** を選択します。
2. Cloudflare に GitHub アカウントへのアクセスを認可します。
3. リポジトリ一覧からドキュメントのリポジトリ `epocanvas-docs` を選択します。
4. **セットアップを開始** をクリックします。

### ステップ 3: ビルド設定を入力する

「ビルドとデプロイの設定」で次の内容を入力します:

| 設定項目 | 入力値 |
| :--- | :--- |
| フレームワーク プリセット | `Astro` |
| ビルドコマンド | `pnpm install --frozen-lockfile && pnpm run verify` |
| ビルド出力 | `dist` |
| Node.js | `22.23.4`（`.node-version` と一致） |
| pnpm | `10.34.5`（`packageManager` と一致） |

### ステップ 4: 自動ビルドを確認する

クラウド環境の Node と pnpm を確認して **保存してデプロイ** を押し、Deployments のログを調べます。インストール、完全検証、アップロードの全成功が必要です。その後の push は本番ブランチと自動デプロイ設定に従います。GitHub CI の成功だけで Pages は公開されません。

:::caution
Git 連携プロジェクトの Settings ページには、ビルド設定のブロック（フレームワーク プリセット、ビルドコマンドなど）が追加で表示されます。これは[直接アップロードプロジェクト](#直接アップロードプロジェクトのビルド設定)の画面とは異なります。Settings にビルド設定が見つからない場合、そのプロジェクトは直接アップロード方式であり、正常な動作です。
:::

---

## カスタムドメインをバインドする

Cloudflare は `<project-name>.pages.dev` を提供し、独自ドメインも設定できます。以下は例であり、DNS と証明書の反映時間は実際の状態によります。

### ステップ 1: カスタムドメイン設定を開く

プロジェクト詳細ページで **Custom domains** タブを開き、**Set up a custom domain** をクリックします:

![epocanvas-docs プロジェクトのカスタムドメインページ。docs.epocanvas.com がバインド済みで SSL が有効](/images/canvas/deploy/cf-04-domains.png)

*図: Custom domains タブ。① タブの入口。② Set up a custom domain ボタン。③ バインド済みの `docs.epocanvas.com`。ステータスは Active で SSL enabled。*

### ステップ 2: ドメインを追加して反映を待つ

1. **Set up a custom domain** をクリックし、あなたのサブドメイン（例: `docs.epocanvas.com`）を入力します。
2. ドメインの DNS がすでに Cloudflare で管理されている場合は、CNAME レコードが自動で追加されます。他社で管理しているドメインの場合は、`<プロジェクト名>.pages.dev` を指す CNAME レコードを手動で 1 件追加する必要があります。
3. DNS 検証と証明書の発行を待ち、**Active** になってから新ドメインを確認します。一定の分数で完了する保証はありません。

HTTPS 証明書は Cloudflare が自動で発行・更新するため、手動での申請や設定は不要です。

---

## デプロイ結果を検証する

### コマンドラインで HTTP ステータスを確認

```bash
curl -sI https://epocanvas-docs.pages.dev
```

レスポンスの例（日付とステータスは実際のリクエストによって異なります）:

```text
HTTP/2 200
date: Fri, 11 Sep 2026 15:32:39 GMT
content-type: text/html; charset=utf-8
```

`200` はその URL の応答成功だけを示し、翻訳、画像、検索、最新内容の正しさは保証しません。既定と独自の両ドメインで以下も確認してください。

### ブラウザで項目ごとに確認

| 確認項目 | 期待される結果 |
| :--- | :--- |
| トップページと任意のドキュメントページが開ける | ページが完全にレンダリングされ、白い画面にならない |
| 変更した内容が反映されている | 編集したばかりの章の内容が公開サイトで見える |
| `Ctrl+K` のサイト全体検索 | 最新の記事がヒットする（インデックスはビルド時に生成される） |
| light/dark モードの切替 | 切替が正常に動作し、リロード後も保持される |

---

## よくあるデプロイの問題

### デプロイ後に公開内容が更新されない？

ブラウザの強制リロード（`Ctrl+F5` / `Cmd+Shift+R`）でキャッシュを排除します。それでも更新されない場合は、コンソールの Deployments ページで最新の記録の時刻を確認し、`curl -sI` でデプロイのプレビュードメインと比較します。

### カスタムドメインで SSL ハンドシェイク失敗 (Error 525) と表示される？

Custom domains でドメイン検証と証明書の状態を確認し、DNS、プロキシ設定、エラー詳細を調べます。数分待つだけで解決すると考えず、`pages.dev` と比較してください。

### `pnpm run deploy` が `Project not found` エラーになる？

まず `pnpm exec wrangler whoami` を実行してログイン済みか確認します。次に、`scripts/verify-release.mjs` の `--project-name` と、コンソール上のプロジェクト名が一致しているか確認します。

その他のチェック項目は[よくある質問とトラブルシューティング](/canvas/troubleshooting/)を参照してください。
