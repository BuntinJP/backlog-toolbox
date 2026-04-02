# AGENTS.md — Backlog Toolbox

このプロジェクトは、AI Agent が継続的に機能追加・保守を行うことを前提にしています。
実装前に必ずこのファイルを確認し、ここに書かれている規約を優先してください。

---

## 技術スタック

| 項目 | 指定 |
| --- | --- |
| ランタイム | **Bun** |
| パッケージマネージャー | **Bun** (`bun install`, `bun add`) |
| フレームワーク | **Next.js v16** (App Router) |
| 言語 | **TypeScript** (`strict: true`) |
| バリデーション | **zod** |
| UI | **Tailwind CSS v4** + **shadcn/ui** |
| アイコン | **lucide-react** |
| 通知 | **sonner** |

### 禁止事項

- `npm`, `yarn`, `pnpm` の使用
- `node` コマンドでの直接実行
- JavaScript ファイル (`.js`, `.jsx`) の新規追加（設定ファイルを除く）
- `any` 型の使用。必要なら `unknown` から絞り込む
- 絵文字や文字列を UI アイコンとして新規採用すること
- `src/components/ui/` にある共通 UI を無視して独自コンポーネントを乱立させること

---

## 現在のプロジェクト構成

```text
src/
├── app/
│   ├── layout.tsx                 # ルートレイアウト（SidebarProvider, Toaster）
│   ├── page.tsx                   # ホーム
│   └── features/
│       └── [feature-name]/
│           ├── page.tsx           # 機能 UI
│           ├── actions.ts         # Server Actions
│           └── _components/       # 機能固有 UI
├── components/
│   ├── ui/                        # shadcn/ui ベースの共有 UI
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Modal.tsx
│   └── sidebar-items.ts
├── hooks/
│   └── use-mobile.ts
├── lib/
│   ├── app-meta.ts                # アプリ名・説明・バージョン
│   ├── utils.ts                   # 共通ユーティリティ
│   └── [feature-name].ts          # 機能ロジック本体
└── types/
    └── feature.ts                 # SidebarItem / NavAction など
docs/
├── FEATURE_GUIDE.md
├── TOOL_FRAMEWORK.md
└── features/
    └── [feature-name].md
```

---

## 重要な規約

1. **機能追加は `src/app/features/[feature-name]/` を起点に行う**
2. **サーバーサイドロジックは `src/lib/[feature-name].ts` に集約する**
3. **`actions.ts` は Server Actions の薄い入出力境界として保つ**
4. **共通 UI は `src/components/ui/` を優先して使う**
5. **サイドバー登録は `src/components/sidebar-items.ts` で一元管理する**
6. **アイコンは `lucide-react` のコンポーネントを使う**
7. **通知は `sonner` の `toast.success` / `toast.error` に統一する**
8. **アプリ全体のシェルは `SidebarProvider` + `Sidebar` + `Navbar` の構成を壊さない**
9. **機能追加後は `docs/features/[feature-name].md` を必ず更新する**
10. **実装規約を変えたら `AGENTS.md` と `docs/FEATURE_GUIDE.md` を同時に更新する**

---

## ツール追加の内部フレームワーク

このリポジトリでは「ツール」は単発ページではなく、以下の責務分離で実装します。
現状はこの形にかなり寄っていますが、今後の追加はこの枠組みに厳密に合わせてください。

### 1. メタデータ層

- `src/components/sidebar-items.ts`
  - サイドバーに表示する順序
  - ラベル、説明、`lucide-react` アイコン
  - ルーティング先
- `src/types/feature.ts`
  - `SidebarItem` や `NavAction` など共有型

### 2. ロジック層

- `src/lib/[feature-name].ts`
  - zod スキーマ
  - 正規化処理
  - ビジネスロジック
  - 外部 API 呼び出し
  - UI 非依存の返却データ構造

### 3. サーバー境界

- `src/app/features/[feature-name]/actions.ts`
  - `FormData` や JSON から入力を組み立てる
  - `src/lib/[feature-name].ts` を呼ぶ
  - エラーを UI 向けメッセージへ変換する

### 4. UI 層

- `src/app/features/[feature-name]/page.tsx`
  - 機能ページの状態管理
  - `Navbar` のタイトルやアクション
  - `shadcn/ui` コンポーネントの組み合わせ
- `src/app/features/[feature-name]/_components/`
  - その機能専用だが、分割した方が明快な UI

### 5. ドキュメント層

- `docs/features/[feature-name].md`
  - 機能概要
  - 入出力
  - 使用 API
  - 環境変数
  - 既知の制限

詳細な追加手順は `docs/TOOL_FRAMEWORK.md` と `docs/FEATURE_GUIDE.md` を参照してください。

---

## 新しいツールを追加するときの標準手順

1. `.github/ISSUE_TEMPLATE/feature.md` に沿って要件を定義する
2. `src/lib/[feature-name].ts` に zod ベースでロジックを実装する
3. `src/app/features/[feature-name]/actions.ts` を作り、UI 境界を実装する
4. `src/app/features/[feature-name]/page.tsx` を `shadcn/ui` ベースで実装する
5. 必要なら `src/app/features/[feature-name]/_components/` に分割する
6. `src/components/sidebar-items.ts` に機能を登録する
7. `docs/features/[feature-name].md` を作成する
8. 必要に応じて `docs/FEATURE_GUIDE.md` や `AGENTS.md` も更新する
9. `bunx tsc --noEmit` を実行する
10. 必要なら `bun run build` や `bun run dev` で確認する

---

## 変更時に更新漏れを起こしやすいファイル

### 機能を追加したとき

- `src/components/sidebar-items.ts`
- `docs/features/[feature-name].md`
- 必要なら `src/types/feature.ts`

### UI の共通方針を変えたとき

- `AGENTS.md`
- `docs/FEATURE_GUIDE.md`
- `docs/TOOL_FRAMEWORK.md`
- 必要なら `.github/ISSUE_TEMPLATE/feature.md`

### アプリ名・説明・バージョンを変えたとき

- `package.json`
- `src/lib/app-meta.ts`
  - ここは `package.json` の version を参照するため、通常はアプリ名や説明の変更時のみ編集
- 画面表示や metadata は `src/lib/app-meta.ts` を参照すること

### 新しい環境変数を追加したとき

- `.env.local`
- `src/lib/env.ts`
- `docs/features/[feature-name].md`
- 必要なら Issue Template や AGENTS の該当箇所

---

## バージョン更新ルール

- セマンティックバージョン風の表記 (`0.1.0`, `0.2.0` など) を `package.json` の `version` で管理する
- 画面上のバージョン表示やメタ情報は `src/lib/app-meta.ts` 経由で参照する
- バージョンを上げるときに UI 側へ数値を直書きしない
- 将来 changelog や release note を導入した場合は、`AGENTS.md` に更新箇所を追記する

---

## UI 実装ルール

- `src/components/ui/` に同等のものがある場合はそれを使う
- 新しい UI パターンを追加する場合は、可能な限り `shadcn/ui` の構成に寄せる
- アイコンは `lucide-react` に統一する
- 成功・失敗・補足通知は `sonner` を使う
- フォームや結果表示はアクセシビリティを意識し、無効化条件とエラー表示を UI 側で明示する

---

## 型チェックと確認コマンド

型チェック:

```bash
bunx tsc --noEmit
```

ビルド確認:

```bash
bun run build
```

開発サーバー:

```bash
bun run dev
```

Bun はランタイムで型チェックを保証しないため、`bunx tsc --noEmit` は必須です。

---

## 環境変数

機能固有の環境変数は `.env.local` に定義し、`src/lib/env.ts` で zod により検証してください。

```ts
import { z } from "zod";

const envSchema = z.object({
  BACKLOG_API_KEY: z.string().min(1),
  BACKLOG_SPACE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```
