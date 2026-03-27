"use server";

import {
  executeTemplateReplacer,
  type TemplateReplacerResult,
} from "@/lib/template-replacer";

export type ActionState = TemplateReplacerResult | null;

export async function runTemplateReplacer(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const template = formData.get("template") as string;
    const variablesJson = formData.get("variables") as string;

    const variables = JSON.parse(variablesJson) as {
      name: string;
      values: string[];
    }[];

    const result = await executeTemplateReplacer({
      template,
      variables,
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    return {
      success: false,
      message,
      results: [],
      totalCombinations: 0,
    };
  }
}
