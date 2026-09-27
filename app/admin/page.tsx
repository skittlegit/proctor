"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CameraOff, ClipboardList, Settings2, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { assessment } from "@/components/interview/config";
import { PossoLogo } from "@/components/interview/shared";

export default function AdminPage() {
  const [allowWithoutMedia, setAllowWithoutMedia] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${password}` }, cache: "no-store" });
    if (!response.ok) { setError(response.status === 401 ? "Invalid admin password." : "Could not load settings. Check the server configuration."); return; }
    const settings = await response.json() as { allowWithoutMedia: boolean };
    setAllowWithoutMedia(settings.allowWithoutMedia);
    setAuthenticated(true);
    setLoaded(true);
  }

  async function changeMediaOption(checked: boolean) {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", { method: "PUT", headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" }, body: JSON.stringify({ allowWithoutMedia: checked }) });
      if (!response.ok) throw new Error("save failed");
      setAllowWithoutMedia(checked);
      setError("");
    } catch {
      setError("Could not save the setting. Try again.");
    } finally { setSaving(false); }
  }

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
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted">Assessment controls</p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Admin overview</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Review the current interview and choose how candidates can complete it.</p>
          </div>
          <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-on-brand hover:bg-brand-hover">Open interview <ArrowUpRight className="size-4" /></Link>
        </div>
        {!authenticated ? <form onSubmit={signIn} className="mt-7 max-w-md rounded-2xl border border-line bg-surface p-6"><h2 className="text-xl font-semibold">Admin sign in</h2><p className="mt-2 text-sm text-muted">Enter the admin password to manage shared settings.</p><label htmlFor="admin-password" className="mt-5 block text-sm font-medium">Password</label><input id="admin-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-line bg-surface px-3 outline-none focus-visible:ring-2 focus-visible:ring-ink/30" /><button type="submit" className="mt-4 h-11 rounded-lg bg-brand px-5 text-sm font-semibold text-on-brand">Sign in</button>{error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}</form> : <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8" aria-labelledby="settings-title">
            <div className="flex items-start gap-3"><span className="rounded-xl bg-surface-soft p-2.5"><Settings2 className="size-5" /></span><div><h2 id="settings-title" className="text-xl font-semibold">Session settings</h2><p className="mt-1 text-sm text-muted">Controls for this interview experience.</p></div></div>
            <div className="mt-7 rounded-xl border border-line p-5">
              <div className="flex items-start gap-4">
                <CameraOff className="mt-0.5 size-5 shrink-0 text-muted" />
                <div className="min-w-0 flex-1"><label htmlFor="allow-without-media" className="block cursor-pointer text-sm font-semibold">Allow continuation without camera and microphone</label><p id="media-option-description" className="mt-1 text-sm leading-6 text-muted">Candidates may choose a text response path during setup. No camera or microphone permission is requested on that path, and spoken answers are replaced with typed answers.</p></div>
                <input id="allow-without-media" type="checkbox" role="switch" aria-describedby="media-option-description" checked={allowWithoutMedia} disabled={!loaded || saving} onChange={(event) => void changeMediaOption(event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
              </div>
              <p className="mt-4 border-t border-line pt-4 text-xs font-medium text-muted">Status: {allowWithoutMedia ? "Optional devices" : "Camera and microphone required"}</p>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
          </section>
          <aside className="space-y-5">
            <section className="rounded-2xl border border-line bg-surface p-6" aria-labelledby="assessment-title"><ClipboardList className="size-5 text-muted" /><h2 id="assessment-title" className="mt-4 text-lg font-semibold">Current assessment</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">ID</dt><dd className="font-mono font-medium">{assessment.id}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Role</dt><dd className="font-medium">{assessment.role}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Duration</dt><dd className="font-medium">{assessment.durationMinutes} min</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Questions</dt><dd className="font-medium">{assessment.questions.length}</dd></div></dl></section>
            <section className="rounded-2xl border border-line bg-surface-soft p-6 text-sm leading-6 text-muted"><ShieldCheck className="mb-3 size-5 text-ink" /><p>Changes are saved to the shared assessment settings database and apply to candidates when they open setup.</p></section>
          </aside>
        </div>}
      </div>
    </main>
  );
}
