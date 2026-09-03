"use client";

import { useEffect } from "react";

import { SystemStateScreen } from "@/components/system-state-screen";

export default function Error({
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
    <>
      <title>Something went wrong | PossoBuild</title>
      <SystemStateScreen
        kind="error"
        code="500"
        eyebrow="Temporary interruption"
        title="We couldn’t load this screen."
        description="Your current work is still safe in this browser. Try loading the screen again, or return to the interview entry page."
        headerLabel="Interview interrupted"
        primaryLabel="Try again"
        onRetry={retry}
        reference={error.digest}
      />
    </>
  );
}
