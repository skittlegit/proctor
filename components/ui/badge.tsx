import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "sage" | "neutral" | "amber" | "red";
};

const tones = {
  sage: "bg-brand-soft text-brand",
  neutral: "bg-surface-soft text-ink-soft",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-danger-soft text-danger",
};

export function Badge({ className, tone = "sage", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.025em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
