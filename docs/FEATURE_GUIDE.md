# 新機能追加ガイド（AI Agent向け）

このガイドは、Backlog Toolbox に新しい機能を追加するときの標準フローです。
実装前に `AGENTS.md` と `docs/TOOL_FRAMEWORK.md` を確認し、このガイドは具体的な実装手順として使ってください。

---

## 前提条件

- Bun をランタイム・パッケージマネージャーとして使う
- TypeScript strict mode を維持する
- zod で入力を検証する
- UI は Tailwind CSS v4 + `shadcn/ui` を基本に組み立てる
- アイコンは `lucide-react` に統一する
- 通知は `sonner` を使う
- 既存のアプリシェルは `Sidebar` + `Navbar` + `SidebarTrigger` を前提にする

---

## Step 1: 機能メタデータを定義する

### 1.1 サイドバーにエントリを追加

`src/components/sidebar-items.ts` に `SidebarItem` を追加します。

```ts
import { Ticket } from "lucide-react";
import type { SidebarItem } from "@/types/feature";

export const sidebarItems: SidebarItem[] = [
  {
    id: "my-feature",
    label: "機能名",
    description: "この機能の説明",
    icon: Ticket,
    href: "/features/my-feature",
  },
];
```

### 1.2 ルーティングを決める

- フォルダ名は `kebab-case`
- URL は `/features/[feature-name]`
- `id`, フォルダ名, `href` は原則そろえる

---

## Step 2: サーバーサイドロジックを実装する

`src/lib/my-feature.ts` に UI 非依存の処理を集約します。

```ts
import { z } from "zod";

const MyFeatureInputSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  count: z.number().int().positive(),
});

export type MyFeatureInput = z.infer<typeof MyFeatureInputSchema>;

export type MyFeatureResult = {
  success: boolean;
  message: string;
};

export async function executeMyFeature(rawInput: unknown): Promise<MyFeatureResult> {
  const input = MyFeatureInputSchema.parse(rawInput);

  return {
    success: true,
    message: `${input.name} を ${input.count} 件処理しました`,
  };
}
```

### 実装ルール

- 入力はまず zod で検証する
- 正規化処理は UI ではなくロジック層へ寄せる
- 返却値は UI が扱いやすい構造にする
- 外部 API 呼び出しや重い変換はここに集約する

---

## Step 3: Server Actions を実装する

`src/app/features/my-feature/actions.ts` では、`FormData` などの UI 入力をサーバーロジックへ橋渡しします。

```ts
"use server";

import { executeMyFeature } from "@/lib/my-feature";

export type ActionState =
  | {
      success: boolean;
      message: string;
    }
  | null;

export async function runFeature(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = {
      name: String(formData.get("name") ?? ""),
      count: Number(formData.get("count") ?? 0),
    };

    return await executeMyFeature(input);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";

    return {
      success: false,
      message,
    };
  }
}
```

### 実装ルール

- `actions.ts` は薄く保つ
- フォーム整形とエラーメッセージ変換に集中する
- ビジネスロジックを `actions.ts` に書き込まない

---

## Step 4: UI を構築する

`src/app/features/my-feature/page.tsx` は `shadcn/ui` を優先して構築します。

```tsx
"use client";

import { useActionState } from "react";
import { Play } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { runFeature, type ActionState } from "./actions";

export default function MyFeaturePage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    runFeature,
    null,
  );

  return (
    <>
      <Navbar title="機能名">
        <Button type="submit" form="my-feature-form" disabled={isPending}>
          <Play />
          {isPending ? "処理中..." : "実行"}
        </Button>
      </Navbar>

      <main className="flex-1 p-6">
        <form
          id="my-feature-form"
          action={formAction}
          className="mx-auto flex max-w-4xl flex-col gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input id="name" name="name" required />
              </div>
            </CardContent>
          </Card>
        </form>

        {state && (
          <div className="mx-auto mt-6 max-w-4xl">
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertTitle>{state.success ? "完了" : "エラー"}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          </div>
        )}
      </main>
    </>
  );
}
```

### UI 実装ルール

- まず `src/components/ui/` に既存コンポーネントがあるか確認する
- 新規 UI も `shadcn/ui` の構成に揃える
- 一時通知は `toast.success` / `toast.error` を使う
- アイコンは `lucide-react` のみ使う
- モバイル幅とサイドバーの開閉状態を考慮する

---

## Step 5: 環境変数が必要な場合

`src/lib/env.ts` にスキーマを追加し、`.env.local` と機能ドキュメントへ反映します。

```ts
import { z } from "zod";

const envSchema = z.object({
  MY_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

更新対象:

- `.env.local`
- `src/lib/env.ts`
- `docs/features/my-feature.md`

---

## Step 6: ドキュメントを更新する

最低限、以下を更新します。

- `docs/features/my-feature.md`
- `src/components/sidebar-items.ts`
- 必要なら `AGENTS.md`
- 実装ルールに影響があるなら `docs/TOOL_FRAMEWORK.md`

`docs/features/my-feature.md` には次を含めてください。

- 機能概要
- 主な入力と出力
- 使用 API / 外部サービス
- 環境変数
- 既知の制限事項

---

## Step 7: 確認する

型チェック:

```bash
bunx tsc --noEmit
```

ビルド確認:

```bash
bun run build
```

必要に応じて開発サーバー:

```bash
bun run dev
```

---

## 追加時のチェックリスト

- `src/lib/[feature-name].ts` を作成した
- `src/app/features/[feature-name]/page.tsx` を作成した
- `src/app/features/[feature-name]/actions.ts` を作成した
- 必要なら `_components/` に UI を分割した
- `src/components/sidebar-items.ts` を更新した
- `docs/features/[feature-name].md` を追加した
- `lucide-react` のアイコンを使った
- `shadcn/ui` を優先して使った
- `bunx tsc --noEmit` を通した
- 必要なら `bun run build` を通した
