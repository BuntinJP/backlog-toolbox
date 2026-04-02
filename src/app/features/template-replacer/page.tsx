"use client";

import { useActionState, useCallback, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Copy,
  Plus,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoResizeTextarea } from "./_components/auto-resize-textarea";
import { runTemplateReplacer, type ActionState } from "./actions";

type ReplacementMode = "aligned" | "cartesian";

type Variable = {
  id: string;
  name: string;
  valuesText: string;
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
  const [sorted, setSorted] = useState(false);

  const addVariable = useCallback(() => {
    setVariables((prev) => [...prev, createVariable()]);
  }, []);

  const removeVariable = useCallback((id: string) => {
    setVariables((prev) => prev.filter((variable) => variable.id !== id));
  }, []);

  const updateVariable = useCallback(
    (id: string, field: keyof Variable, value: string) => {
      setVariables((prev) =>
        prev.map((variable) =>
          variable.id === id ? { ...variable, [field]: value } : variable
        )
      );
    },
    []
  );

  const handleModeChange = useCallback((value: string) => {
    if (value === "aligned" || value === "cartesian") {
      setMode(value);
    }
  }, []);

  const handleSubmit = useCallback(
    (formData: FormData) => {
      formData.set("template", template);

      const payload = variables
        .filter((variable) => variable.name.trim() !== "")
        .map((variable) => ({
          name: variable.name.trim(),
          values: variable.valuesText
            .split("\n")
            .map((entry) => entry.trim())
            .filter((entry) => entry !== ""),
        }));

      formData.set("variables", JSON.stringify(payload));
      formData.set("mode", mode);

      formAction(formData);
    },
    [formAction, mode, template, variables]
  );

  const displayResults = (state?.results ?? []).map((text, index) => ({
    originalIndex: index + 1,
    text,
  }));

  if (sorted) {
    displayResults.sort((left, right) => left.text.localeCompare(right.text));
  }

  const copyToClipboard = useCallback(
    async (text: string, successMessage: string) => {
      try {
        if (!navigator.clipboard) {
          throw new Error("Clipboard API is unavailable");
        }

        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
      } catch {
        toast.error("クリップボードへのコピーに失敗しました");
      }
    },
    []
  );

  const handleCopyResults = useCallback(async () => {
    if (displayResults.length === 0) return;

    await copyToClipboard(
      displayResults.map((item) => item.text).join("\n"),
      "全結果をコピーしました"
    );
  }, [copyToClipboard, displayResults]);

  const handleCopySingleResult = useCallback(
    async (text: string) => {
      await copyToClipboard(text, "1件コピーしました");
    },
    [copyToClipboard]
  );

  const configuredValueCounts = variables
    .filter(
      (variable) =>
        variable.name.trim() !== "" && variable.valuesText.trim() !== ""
    )
    .map(
      (variable) =>
        variable.valuesText.split("\n").filter((entry) => entry.trim()).length
    );

  const hasCountMismatch =
    mode === "aligned" &&
    configuredValueCounts.length > 1 &&
    configuredValueCounts.some((count) => count !== configuredValueCounts[0]);

  const previewCount =
    configuredValueCounts.length === 0
      ? 0
      : mode === "aligned"
        ? hasCountMismatch
          ? 0
          : configuredValueCounts[0]
        : configuredValueCounts.reduce(
            (total, count) => total * Math.max(count, 1),
            1
          );

  const modeLabel = mode === "aligned" ? "行対応" : "直積";

  return (
    <>
      <Navbar title="テンプレート変数置換" />

      <main className="flex-1 p-6">
        <form action={handleSubmit} className="mx-auto flex max-w-4xl flex-col gap-6">
          <Card className="border border-border/70 bg-card ring-0">
            <CardHeader>
              <CardTitle>テンプレート</CardTitle>
              <CardDescription>
                {"{{変数名}}"} の形式で変数を埋め込んでください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoResizeTextarea
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
                placeholder={"例: Hello {{name}}, you are {{role}}"}
                className="min-h-32 bg-background/70 font-mono leading-6"
                rows={5}
                required
              />
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card ring-0">
            <CardHeader>
              <CardTitle>置換方法</CardTitle>
              <CardDescription>
                標準は同じ行番号同士を対応させて置換します。必要な場合だけ、全組み合わせを作る直積生成に切り替えてください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={mode} onValueChange={handleModeChange}>
                <TabsList className="bg-background/70">
                  <TabsTrigger value="aligned">行対応</TabsTrigger>
                  <TabsTrigger value="cartesian">直積</TabsTrigger>
                </TabsList>
              </Tabs>

              <p className="text-xs text-muted-foreground">
                {mode === "aligned"
                  ? "1 行目同士、2 行目同士のように対応づけて置換します。複数変数を使う場合は値の数を揃えてください。"
                  : "各変数の全値の組み合わせを生成します。値が増えるほど出力件数も急激に増えます。"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card ring-0">
            <CardHeader>
              <CardTitle>置換変数</CardTitle>
              <CardDescription>
                各変数の値を改行区切りで入力してください
              </CardDescription>
              <CardAction>
                <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                  <Plus />
                  変数を追加
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              {variables.map((variable, index) => {
                const valueCount = variable.valuesText
                  .split("\n")
                  .filter((entry) => entry.trim()).length;

                return (
                  <div
                    key={variable.id}
                    className="grid gap-4 rounded-xl border border-border/60 bg-background/40 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0 space-y-3">
                      <Input
                        value={variable.name}
                        onChange={(event) =>
                          updateVariable(variable.id, "name", event.target.value)
                        }
                        placeholder="変数名 (例: name)"
                        className="bg-background/70"
                      />

                      <AutoResizeTextarea
                        value={variable.valuesText}
                        onChange={(event) =>
                          updateVariable(
                            variable.id,
                            "valuesText",
                            event.target.value
                          )
                        }
                        placeholder={"値を改行区切りで入力\n例:\nAlice\nBob"}
                        className="bg-background/70 font-mono leading-6"
                        rows={4}
                      />

                      {valueCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {valueCount} 個の値
                        </p>
                      )}
                    </div>

                    {variables.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeVariable(variable.id)}
                        className="self-start text-muted-foreground hover:text-destructive"
                        aria-label="変数を削除"
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                );
              })}

              {hasCountMismatch && (
                <Alert
                  variant="destructive"
                  className="border-destructive/30 bg-destructive/5"
                >
                  <TriangleAlert />
                  <AlertTitle>値数が一致していません</AlertTitle>
                  <AlertDescription>
                    行対応モードでは、各変数の値を同じ数だけ入力してください。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                予想出力数 ({modeLabel}):{" "}
                <span className="font-semibold text-foreground">{previewCount}</span>{" "}
                件
              </p>
              <p className="text-xs text-muted-foreground">
                {mode === "aligned"
                  ? hasCountMismatch
                    ? "値数が揃うまで行対応の出力数は確定できません。"
                    : "各変数の同じ行番号を組み合わせて件数を計算しています。"
                  : "値数の掛け合わせで件数を計算しています。"}
              </p>
            </div>

            <Button type="submit" disabled={isPending || hasCountMismatch}>
              <Sparkles />
              {isPending ? "処理中..." : "実行"}
            </Button>
          </div>
        </form>

        {state && (
          <div className="mx-auto mt-6 max-w-4xl">
            <Card
              className={`border ring-0 ${
                state.success
                  ? "border-border/70 bg-card"
                  : "border-destructive/30 bg-card"
              }`}
            >
              <CardHeader>
                <CardTitle>
                  {state.success
                    ? `結果 (${state.totalCombinations} 件)`
                    : "実行エラー"}
                </CardTitle>
                <CardDescription>{state.message}</CardDescription>
                {state.success && state.results.length > 0 && (
                  <CardAction className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={sorted ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSorted((prev) => !prev)}
                    >
                      <ArrowUpDown />
                      {sorted ? "ソート中" : "ソート"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyResults}
                    >
                      <Copy />
                      全てコピー
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                {state.success ? (
                  <div className="space-y-2">
                    {displayResults.map((item) => (
                      <div
                        key={`${item.originalIndex}-${item.text}`}
                        className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 px-4 py-3 font-mono text-sm text-foreground"
                      >
                        <button
                          type="button"
                          onClick={() => void handleCopySingleResult(item.text)}
                          className="group/copy relative flex h-8 w-14 shrink-0 items-center justify-center rounded-md text-xs tabular-nums text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          aria-label={`${item.originalIndex} 件目の結果をコピー`}
                        >
                          <span className="transition-opacity group-hover/copy:opacity-0 group-focus-visible/copy:opacity-0">
                            #{String(item.originalIndex).padStart(
                              String(state.results.length).length,
                              "0"
                            )}
                          </span>
                          <Copy className="pointer-events-none absolute size-3.5 opacity-0 transition-opacity group-hover/copy:opacity-100 group-focus-visible/copy:opacity-100" />
                        </button>
                        <span className="min-w-0 whitespace-pre-wrap break-words">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert
                    variant="destructive"
                    className="border-destructive/30 bg-destructive/5"
                  >
                    <TriangleAlert />
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
