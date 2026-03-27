import { z } from "zod/v4";

// ============================================
// スキーマ定義
// ============================================

/** 変数定義: 変数名と置換候補値の一覧 */
const VariableSchema = z.object({
  /** テンプレート内の変数名 (e.g. "name") */
  name: z.string().min(1, "変数名は必須です"),
  /** この変数に対する置換候補文字列の配列 */
  values: z.array(z.string()).min(1, "少なくとも1つの値が必要です"),
});

/** テンプレート置換の入力スキーマ */
const InputSchema = z.object({
  /** テンプレート文字列 (e.g. "Hello {{name}}, you are {{role}}") */
  template: z.string().min(1, "テンプレートは必須です"),
  /** 置換対象の変数リスト */
  variables: z.array(VariableSchema).min(1, "少なくとも1つの変数が必要です"),
});

export type TemplateReplacerInput = z.infer<typeof InputSchema>;
export type Variable = z.infer<typeof VariableSchema>;

/** 結果の型 */
export type TemplateReplacerResult = {
  success: boolean;
  message: string;
  /** 生成された全置換結果 */
  results: string[];
  /** 組み合わせ数 */
  totalCombinations: number;
};

// ============================================
// ユーティリティ
// ============================================

/**
 * 配列の配列の直積（デカルト積）を計算する
 *
 * 例: cartesianProduct([["a","b"], ["1","2"]])
 *   → [["a","1"], ["a","2"], ["b","1"], ["b","2"]]
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];

  return arrays.reduce<T[][]>(
    (acc, current) =>
      acc.flatMap((combo) => current.map((item) => [...combo, item])),
    [[]]
  );
}

// ============================================
// メイン処理
// ============================================

/**
 * テンプレート変数置換を実行する
 *
 * テンプレート内の {{変数名}} を各変数の値で置換し、
 * 全変数の値の直積（デカルト積）で組み合わせた結果を返す。
 */
export async function executeTemplateReplacer(
  rawInput: unknown
): Promise<TemplateReplacerResult> {
  const input = InputSchema.parse(rawInput);
  const { template, variables } = input;

  // テンプレート内の変数を検証
  for (const v of variables) {
    const pattern = `{{${v.name}}}`;
    if (!template.includes(pattern)) {
      return {
        success: false,
        message: `テンプレートに変数 "${v.name}" (${pattern}) が見つかりません`,
        results: [],
        totalCombinations: 0,
      };
    }
  }

  // 各変数の値の直積を計算
  const valueArrays = variables.map((v) => v.values);
  const combinations = cartesianProduct(valueArrays);

  // 各組み合わせでテンプレートを置換
  const results = combinations.map((combo) => {
    let result = template;
    variables.forEach((v, i) => {
      result = result.replaceAll(`{{${v.name}}}`, combo[i]);
    });
    return result;
  });

  return {
    success: true,
    message: `${results.length} 件の組み合わせを生成しました`,
    results,
    totalCombinations: results.length,
  };
}
