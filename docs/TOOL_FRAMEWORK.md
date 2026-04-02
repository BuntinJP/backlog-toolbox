# ツール実装フレームワーク

このドキュメントは、Backlog Toolbox に新しいツールを追加するときの内部フレームワークを整理したものです。
「どういう責務で分けるか」「どこを更新するか」を固定化し、AI Agent でも人間でも同じ手順で増築できる状態を目指します。

---

## 現状の評価

このリポジトリは、すでに以下の意味でフレームワーク的な構造を持っています。

- `src/lib/[feature-name].ts` にロジックを集約する方針がある
- `src/app/features/[feature-name]/` で UI と actions を分離している
- `src/components/sidebar-items.ts` で機能メタデータを管理している
- `shadcn/ui` と `lucide-react` に UI の基盤が寄っている

一方で、これまではその構造が十分に文章化されておらず、追加時の更新漏れや設計の揺れが起きやすい状態でした。
今後はこの文書を内部フレームワークの基準として扱います。

---

## 標準構成

```text
src/
├── app/
│   └── features/
│       └── [feature-name]/
│           ├── page.tsx
│           ├── actions.ts
│           └── _components/
├── components/
│   ├── ui/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── sidebar-items.ts
├── lib/
│   └── [feature-name].ts
└── types/
    └── feature.ts
docs/
└── features/
    └── [feature-name].md
```

---

## レイヤーごとの責務

### 1. `sidebar-items.ts`

- 機能一覧の登録
- 表示順の管理
- `lucide-react` アイコンの指定
- ルーティング定義

### 2. `src/lib/[feature-name].ts`

- zod スキーマ
- 入力の正規化
- ビジネスロジック
- API 呼び出し
- 結果構造の返却

### 3. `actions.ts`

- `FormData` や UI 入力の取り出し
- サーバーロジックの呼び出し
- UI に返すための失敗メッセージ整形

### 4. `page.tsx`

- 画面状態
- `Navbar` 上のアクション
- `shadcn/ui` ベースのフォームと結果表示
- `sonner` による補助通知

### 5. `_components/`

- その機能専用の UI 部品
- 再利用されないが、`page.tsx` に置くには大きすぎる要素

### 6. `docs/features/[feature-name].md`

- 仕様の要約
- 使い方
- API / 環境変数
- 制限事項

---

## 推奨実装テンプレート

### サーバーロジック

```ts
import { z } from "zod";

const FeatureInputSchema = z.object({
  value: z.string().min(1),
});

export type FeatureInput = z.infer<typeof FeatureInputSchema>;

export type FeatureResult = {
  success: boolean;
  message: string;
};

export async function executeFeature(rawInput: unknown): Promise<FeatureResult> {
  const input = FeatureInputSchema.parse(rawInput);

  return {
    success: true,
    message: input.value,
  };
}
```

### Server Action

```ts
"use server";

import { executeFeature } from "@/lib/my-feature";

export async function runFeature(_prevState: unknown, formData: FormData) {
  const input = {
    value: String(formData.get("value") ?? ""),
  };

  return executeFeature(input);
}
```

### UI

```tsx
<Navbar title="機能名">
  <Button type="submit" form="feature-form">実行</Button>
</Navbar>
```

---

## UI とデザインの標準

- フォーム、カード、アラート、タブ、ダイアログは `src/components/ui/` を優先する
- アイコンは `lucide-react` に統一する
- クリップボードや成功通知は `sonner` を使う
- ルートシェルは `SidebarProvider` / `Sidebar` / `SidebarTrigger` / `Navbar` に乗せる
- 新しい UI パターンを導入したら、必要に応じて `docs/FEATURE_GUIDE.md` と `AGENTS.md` を更新する

---

## データ設計の標準

- UI 入力の生データをそのままロジックに渡さない
- まず zod スキーマに通す
- UI 上の複雑な入力形式があっても、ロジック層には正規化後の形で渡す
- 返却値はなるべく UI 非依存で、`success`, `message`, `data` のように扱いやすくする

---

## 更新漏れしやすい箇所

新しいツールを追加したとき:

- `src/components/sidebar-items.ts`
- `docs/features/[feature-name].md`
- 必要なら `src/types/feature.ts`

実装ルールが変わったとき:

- `AGENTS.md`
- `docs/FEATURE_GUIDE.md`
- `.github/ISSUE_TEMPLATE/feature.md`

バージョンを変えたとき:

- `package.json`
- `src/lib/app-meta.ts` が version を参照していることを壊さない

---

## 追加前チェック

- 既存機能で近い UI / ロジックがないか確認したか
- `src/components/ui/` に使える部品があるか確認したか
- アイコンを `lucide-react` から選んだか
- `docs/features/` への記録を予定しているか
- バージョンや共通ルールに影響する変更か確認したか

---

## 追加後チェック

- `bunx tsc --noEmit`
- 必要なら `bun run build`
- サイドバー導線が正しい
- ホバー、disabled、エラー表示などの UI 状態が破綻していない
- ドキュメントが更新されている
