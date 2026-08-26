import type * as React from "react";

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
  ...props
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
      className={cn("h-1 w-full overflow-hidden bg-surface-strong", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full bg-brand transition-[width] duration-500 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
}
