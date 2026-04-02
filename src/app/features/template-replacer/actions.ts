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
    const templateEntry = formData.get("template");
    const variablesEntry = formData.get("variables");
    const modeEntry = formData.get("mode");
    const inputFormatEntry = formData.get("inputFormat");

    if (typeof templateEntry !== "string" || typeof variablesEntry !== "string") {
      throw new Error("入力データが不正です");
    }

    const variables: unknown = JSON.parse(variablesEntry);
    const mode = typeof modeEntry === "string" ? modeEntry : undefined;
    const inputFormat =
      typeof inputFormatEntry === "string" ? inputFormatEntry : undefined;

    const result = await executeTemplateReplacer({
      template: templateEntry,
      variables,
      mode,
      inputFormat,
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
