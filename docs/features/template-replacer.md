# テンプレート変数置換

## 概要

テンプレート文字列内の `{{変数名}}` を、各変数に指定された複数の値で置換し、
全変数の値の**直積（デカルト積）**で全組み合わせを生成する機能。

### 例

テンプレート: `Hello {{name}}, you are {{role}}`

| 変数 | 値 |
|------|------|
| `name` | Alice, Bob |
| `role` | admin, user |

→ 2 × 2 = **4件** の結果:
1. `Hello Alice, you are admin`
2. `Hello Alice, you are user`
3. `Hello Bob, you are admin`
4. `Hello Bob, you are user`

## 使用API / 外部サービス

- なし（純粋なクライアント→サーバー処理）

## 環境変数

不要

## 既知の制限事項

- 変数の値の数が多い場合、直積の結果が膨大になる（指数的増加）
- ネストされた変数（変数内に変数）は非対応
