"use client";

import { Camera, Check, ChevronRight, Mic } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { assessment, type AnswerMode } from "./config";
import { AIOrb, AnswerStatus, AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

export default function ConversationStage({
  questionIndex,
  answerMode,
  answerElapsed,
  stream,
  onFinishAnswer,
}: {
  questionIndex: number;
  answerMode: AnswerMode;
  answerElapsed: number;
  stream: MediaStream | null;
  onFinishAnswer: () => void;
}) {
  const question = assessment.questions[questionIndex];
  const orbState = answerMode === "asking" ? "speaking" : answerMode === "answering" ? "listening" : "thinking";

  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label={`Interview / Question ${questionIndex + 1} of 4`} detail="Approximately 27 minutes remaining" progress={24 + questionIndex * 14} />
      <AssessmentFrame className="md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_var(--assessment-rail)]">
        <section className="flex h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] min-h-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-[var(--assessment-panel-pad)]">
            <Badge tone="neutral">{question.label}</Badge>
            <span className="text-xs font-medium text-muted">Question {questionIndex + 1} of 4</span>
          </div>

          <div className="grid min-h-0 flex-1 items-center gap-6 p-[var(--assessment-panel-pad)] text-center lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-8 lg:text-left">
            <div className="flex justify-center lg:border-r lg:border-line lg:pr-8">
              <AIOrb state={orbState} size="small" />
            </div>
            <div className="mx-auto max-w-3xl lg:mx-0">
              <h1 tabIndex={-1} data-stage-heading className="stage-focus short-mobile-question short-screen-question font-serif text-[clamp(1.8rem,2.5vw,2.65rem)] leading-[1.16] font-medium tracking-[-0.035em] text-ink">
                &ldquo;{question.prompt}&rdquo;
              </h1>
              <p className="short-mobile-hide mt-3 max-w-2xl text-sm leading-6 text-muted">{question.note}</p>
            </div>
          </div>

          <div className="shrink-0 border-t border-line p-[var(--assessment-panel-pad)]">
            <div className="mx-auto max-w-2xl">
              <AnswerStatus mode={answerMode} elapsed={answerElapsed} onDone={onFinishAnswer} />
            </div>
          </div>

          <div className="grid min-h-14 shrink-0 grid-cols-[minmax(0,1fr)_6rem] items-center gap-3 border-t border-line bg-surface-soft px-[var(--assessment-panel-pad)] py-2 text-xs text-muted md:flex md:min-h-11 md:flex-wrap md:justify-between md:gap-x-5 md:gap-y-2">
            <div className="min-w-0">
              <span className="flex items-center gap-2 font-medium text-ink-soft"><span className={cn("size-1.5 rounded-full", answerMode === "answering" ? "bg-danger" : answerMode === "saved" ? "bg-success" : "bg-muted")} /> <span className="truncate">{answerMode === "answering" ? "Answer capture is active" : "Proctoring remains active"}</span></span>
              <span className="mt-1.5 flex items-center gap-4 md:mt-0"><span className="flex items-center gap-1.5"><Camera className="size-3.5" /> Camera on</span><span className="flex items-center gap-1.5"><Mic className="size-3.5" /> Mic on</span></span>
            </div>
            <CandidatePreview stream={stream} className="w-full rounded-lg md:hidden" />
          </div>
        </section>

        <aside className="hidden items-start gap-[var(--assessment-gap)] md:grid md:h-full md:min-h-0 md:grid-cols-1 md:grid-rows-[auto_minmax(0,1fr)]">
          <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />

          <section className="hidden min-h-0 border-y border-line bg-transparent py-1 md:flex md:flex-col" aria-label="Assessment path">
            <p className="border-b border-line px-1 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Assessment path</p>
            <div className="flex flex-1 flex-col justify-center">
              {[
                ["Interview", "2 fixed questions", true],
                ["Coding", "12 minutes", false],
                ["Walkthrough", "3 minutes", false],
              ].map(([title, detail, active], index) => (
                <div key={String(title)} className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-1 py-4 last:border-b-0">
                  <span className={cn("font-mono text-xs font-semibold", active ? "text-ink" : "text-muted")}>{String(index + 1).padStart(2, "0")}</span>
                  <div><p className={cn("text-sm font-semibold", active ? "text-ink" : "text-ink-soft")}>{String(title)}</p><p className="mt-0.5 text-xs text-muted">{String(detail)}</p></div>
                  {active ? <Check className="size-4 text-success" aria-label="Current section" /> : <ChevronRight className="size-4 text-muted" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </AssessmentFrame>
    </main>
  );
}
