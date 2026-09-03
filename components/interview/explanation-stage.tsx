"use client";

import { Camera, FileCode2, Mic } from "lucide-react";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";

import { codeLanguages, formatTime, type AnswerMode, type CodeLanguage } from "./config";
import { AIOrb, AnswerStatus, AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

const ReadOnlyCodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-0 flex-1 place-items-center bg-code-surface font-mono text-xs text-muted" role="status">
      Loading submitted code…
    </div>
  ),
});

export default function ExplanationStage({
  code,
  language,
  answerMode,
  answerElapsed,
  sessionElapsed,
  stream,
  onFinish,
}: {
  code: string;
  language: CodeLanguage;
  answerMode: AnswerMode;
  answerElapsed: number;
  sessionElapsed: number;
  stream: MediaStream | null;
  onFinish: () => void;
}) {
  const orbState = answerMode === "asking" ? "speaking" : answerMode === "answering" ? "listening" : "thinking";
  const languageConfig = codeLanguages[language];
  const responseState = answerMode === "asking"
    ? {
        label: "Sia is speaking",
        detail: "Your microphone begins recording automatically when the prompt ends.",
      }
    : answerMode === "answering"
      ? {
          label: "Your walkthrough is live",
          detail: "Explain your solution naturally, then select Finish when you are done.",
        }
      : {
          label: "Walkthrough captured",
          detail: "Your final response has been securely captured.",
        };

  return (
    <main id="assessment-main" className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Code walkthrough" detail={`${formatTime(sessionElapsed)} elapsed`} />
      <AssessmentFrame className="md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_var(--assessment-rail)]">
        <section className="flex h-[calc(100svh-var(--shell-total-header)-var(--assessment-outer)-var(--assessment-outer))] min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full">
          <div className="grid shrink-0 grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 border-b border-line bg-surface-soft px-[var(--assessment-panel-pad)] py-2 text-xs text-muted md:hidden">
            <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
            <div className="min-w-0 text-left">
              <span className="font-medium text-ink-soft">{responseState.label}</span>
              <span className="mt-1.5 flex items-center gap-4"><span className="flex items-center gap-1.5"><Camera className="size-3.5" /> Camera on</span><span className="flex items-center gap-1.5"><Mic className="size-3.5" /> Mic on</span></span>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 border-b border-line px-[var(--assessment-panel-pad)] pb-[var(--assessment-panel-pad)] pt-3 text-left md:p-[var(--assessment-panel-pad)] lg:grid-cols-[5rem_minmax(0,1fr)] lg:gap-5">
            <div><AIOrb state={orbState} size="small" /></div>
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                <span className="hidden md:inline">Sia</span>
                <span className="hidden size-1 rounded-full bg-line md:inline-block" />
                <span>Code walkthrough</span>
              </div>
              <h1 className="short-screen-question font-serif text-xl leading-[1.15] font-medium tracking-[-0.03em] text-ink md:text-[clamp(1.5rem,2vw,2.05rem)] md:leading-tight">
                &ldquo;Walk me through your approach and one tradeoff you considered.&rdquo;
              </h1>
            </div>
          </div>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-code-surface text-left" aria-label="Submitted solution, read only">
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-code-line px-[var(--assessment-panel-pad)] text-muted">
              <span className="flex items-center gap-2 text-xs font-semibold"><FileCode2 className="size-3.5" /> {languageConfig.fileName}</span>
              <Badge tone="neutral">{languageConfig.label} / Submitted</Badge>
            </div>
            <ReadOnlyCodeEditor code={code} language={language} readOnly />
          </section>

          <div className="shrink-0 border-t border-line">
            <AnswerStatus mode={answerMode} elapsed={answerElapsed} onDone={onFinish} doneLabel="Finish interview" />
          </div>
        </section>

        <aside className="hidden gap-4 md:grid md:h-full md:min-h-0 md:grid-rows-[auto_minmax(0,1fr)]" aria-label="Live walkthrough status">
          <CandidatePreview stream={stream} className="w-full rounded-[var(--assessment-radius)]" />
          <section className="flex min-h-0 flex-col justify-between border-y border-line py-5">
            <div className="px-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Your response</p>
              <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-ink-soft">{responseState.label}</h2>
              <p className="mt-2 text-xs leading-5 text-muted">{responseState.detail}</p>
            </div>
            <div className="mt-5 space-y-2 border-t border-line px-1 pt-4 text-[11px] font-medium text-muted">
              <span className="flex items-center gap-2"><Camera className="size-3.5" /> Camera on</span>
              <span className="flex items-center gap-2"><Mic className="size-3.5" /> Microphone on</span>
            </div>
          </section>
        </aside>
      </AssessmentFrame>
    </main>
  );
}
