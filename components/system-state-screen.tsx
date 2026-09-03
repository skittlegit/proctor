"use client";

import {
  ArrowRight,
  FileQuestion,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

import {
  AssessmentContent,
  PossoSymbol,
  SecureHeader,
} from "@/components/interview/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateKind = "not-found" | "error";

const stateIcons = {
  "not-found": FileQuestion,
  error: ShieldAlert,
};

export function SystemStateScreen({
  kind,
  code,
  eyebrow,
  title,
  description,
  headerLabel,
  primaryLabel,
  primaryHref,
  onRetry,
  reference,
}: {
  kind: StateKind;
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  headerLabel: string;
  primaryLabel: string;
  primaryHref?: string;
  onRetry?: () => void;
  reference?: string;
}) {
  const Icon = stateIcons[kind];
  const isError = kind === "error";

  return (
    <>
      <a className="skip-link" href="#system-state-main">
        Skip to message
      </a>
      <main
        id="system-state-main"
        className="assessment-shell min-h-dvh bg-canvas text-ink"
      >
        <SecureHeader label={headerLabel} />
        <AssessmentContent className="min-h-[calc(100dvh-var(--shell-total-header))] items-stretch md:min-h-0 md:items-center">
          <section
            className="grid min-h-full w-full overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:min-h-[32rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]"
            aria-labelledby="system-state-title"
            role={isError ? "alert" : undefined}
          >
            <div className="flex min-w-0 flex-col px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
              <div className="flex flex-1 flex-col justify-center">
                <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[11px]">
                  <Icon className={cn("size-3.5", isError && "text-danger")} aria-hidden="true" />
                  {eyebrow}
                </p>
                <h1
                  id="system-state-title"
                  className="mt-4 max-w-2xl font-serif text-[clamp(2.55rem,9vw,4.75rem)] leading-[0.98] font-medium tracking-[-0.05em] text-ink"
                >
                  {title}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-muted sm:text-[15px] sm:leading-7">
                  {description}
                </p>
                {reference ? (
                  <p className="mt-5 w-fit rounded-lg border border-line bg-surface-soft px-3 py-2 font-mono text-[10px] text-muted">
                    Reference / {reference}
                  </p>
                ) : null}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {onRetry ? (
                  <Button size="lg" className="w-full sm:w-auto" onClick={onRetry}>
                    <RefreshCw aria-hidden="true" /> {primaryLabel}
                  </Button>
                ) : primaryHref ? (
                  <Link
                    href={primaryHref}
                    className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                  >
                    {primaryLabel} <ArrowRight aria-hidden="true" />
                  </Link>
                ) : null}
                {onRetry ? (
                  <Link
                    href="/"
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
                  >
                    Return to interview
                  </Link>
                ) : null}
              </div>
            </div>

            <aside className="relative flex min-h-60 flex-col justify-between overflow-hidden border-t border-line bg-surface-soft p-6 sm:p-8 lg:min-h-0 lg:border-t-0 lg:border-l lg:p-10" aria-label={`Status ${code}`}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  System status
                </span>
                <span className="rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-[10px] font-semibold text-ink-soft">
                  {code}
                </span>
              </div>
              <div className="grid flex-1 place-items-center py-8">
                <div className="relative grid size-36 place-items-center sm:size-44">
                  <div className="absolute inset-0 rounded-full border border-line" />
                  <div className="absolute inset-5 rounded-full border border-line" />
                  <PossoSymbol className="size-20 sm:size-24" />
                </div>
              </div>
              <p className="max-w-xs text-xs leading-5 text-muted">
                Your interview data has not been submitted or changed.
              </p>
            </aside>
          </section>
        </AssessmentContent>
      </main>
    </>
  );
}

export function SystemLoadingScreen() {
  return (
    <main
      id="assessment-main"
      className="assessment-shell min-h-dvh bg-canvas text-ink"
      aria-busy="true"
      aria-label="Loading interview"
    >
      <SecureHeader label="Preparing interview" />
      <AssessmentContent className="min-h-[calc(100dvh-var(--shell-total-header))] items-stretch md:min-h-0 md:items-center">
        <section className="grid min-h-full w-full overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:min-h-[32rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
          <div className="flex flex-col justify-center px-5 py-8 sm:px-8 lg:px-12">
            <div className="animate-pulse" aria-hidden="true">
              <div className="h-3 w-28 rounded-full bg-surface-strong" />
              <div className="mt-6 h-12 w-full max-w-lg rounded-lg bg-surface-strong sm:h-16" />
              <div className="mt-3 h-12 w-4/5 max-w-md rounded-lg bg-surface-strong sm:h-16" />
              <div className="mt-7 h-3 w-full max-w-lg rounded-full bg-surface-strong" />
              <div className="mt-3 h-3 w-3/4 max-w-sm rounded-full bg-surface-strong" />
              <div className="mt-10 h-12 w-full rounded-lg bg-surface-strong sm:w-44" />
            </div>
          </div>
          <aside className="grid min-h-60 place-items-center border-t border-line bg-surface-soft lg:min-h-0 lg:border-t-0 lg:border-l">
            <div className="flex flex-col items-center gap-5 text-muted" role="status">
              <div className="grid size-24 place-items-center rounded-full border border-line bg-surface sm:size-28">
                <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold">Preparing your session…</span>
            </div>
          </aside>
        </section>
      </AssessmentContent>
    </main>
  );
}
