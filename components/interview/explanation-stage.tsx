"use client";

import { FileCode2, LockKeyhole } from "lucide-react";
import ReadOnlyCodeEditor from "./code-editor";

import { Badge } from "@/components/ui/badge";

import { codeLanguages, formatTime, type AnswerMode, type CodeLanguage } from "./config";
import { AIOrb, AnswerStatus, AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";

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

  return (
    <main id="assessment-main" className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Code walkthrough" detail={`${formatTime(sessionElapsed)} elapsed`} />
      <AssessmentFrame className="md:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
            <section aria-labelledby="walkthrough-title" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full">
              <div className="min-h-0 flex-1 overflow-y-auto p-[var(--assessment-panel-pad)]">
                <div className="flex min-h-full flex-col justify-center gap-6 py-4 text-center">
                <div className="flex justify-center"><AIOrb state={orbState} size="small" /></div>
                <div>
                <h1 id="walkthrough-title" className="short-mobile-question short-screen-question text-balance font-serif text-[clamp(1.8rem,2.5vw,2.65rem)] leading-[1.16] font-medium tracking-[-0.035em] text-ink">
                  &ldquo;Walk me through your approach and one tradeoff you considered.&rdquo;
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted">Refer to your code as you explain your reasoning, complexity, and the choices you made.</p>
                </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-line bg-surface-soft p-3">
                <CandidatePreview stream={stream} className="w-48 max-w-full shrink-0" />
                <div className="min-w-0 flex-1 basis-28"><p className="text-xs font-semibold">Your interview session</p><p className="mt-1 text-xs leading-5 text-muted">Keep your camera and microphone connected.</p></div>
              </div>
            </section>

            <section aria-label="Submitted solution, read only" className="flex h-[55svh] min-h-64 min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full md:min-h-0">
              <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-code-line px-[var(--assessment-panel-pad)] py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-ink-soft"><FileCode2 className="size-4 text-muted" /><span className="font-mono">{languageConfig.fileName}</span></div>
                <Badge tone="neutral">Submitted</Badge>
              </div>
              <ReadOnlyCodeEditor code={code} language={language} readOnly />
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-code-line bg-code-gutter px-[var(--assessment-panel-pad)] py-2 text-[11px] text-muted">
                <span className="flex items-center gap-1.5"><LockKeyhole className="size-3" /> Read only</span>
                <span>{languageConfig.label}</span>
              </div>
          <div className="shrink-0 border-t border-line">
            <AnswerStatus mode={answerMode} elapsed={answerElapsed} onDone={onFinish} doneLabel="Finish interview" />
          </div>
            </section>
      </AssessmentFrame>
    </main>
  );
}
