"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AutoResizeTextareaProps = React.ComponentProps<typeof Textarea>;

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(function AutoResizeTextarea(
  { className, onChange, value, ...props },
  forwardedRef
) {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const resize = React.useCallback((node: HTMLTextAreaElement | null) => {
    if (!node) return;

    node.style.height = "0px";
    node.style.height = `${node.scrollHeight}px`;
  }, []);

  const handleRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      assignRef(forwardedRef, node);
      resize(node);
    },
    [forwardedRef, resize]
  );

  React.useLayoutEffect(() => {
    resize(innerRef.current);
  }, [resize, value]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize(event.currentTarget);
      onChange?.(event);
    },
    [onChange, resize]
  );

  return (
    <Textarea
      {...props}
      ref={handleRef}
      value={value}
      onChange={handleChange}
      className={cn("resize-none overflow-hidden", className)}
    />
  );
});
