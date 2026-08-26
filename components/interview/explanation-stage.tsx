"use client";

import { Camera, FileCode2, Mic } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { type AnswerMode } from "./config";
import { AIOrb, AnswerStatus, AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

export default function ExplanationStage({
  code,
  answerMode,
  answerElapsed,
  stream,
  onFinish,
}: {
  code: string;
  answerMode: AnswerMode;
  answerElapsed: number;
  stream: MediaStream | null;
  onFinish: () => void;
}) {
  const orbState = answerMode === "asking" ? "speaking" : answerMode === "answering" ? "listening" : "thinking";

  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Walkthrough / Question 4 of 4" detail="Approximately 3 minutes remaining" progress={86} />
      <AssessmentFrame className="md:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
        <section className="order-2 flex min-h-[320px] max-h-[360px] flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-white/10 bg-editor md:order-1 md:h-full md:max-h-none md:min-h-0">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-[var(--assessment-panel-pad)] text-white/70">
            <div className="flex items-center gap-2 text-xs font-semibold"><FileCode2 className="size-4" /> Submitted solution</div>
            <Badge className="bg-white/10 text-white/75">Read only</Badge>
          </div>
          <div className="grid flex-1 grid-cols-[46px_minmax(0,1fr)] overflow-hidden lg:min-h-0">
            <div className="select-none border-r border-white/10 bg-editor-soft py-4 pr-3 text-right font-mono text-xs leading-6 text-white/50">{code.split("\n").map((_, index) => <div key={index}>{index + 1}</div>)}</div>
            <pre className="overflow-auto p-4 font-mono text-sm leading-6 whitespace-pre text-white/85">{code}</pre>
          </div>
        </section>

        <section className="order-1 flex min-h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:order-2 md:h-full md:min-h-0">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-[var(--assessment-panel-pad)]">
            <Badge tone="neutral">Walkthrough</Badge>
            <span className="text-xs font-medium text-muted">Question 4 of 4</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 p-[var(--assessment-panel-pad)] text-center">
            <AIOrb state={orbState} size="small" />
            <div className="max-w-xl">
              <h1 tabIndex={-1} data-stage-heading className="stage-focus short-mobile-question font-serif text-[clamp(1.65rem,2.3vw,2.25rem)] leading-tight font-medium tracking-[-0.03em] text-ink">&ldquo;Walk me through your approach and one tradeoff you considered.&rdquo;</h1>
              <p className="short-mobile-hide mt-3 text-sm leading-6 text-muted">Your submitted code stays visible while your response is captured.</p>
            </div>
          </div>

          <div className="shrink-0 border-t border-line p-[var(--assessment-panel-pad)]">
            <div className="mx-auto max-w-md"><AnswerStatus mode={answerMode} elapsed={answerElapsed} onDone={onFinish} doneLabel="Finish interview" /></div>
          </div>

          <div className="grid min-h-16 shrink-0 grid-cols-[minmax(0,1fr)_7rem] items-center gap-4 border-t border-line bg-surface-soft px-[var(--assessment-panel-pad)] py-2">
            <div className="text-left">
              <p className="flex items-center gap-2 text-xs font-semibold text-ink-soft"><span className={`size-1.5 rounded-full ${answerMode === "answering" ? "bg-danger" : answerMode === "saved" ? "bg-success" : "bg-muted"}`} /> {answerMode === "answering" ? "Answer capture is active" : "Camera and microphone remain on"}</p>
              <p className="mt-1 text-xs leading-5 text-muted">Approach · complexity · edge cases · tradeoffs</p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted"><span className="flex items-center gap-1.5"><Camera className="size-3.5" /> Camera on</span><span className="flex items-center gap-1.5"><Mic className="size-3.5" /> Microphone on</span></div>
            </div>
            <CandidatePreview stream={stream} className="w-full rounded-lg" />
          </div>
        </section>
      </AssessmentFrame>
    </main>
  );
}
