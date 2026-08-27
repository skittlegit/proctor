"use client";

import { Camera, FileCode2, Mic } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { codeLanguages, type AnswerMode, type CodeLanguage } from "./config";
import { AIOrb, AnswerStatus, AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

export default function ExplanationStage({
  code,
  language,
  answerMode,
  answerElapsed,
  stream,
  onFinish,
}: {
  code: string;
  language: CodeLanguage;
  answerMode: AnswerMode;
  answerElapsed: number;
  stream: MediaStream | null;
  onFinish: () => void;
}) {
  const orbState = answerMode === "asking" ? "speaking" : answerMode === "answering" ? "listening" : "thinking";
  const languageConfig = codeLanguages[language];

  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Walkthrough / Question 4 of 4" detail="3 min left" progress={86} />
      <AssessmentFrame className="md:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
        <section className="hidden overflow-hidden rounded-[var(--assessment-radius)] border border-white/10 bg-editor md:order-1 md:flex md:h-full md:min-h-0 md:flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-[var(--assessment-panel-pad)] text-white/70">
            <div className="flex items-center gap-2 text-xs font-semibold"><FileCode2 className="size-4" /> {languageConfig.fileName}</div>
            <Badge className="bg-white/10 text-white/75">{languageConfig.label} · Read only</Badge>
          </div>
          <div className="grid flex-1 grid-cols-[46px_minmax(0,1fr)] overflow-hidden lg:min-h-0">
            <div className="select-none border-r border-white/10 bg-editor-soft py-4 pr-3 text-right font-mono text-xs leading-6 text-white/50">{code.split("\n").map((_, index) => <div key={index}>{index + 1}</div>)}</div>
            <pre className="overflow-auto p-4 font-mono text-sm leading-6 whitespace-pre text-white/85">{code}</pre>
          </div>
        </section>

        <section className="order-1 flex h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] min-h-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:order-2 md:h-full">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-[var(--assessment-panel-pad)]">
            <Badge tone="neutral">Walkthrough</Badge>
            <span className="text-xs font-medium text-muted">Question 4 of 4</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-3 overflow-hidden p-[var(--assessment-panel-pad)] text-center md:justify-center md:gap-4 md:overflow-y-auto">
            <div className="grid w-full shrink-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 text-left md:flex md:max-w-xl md:flex-col md:text-center">
              <AIOrb state={orbState} size="small" />
              <div>
                <h1 tabIndex={-1} data-stage-heading className="stage-focus short-screen-question font-serif text-xl leading-[1.15] font-medium tracking-[-0.03em] text-ink md:text-[clamp(1.65rem,2.3vw,2.25rem)] md:leading-tight">&ldquo;Walk me through your approach and one tradeoff you considered.&rdquo;</h1>
                <p className="short-screen-hide mt-3 hidden text-sm leading-6 text-muted md:block">Your submitted code stays visible while your response is captured.</p>
              </div>
            </div>

            <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-white/10 bg-editor text-left md:hidden" aria-label="Submitted solution, read only">
              <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-3 text-white/70">
                <span className="flex items-center gap-2 text-xs font-semibold"><FileCode2 className="size-3.5" /> {languageConfig.fileName}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">{languageConfig.label} · Read only</span>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-[36px_minmax(0,1fr)] overflow-hidden">
                <div className="select-none overflow-hidden border-r border-white/10 bg-editor-soft py-2.5 pr-2 text-right font-mono text-[10px] leading-5 text-white/40">{code.split("\n").map((_, index) => <div key={index}>{index + 1}</div>)}</div>
                <pre className="overflow-auto p-2.5 font-mono text-xs leading-5 whitespace-pre text-white/85">{code}</pre>
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-line p-3 lg:p-[var(--assessment-panel-pad)]">
            <div className="mx-auto max-w-md"><AnswerStatus mode={answerMode} elapsed={answerElapsed} onDone={onFinish} doneLabel="Finish interview" /></div>
          </div>

          <div className="grid min-h-14 shrink-0 grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-3 border-t border-line bg-surface-soft px-[var(--assessment-panel-pad)] py-2">
            <div className="text-left">
              <p className="flex items-center gap-2 text-xs font-semibold text-ink-soft"><span className={`size-1.5 rounded-full ${answerMode === "answering" ? "bg-danger" : answerMode === "saved" ? "bg-success" : "bg-muted"}`} /> {answerMode === "answering" ? "Answer capture is active" : "Camera and microphone remain on"}</p>
              <p className="short-screen-hide mt-1 hidden text-xs leading-5 text-muted md:block">Approach · complexity · edge cases · tradeoffs</p>
              <div className="mt-1.5 flex gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5" aria-label="Camera on"><Camera className="size-3.5" /><span className="hidden md:inline">Camera on</span></span>
                <span className="flex items-center gap-1.5" aria-label="Microphone on"><Mic className="size-3.5" /><span className="hidden md:inline">Microphone on</span></span>
              </div>
            </div>
            <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
          </div>
        </section>
      </AssessmentFrame>
    </main>
  );
}
