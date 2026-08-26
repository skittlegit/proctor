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
import { cn } from "@/lib/utils";

import { assessment, type MediaStatus } from "./config";
import { CandidatePreview, SecureHeader } from "./shared";

export function WelcomeStage({ onContinue }: { onContinue: () => void }) {
  const agenda = [
    ["01", "System check", "About 1 min"],
    ["02", "Conversation", "2 spoken prompts"],
    ["03", "Coding exercise", "12 minutes"],
    ["04", "Code walkthrough", "About 3 min"],
  ];

  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <SecureHeader
        label={`Secure invite / ${assessment.id}`}
        compactLabel={assessment.id}
      />
      <div className="assessment-content shell-pad mx-auto flex min-h-[calc(100dvh-var(--shell-total-header))] w-full max-w-[1520px] flex-col md:min-h-0">
        <div className="flex min-h-0 flex-1 items-center py-2 sm:py-3">
          <div className="grid w-full overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <section className="px-5 py-7 sm:px-7 sm:py-9 lg:pl-10 lg:pr-12 xl:px-12 xl:py-11 xl:pr-16">
              <div className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[11px]">
                <span>Interview briefing</span>
                <span className="h-px w-7 bg-line" aria-hidden="true" />
                <span>{assessment.durationMinutes} min</span>
              </div>
              <h1
                tabIndex={-1}
                data-stage-heading
                className="stage-focus mt-4 max-w-3xl font-serif text-[clamp(2.55rem,10.5vw,4.65rem)] leading-[0.98] font-medium tracking-[-0.05em] text-ink max-[374px]:text-[2.25rem] sm:text-[clamp(3.1rem,5vw,4.65rem)]"
              >
                Ready when you are, Alex.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:mt-5 sm:text-[15px] sm:leading-7">
                Maya leads a fixed set of questions. Each spoken response starts
                recording as soon as the question ends.
              </p>

              <dl className="mt-6 grid max-w-xl grid-cols-2 border-y border-line">
                <div className="py-3 pr-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                    Candidate
                  </dt>
                  <dd className="mt-1 truncate text-xs font-semibold text-ink-soft sm:text-sm">
                    {assessment.candidate}
                  </dd>
                </div>
                <div className="border-l border-line py-3 pl-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                    Role
                  </dt>
                  <dd className="mt-1 truncate text-xs font-semibold text-ink-soft sm:text-sm">
                    {assessment.role}
                  </dd>
                </div>
              </dl>

              <Button
                size="lg"
                className="mt-6 h-11 w-full sm:w-auto sm:min-w-72"
                onClick={onContinue}
              >
                Check your setup <ArrowRight />
              </Button>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                <LockKeyhole className="size-3" /> Your timed interview has not
                started.
              </p>
            </section>

            <section
              className="flex flex-col border-t border-line px-5 py-6 sm:px-7 lg:border-t-0 lg:border-l lg:px-10 lg:py-9 xl:px-12 xl:py-11"
              aria-label="Interview agenda"
            >
              <div className="flex items-end justify-between gap-4 pb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[11px]">
                    Today&apos;s sequence
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-ink sm:text-2xl">
                    Four guided sections
                  </h2>
                </div>
                <Clock3 className="mb-1 size-4 text-ink-soft" />
              </div>
              <ol className="border-t border-line">
                {agenda.map(([number, title, detail]) => (
                  <li
                    key={number}
                    className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-2.5 sm:py-3"
                  >
                    <span className="font-mono text-[10px] font-semibold text-muted sm:text-[11px]">
                      {number}
                    </span>
                    <span className="text-sm font-semibold text-ink-soft">
                      {title}
                    </span>
                    <span className="text-right text-[11px] text-muted sm:text-xs">
                      {detail}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-auto border-t border-line pt-4 text-xs leading-5 text-muted">
                Only the current section appears during the assessment.
              </p>
            </section>
          </div>
        </div>

        <footer className="flex min-h-8 shrink-0 items-end justify-between gap-4 text-[10px] text-muted sm:text-[11px]">
          <span>Camera and microphone are required.</span>
          <span className="font-mono max-[359px]:hidden">Invite / {assessment.id}</span>
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
  const videoDevices = devices.filter(
    (device) => device.kind === "videoinput",
  );
  const audioDevices = devices.filter(
    (device) => device.kind === "audioinput",
  );
  const canStart = consent && mediaStatus === "ready" && Boolean(stream);

  return (
    <main className="assessment-shell min-h-dvh bg-canvas text-ink">
      <SecureHeader label="System check" />
      <div className="assessment-content shell-pad mx-auto flex min-h-[calc(100dvh-var(--shell-total-header))] w-full max-w-[1520px] flex-col justify-center md:min-h-0">
        <div className="flex min-h-0 w-full flex-col md:h-full md:max-h-[600px]">
        <div className="mb-4 flex shrink-0 items-center gap-5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[11px]">
                Required before starting
              </p>
              <h1
                tabIndex={-1}
                data-stage-heading
                className="stage-focus mt-0.5 font-serif text-2xl font-medium tracking-[-0.025em] text-ink sm:text-3xl"
              >
                Check your setup
              </h1>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="-order-1 grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-surface text-muted outline-none transition-colors hover:border-ink-soft hover:text-ink focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/15 focus-visible:ring-offset-2"
              aria-label="Back to invitation"
            >
              <ArrowLeft className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)] items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_minmax(300px,350px)] xl:grid-cols-[minmax(0,1fr)_minmax(340px,390px)] xl:gap-6">
          <section
            className="relative min-h-[220px] min-w-0 max-w-full overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-editor sm:aspect-video sm:min-h-0 md:aspect-auto md:h-full"
            aria-label="Camera preview"
            aria-busy={mediaStatus === "requesting"}
          >
            <CandidatePreview
              stream={stream}
              className="absolute inset-0 size-full rounded-none"
              label="Camera preview"
            />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/45 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:left-4 sm:top-4">
              <LockKeyhole className="size-3" /> Preview only
            </div>
            {mediaStatus !== "ready" && (
              <div className="absolute inset-0 grid place-items-center bg-editor/85 p-6 text-center backdrop-blur-sm">
                <div
                  className="max-w-sm"
                  role={mediaStatus === "requesting" ? "status" : undefined}
                  aria-live={mediaStatus === "requesting" ? "polite" : undefined}
                  aria-atomic="true"
                >
                  <div className="mx-auto grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 sm:size-12">
                    <Camera className="size-4 sm:size-5" />
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-white sm:mt-4 sm:text-lg">
                    {mediaStatus === "requesting"
                      ? "Waiting for browser permission..."
                      : mediaStatus === "unavailable"
                        ? "Camera and microphone required"
                        : "Allow camera and microphone"}
                  </h2>
                  <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-white/70 sm:mt-2 sm:text-sm sm:leading-6">
                    {mediaStatus === "unavailable"
                      ? mediaError
                      : "Both devices must be connected before this assessment can begin."}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section
            className="flex min-w-0 max-w-full flex-col overflow-hidden rounded-[var(--assessment-radius)] border border-line bg-surface md:h-full md:overflow-y-auto"
            aria-labelledby="device-settings-heading"
          >
            <header className="border-b border-line px-4 py-3.5 sm:px-5 sm:py-4">
              <h2
                id="device-settings-heading"
                className="flex items-center gap-2 text-base font-semibold tracking-[-0.02em] text-ink"
              >
                <Settings2 className="size-4 text-ink-soft" /> Devices
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                These remain active for the full assessment.
              </p>
            </header>

            <div className="flex min-h-0 flex-1 flex-col divide-y divide-line">
              <DeviceSelect
                icon={Camera}
                label="Camera"
                status={mediaStatus === "ready" ? "Ready" : "Required"}
                value={selectedCamera}
                onChange={onCameraChange}
                devices={videoDevices}
                fallback="Default camera"
              />
              <DeviceSelect
                icon={Mic}
                label="Microphone"
                status={mediaStatus === "ready" ? "Connected" : "Required"}
                value={selectedMic}
                onChange={onMicChange}
                devices={audioDevices}
                fallback="Default microphone"
              />
              <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                <span className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                  <Wifi className="size-4 text-ink-soft" /> Browser connection
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="size-3.5" /> Active
                </span>
              </div>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-3.5 sm:px-5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => onConsentChange(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2"
                />
                <span className="text-xs leading-5 text-muted">
                  I understand that video, audio, transcript, and code activity
                  remain recorded for this assessment.
                </span>
              </label>
              {mediaStatus === "unavailable" && mediaError && (
                <p
                  className="px-4 py-3 text-xs leading-5 text-danger sm:px-5"
                  role="alert"
                >
                  {mediaError}
                </p>
              )}
              <div className="mobile-action-bar mt-auto bg-surface px-4 py-4 sm:px-5">
                {mediaStatus === "ready" ? (
                  <Button
                    className="mx-auto h-11 w-full max-w-md"
                    onClick={onStart}
                    disabled={!canStart}
                  >
                    Begin assessment <ArrowRight />
                  </Button>
                ) : (
                  <Button
                    className="mx-auto h-11 w-full max-w-md"
                    onClick={onRequestMedia}
                    disabled={mediaStatus === "requesting"}
                  >
                    {mediaStatus === "requesting" ? (
                      <RotateCcw className="animate-spin" />
                    ) : (
                      <Camera />
                    )}
                    {mediaStatus === "requesting"
                      ? "Checking..."
                      : "Check camera and microphone"}
                  </Button>
                )}
                <p className="mt-2 text-center text-[11px] text-muted">
                  A three-second countdown begins after confirmation.
                </p>
              </div>
            </div>
          </section>
        </div>
        </div>
      </div>
    </main>
  );
}

function DeviceSelect({
  icon: Icon,
  label,
  status,
  value,
  onChange,
  devices,
  fallback,
}: {
  icon: typeof Camera;
  label: string;
  status: string;
  value: string;
  onChange: (id: string) => void;
  devices: MediaDeviceInfo[];
  fallback: string;
}) {
  return (
    <label className="block px-4 py-3.5 sm:px-5">
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-soft">
        <span className="flex items-center gap-1.5">
          <Icon className="size-4" /> {label}
        </span>
        <span
          className={cn(
            status === "Required" ? "text-warning" : "text-success",
          )}
        >
          {status}
        </span>
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 min-w-0 w-full appearance-none rounded-lg border border-line bg-surface px-3 pr-9 text-base text-ink-soft outline-none transition-colors focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/15 focus-visible:ring-offset-1 md:text-sm"
        >
          {devices.length === 0 ? (
            <option value="">{fallback}</option>
          ) : (
            devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `${label} ${index + 1}`}
              </option>
            ))
          )}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted" />
      </div>
    </label>
  );
}

export function CountdownStage({ count }: { count: number }) {
  return (
    <main className="relative grid h-dvh place-items-center overflow-hidden bg-canvas px-5 text-center text-ink">
      <div className="countdown-ring absolute size-[min(400px,78vw)] rounded-full border border-line" />
      <div className="absolute size-[min(300px,58vw)] rounded-full border border-line/70" />
      <div className="relative z-10">
        <span className="sr-only" role="status" aria-live="assertive" aria-atomic="true">
          Assessment starts in {count}
        </span>
        <div className="mx-auto grid size-20 place-items-center rounded-xl border border-ink bg-surface font-mono text-3xl font-medium text-ink" aria-hidden="true">
          {count}
        </div>
        <h1
          tabIndex={-1}
          data-stage-heading
          className="stage-focus mt-7 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
        >
          Assessment starting
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Camera and microphone are locked on. Maya will ask the first question.
        </p>
        <div className="mx-auto mt-6 flex w-fit items-center overflow-hidden rounded-lg border border-line bg-surface text-xs font-semibold text-ink-soft">
          <span className="flex items-center gap-1.5 px-4 py-2">
            <Camera className="size-3.5" /> Camera on
          </span>
          <span className="flex items-center gap-1.5 border-l border-line px-4 py-2">
            <Mic className="size-3.5" /> Mic on
          </span>
        </div>
      </div>
    </main>
  );
}
