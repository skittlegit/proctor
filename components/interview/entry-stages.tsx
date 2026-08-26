"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LockKeyhole,
  Mic,
  RotateCcw,
  Settings2,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { assessment, type MediaStatus } from "./config";
import { CandidatePreview, PossoLogo, PossoSymbol, SecureHeader } from "./shared";

export function WelcomeStage({ onContinue }: { onContinue: () => void }) {
  const agenda = [
    ["01", "System check", "About 1 min"],
    ["02", "Conversation", "2 spoken prompts"],
    ["03", "Coding exercise", "12 minutes"],
    ["04", "Code walkthrough", "About 3 min"],
  ];

  const briefingFacts = [
    ["Candidate", assessment.candidate],
    ["Interviewer", "Maya / Posso AI"],
    ["Required", "Camera + microphone"],
    ["Privacy", "Encrypted + proctored"],
  ];

  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <div className="safe-inline mx-auto flex min-h-dvh w-full max-w-[1520px] flex-col px-4 py-3 sm:px-7 sm:py-4 lg:h-dvh lg:min-h-0 lg:px-8 xl:px-10">
        <nav className="flex h-10 shrink-0 items-center justify-between">
          <PossoLogo />
          <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted sm:text-[11px]">
            <LockKeyhole className="size-3.5 text-brand" /> <span className="hidden sm:inline">Secure invite / </span>{assessment.id}
          </div>
        </nav>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4 py-4">
          <div className="grid min-h-0 content-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-center lg:gap-12 xl:gap-16">
            <section className="max-w-3xl">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">{assessment.role} · {assessment.durationMinutes} minutes</p>
              <h1 tabIndex={-1} data-stage-heading className="stage-focus mt-3 max-w-3xl font-serif text-[clamp(2.75rem,11.5vw,4.9rem)] leading-[0.98] font-medium tracking-[-0.05em] text-ink sm:mt-4 sm:text-[clamp(3.2rem,5.2vw,4.9rem)]">
                Ready when you are, Alex.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:mt-5 sm:text-[15px] sm:leading-7">
                Maya will lead each fixed prompt and give you space to respond. Spoken answers begin recording automatically after each question.
              </p>
              <Button size="lg" className="mt-6 h-11 w-full sm:w-auto sm:min-w-72" onClick={onContinue}>Check your setup <ArrowRight /></Button>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted"><LockKeyhole className="size-3" /> The interview has not started.</p>
            </section>

            <section className="relative overflow-hidden border-t border-line pt-4 lg:border-t-0 lg:border-l lg:py-2 lg:pl-10 xl:pl-12" aria-label="Interview agenda">
              <PossoSymbol className="pointer-events-none absolute -right-7 top-1/2 size-44 -translate-y-1/2 opacity-[0.035]" />
              <div className="relative flex items-end justify-between gap-4 pb-3">
                <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Your interview</p><h2 className="mt-1 font-serif text-2xl font-medium tracking-[-0.03em] text-ink">Four guided sections</h2></div>
                <Clock3 className="mb-1 size-4 text-brand" />
              </div>
              <ol className="relative border-t border-line">
                {agenda.map(([number, title, detail]) => (
                  <li key={number} className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-3">
                    <span className="font-mono text-[11px] font-semibold text-brand">{number}</span>
                    <span className="text-sm font-semibold text-ink-soft">{title}</span>
                    <span className="text-right text-xs text-muted">{detail}</span>
                  </li>
                ))}
              </ol>
              <p className="relative mt-3 text-xs leading-5 text-muted">You only need to focus on the section in front of you.</p>
            </section>
          </div>

          <section className="grid shrink-0 grid-cols-2 border-y border-line md:grid-cols-4" aria-label="Interview details">
            {briefingFacts.map(([label, value], index) => (
              <div key={label} className={cn("px-3 py-2.5 sm:px-4 lg:px-5", index > 0 && "md:border-l md:border-line", index % 2 === 1 && "border-l border-line md:border-l", index > 1 && "border-t border-line md:border-t-0")}>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted">{label}</p>
                <p className="mt-1 truncate text-xs font-semibold text-ink-soft sm:text-sm">{value}</p>
              </div>
            ))}
          </section>
        </div>

        <footer className="flex min-h-8 shrink-0 items-end justify-between gap-4 text-[10px] text-muted sm:text-[11px]">
          <span>Take a moment before you continue.</span><span className="font-mono">Invite / {assessment.id}</span>
        </footer>
      </div>
    </main>
  );
}

export function SetupStage({
  mediaStatus,
  mediaError,
  stream,
  devices,
  selectedCamera,
  selectedMic,
  consent,
  onConsentChange,
  onCameraChange,
  onMicChange,
  onRequestMedia,
  onBack,
  onStart,
}: {
  mediaStatus: MediaStatus;
  mediaError: string;
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
  onCameraChange: (id: string) => void;
  onMicChange: (id: string) => void;
  onRequestMedia: () => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  const audioDevices = devices.filter((device) => device.kind === "audioinput");
  const canStart = consent && mediaStatus === "ready" && Boolean(stream);

  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <SecureHeader label="System check" />
      <div className="assessment-content shell-pad mx-auto flex w-full max-w-[1520px] flex-col">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onBack} className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-surface text-muted transition-colors hover:text-ink lg:size-9" aria-label="Back to invitation"><ArrowLeft className="size-4" /></button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Required before starting</p>
              <h1 tabIndex={-1} data-stage-heading className="stage-focus mt-0.5 font-serif text-2xl font-medium tracking-[-0.025em] text-ink sm:text-3xl">Check your setup</h1>
            </div>
          </div>
          <p className="hidden max-w-md text-right text-xs leading-5 text-muted xl:block">After you begin, camera and microphone stay on until submission.</p>
        </div>

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)] items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] xl:grid-cols-[minmax(0,1fr)_minmax(330px,380px)] xl:gap-6">
          <section className="relative min-h-[220px] min-w-0 max-w-full self-center overflow-hidden rounded-[var(--assessment-radius)] bg-editor sm:aspect-video sm:min-h-0 md:aspect-auto md:h-full md:max-h-[min(62vh,560px)]">
            <CandidatePreview stream={stream} className="absolute inset-0 size-full rounded-none" label="Camera preview" />
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md"><LockKeyhole className="size-3" /> Preview only</div>
            {mediaStatus !== "ready" && (
              <div className="absolute inset-0 grid place-items-center bg-editor/85 p-6 text-center backdrop-blur-sm">
                <div className="max-w-sm">
                  <div className="mx-auto grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 sm:size-12"><Camera className="size-4 sm:size-5" /></div>
                  <h2 className="mt-3 text-base font-semibold text-white sm:mt-4 sm:text-lg">{mediaStatus === "requesting" ? "Waiting for browser permission..." : mediaStatus === "unavailable" ? "Camera and microphone required" : "Allow camera and microphone"}</h2>
                  <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-white/70 sm:mt-2 sm:text-sm sm:leading-6">{mediaStatus === "unavailable" ? mediaError : "Both devices must be connected before this assessment can begin."}</p>
                </div>
              </div>
            )}
          </section>

          <Card className="min-w-0 max-w-full self-center md:max-h-full md:overflow-y-auto">
            <CardHeader className="border-b border-line px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-base"><Settings2 className="size-4 text-brand" /> Devices</CardTitle>
              <CardDescription className="text-xs leading-5">Confirm the devices used for the full assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 p-5 pb-28 md:pb-5">
              <DeviceSelect icon={Camera} label="Camera" status={mediaStatus === "ready" ? "Ready" : "Required"} value={selectedCamera} onChange={onCameraChange} devices={videoDevices} fallback="Default camera" />
              <DeviceSelect icon={Mic} label="Microphone" status={mediaStatus === "ready" ? "Connected" : "Required"} value={selectedMic} onChange={onMicChange} devices={audioDevices} fallback="Default microphone" />
              <div className="flex items-center justify-between rounded-xl border border-line bg-surface-soft px-3 py-2.5"><span className="flex items-center gap-2 text-xs font-semibold text-ink-soft"><Wifi className="size-4 text-brand" /> Browser connection</span><span className="flex items-center gap-1 text-xs text-brand"><CheckCircle2 className="size-3.5" /> Active</span></div>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-surface-soft p-3">
                <input type="checkbox" checked={consent} onChange={(event) => onConsentChange(event.target.checked)} className="mt-0.5 size-4 accent-brand" />
                <span className="text-xs leading-5 text-muted">I understand that video, audio, transcript, and code activity remain recorded for this assessment.</span>
              </label>
              <div className="mobile-action-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pt-3 shadow-[0_-12px_32px_rgba(25,52,44,0.08)] md:static md:border-0 md:bg-transparent md:px-0 md:pt-0 md:shadow-none">
                {mediaStatus === "ready" ? (
                  <Button className="mx-auto h-11 w-full max-w-md lg:h-9" onClick={onStart} disabled={!canStart}>Begin assessment <ArrowRight /></Button>
                ) : (
                  <Button className="mx-auto h-11 w-full max-w-md lg:h-9" onClick={onRequestMedia} disabled={mediaStatus === "requesting"}>{mediaStatus === "requesting" ? <RotateCcw className="animate-spin" /> : <Camera />}{mediaStatus === "requesting" ? "Checking..." : "Check camera and microphone"}</Button>
                )}
                <p className="mt-2 text-center text-[11px] text-muted">A three-second countdown begins after confirmation.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function DeviceSelect({ icon: Icon, label, status, value, onChange, devices, fallback }: { icon: typeof Camera; label: string; status: string; value: string; onChange: (id: string) => void; devices: MediaDeviceInfo[]; fallback: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-soft"><span className="flex items-center gap-1.5"><Icon className="size-4" /> {label}</span><span className={cn(status === "Required" ? "text-amber-700" : "text-brand")}>{status}</span></span>
      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 min-w-0 w-full appearance-none rounded-[10px] border border-line bg-surface px-3 pr-9 text-xs text-ink-soft outline-none focus:border-brand lg:h-10">
          {devices.length === 0 ? <option value="">{fallback}</option> : devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `${label} ${index + 1}`}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
      </div>
    </label>
  );
}

export function CountdownStage({ count }: { count: number }) {
  return (
    <main className="relative grid h-dvh place-items-center overflow-hidden bg-canvas px-5 text-center text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98)_0%,rgba(244,241,250,0.86)_34%,rgba(231,232,241,0.76)_100%)]" />
      <div className="countdown-ring absolute size-[min(400px,70vw)] rounded-full border border-line" />
      <div className="relative z-10">
        <div className="mx-auto grid size-20 place-items-center rounded-full border border-white bg-white/75 text-3xl font-medium shadow-float backdrop-blur-xl">{count}</div>
        <h1 tabIndex={-1} data-stage-heading className="stage-focus mt-7 font-serif text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Assessment starting</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">Camera and microphone are locked on. Maya will ask the first question.</p>
        <div className="mx-auto mt-6 flex w-fit items-center gap-4 rounded-full border border-line bg-white/70 px-4 py-2 text-xs font-semibold text-ink-soft"><span className="flex items-center gap-1.5"><Camera className="size-3.5" /> Camera on</span><span className="flex items-center gap-1.5"><Mic className="size-3.5" /> Mic on</span></div>
      </div>
    </main>
  );
}
