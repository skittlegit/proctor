"use client";

import { ArrowRight, ChevronDown, FileCode2, Moon, Sun } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

import CodeEditor from "./code-editor";
import { assessment, codeLanguages, formatTime, type CodeLanguage } from "./config";
import { AssessmentFrame, CandidatePreview, RoomHeader } from "./shared";
import styles from "./coding-stage.module.css";

type ColorTheme = "light" | "dark";

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getMainTheme(): ColorTheme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerTheme(): ColorTheme {
  return "light";
}

export default function CodingStage({
  code, language, sessionElapsed, stream,
  onCodeChange, onLanguageChange, onSubmit,
}: {
  code: string;
  language: CodeLanguage;
  sessionElapsed: number;
  stream: MediaStream | null;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: CodeLanguage) => void;
  onSubmit: () => void;
}) {
  const languageConfig = codeLanguages[language];
  const challenge = assessment.codingChallenge;
  const mainTheme = useSyncExternalStore(subscribeToTheme, getMainTheme, getServerTheme);
  const [editorPreference, setEditorPreference] = useState<{ mainTheme: ColorTheme; override: ColorTheme | null }>({ mainTheme, override: null });
  if (editorPreference.mainTheme !== mainTheme) {
    setEditorPreference({ mainTheme, override: null });
  }
  const editorTheme = editorPreference.mainTheme === mainTheme
    ? editorPreference.override ?? mainTheme
    : mainTheme;

  return (
    <main id="assessment-main" className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Coding exercise" detail={`${formatTime(sessionElapsed)} elapsed`} />
      <AssessmentFrame className="md:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
        <section aria-labelledby="challenge-title" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-line bg-surface-soft/45 p-[var(--assessment-panel-pad)]">
              <div className="flex items-center gap-2.5 text-xs font-medium text-muted">
                <span className="grid size-7 place-items-center rounded-lg border border-line bg-surface font-mono text-ink-soft">01</span>
                <span>Coding challenge</span><span className="ml-auto rounded-full border border-line px-2.5 py-0.5">Strings</span>
              </div>
              <h1 id="challenge-title" className="mt-4 text-balance text-2xl font-semibold leading-tight tracking-[-0.03em]">{challenge.title.replaceAll("-", "\u2011")}</h1>
            </div>
            <div className="p-[var(--assessment-panel-pad)]">
            <p className="text-sm leading-6 text-ink">{challenge.description}</p>
            <p className="mt-3 text-xs leading-5 text-ink-soft">{challenge.task}</p>

            <div className="mt-6 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-xs leading-5">
              <caption className="sr-only">Example inputs and expected outputs</caption>
              <thead><tr className="border-b border-line bg-surface-soft text-ink-soft"><th scope="col" className="px-3 py-2 font-medium">Example input</th><th scope="col" className="px-3 py-2 text-right font-medium">Returns</th></tr></thead>
              <tbody>
                {challenge.examples.map((item) => (
                  <tr key={item.input} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2.5 font-mono text-ink-soft">&quot;{item.input}&quot;</td>
                    <td className="px-3 py-2.5 text-right font-mono text-ink-soft"><span className="inline-block min-w-7 rounded-md bg-surface-soft px-1.5 text-center">{item.output}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <details className="mt-3 text-xs leading-5 text-ink-soft">
              <summary className="w-fit cursor-pointer rounded py-1 outline-none focus-visible:ring-2 focus-visible:ring-brand">Explain the examples</summary>
              <ol className="mt-2 list-decimal space-y-2 pl-4">
                {challenge.examples.map((item) => <li key={item.input}>{item.explanation}</li>)}
              </ol>
            </details>

            <div className="mt-6 text-xs leading-5 text-ink-soft">
              <h2 className="font-medium text-ink-soft">Constraints</h2>
              <ul className="mt-1 space-y-1">
                {challenge.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}
              </ul>
              <p className="mt-3">{challenge.complexity}</p>
            </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-line bg-surface-soft p-3">
            <CandidatePreview stream={stream} className="w-48 max-w-full shrink-0" />
            <div className="min-w-0 flex-1 basis-28 text-xs">
              <p className="font-semibold text-ink-soft">Your session</p>
              <p className="mt-2 leading-5 text-muted">Keep your face in view.</p>
            </div>
          </div>
        </section>

        <section aria-label="Solution workspace" data-editor-theme={editorTheme} className={`${styles.workspace} flex min-h-[70svh] min-w-0 flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface text-ink md:h-full md:min-h-0`}>
          <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-soft/45 px-[var(--assessment-panel-pad)]">
            <div className="flex min-h-12 items-center gap-2.5 border-b-2 border-ink px-2 text-xs text-ink-soft"><FileCode2 className="size-4 text-muted" /><span className="font-mono">{languageConfig.fileName}</span></div>
            <div className="flex items-center gap-2 py-1">
            <div className="relative">
              <select aria-label="Programming language" name="programming_language" autoComplete="off" value={language} onChange={(event) => onLanguageChange(event.target.value as CodeLanguage)} className="h-8 appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs font-semibold text-ink-soft outline-none hover:border-muted focus-visible:ring-2 focus-visible:ring-brand">
                {assessment.codingLanguages.map((option) => <option key={option} value={option}>{codeLanguages[option].label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 size-3.5 text-muted" aria-hidden="true" />
            </div>
              <Button variant="ghost" size="icon" className="size-10" aria-label={`Editor theme: ${editorTheme}. Switch to ${editorTheme === "dark" ? "light" : "dark"} mode`} title={`Editor theme: ${editorTheme}. Switch to ${editorTheme === "dark" ? "light" : "dark"} mode`} onClick={() => setEditorPreference({ mainTheme, override: editorTheme === "light" ? "dark" : "light" })}>
                {editorTheme === "dark" ? <Moon /> : <Sun />}
              </Button>
            </div>
          </div>
          <CodeEditor key={language} code={code} language={language} onChange={onCodeChange} />
          <div className="shrink-0 border-t border-line bg-surface-soft px-[var(--assessment-panel-pad)] py-3">
            <p id="editor-keyboard-help" className="sr-only">Tab indents. Press Escape, then Tab, to leave the editor.</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button size="sm" onClick={onSubmit}>Submit solution <ArrowRight /></Button>
            </div>
          </div>
        </section>
      </AssessmentFrame>
    </main>
  );
}
