"use client";

import * as React from "react";
import { AutoResizeTextarea } from "./auto-resize-textarea";
import { cn } from "@/lib/utils";

type NumberedEditorProps = Omit<
  React.ComponentProps<typeof AutoResizeTextarea>,
  "className"
> & {
  className?: string;
  editorClassName?: string;
};

export function NumberedEditor({
  value,
  readOnly,
  className,
  editorClassName,
  ...props
}: NumberedEditorProps) {
  const lineCount = Math.max(1, String(value ?? "").split("\n").length);

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-border/70 bg-background/50 font-mono",
        className
      )}
    >
      <div className="border-r border-border/70 bg-muted/40 px-3 py-3 text-right text-xs leading-6 text-muted-foreground select-none">
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>

      <AutoResizeTextarea
        {...props}
        value={value}
        readOnly={readOnly}
        className={cn(
          "min-h-[11rem] rounded-none border-0 bg-transparent px-4 py-3 text-sm leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent",
          readOnly && "cursor-default text-muted-foreground",
          editorClassName
        )}
      />
    </div>
  );
}
