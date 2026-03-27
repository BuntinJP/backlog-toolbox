"use client";

import { useActionState, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { runTemplateReplacer, type ActionState } from "./actions";

type Variable = {
  id: string;
  name: string;
  valuesText: string; // 改行区切りで複数値
};

function createVariable(): Variable {
  return {
    id: crypto.randomUUID(),
    name: "",
    valuesText: "",
  };
}

export default function TemplateReplacerPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    runTemplateReplacer,
    null
  );
  const [template, setTemplate] = useState("");
  const [variables, setVariables] = useState<Variable[]>([createVariable()]);
  const [copied, setCopied] = useState(false);
  const [sorted, setSorted] = useState(false);

  const addVariable = useCallback(() => {
    setVariables((prev) => [...prev, createVariable()]);
  }, []);

  const removeVariable = useCallback((id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const updateVariable = useCallback(
    (id: string, field: keyof Variable, value: string) => {
      setVariables((prev) =>
        prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
      );
    },
    []
  );

  const handleSubmit = useCallback(
    (formData: FormData) => {
      // テンプレートをFormDataに追加
      formData.set("template", template);

      // 変数をJSON化してFormDataに追加
      const vars = variables
        .filter((v) => v.name.trim() !== "")
        .map((v) => ({
          name: v.name.trim(),
          values: v.valuesText
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s !== ""),
        }));
      formData.set("variables", JSON.stringify(vars));

      formAction(formData);
    },
    [template, variables, formAction]
  );

  const handleCopyResults = useCallback(async () => {
    if (!state?.results.length) return;
    const items = displayResults.map((r) => r.text);
    await navigator.clipboard.writeText(items.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [state, sorted]);

  // ソート済み結果（元の生成番号を保持）
  const displayResults = (state?.results ?? []).map((text, i) => ({
    originalIndex: i + 1,
    text,
  }));
  if (sorted) {
    displayResults.sort((a, b) => a.text.localeCompare(b.text));
  }

  // 組み合わせ数のプレビュー計算
  const previewCount = variables
    .filter((v) => v.name.trim() !== "" && v.valuesText.trim() !== "")
    .reduce((acc, v) => {
      const count = v.valuesText
        .split("\n")
        .filter((s) => s.trim() !== "").length;
      return acc * Math.max(count, 1);
    }, 1);

  return (
    <>
      <Navbar title="テンプレート変数置換" />

      <main className="flex-1 p-6">
        <form action={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* テンプレート入力 */}
          <section className="bg-card-bg rounded-xl border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground mb-1">
              テンプレート
            </h2>
            <p className="text-xs text-muted mb-3">
              {"{{変数名}}"} の形式で変数を埋め込んでください
            </p>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder={"例: Hello {{name}}, you are {{role}}"}
              className="w-full h-32 bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground font-mono resize-y focus:outline-none focus:border-accent transition-colors"
              required
            />
          </section>

          {/* 変数入力 */}
          <section className="bg-card-bg rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  置換変数
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  各変数の値を改行区切りで入力（値の数の直積 = 出力数）
                </p>
              </div>
              <button
                type="button"
                onClick={addVariable}
                className="btn btn-secondary text-xs"
              >
                ＋ 変数を追加
              </button>
            </div>

            <div className="space-y-4">
              {variables.map((variable, index) => (
                <div
                  key={variable.id}
                  className="flex gap-4 items-start bg-background/50 rounded-lg p-4 border border-border/50"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) =>
                        updateVariable(variable.id, "name", e.target.value)
                      }
                      placeholder="変数名 (例: name)"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                    />
                    <textarea
                      value={variable.valuesText}
                      onChange={(e) =>
                        updateVariable(
                          variable.id,
                          "valuesText",
                          e.target.value
                        )
                      }
                      placeholder={"値を改行区切りで入力\n例:\nAlice\nBob"}
                      className="w-full h-24 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono resize-y focus:outline-none focus:border-accent transition-colors"
                    />
                    {variable.valuesText.trim() && (
                      <p className="text-xs text-muted">
                        {
                          variable.valuesText
                            .split("\n")
                            .filter((s) => s.trim()).length
                        }{" "}
                        個の値
                      </p>
                    )}
                  </div>

                  {variables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariable(variable.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg bg-transparent text-muted hover:text-danger hover:bg-danger/10 flex items-center justify-center text-sm transition-colors cursor-pointer border-none"
                      aria-label="変数を削除"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 実行ボタン */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              予想出力数:{" "}
              <span className="font-bold text-foreground">{previewCount}</span>{" "}
              件
            </p>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? "⏳ 処理中..." : "▶ 実行"}
            </button>
          </div>
        </form>

        {/* 結果表示 */}
        {state && (
          <div className="max-w-4xl mx-auto mt-6">
            <section
              className={`rounded-xl border p-6 ${
                state.success
                  ? "bg-card-bg border-border"
                  : "bg-danger/5 border-danger/30"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  {state.success
                    ? `✅ 結果 (${state.totalCombinations} 件)`
                    : "❌ エラー"}
                </h2>
                {state.success && state.results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSorted((prev) => !prev)}
                      className={`btn text-xs ${sorted ? "btn-primary" : "btn-secondary"}`}
                    >
                      {sorted ? "🔤 ソート中" : "🔤 ソート"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyResults}
                      className="btn btn-secondary text-xs"
                    >
                      {copied ? "✓ コピー済み" : "📋 全てコピー"}
                    </button>
                  </div>
                )}
              </div>

              {state.success ? (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {displayResults.map((item, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 bg-background/50 rounded-lg text-sm text-foreground font-mono border border-border/30 flex items-baseline gap-3"
                    >
                      <span className="text-muted text-xs select-none shrink-0 tabular-nums">
                        #{String(item.originalIndex).padStart(
                          String(state.results.length).length,
                          "0"
                        )}
                      </span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-danger">{state.message}</p>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
