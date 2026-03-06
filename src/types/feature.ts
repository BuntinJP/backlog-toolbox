/**
 * Backlog Toolbox — 機能定義の共通型
 *
 * 新機能を追加する際は、この型に従って FeatureConfig を定義し、
 * sidebar-items.ts に登録する。
 */

/** サイドバーに表示する機能のメタ情報 */
export type SidebarItem = {
  /** 機能の一意識別子（kebab-case） */
  id: string;
  /** サイドバーに表示する名前 */
  label: string;
  /** 機能の短い説明 */
  description: string;
  /** アイコン（絵文字 or テキスト） */
  icon: string;
  /** ルーティングパス（`/features/xxx`） */
  href: string;
};

/** ナビバーに表示するアクションボタン */
export type NavAction = {
  /** ボタンに表示するラベル */
  label: string;
  /** アイコン（絵文字 or テキスト） */
  icon?: string;
  /** ボタンの種別 */
  variant: "primary" | "secondary" | "danger";
};

/** パラメータの入力タイプ */
export type ParamType = "text" | "textarea" | "number" | "select" | "checkbox";

/** 機能のパラメータ定義 */
export type FeatureParam = {
  /** パラメータのキー */
  key: string;
  /** 表示ラベル */
  label: string;
  /** 入力タイプ */
  type: ParamType;
  /** 必須かどうか */
  required: boolean;
  /** 説明・ヘルプテキスト */
  description?: string;
  /** デフォルト値 */
  defaultValue?: string;
  /** select の場合の選択肢 */
  options?: { label: string; value: string }[];
  /** 複数入力を許可するか（ループ処理対象） */
  multiple?: boolean;
};
