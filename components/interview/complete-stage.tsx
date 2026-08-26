import { CameraOff, Check, LockKeyhole, MicOff } from "lucide-react";

import { assessment } from "./config";
import { PossoLogo, PossoSymbol } from "./shared";

const handoffDetails = [
  ["Receipt", assessment.id],
  ["Captured", "3 responses · 1 solution"],
  ["Next", "Posso Build will contact you"],
];

export default function CompleteStage() {
  return (
    <main className="flex min-h-dvh flex-col bg-canvas text-ink lg:h-dvh lg:overflow-hidden">
      <nav className="safe-inline mx-auto flex h-16 w-full max-w-[1520px] shrink-0 items-center justify-between px-4 sm:px-7 lg:px-8 xl:px-10" aria-label="Submission receipt">
          <PossoLogo />
          <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted sm:text-[11px]">
            <LockKeyhole className="size-3.5 text-brand" />
            <span className="hidden sm:inline">Submitted / </span>{assessment.id}
          </div>
      </nav>

      <section className="safe-inline relative mx-auto flex w-full max-w-[1520px] flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-7 sm:py-12 lg:min-h-0 lg:px-8 xl:px-10" aria-labelledby="submission-heading">
        <PossoSymbol className="pointer-events-none absolute left-1/2 top-1/2 size-[min(58vw,30rem)] -translate-x-1/2 -translate-y-1/2 opacity-[0.025]" />
        <div className="relative w-full max-w-3xl text-left sm:text-center">
          <span className="grid size-11 place-items-center rounded-full bg-brand text-white sm:mx-auto"><Check className="size-5" strokeWidth={2.6} /></span>
          <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Submission confirmed</p>
          <h1 id="submission-heading" tabIndex={-1} data-stage-heading className="stage-focus mt-3 font-serif text-[clamp(2.8rem,11vw,4.8rem)] leading-[0.98] font-medium tracking-[-0.05em] text-ink sm:text-[clamp(3.4rem,6vw,5rem)]">
            That&apos;s everything, Alex.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted sm:text-[15px] sm:leading-7">Your responses and code are ready for review.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3 text-xs font-semibold text-ink-soft sm:mx-auto sm:w-fit sm:justify-center sm:border-x sm:px-5">
            <span className="flex items-center gap-1.5"><CameraOff className="size-3.5 text-brand" /> Camera off</span>
            <span className="flex items-center gap-1.5"><MicOff className="size-3.5 text-brand" /> Microphone off</span>
            <span className="w-full font-normal text-muted sm:w-auto">You can safely close this tab.</span>
          </div>
        </div>
      </section>

      <section className="shrink-0 bg-editor text-white" aria-label="Submission handoff">
        <dl className="mx-auto grid w-full max-w-[1520px] sm:grid-cols-3">
          {handoffDetails.map(([label, value], index) => (
            <div key={label} className={`px-5 py-4 sm:min-h-36 sm:px-7 sm:py-6 lg:px-8 xl:px-10 ${index > 0 ? "border-t border-white/10 sm:border-t-0 sm:border-l" : ""}`}>
              <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300">{label}</dt>
              <dd className="mt-2 text-sm font-semibold leading-6 text-white/90">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
