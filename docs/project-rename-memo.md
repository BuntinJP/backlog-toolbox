# プロジェクト名変更メモ

> 作成日: 2026-04-02

GitHubリポジトリを含めてプロジェクト名を変更する際に、修正が必要な箇所の一覧。

---

## 🔴 必須（動作・識別に関わる）

| ファイル | 行 | 内容 |
|---|---|---|
| `package.json` | L2 | `"name": "backlog-toolbox"` → npm パッケージ名 |
| `src/lib/app-meta.ts` | L3 | `APP_NAME = "Backlog Toolbox"` → UIに表示されるアプリ名 |
| `src/components/ui/sidebar.tsx` | L27 | `SIDEBAR_STORAGE_KEY = "backlog-toolbox.sidebar.open"` → localStorageのキー名 |

### 備考

- `src/lib/app-meta.ts` の `APP_NAME` は `layout.tsx` の `<title>` タグや Navbar など複数箇所から参照されているため、**ここを変えるだけで UI 全体のアプリ名表示が変わる**。
- `SIDEBAR_STORAGE_KEY` を変更すると既存ユーザーのサイドバー開閉状態がリセットされるが、新リポジトリ運用開始時点なら影響なし。

---

## 🟡 推奨（UI表示・ドキュメントとして見える）

| ファイル | 行 | 内容 |
|---|---|---|
| `src/app/page.tsx` | L14, L17 | ホーム画面の見出し・ウェルカムメッセージ |
| `src/types/feature.ts` | L4 | JSDoc コメント |
| `docs/FEATURE_GUIDE.md` | L3 | ドキュメント内の記載 |
| `docs/TOOL_FRAMEWORK.md` | L3 | ドキュメント内の記載 |
| `AGENTS.md` | L1 | エージェント向け指定書のタイトル |
| `README.md` | 全体 | create-next-app のデフォルト内容のまま。プロジェクト説明を書き直す機会にも |

---

## ℹ️ GitHub リポジトリ側の作業

新しいリポジトリを作成後、以下のコマンドでリモート先を変更する。

```bash
git remote set-url origin <新しいリポジトリURL>
git push -u origin main
```

`.github/ISSUE_TEMPLATE/feature.md` はプロジェクト名の直接記載なし（変更不要）。
