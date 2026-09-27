"use client";

import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatTime } from "./config";
import { AIOrb, AssessmentContent, CandidatePreview, RoomHeader } from "./shared";

const instructions = [
  {
    title: "Understand the challenge",
    text: "Read the problem, examples, and constraints. Choose the language you are most comfortable with.",
  },
  {
    title: "Build and review your solution",
    text: "Write your code, check your reasoning against the examples, and consider edge cases. Your draft is saved in this browser as you work.",
  },
  {
    title: "Walk Sia through your approach",
    text: "Submit when you are ready. Your code becomes read only, then you will explain your approach and one tradeoff you made.",
  },
];

const transcript = "Now, let's move on to the coding exercise. You'll work on one challenge, then talk me through your solution. Start by reading the problem, examples, and constraints. Choose the language you're most comfortable with, and build your solution in the editor. Your draft is saved in this browser as you work. Before you submit, check your reasoning against the examples and consider edge cases. Once you select Submit solution, your code will be read only. I'll then ask you to explain your approach and one tradeoff you made. Keep your camera and microphone connected. When you're ready, select Start coding.";

export function CodingBriefing({
  sessionElapsed, stream, onContinue,
}: {
  sessionElapsed: number;
  stream: MediaStream | null;
  onContinue: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;
    void audio.play().catch(() => {
      if (!cancelled) setAudioError("Audio did not start automatically. You can hear the instructions or read them below.");
    });
    return () => {
      cancelled = true;
      audio.pause();
    };
  }, []);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setFinished(false);
    void audio.play().catch(() => setAudioError("Audio is unavailable. You can read the instructions below and start coding."));
  };

  return (
    <main id="assessment-main" className="assessment-shell min-h-dvh bg-canvas text-ink">
      <RoomHeader label="Coding briefing" detail={`${formatTime(sessionElapsed)} elapsed`} />
      <AssessmentContent className="items-start overflow-y-auto">
        <section aria-labelledby="coding-briefing-title" className="my-auto grid w-full shrink-0 overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
          <div className="flex min-w-0 flex-col border-b border-line bg-surface-soft/45 p-6 lg:border-r lg:border-b-0 lg:p-8 min-[1920px]:p-12">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Up next / Coding exercise</p>
            <div className="my-7 flex justify-start"><AIOrb state={playing ? "speaking" : "thinking"} showLabel={false} /></div>
            <h1 id="coding-briefing-title" className="max-w-lg font-serif text-4xl leading-[1.08] tracking-[-0.035em] min-[1920px]:text-5xl">Before you start coding.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted min-[1920px]:text-base">Sia will explain the exercise and what happens after you submit.</p>

            <div className="mt-6">
              <p role="status" className="text-xs text-muted">{playing ? "Sia is speaking" : finished ? "Briefing complete" : "Getting the briefing ready"}</p>
              {audioError && (
                <div className="mt-3">
                  <p role="status" className="text-sm leading-5 text-muted">{audioError}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={play}><Play /> Hear instructions</Button>
                </div>
              )}
            </div>
            <details className="mt-4 text-sm text-muted">
              <summary className="w-fit cursor-pointer rounded py-1 outline-none focus-visible:ring-2 focus-visible:ring-brand">Read Sia&apos;s transcript</summary>
              <p className="mt-3 leading-6">{transcript}</p>
            </details>
            <div className="mt-auto pt-6">
              <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
                <CandidatePreview stream={stream} className="w-40 max-w-full shrink-0 min-[1920px]:w-48" />
                <div className="min-w-0 flex-1 basis-32 text-xs leading-5 text-muted min-[1920px]:text-sm">
                  <p className="font-semibold text-ink-soft">Your session</p>
                  <p className="mt-1">Keep your camera and microphone connected.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-col p-6 lg:p-8 min-[1920px]:p-12">
            <h2 className="text-lg font-semibold tracking-tight min-[1920px]:text-2xl">How it works</h2>
            <ol className="mt-6 flex-1 divide-y divide-line">
              {instructions.map((instruction, index) => (
                <li key={instruction.title} className="flex gap-4 py-5 first:pt-0 lg:py-7">
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-soft font-mono text-xs">0{index + 1}</span>
                  <div>
                    <h2 className="font-semibold text-ink min-[1920px]:text-xl">{instruction.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted min-[1920px]:text-base min-[1920px]:leading-7">{instruction.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <p className="text-xs text-muted">Ready? You can revisit these instructions in the editor.</p>
              <Button className="w-full sm:w-auto" onClick={() => { audioRef.current?.pause(); onContinue(); }}>Start coding <ArrowRight /></Button>
            </div>
          </div>
        </section>
      </AssessmentContent>
      <audio
        ref={audioRef}
        src="/audio/sia/coding-instructions-v2.mp3"
        preload="auto"
        onPlay={() => { setPlaying(true); setAudioError(""); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setFinished(true); }}
        onError={() => { setPlaying(false); setAudioError("Audio is unavailable. You can read the instructions and start coding."); }}
      />
    </main>
  );
}
