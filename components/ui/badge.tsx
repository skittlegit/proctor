import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "sage" | "neutral" | "success" | "amber" | "red";
};

const tones = {
  sage: "bg-brand text-on-brand",
  neutral: "bg-surface-soft text-ink-soft",
  success: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
};

export function Badge({ className, tone = "sage", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tracking-[0.01em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
