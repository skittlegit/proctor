"use client";

import { Camera, Mic } from "lucide-react";

import { assessment, formatTime, type AnswerMode } from "./config";
import { AIOrb, AnswerStatus, AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

export default function ConversationStage({
  questionIndex,
  answerMode,
  answerElapsed,
  sessionElapsed,
  stream,
  onFinishAnswer,
}: {
  questionIndex: number;
  answerMode: AnswerMode;
  answerElapsed: number;
  sessionElapsed: number;
  stream: MediaStream | null;
  onFinishAnswer: () => void;
}) {
  const question = assessment.questions[questionIndex];
  const orbState = answerMode === "asking" ? "speaking" : answerMode === "answering" ? "listening" : "thinking";
  const responseState = answerMode === "asking"
    ? {
        label: "Sia is speaking",
        detail: "Your microphone begins recording automatically when the prompt ends.",
      }
    : answerMode === "answering"
      ? {
          label: "Your response is live",
          detail: "Speak naturally, then select Done when you have finished.",
        }
      : {
          label: "Response captured",
          detail: "Your response is secure. The interview will continue automatically.",
        };

  return (
    <main id="assessment-main" className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Interview" detail={`${formatTime(sessionElapsed)} elapsed`} />
      <AssessmentFrame className="md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_var(--assessment-rail)]">
        <section className="flex h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] min-h-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full">
          <div className="grid shrink-0 grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 border-b border-line bg-surface-soft px-[var(--assessment-panel-pad)] py-2 text-xs text-muted md:hidden">
            <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
            <div className="min-w-0 space-y-1.5 text-left">
              <span className="block font-medium text-ink-soft">{responseState.label}</span>
              <span className="flex items-center gap-4"><span className="flex items-center gap-1.5"><Camera className="size-3.5" /> Camera on</span><span className="flex items-center gap-1.5"><Mic className="size-3.5" /> Mic on</span></span>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 content-center grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 px-[var(--assessment-panel-pad)] py-[var(--assessment-panel-pad)] text-left md:grid-cols-1 md:gap-6 md:text-center lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-8 lg:text-left">
            <div className="flex justify-center lg:border-r lg:border-line lg:pr-8">
              <AIOrb state={orbState} size="small" />
            </div>
            <div className="max-w-3xl md:mx-auto lg:mx-0">
              <h1 className="short-mobile-question short-screen-question font-serif text-[clamp(1.8rem,2.5vw,2.65rem)] leading-[1.16] font-medium tracking-[-0.035em] text-ink">
                &ldquo;{question.prompt}&rdquo;
              </h1>
              <p className="short-mobile-hide mt-3 max-w-2xl text-sm leading-6 text-muted">{question.note}</p>
            </div>
          </div>

          <div className="shrink-0 border-t border-line">
            <AnswerStatus mode={answerMode} elapsed={answerElapsed} onDone={onFinishAnswer} />
          </div>
        </section>

        <aside className="hidden gap-4 md:grid md:h-full md:min-h-0 md:grid-rows-[auto_minmax(0,1fr)]">
          <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
          <section className="flex min-h-0 flex-col justify-between border-y border-line py-5" aria-label="Live response status">
            <div className="px-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Live response</p>
              <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-ink-soft">{responseState.label}</h2>
              <p className="mt-2 text-xs leading-5 text-muted">{responseState.detail}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line px-1 pt-4 text-[11px] font-medium text-muted">
              <span className="flex items-center gap-1.5"><Camera className="size-3.5" /> Camera on</span>
              <span className="flex items-center gap-1.5"><Mic className="size-3.5" /> Mic on</span>
            </div>
          </section>
        </aside>
      </AssessmentFrame>
    </main>
  );
}
