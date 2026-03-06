# AGENTS.md — Backlog Toolbox

このプロジェクトは **AI Agents による機能追加** を前提に設計されています。
以下のルールを厳守してください。

---

## 技術スタック（強制）

| 項目                   | 指定                               |
| ---------------------- | ---------------------------------- |
| ランタイム             | **Bun** （Node.js は使用禁止）     |
| パッケージマネージャー | **Bun** (`bun install`, `bun add`) |
| テスト                 | **Bun** (`bun test`) ※必要な場合   |
| フレームワーク         | **Next.js v16** (App Router)       |
| 言語                   | **TypeScript** (strict mode)       |
| バリデーション         | **zod**                            |

### 禁止事項

- `npm`, `yarn`, `pnpm` の使用
- `node` コマンドでの直接実行
- JavaScript ファイル (`.js`, `.jsx`) の作成（設定ファイルを除く）
- `any` 型の使用（`unknown` を使うこと）

---

## プロジェクト構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（サイドバー + ナビバー）
│   ├── page.tsx                # ダッシュボード / ホーム
│   └── features/
│       └── [feature-name]/     # 機能ごとのフォルダ
│           ├── page.tsx        # 機能のUI（メインセクション）
│           ├── actions.ts      # Server Actions
│           └── _components/    # 機能固有のコンポーネント
├── components/                 # 共通UIコンポーネント
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── Modal.tsx
├── lib/                        # サーバーサイドロジック（機能ごとに単一TSファイル）
│   └── [feature-name].ts      # 例: backlog-api.ts
└── types/                      # 共通型定義
    └── index.ts
```

### 重要な規約

1. **機能の追加** = `src/app/features/[feature-name]/` フォルダの追加
2. **サーバーサイドロジック** = `src/lib/[feature-name].ts` に単一ファイルとして実装
3. **Server Actions** からサーバーサイドロジックを `import` して使用
4. **共通コンポーネント** は `src/components/` に配置
5. **機能固有コンポーネント** は `src/app/features/[feature-name]/_components/` に配置

---

## 機能追加の手順

機能の追加は **Issue** から行います。以下のフォーマットに従ってください。

### 1. Issue の作成

`.github/ISSUE_TEMPLATE/feature.md` のテンプレートに従う。

### 2. 実装手順

1. `src/lib/[feature-name].ts` — サーバーサイドロジックを実装
2. `src/app/features/[feature-name]/page.tsx` — UI を実装
3. `src/app/features/[feature-name]/actions.ts` — Server Actions を実装
4. `src/components/sidebar-items.ts` — サイドバーに機能を登録
5. 型チェック: `bunx tsc --noEmit`
6. 動作確認: `bun run dev` で起動して確認

### 3. 完了ドキュメント

実装完了後、以下を `docs/features/[feature-name].md` に記録する:

- 機能概要
- 使用した API / 外部サービス
- 環境変数（必要な場合）
- 既知の制限事項

---

## 型チェック

TypeScript の型チェックは以下のコマンドで行うこと:

```bash
bunx tsc --noEmit
```

Bun はランタイムで型チェックをスキップするため、型の正しさを保証するには `tsc` の実行が必須。

---

## 環境変数

機能固有の環境変数は `.env.local` に定義し、zod でバリデーションすること。

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  BACKLOG_API_KEY: z.string().min(1),
  BACKLOG_SPACE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```
