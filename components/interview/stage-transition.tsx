"use client";

import { AnimatePresence, motion, usePresence, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const SettledStage = createContext("");

export function StageTransition({ stageKey, busy, onComplete, children }: {
  stageKey: string;
  busy: boolean;
  onComplete: () => void;
  children: ReactNode;
}) {
  const [settledKey, setSettledKey] = useState(stageKey);
  return (
    <SettledStage.Provider value={settledKey}>
    <div className="relative isolate w-full overflow-clip bg-canvas">
      <AnimatePresence initial={false} mode="sync">
        <StageLayer key={stageKey} stageKey={stageKey} busy={busy} onComplete={() => { setSettledKey(stageKey); onComplete(); }}>
          {children}
        </StageLayer>
      </AnimatePresence>
    </div>
    </SettledStage.Provider>
  );
}

function StageLayer({ stageKey, busy, onComplete, children }: {
  stageKey: string;
  busy: boolean;
  onComplete: () => void;
  children: ReactNode;
}) {
  const [present, safeToRemove] = usePresence();
  const settledKey = useContext(SettledStage);
  useEffect(() => {
    if (!present && settledKey !== stageKey) safeToRemove?.();
  }, [present, safeToRemove, settledKey, stageKey]);
  const reduced = useReducedMotion();
  const duration = reduced ? 0 : 0.32;
  return (
    <motion.div
      className="assessment-stage"
      style={{ position: present ? "relative" : "absolute", inset: 0, zIndex: present ? 1 : 0 }}
      initial={{ opacity: reduced ? 1 : 0 }}
      animate="visible"
      variants={{ visible: { opacity: 1, transition: { duration, ease: [0.4, 0, 0.2, 1] } } }}
      // usePresence retains this opaque layer until the new layer completes.
      // Its lifetime is not tied to a guessed exit duration.
      onAnimationComplete={(definition) => {
        if (present && definition === "visible") onComplete();
      }}
      inert={!present || busy || undefined}
      aria-hidden={!present || undefined}
    >
      {children}
    </motion.div>
  );
}
