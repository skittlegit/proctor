"use client";

import { useCallback, useRef, useState } from "react";

export function useStageTransition<T>(commit: (action: T) => void) {
  const [phase, setPhase] = useState<"idle" | "entering">("idle");
  const busy = useRef(false);
  const navigate = useCallback((action: T) => {
    if (busy.current) return;
    busy.current = true;
    setPhase("entering");
    commit(action);
  }, [commit]);
  const onAnimationComplete = useCallback(() => {
    busy.current = false;
    setPhase("idle");
  }, []);
  return { phase, navigate, onAnimationComplete };
}
