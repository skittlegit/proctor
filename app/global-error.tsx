"use client";

import { useEffect } from "react";

import { SystemStateScreen } from "@/components/system-state-screen";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <title>PossoBuild is unavailable</title>
      </head>
      <body>
        <SystemStateScreen
          kind="error"
          code="500"
          eyebrow="System interruption"
          title="PossoBuild needs a fresh start."
          description="The application shell could not finish loading. Try again first; if the problem continues, return to the interview entry page."
          headerLabel="Service interruption"
          primaryLabel="Try again"
          onRetry={retry}
          reference={error.digest}
        />
      </body>
    </html>
  );
}
