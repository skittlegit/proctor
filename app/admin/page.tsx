import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ClipboardList } from "lucide-react";

import { assessment } from "@/components/interview/config";
import { PossoLogo } from "@/components/interview/shared";

export default function AdminPage() {
  return (
    <main id="assessment-main" className="min-h-dvh bg-canvas text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <PossoLogo />
          <span className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs font-semibold text-ink-soft">Admin workspace</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"><ArrowLeft className="size-4" /> Candidate view</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-7">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">Assessment overview</p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Admin overview</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Review the current interview and open its candidate experience.</p>
          </div>
          <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-on-brand hover:bg-brand-hover">Open interview <ArrowUpRight className="size-4" /></Link>
        </div>
        <section className="mt-7 max-w-xl rounded-2xl border border-line bg-surface p-6 sm:p-8" aria-labelledby="assessment-title">
          <ClipboardList className="size-5 text-muted" />
          <h2 id="assessment-title" className="mt-4 text-xl font-semibold">Current assessment</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">ID</dt><dd className="font-mono font-medium">{assessment.id}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Role</dt><dd className="font-medium">{assessment.role}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Duration</dt><dd className="font-medium">{assessment.durationMinutes} min</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Questions</dt><dd className="font-medium">{assessment.questions.length}</dd></div>
          </dl>
        </section>
      </div>
    </main>
  );
}
