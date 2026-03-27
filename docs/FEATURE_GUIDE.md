# 新機能追加ガイド（AI Agent向け）

このガイドは、Backlog Toolbox に新しい機能を追加するための手順書です。
AI Agent がこのガイドに従って実装を行います。

---

## 前提条件

- `AGENTS.md` の規約を必ず確認すること
- Bun をランタイム・パッケージマネージャーとして使用
- TypeScript strict mode
- zod によるバリデーション
- **Tailwind CSS v4** によるスタイリング（CSS Module は使用しない）

---

## Step 1: 機能の定義

### 1.1 サイドバーにエントリを追加

`src/components/sidebar-items.ts` に `SidebarItem` を追加する。

```typescript
// src/components/sidebar-items.ts
import type { SidebarItem } from '@/types/feature';

export const sidebarItems: SidebarItem[] = [
  {
    id: 'my-feature', // kebab-case の一意ID
    label: '機能名', // サイドバーに表示する名前
    description: 'この機能の説明', // ツールチップ
    icon: '🎫', // 絵文字アイコン
    href: '/features/my-feature', // ルーティングパス
  },
];
```

---

## Step 2: サーバーサイドロジックの実装

### 2.1 ロジックファイルを作成

`src/lib/my-feature.ts` に **サーバーサイドロジック** を実装する。
外部APIの呼び出し、データ加工など、サーバーサイドで行う処理をすべてこのファイルに集約する。

```typescript
// src/lib/my-feature.ts
import { z } from 'zod/v4';

// 入力スキーマ
const InputSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().positive(),
});

type Input = z.infer<typeof InputSchema>;

// 結果の型
type Result = {
  success: boolean;
  message: string;
};

/**
 * 機能のメイン処理
 */
export async function executeMyFeature(rawInput: unknown): Promise<Result> {
  const input = InputSchema.parse(rawInput);

  // ここにロジックを実装
  // 例: 外部APIの呼び出し

  return {
    success: true,
    message: `${input.name} を ${input.count} 件処理しました`,
  };
}
```

### 2.2 環境変数が必要な場合

`src/lib/env.ts` にスキーマを追加し、`.env.local` に環境変数を定義する。

```typescript
// src/lib/env.ts
import { z } from 'zod/v4';

const envSchema = z.object({
  MY_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

---

## Step 3: Server Actions の実装

### 3.1 actions.ts を作成

`src/app/features/my-feature/actions.ts` に Server Actions を実装する。
ここからサーバーサイドロジックを `import` して呼び出す。

```typescript
// src/app/features/my-feature/actions.ts
'use server';

import { executeMyFeature } from '@/lib/my-feature';

export type ActionState = {
  success: boolean;
  message: string;
} | null;

export async function runFeature(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const input = {
      name: formData.get('name'),
      count: Number(formData.get('count')),
    };

    const result = await executeMyFeature(input);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    return { success: false, message };
  }
}
```

---

## Step 4: UIページの実装

### 4.1 page.tsx を作成

`src/app/features/my-feature/page.tsx` にメインセクションのUIを実装する。
スタイリングには **Tailwind CSS のユーティリティクラス** を使用する。

```tsx
// src/app/features/my-feature/page.tsx
'use client';

import { useActionState, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Modal } from '@/components/Modal';
import { runFeature, type ActionState } from './actions';

export default function MyFeaturePage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(runFeature, null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Navbar title='機能名'>
        <button className='btn btn-primary' onClick={() => setModalOpen(true)} disabled={isPending}>
          ▶ 実行
        </button>
      </Navbar>

      <main className='flex-1 p-6'>
        <form action={formAction} className='max-w-4xl mx-auto space-y-6'>
          <section className='bg-card-bg rounded-xl border border-border p-6'>
            <label className='block'>
              <span className='text-sm font-medium text-foreground'>名前</span>
              <input
                type='text'
                name='name'
                required
                className='mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors'
              />
            </label>
            <label className='block mt-4'>
              <span className='text-sm font-medium text-foreground'>件数</span>
              <input
                type='number'
                name='count'
                defaultValue={1}
                required
                className='mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors'
              />
            </label>
          </section>

          <div className='flex justify-end'>
            <button type='submit' className='btn btn-primary' disabled={isPending}>
              {isPending ? '処理中...' : '実行'}
            </button>
          </div>
        </form>

        {state && (
          <div className='max-w-4xl mx-auto mt-6'>
            <div className={`rounded-xl border p-6 ${
              state.success ? 'bg-card-bg border-border' : 'bg-danger/5 border-danger/30'
            }`}>
              {state.success ? `✅ ${state.message}` : `❌ ${state.message}`}
            </div>
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title='実行確認'>
        <p className='text-sm text-muted mb-4'>処理を実行しますか？</p>
        <button className='btn btn-primary' onClick={() => setModalOpen(false)}>
          OK
        </button>
      </Modal>
    </>
  );
}
```

### 4.2 スタイリングルール

- **CSS Module は使用禁止** — Tailwind CSS のユーティリティクラスを使用
- カスタム色は `globals.css` の `@theme` で定義済み（例: `text-foreground`, `bg-card-bg`, `border-border`）
- ボタンは `btn btn-primary` / `btn btn-secondary` / `btn btn-danger` を使用
- カードセクションは `bg-card-bg rounded-xl border border-border p-6` パターン
- フォーム入力は `bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors` パターン

---

## Step 5: 型チェックと動作確認

### 5.1 型チェック

```bash
bunx tsc --noEmit
```

### 5.2 開発サーバーで確認

```bash
bun run dev
```

ブラウザで `http://localhost:3000/features/my-feature` を開いて動作確認。

---

## Step 6: ドキュメントの作成

`docs/features/my-feature.md` に以下を記録する:

```markdown
# 機能名

## 概要

この機能は...

## 使用API / 外部サービス

- API名: 用途

## 環境変数

| 変数名     | 用途      |
| ---------- | --------- |
| MY_API_KEY | APIの認証 |

## 既知の制限事項

- ...
```

---

## チェックリスト

実装完了時に以下を確認:

- [ ] `src/lib/[feature-name].ts` — サーバーサイドロジック
- [ ] `src/app/features/[feature-name]/page.tsx` — UI（Tailwind CSS）
- [ ] `src/app/features/[feature-name]/actions.ts` — Server Actions
- [ ] `src/components/sidebar-items.ts` にエントリ追加
- [ ] `bunx tsc --noEmit` パス
- [ ] `bun run dev` で動作確認
- [ ] `docs/features/[feature-name].md` 作成

---

## ファイル構成まとめ

```
新機能追加時に作成/編集するファイル:

[作成] src/lib/my-feature.ts              ← サーバーサイドロジック
[作成] src/app/features/my-feature/page.tsx ← UIページ（Tailwind CSS）
[作成] src/app/features/my-feature/actions.ts ← Server Actions
[編集] src/components/sidebar-items.ts     ← サイドバー登録
[作成] docs/features/my-feature.md         ← ドキュメント
```

## 参照すべき型定義

- `src/types/feature.ts` — `SidebarItem`, `NavAction`, `FeatureParam` 等

## リファレンス実装

実際の実装例として以下を参照:

- `src/lib/template-replacer.ts` — サーバーサイドロジックの参考
- `src/app/features/template-replacer/` — UI / Server Actions の参考
