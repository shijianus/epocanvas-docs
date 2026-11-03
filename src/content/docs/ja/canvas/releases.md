---
title: バージョン管理と自動化ワークフロー
description: EpoCanvas Docs のバージョン番号の命名規則、バージョン更新の標準的なリリース手順、GitHub Actions による自動リリースパイプライン。
---

読者が「このドキュメントは製品のどのバージョンに対応しているのか」をはっきり分かるようにし、チームが変更履歴を整理して追跡できるようにするため、**EpoCanvas Docs** ではセマンティックバージョニングと決まったリリース手順を採用しています。

![リリースフロー図：コンテンツの編集、ローカルでの pnpm run verify、レビューと main へのマージ、v* タグの作成という 5 つのチェックポイント。タグ付けは GitHub Release を作成するだけで、サイトのデプロイは main で別途 pnpm run deploy を実行します](/images/canvas/docs-release-flow.svg)

---

## 1. セマンティックバージョニングの規則 (SemVer)

安定版は `vMAJOR.MINOR.PATCH`、プレリリースは識別子付きです。現在の候補は `v1.3.2-beta.1` で、Release の公開や本番デプロイ済みを意味しません。

| 変更の種類 | 例 | 発生する場面 |
| :--- | :--- | :--- |
| **メジャー番号 (Major)** | `v2.0.0` | ドキュメントシステムの大規模な作り直し（Astro のメジャーバージョンのアップグレード、レイアウトの全面刷新など）。 |
| **マイナー番号 (Minor)** | `v1.2.0` | ドキュメントの章の追加、多言語の追加、デザインシステムの更新など、比較的大きな機能。 |
| **パッチ番号 (Patch)** | `v1.2.1` | 誤字の修正、コード例の更新、細かいスタイル調整などの小さな変更。 |

---

## 2. 新バージョンをリリースする標準的な 3 ステップ

### ステップ 1：更新内容を記録する (`RELEASE_NOTES.md`)

プロジェクトルートの `RELEASE_NOTES.md` に更新内容を書きます。このファイルは GitHub Release の説明文になります。先頭行は `# EpoCanvas Docs v<バージョン>` と完全に一致させ、バージョンは `package.json` と揃えてください。`verify:config` がこの形式を検査します。以下は形式の例です。実際のリリースでは未使用のバージョンに置き換え、プレリリースの本文には `candidate` または `prerelease` と明記してください。

```markdown
# EpoCanvas Docs v1.2.1

2026-09-14

### 修正
- デプロイの章にあるコマンドの誤字を修正。
- 画面のスクリーンショットを最新版に更新。
```

### ステップ 2：package.json のバージョン番号を更新する

ナビゲーションバーのバージョンバッジは `package.json` の `version` フィールドと自動的に連動しており、サイト全体のバージョンの単一のデータソース（Single Source of Truth）になっています。`package.json` のバージョン番号を更新するか（または `pnpm version patch --no-git-tag-version` を実行するか）すると、トップバーのバッジが自動的に最新のバージョン番号へ同期され、複数か所を手で直す必要はありません。

```json
{
  "name": "epocanvas-docs",
  "version": "1.2.1"
}
```

### ステップ 3：コードをコミットし、Git タグを打つ

```bash
# 1. すべての変更をコミットする
git add .
git commit -m "chore(release): bump version to v1.2.1"
git push origin main

# 2. 対応するバージョンタグを打ってプッシュする
git tag v1.2.1
git push origin v1.2.1
```

---

## 3. GitHub Actions の自動リリースパイプライン

正確な定義は [`.github/workflows/release.yml`](https://github.com/shijianus/epocanvas-docs/blob/main/.github/workflows/release.yml) を参照してください。完全な YAML はここには複製しません。`v*` タグのプッシュで起動します。タグを付ける前に、次のローカル検査を実行できます。このコマンドは GitHub Release への書き込みやサイトのデプロイを行いません。

```bash
pnpm run verify
```

1. `validate` job は読み取り専用の `contents: read` 権限で、まず `pnpm run verify` による完全な検証を実行します。
2. 検証が通過した後、`publish` job だけが `contents: write` 権限を使い、`RELEASE_NOTES.md` を説明として GitHub Release を作成または更新します。
3. 既存の Release は削除・再作成せず、非破壊的に更新します。安定版の `Latest` は GitHub がバージョンに基づいて決定し、プレリリースを `Latest` にはしません。過去のバージョンはヘッダーのバージョンバッジから確認できます。

:::note
このワークフローは GitHub Release の作成・更新のみを行い、サイトを自動デプロイしません。`main` へのマージでもデプロイされません。公開はローカルの `pnpm run deploy`、または別途設定したホスティング側の Git 連携で行います。[Cloudflare Pages へのデプロイ](/canvas/cloudflare/) を参照してください。
:::

---

## 4. コンテンツ共同作業のワークフロー

複数人でドキュメントをメンテナンスするときは、「ブランチ → レビュー → マージ → リリース」という決まった流れで協力し、公開されている内容が常にビルドできる状態を保ちます。

```text
main ブランチ（リリース元。公開サイトはデプロイ後に更新）
  │
  ├─ 1. main から機能ブランチを切る                  git checkout -b docs/new-guide
  ├─ 2. Markdown を書く / 修正する
  ├─ 3. ローカルで自己チェック                        pnpm run verify
  ├─ 4. ブランチをプッシュして Pull Request を出す     CI の完全な検証が起動
  ├─ 5. レビュー通過後に main へマージ                サイトは自動デプロイされない
  └─ 6. リリースが必要なときは v* タグを打つ           GitHub Release パイプラインが起動
```

### Pull Request のレビューのポイント

CI（`build.yml`）は `pnpm run verify` でテスト、設定チェック、Astro 型チェック、ビルド、コンテンツと成果物の検査を実行します。表示結果は引き続き手動で確認します。

- **リンクの有効性**：新しく追加したサイト内リンクやアンカーが飛べるか。パスを変更したドキュメントにリダイレクトを登録したか。
- **レンダリング結果**：吹き出し（コールアウト）の `:::` 構文やコードブロックの注記がページ上で正しく表示されるか（CI は見た目をチェックしません）。
- **図文の対応**：新しく追加したスクリーンショットに説明文があるか、鮮明か。
- **命名規則**：ファイル名は小文字とハイフン、Frontmatter の `title` と `description` が揃っていること。

### 役割分担の目安

| 役割 | 担当 |
| :--- | :--- |
| ドキュメント作成者 | 内容の執筆、ローカルでの自己チェック、PR の起票 |
| レビュアー | レンダリング結果とリンクの確認、コードのマージ |
| リリース管理者 | バージョンタグを打つ、`RELEASE_NOTES.md` の保守、ナビゲーションバーのバージョンバッジの同期 |

---

## 5. CI のビルドチェック

`.github/workflows/build.yml` は `main` へのプッシュと Pull Request で完全な検証を実行します。CI は `.node-version` で固定した Node.js 22.23.4 と pnpm 10.34.5 を使用します。コミット前にローカルで同じ自己チェックを実行してください。

```bash
pnpm run verify
```
