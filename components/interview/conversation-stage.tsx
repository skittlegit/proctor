"use client";

import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { assessment, type AnswerMode } from "./config";
import { AIOrb, AnswerStatus, AssessmentFrame, CandidatePreview, LockedDeviceStatus, RoomHeader } from "./shared";

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
          <section className="relative flex min-h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full md:min-h-0">
            <div className="pointer-events-none absolute left-1/3 top-1/4 size-[340px] rounded-full bg-brand-soft/70 blur-3xl" />
            <div className="relative flex h-12 shrink-0 items-center justify-between border-b border-line px-[var(--assessment-panel-pad)]">
              <Badge tone="neutral">{question.label}</Badge>
              <span className="text-xs font-medium text-muted">Question {questionIndex + 1} of 4</span>
            </div>

            <div className="relative grid min-h-0 flex-1 items-center gap-6 p-[var(--assessment-panel-pad)] text-center xl:grid-cols-[210px_minmax(0,1fr)] xl:gap-8 xl:text-left">
              <div className="flex justify-center xl:border-r xl:border-line xl:pr-8"><AIOrb state={orbState} /></div>
              <div className="mx-auto max-w-3xl xl:mx-0">
                <h1 tabIndex={-1} data-stage-heading className="stage-focus short-mobile-question font-serif text-[clamp(1.8rem,2.5vw,2.65rem)] leading-[1.16] font-medium tracking-[-0.035em] text-ink">
                  &ldquo;{question.prompt}&rdquo;
                </h1>
                <p className="short-mobile-hide mt-3 text-sm leading-6 text-muted">{question.note}</p>
              </div>
            </div>

            <div className="relative z-10 shrink-0 border-t border-line bg-surface/95 p-[var(--assessment-panel-pad)]">
              <div className="mx-auto max-w-2xl"><AnswerStatus mode={answerMode} elapsed={answerElapsed} onDone={onFinishAnswer} /></div>
            </div>
          </section>

          <aside className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-[var(--assessment-gap)] md:h-full md:min-h-0 md:grid-cols-1 md:grid-rows-[auto_auto_minmax(0,1fr)] md:content-start">
            <CandidatePreview stream={stream} className="w-full shrink-0" />
            <LockedDeviceStatus compact className="grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2" />
            <Card className="hidden min-h-0 overflow-hidden shadow-none md:block">
              <CardContent className="flex h-full min-h-0 flex-col p-[var(--assessment-panel-pad)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">Assessment path</p>
                <div className="flex flex-1 flex-col justify-center gap-4 py-3">
                  {[
                    ["Interview", "2 fixed questions", true],
                    ["Coding", "12 minutes", false],
                    ["Walkthrough", "3 minutes", false],
                  ].map(([title, detail, active], index) => (
                    <div key={String(title)} className="flex items-center gap-3">
                      <span className={cn("grid size-7 place-items-center rounded-full text-[11px] font-bold", active ? "bg-brand text-white" : "bg-surface-soft text-muted")}>{index + 1}</span>
                      <div><p className="text-sm font-semibold text-ink-soft">{String(title)}</p><p className="mt-0.5 text-xs text-muted">{String(detail)}</p></div>
                    </div>
                  ))}
                </div>
                <div className="short-screen-hide mt-auto flex items-start gap-2 border-t border-line pt-4 text-xs leading-5 text-muted"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" /> Responses advance only after you press Done.</div>
              </CardContent>
            </Card>
          </aside>
      </AssessmentFrame>
    </main>
  );
}
