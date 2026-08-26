import { CameraOff, Check, MicOff } from "lucide-react";

import { assessment } from "./config";
import { SecureHeader } from "./shared";

const handoffDetails = [
  ["Attempt", assessment.id],
  ["Candidate", assessment.candidate],
  ["Expected items", "3 spoken steps / 1 code draft"],
  ["Delivery", "Awaiting backend connection"],
];

export default function CompleteStage() {
  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <SecureHeader
        label={`Session ended / ${assessment.id}`}
        compactLabel={assessment.id}
      />

      <section
        className="assessment-content shell-pad mx-auto flex w-full max-w-[1520px] flex-1 items-center"
        aria-labelledby="completion-heading"
      >
        <div className="grid w-full overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <article className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
            <div className="flex items-center gap-3">
              <span
                className="grid size-10 place-items-center rounded-lg border border-ink bg-ink text-white"
                aria-hidden="true"
              >
                <Check className="size-4" strokeWidth={2.6} />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-[11px]">
                Interview ended
              </span>
            </div>
            <h1
              id="completion-heading"
              tabIndex={-1}
              data-stage-heading
              className="stage-focus mt-8 max-w-xl text-[clamp(2.25rem,8vw,4rem)] leading-[1.02] font-semibold tracking-[-0.05em] text-ink"
            >
              You&apos;re finished, Alex.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-[15px] sm:leading-7">
              Maya has ended the interview. Camera and microphone access has
              been released for this session.
            </p>

            <div className="mt-8 flex w-fit flex-wrap overflow-hidden rounded-lg border border-line text-xs font-semibold text-ink-soft">
              <span className="flex items-center gap-2 px-4 py-3">
                <CameraOff className="size-3.5" /> Camera off
              </span>
              <span className="flex items-center gap-2 border-l border-line px-4 py-3">
                <MicOff className="size-3.5" /> Microphone off
              </span>
            </div>
          </article>

          <aside
            className="border-t border-line bg-canvas px-5 py-7 sm:px-8 sm:py-8 lg:border-t-0 lg:border-l lg:px-9 lg:py-10"
            aria-label="Session receipt"
          >
            <div className="flex items-start justify-between gap-6 border-b border-ink pb-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Completion record
                </p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-ink">
                  Session receipt
                </h2>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-md border-2 border-ink font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-ink">
                End
              </span>
            </div>

            <dl className="divide-y divide-line">
              {handoffDetails.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-4 py-3.5"
                >
                  <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
                    {label}
                  </dt>
                  <dd className="text-right text-xs font-semibold leading-5 text-ink-soft">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="border-t border-ink pt-4 text-[11px] leading-5 text-muted">
              This draft confirms that the interview flow ended. It does not yet
              verify a server upload.
            </p>
          </aside>
        </div>
      </section>

      <footer
        className="shrink-0 bg-editor text-white"
        aria-label="Session status"
      >
        <div className="safe-inline mx-auto flex min-h-14 w-full max-w-[1520px] flex-col justify-center gap-1 px-4 py-3 text-[11px] sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-8 xl:px-10">
          <span className="font-semibold text-white/90">
            No further questions remain.
          </span>
          <span className="font-mono uppercase tracking-[0.08em] text-white/55">
            Prototype receipt / delivery unverified
          </span>
        </div>
      </footer>
    </main>
  );
}
