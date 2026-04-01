"use client";

import { useActionState, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { runTemplateReplacer, type ActionState } from "./actions";

type ReplacementMode = "aligned" | "cartesian";

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
  const [mode, setMode] = useState<ReplacementMode>("aligned");
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
      formData.set("mode", mode);

      formAction(formData);
    },
    [template, variables, mode, formAction]
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

  const configuredVariables = variables
    .filter((v) => v.name.trim() !== "" && v.valuesText.trim() !== "")
    .map((v) => v.valuesText.split("\n").filter((s) => s.trim() !== "").length);
  const valueCounts = configuredVariables;
  const hasCountMismatch =
    mode === "aligned" &&
    valueCounts.length > 1 &&
    valueCounts.some((count) => count !== valueCounts[0]);
  const previewCount =
    valueCounts.length === 0
      ? 0
      : mode === "aligned"
        ? hasCountMismatch
          ? 0
          : valueCounts[0]
        : valueCounts.reduce((acc, count) => acc * Math.max(count, 1), 1);
  const modeLabel = mode === "aligned" ? "行対応" : "直積";

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

          <section className="bg-card-bg rounded-xl border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground mb-1">
              置換方法
            </h2>
            <p className="text-xs text-muted">
              標準は各変数の同じ行番号を対応させて置換します。必要な場合のみ、全組み合わせを作る直積生成に切り替えてください。
            </p>

            <div className="mt-4 inline-flex rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setMode("aligned")}
                className={`rounded-md px-4 py-2 text-sm transition-colors ${
                  mode === "aligned"
                    ? "bg-accent text-background"
                    : "text-muted hover:text-foreground"
                }`}
                aria-pressed={mode === "aligned"}
              >
                行対応
              </button>
              <button
                type="button"
                onClick={() => setMode("cartesian")}
                className={`rounded-md px-4 py-2 text-sm transition-colors ${
                  mode === "cartesian"
                    ? "bg-accent text-background"
                    : "text-muted hover:text-foreground"
                }`}
                aria-pressed={mode === "cartesian"}
              >
                直積
              </button>
            </div>

            <p className="text-xs text-muted mt-3">
              {mode === "aligned"
                ? "1行目同士、2行目同士のように対応づけて置換します。複数変数を使う場合は値の数を揃えてください。"
                : "各変数の全値の組み合わせを生成します。値が増えるほど出力件数も急激に増えます。"}
            </p>
          </section>

          {/* 変数入力 */}
          <section className="bg-card-bg rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  置換変数
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  各変数の値を改行区切りで入力してください
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

            {hasCountMismatch && (
              <p className="text-xs text-danger mt-4">
                行対応モードでは、各変数の値を同じ数だけ入力してください。
              </p>
            )}
          </section>

          {/* 実行ボタン */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">
                予想出力数 ({modeLabel}):{" "}
                <span className="font-bold text-foreground">{previewCount}</span>{" "}
                件
              </p>
              {mode === "cartesian" && previewCount > 0 && (
                <p className="text-xs text-muted mt-1">
                  値数の掛け合わせで件数を計算しています。
                </p>
              )}
            </div>
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
