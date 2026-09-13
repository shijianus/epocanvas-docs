---
title: バージョン管理と自動化ワークフロー
description: EpoCanvas Docs のバージョン番号の命名規則、バージョン更新の標準的なリリース手順、GitHub Actions による自動リリースパイプライン。
---

読者が「このドキュメントは製品のどのバージョンに対応しているのか」をはっきり分かるようにし、チームが変更履歴を整理して追跡できるようにするため、**EpoCanvas Docs** ではセマンティックバージョニングと決まったリリース手順を採用しています。

---

## 1. セマンティックバージョニングの規則 (SemVer)

バージョン番号は `vメジャー.マイナー.パッチ` の形式です（現在は `v1.2.0`）。

| 変更の種類 | 例 | 発生する場面 |
| :--- | :--- | :--- |
| **メジャー番号 (Major)** | `v2.0.0` | ドキュメントシステムの大規模な作り直し（Astro のメジャーバージョンのアップグレード、レイアウトの全面刷新など）。 |
| **マイナー番号 (Minor)** | `v1.2.0` | ドキュメントの章の追加、多言語の追加、デザインシステムの更新など、比較的大きな機能。 |
| **パッチ番号 (Patch)** | `v1.2.1` | 誤字の修正、コード例の更新、細かいスタイル調整などの小さな変更。 |

---

## 2. 新バージョンをリリースする標準的な 3 ステップ

### ステップ 1：更新内容を記録する (`RELEASE_NOTES.md`)

プロジェクトルートの `RELEASE_NOTES.md` に今回の更新内容をはっきり書きます。このファイルは GitHub Release の説明文として使われます。

```markdown
## [v1.2.1] - 2026-09-18

### 修正
- デプロイの章にあるコマンドの誤字を修正。
- 画面のスクリーンショットを最新版に更新。
```

### ステップ 2：package.json のバージョン番号を更新する

ナビゲーションバーのバージョンバッジは `package.json` の `version` フィールドと自動的に連動しており、サイト全体のバージョンの単一のデータソース（Single Source of Truth）になっています。`package.json` のバージョン番号を更新するか（または `pnpm version patch` を実行するか）すると、トップバーのバッジが自動的に最新のバージョン番号へ同期され、複数か所を手で直す必要はありません。

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

プロジェクトには `.github/workflows/release.yml` に自動リリースのワークフローが用意されており、実際の内容は次のとおりです。

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'   # v で始まるタグをプッシュすると自動的にトリガーされる

permissions:
  contents: write

jobs:
  release:
    name: Publish GitHub Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TAG_NAME="${{ github.ref_name }}"
          echo "Publishing release for tag: ${TAG_NAME}"
          gh release create "${TAG_NAME}" \
            --title "EpoCanvas Docs ${TAG_NAME}" \
            --notes-file RELEASE_NOTES.md \
            --latest
```

`v1.2.1` タグをプッシュすると、GitHub が自動的にパイプラインを起動します。

1. リポジトリのコードをチェックアウトします；
2. `RELEASE_NOTES.md` を説明文として、リポジトリの **Releases** ページに正式なリリースを作成し、latest としてマークします；
3. 読者がトップバーのバージョンバッジをクリックすれば、すべての過去バージョンのアーカイブを確認できます。

:::note
このパイプラインが担当するのは GitHub Release の作成だけで、**サイトのデプロイは行いません**。公開環境の更新は Cloudflare Pages の Git 自動ビルド（またはローカルの `pnpm run deploy`）で行われ、両者は互いに依存していません。詳細は [Cloudflare Pages でのデプロイ](/canvas/cloudflare/) を参照してください。
:::

---

## 4. コンテンツ共同作業のワークフロー

複数人でドキュメントをメンテナンスするときは、「ブランチ → レビュー → マージ → リリース」という決まった流れで協力し、公開されている内容が常にビルドできる状態を保ちます。

```text
main ブランチ（常にリリース可能、公開サイトに対応）
  │
  ├─ 1. main から機能ブランチを切る                  git checkout -b docs/new-guide
  ├─ 2. Markdown を書く / 修正する
  ├─ 3. ローカルで自己チェック                        pnpm exec astro check && pnpm run build
  ├─ 4. ブランチをプッシュして Pull Request を出す     CI ビルドが起動
  ├─ 5. レビュー通過後に main へマージ                公開環境の自動デプロイが起動
  └─ 6. リリースが必要なときは v* タグを打つ           GitHub Release パイプラインが起動
```

### Pull Request のレビューのポイント

CI（`build.yml`）が保証するのは「ビルドが通ること」までです。次の点は人の目で確認します。

- **リンクの有効性**：新しく追加したサイト内リンクやアンカーが飛べるか。パスを変更したドキュメントにリダイレクトを登録したか；
- **レンダリング結果**：吹き出し（コールアウト）の `:::` 構文やコードブロックの注記がページ上で正しく表示されるか（CI は見た目をチェックしません）；
- **図文の対応**：新しく追加したスクリーンショットに説明文があるか、鮮明か；
- **命名規則**：ファイル名は小文字とハイフン、Frontmatter の `title` と `description` が揃っていること。

### 役割分担の目安

| 役割 | 担当 |
| :--- | :--- |
| ドキュメント作成者 | 内容の執筆、ローカルでの自己チェック、PR の起票 |
| レビュアー | レンダリング結果とリンクの確認、コードのマージ |
| リリース管理者 | バージョンタグを打つ、`RELEASE_NOTES.md` の保守、ナビゲーションバーのバージョンバッジの同期 |

---

## 5. CI のビルドチェック

リポジトリには `.github/workflows/build.yml` が設定されており、`main` ブランチへのプッシュのたび、またすべての Pull Request で、依存関係のインストールとフルビルドが自動実行され、リンク切れや Frontmatter のエラーなどのビルド時の問題を早めに検出します。プッシュ前にローカルで同じチェックを一度回しておけば、プッシュ後の CI 失敗を避けられます。

```bash
pnpm exec astro check && pnpm run build
```
