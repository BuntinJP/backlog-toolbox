"use client";

import { useActionState, useCallback, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Copy,
  ListOrdered,
  Plus,
  Regex,
  Rows3,
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
import { NumberedEditor } from "./_components/numbered-editor";
import { runTemplateReplacer, type ActionState } from "./actions";

type ReplacementMode = "aligned" | "cartesian";
type InputFormat = "by-variable" | "by-line";

type VariableSlot = {
  id: string;
  name: string;
  valuesText: string;
};

type NormalizedVariable = {
  name: string;
  values: string[];
};

type ParsedLineError = {
  lineNumber: number;
  text: string;
};

type RegexParseResult = {
  variableNames: string[];
  variables: NormalizedVariable[];
  rowCount: number;
  lineErrors: ParsedLineError[];
  generalError: string | null;
};

function createVariableSlot(name: string, valuesText = ""): VariableSlot {
  return {
    id: crypto.randomUUID(),
    name,
    valuesText,
  };
}

function splitNonEmptyLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

function reconcileVariableSlots(
  previous: VariableSlot[],
  nextNames: string[]
): VariableSlot[] {
  return nextNames.map((name, index) => {
    const existing = previous[index];
    if (!existing) {
      return createVariableSlot(name);
    }

    return {
      ...existing,
      name,
    };
  });
}

function buildVariableNameText(slots: VariableSlot[]): string {
  return slots.map((slot) => slot.name).join("\n");
}

function extractNamedCaptureGroups(pattern: string): string[] {
  return Array.from(
    new Set(
      Array.from(pattern.matchAll(/\(\?<([A-Za-z][A-Za-z0-9_]*)>/g), (match) => {
        return match[1];
      })
    )
  );
}

function normalizeVariableSlots(slots: VariableSlot[]): NormalizedVariable[] {
  return slots.map((slot) => ({
    name: slot.name,
    values: splitNonEmptyLines(slot.valuesText),
  }));
}

function parseRegexInput(
  sourceText: string,
  pattern: string,
  flags: string
): RegexParseResult {
  const variableNames = extractNamedCaptureGroups(pattern);
  const normalizedFlags = flags.trim();

  if (pattern.trim() === "") {
    return {
      variableNames,
      variables: [],
      rowCount: 0,
      lineErrors: [],
      generalError: "pattern を入力してください",
    };
  }

  if (/[gy]/.test(normalizedFlags)) {
    return {
      variableNames,
      variables: [],
      rowCount: 0,
      lineErrors: [],
      generalError: "flags では g と y は利用できません",
    };
  }

  if (variableNames.length === 0) {
    return {
      variableNames,
      variables: [],
      rowCount: 0,
      lineErrors: [],
      generalError: "名前付きキャプチャを少なくとも1つ定義してください",
    };
  }

  let regex: RegExp;

  try {
    regex = new RegExp(`^(?:${pattern})$`, normalizedFlags);
  } catch (error) {
    return {
      variableNames,
      variables: [],
      rowCount: 0,
      lineErrors: [],
      generalError:
        error instanceof Error ? error.message : "正規表現が不正です",
    };
  }

  const rows: Record<string, string>[] = [];
  const lineErrors: ParsedLineError[] = [];

  sourceText.split("\n").forEach((line, index) => {
    if (line.trim() === "") return;

    const match = regex.exec(line);

    if (!match) {
      lineErrors.push({
        lineNumber: index + 1,
        text: line,
      });
      return;
    }

    const groups = match.groups ?? {};
    const row: Record<string, string> = {};

    variableNames.forEach((name) => {
      row[name] = groups[name] ?? "";
    });

    rows.push(row);
  });

  return {
    variableNames,
    variables: variableNames.map((name) => ({
      name,
      values: rows.map((row) => row[name] ?? ""),
    })),
    rowCount: rows.length,
    lineErrors,
    generalError: null,
  };
}

export default function TemplateReplacerPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    runTemplateReplacer,
    null
  );
  const [template, setTemplate] = useState("");
  const [mode, setMode] = useState<ReplacementMode>("aligned");
  const [inputFormat, setInputFormat] = useState<InputFormat>("by-variable");
  const [sorted, setSorted] = useState(false);

  const [variableSlots, setVariableSlots] = useState<VariableSlot[]>([
    createVariableSlot("var1"),
  ]);
  const [variableNamesText, setVariableNamesText] = useState("var1");

  const [lineSourceText, setLineSourceText] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [regexFlags, setRegexFlags] = useState("");

  const syncVariableNames = useCallback((nextText: string) => {
    setVariableNamesText(nextText);
    setVariableSlots((previous) =>
      reconcileVariableSlots(previous, splitNonEmptyLines(nextText))
    );
  }, []);

  const addVariable = useCallback(() => {
    const nextIndex = splitNonEmptyLines(variableNamesText).length + 1;
    const nextText =
      variableNamesText.trim() === ""
        ? `var${nextIndex}`
        : `${variableNamesText}\nvar${nextIndex}`;

    syncVariableNames(nextText);
  }, [syncVariableNames, variableNamesText]);

  const removeVariable = useCallback(
    (index: number) => {
      const nextSlots = variableSlots.filter((_, currentIndex) => currentIndex !== index);
      setVariableSlots(nextSlots);
      setVariableNamesText(buildVariableNameText(nextSlots));
    },
    [variableSlots]
  );

  const updateVariableValue = useCallback((id: string, value: string) => {
    setVariableSlots((previous) =>
      previous.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              valuesText: value,
            }
          : slot
      )
    );
  }, []);

  const handleModeChange = useCallback(
    (value: string) => {
      if (value !== "aligned" && value !== "cartesian") return;

      if (value === "cartesian" && inputFormat === "by-line") {
        setInputFormat("by-variable");
        toast.info("1行で入力は行対応モード専用のため、変数ずつへ切り替えました");
      }

      setMode(value);
    },
    [inputFormat]
  );

  const handleInputFormatChange = useCallback(
    (value: string) => {
      if (value !== "by-variable" && value !== "by-line") return;
      if (value === "by-line" && mode === "cartesian") return;
      setInputFormat(value);
    },
    [mode]
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

  const normalizedByVariable = normalizeVariableSlots(variableSlots);
  const byLineParseResult = parseRegexInput(
    lineSourceText,
    regexPattern,
    regexFlags
  );

  const activeVariables =
    inputFormat === "by-variable" ? normalizedByVariable : byLineParseResult.variables;

  const valueCounts = activeVariables.map((variable) => variable.values.length);
  const hasCountMismatch =
    mode === "aligned" &&
    valueCounts.length > 1 &&
    valueCounts.some((count) => count !== valueCounts[0]);

  const hasEmptyVariables =
    activeVariables.length === 0 ||
    activeVariables.some(
      (variable) => variable.name.trim() === "" || variable.values.length === 0
    );

  const isByLineInvalid =
    inputFormat === "by-line" &&
    (byLineParseResult.generalError !== null ||
      byLineParseResult.lineErrors.length > 0 ||
      byLineParseResult.variables.length === 0 ||
      byLineParseResult.rowCount === 0);

  const previewCount =
    inputFormat === "by-line"
      ? byLineParseResult.rowCount
      : valueCounts.length === 0
        ? 0
        : mode === "aligned"
          ? hasCountMismatch
            ? 0
            : valueCounts[0]
          : valueCounts.reduce((total, count) => total * Math.max(count, 1), 1);

  const modeLabel = mode === "aligned" ? "行対応" : "直積";
  const isSubmitDisabled =
    isPending ||
    hasEmptyVariables ||
    hasCountMismatch ||
    isByLineInvalid;

  const handleSubmit = useCallback(
    (formData: FormData) => {
      formData.set("template", template);
      formData.set("variables", JSON.stringify(activeVariables));
      formData.set("mode", mode);
      formData.set("inputFormat", inputFormat);
      formAction(formData);
    },
    [activeVariables, formAction, inputFormat, mode, template]
  );

  return (
    <>
      <Navbar title="テンプレート変数置換" />

      <main className="flex-1 p-6">
        <form action={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-6">
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
              <CardTitle>置換設定</CardTitle>
              <CardDescription>
                行対応か直積かを選び、続けて変数の入力形式を選択してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">モード</p>
                <Tabs value={mode} onValueChange={handleModeChange}>
                  <TabsList className="bg-background/70">
                    <TabsTrigger value="aligned">
                      <Rows3 />
                      行対応
                    </TabsTrigger>
                    <TabsTrigger value="cartesian">
                      <ListOrdered />
                      直積
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground">
                  {mode === "aligned"
                    ? "同じ行番号の値同士を対応づけて 1 件ずつ生成します。"
                    : "各変数の全ての値の組み合わせを生成します。"}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">入力形式</p>
                <Tabs value={inputFormat} onValueChange={handleInputFormatChange}>
                  <TabsList className="bg-background/70">
                    <TabsTrigger value="by-variable">変数ずつ</TabsTrigger>
                    <TabsTrigger
                      value="by-line"
                      disabled={mode === "cartesian"}
                    >
                      1行で
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground">
                  {inputFormat === "by-variable"
                    ? "変数名欄で定義した順に、各変数値欄を編集します。"
                    : "1 行ごとに正規表現で値を抽出し、名前付きキャプチャを変数名として扱います。"}
                </p>
              </div>
            </CardContent>
          </Card>

          {inputFormat === "by-variable" ? (
            <Card className="border border-border/70 bg-card ring-0">
              <CardHeader>
                <CardTitle>変数入力</CardTitle>
                <CardDescription>
                  変数名欄の 1 行が 1 変数です。変数値欄はその順序に追従します。
                </CardDescription>
                <CardAction>
                  <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                    <Plus />
                    変数を追加
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      変数名欄
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      1 行に 1 つずつ変数名を記述します。空行は無視されます。
                    </p>
                  </div>
                  <NumberedEditor
                    value={variableNamesText}
                    onChange={(event) => syncVariableNames(event.target.value)}
                    placeholder={"var1\nvar2"}
                  />
                </section>

                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      変数値欄
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      変数名欄の順に表示されます。各欄は改行ごとに値を扱います。
                    </p>
                  </div>

                  {variableSlots.length > 0 ? (
                    <div className="space-y-4">
                      {variableSlots.map((slot, index) => (
                        <div
                          key={slot.id}
                          className="rounded-xl border border-border/60 bg-background/40 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-semibold text-foreground">
                                {slot.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                変数値欄
                              </p>
                            </div>
                            {variableSlots.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeVariable(index)}
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={`${slot.name} を削除`}
                              >
                                <X />
                              </Button>
                            )}
                          </div>

                          <AutoResizeTextarea
                            value={slot.valuesText}
                            onChange={(event) =>
                              updateVariableValue(slot.id, event.target.value)
                            }
                            placeholder={"値を改行区切りで入力\n例:\nAlice\nBob"}
                            className="bg-background/70 font-mono leading-6"
                            rows={4}
                          />

                          <p className="mt-3 text-xs text-muted-foreground">
                            {splitNonEmptyLines(slot.valuesText).length} 個の値
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/70 bg-background/30 px-4 py-6 text-sm text-muted-foreground">
                      変数名欄に 1 行以上入力すると、対応する変数値欄が表示されます。
                    </div>
                  )}
                </section>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border/70 bg-card ring-0">
              <CardHeader>
                <CardTitle>1行で入力</CardTitle>
                <CardDescription>
                  各行を正規表現で解釈します。名前付きキャプチャがそのまま変数名になります。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <section className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_8rem]">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        pattern
                      </label>
                      <Input
                        value={regexPattern}
                        onChange={(event) => setRegexPattern(event.target.value)}
                        placeholder="(?<name>[^,]+),(?<role>.+)"
                        className="bg-background/70 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        flags
                      </label>
                      <Input
                        value={regexFlags}
                        onChange={(event) => setRegexFlags(event.target.value)}
                        placeholder="i"
                        className="bg-background/70 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        変数値欄
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        1 行に 1 レコードを記述し、行ごとに正規表現で抽出します。
                      </p>
                    </div>
                    <NumberedEditor
                      value={lineSourceText}
                      onChange={(event) => setLineSourceText(event.target.value)}
                      placeholder={"Alice,admin\nBob,user"}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Regex className="size-4" />
                      変数名欄
                    </div>
                    <p className="text-xs text-muted-foreground">
                      名前付きキャプチャから自動生成されます。
                    </p>
                    <NumberedEditor
                      value={byLineParseResult.variableNames.join("\n")}
                      readOnly
                    />
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">
                      抽出行数: {byLineParseResult.rowCount}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      各行は `^(?:pattern)$` として完全一致で評価されます。
                    </p>
                  </div>
                </section>
              </CardContent>
            </Card>
          )}

          {(hasCountMismatch || isByLineInvalid) && (
            <Alert
              variant="destructive"
              className="border-destructive/30 bg-destructive/5"
            >
              <TriangleAlert />
              <AlertTitle>入力を確認してください</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  {hasCountMismatch && (
                    <p>
                      行対応モードでは、全ての変数値欄の行数を一致させる必要があります。
                    </p>
                  )}

                  {byLineParseResult.generalError && (
                    <p>{byLineParseResult.generalError}</p>
                  )}

                  {byLineParseResult.lineErrors.length > 0 && (
                    <div className="space-y-1">
                      {byLineParseResult.lineErrors.map((error) => (
                        <p key={`${error.lineNumber}-${error.text}`}>
                          {error.lineNumber} 行目を pattern で解釈できません:{" "}
                          <span className="font-mono">{error.text}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                予想出力数 ({modeLabel}):{" "}
                <span className="font-semibold text-foreground">{previewCount}</span>{" "}
                件
              </p>
              <p className="text-xs text-muted-foreground">
                {inputFormat === "by-line"
                  ? "正規表現で抽出できた行数が、そのまま出力件数になります。"
                  : mode === "aligned"
                    ? hasCountMismatch
                      ? "行数が揃うまで行対応の出力数は確定できません。"
                      : "各変数値欄の同じ行番号を組み合わせて件数を計算しています。"
                    : "各変数値欄の行数を掛け合わせて件数を計算しています。"}
              </p>
            </div>

            <Button type="submit" disabled={isSubmitDisabled}>
              <Sparkles />
              {isPending ? "処理中..." : "実行"}
            </Button>
          </div>
        </form>

        {state && (
          <div className="mx-auto mt-6 max-w-6xl">
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
