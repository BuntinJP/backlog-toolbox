---
name: 機能追加リクエスト
about: 新しい機能の追加をリクエストする
title: '[Feature] '
labels: feature
---

## 機能名

<!-- 機能の短い名前（英語、kebab-case） 例: backlog-tickets -->

## ルーティング

<!-- 例: /features/backlog-tickets -->

## 概要

<!-- この機能が何をするか、1-2文で説明 -->

## 詳細仕様

### 入力パラメータ

| パラメータ名 | 型  | 必須 | 説明 |
| ------------ | --- | ---- | ---- |
|              |     |      |      |

### 処理内容

<!-- 処理のフロー・ロジックを説明 -->

### 出力・結果

<!-- 成功時の結果、エラー時の挙動 -->

## 外部API / サービス

<!-- 必要な外部APIやサービス、環境変数 -->

| 環境変数名 | 用途 |
| ---------- | ---- |
|            |      |

## UI要件

### 使用するアイコン

<!-- lucide-react のアイコン名を記載 -->

### 使用する共通UI

<!-- Card / Button / Tabs / Alert など、shadcn/ui を前提に記載 -->

### メインセクション

<!-- メインセクションに表示する内容の説明 -->

### ナビバーボタン

<!-- ナビバーに追加するボタンの説明 -->

| ボタン名 | アクション     |
| -------- | -------------- |
| 実行     | 処理を開始する |

## 実装チェックリスト

- [ ] `src/lib/[feature-name].ts` — サーバーサイドロジック
- [ ] `src/app/features/[feature-name]/page.tsx` — UI
- [ ] `src/app/features/[feature-name]/actions.ts` — Server Actions
- [ ] `src/components/sidebar-items.ts` にエントリ追加
- [ ] `lucide-react` のアイコンを選定
- [ ] `shadcn/ui` ベースで UI を構成
- [ ] `bunx tsc --noEmit` パス
- [ ] 必要なら `bun run build` パス
- [ ] `docs/features/[feature-name].md` 作成

## バージョン・リリース影響

<!-- package.json の version 更新が必要か、リリースノート対象かを記載 -->
