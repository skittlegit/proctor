"use client";

import {
  AudioLines,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  Mic,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react";
import { memo, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { type AnswerMode, formatTime } from "./config";
import { attachCameraPreview } from "./camera-preview";

export function AssessmentContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("assessment-content shell-pad mx-auto flex w-full max-w-[1520px] items-center", className)}>
      {children}
    </div>
  );
}

export function AssessmentFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AssessmentContent>
      <div
        className={cn(
          "grid w-full min-w-0 gap-[var(--assessment-gap)] md:h-full md:min-h-0 md:max-h-[var(--assessment-frame-max)]",
          className,
        )}
      >
        {children}
      </div>
    </AssessmentContent>
  );
}

export function PossoSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-8 shrink-0 text-ink sm:size-9", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="posso-top"><circle cx="24" cy="16" r="16" /></clipPath>
        <clipPath id="posso-right"><circle cx="32" cy="24" r="16" /></clipPath>
        <clipPath id="posso-bottom"><circle cx="24" cy="32" r="16" /></clipPath>
      </defs>
      <g fill="var(--logo-outer)">
        <circle cx="24" cy="16" r="16" />
        <circle cx="32" cy="24" r="16" />
        <circle cx="24" cy="32" r="16" />
        <circle cx="16" cy="24" r="16" />
      </g>
      <g fill="var(--logo-overlap)">
        <circle cx="32" cy="24" r="16" clipPath="url(#posso-top)" />
        <circle cx="24" cy="32" r="16" clipPath="url(#posso-top)" />
        <circle cx="16" cy="24" r="16" clipPath="url(#posso-top)" />
        <circle cx="24" cy="32" r="16" clipPath="url(#posso-right)" />
        <circle cx="16" cy="24" r="16" clipPath="url(#posso-right)" />
        <circle cx="16" cy="24" r="16" clipPath="url(#posso-bottom)" />
      </g>
      <g fill="var(--logo-core)" clipPath="url(#posso-top)">
        <g clipPath="url(#posso-right)"><circle cx="24" cy="32" r="16" /></g>
        <g clipPath="url(#posso-right)"><circle cx="16" cy="24" r="16" /></g>
        <g clipPath="url(#posso-bottom)"><circle cx="16" cy="24" r="16" /></g>
      </g>
      <g fill="var(--logo-core)" clipPath="url(#posso-right)">
        <g clipPath="url(#posso-bottom)"><circle cx="16" cy="24" r="16" /></g>
      </g>
    </svg>
  );
}

export function PossoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-2" role="img" aria-label="PossoBuild">
      <PossoSymbol />
      {!compact && (
        <span
          aria-hidden="true"
          className="whitespace-nowrap text-[19px] leading-none font-extrabold tracking-[-0.055em] text-ink sm:text-[25px]"
        >
          PossoBuild
        </span>
      )}
    </span>
  );
}

export const CandidatePreview = memo(function CandidatePreview({
  stream,
  className,
  label = "You",
}: {
  stream: MediaStream | null;
  className?: string;
  label?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const live = Boolean(
    stream?.getVideoTracks().some((track) => track.readyState === "live"),
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    return attachCameraPreview(video, stream);
  }, [stream]);

  return (
    <div
      className={cn(
        "candidate-preview relative isolate aspect-video overflow-hidden rounded-[var(--assessment-radius)] bg-editor",
        className,
      )}
      style={{
        borderRadius: "var(--assessment-radius)",
        clipPath: "inset(0 round var(--assessment-radius))",
        WebkitMaskImage: "-webkit-radial-gradient(white, black)",
      }}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="size-full -scale-x-100 transform-gpu rounded-[inherit] object-cover [backface-visibility:hidden] [clip-path:inset(0_round_var(--assessment-radius))]"
        />
      ) : (
        <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_25%,#303531_0%,#111412_72%)]">
          <div className="grid size-12 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/15">
            AC
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-white">
        <span className="text-xs font-semibold">{label}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-white/80">
          <span className={cn("size-1.5 rounded-full", live ? "bg-emerald-300" : "bg-white/45")} />
          {live ? "Live" : "Preview"}
        </span>
      </div>
    </div>
  );
});

function SoundBars({ count = 7, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex h-6 items-center justify-center gap-0.5", className)} aria-hidden="true">
      {Array.from({ length: count }, (_, bar) => (
        <span
          key={bar}
          className={cn("sound-bar rounded-full bg-current", count > 7 ? "min-w-0 max-w-1 flex-1" : "w-0.5")}
          style={{ "--bar-delay": `${(bar % 7) * 85}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function AIOrb({
  state,
  size = "large",
  showLabel = true,
}: {
  state: "speaking" | "listening" | "thinking";
  size?: "small" | "large";
  showLabel?: boolean;
}) {
  const labels = {
    speaking: "Sia is asking",
    listening: "Sia is listening",
    thinking: "Sia is ready",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "short-mobile-orb grid shrink-0 place-items-center rounded-full bg-orb text-on-orb ring-1 ring-line",
          size === "large" ? "size-20 sm:size-24 xl:size-28" : "size-16",
        )}
        aria-hidden="true"
      >
        {state === "speaking" ? <SoundBars /> : state === "listening" ? <Mic className="size-5" /> : <Check className="size-6" />}
      </div>
      {showLabel ? (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted">
          <span
            className={cn(
              "size-1.5 rounded-full",
              state === "listening" ? "bg-danger" : state === "thinking" ? "bg-success" : "bg-ink",
            )}
          />
          {labels[state]}
        </div>
      ) : null}
    </div>
  );
}

export function SecureHeader({
  label = "Secure assessment",
  compactLabel,
}: {
  label?: string;
  compactLabel?: string;
}) {
  return (
    <header
      className="room-header shrink-0 border-b border-line bg-surface/95 backdrop-blur-xl"
      style={{ viewTransitionName: "assessment-header" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1520px] items-center justify-between px-[var(--assessment-outer)]">
        <PossoLogo />
        <div className="flex min-w-0 items-center gap-1 text-xs font-semibold text-muted sm:gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <LockKeyhole className="size-3.5 shrink-0 text-brand" />
            <span className={cn("max-w-[40vw] truncate sm:max-w-[52vw]", compactLabel && "hidden sm:inline")}>
              {label}
            </span>
            {compactLabel && <span className="sm:hidden">{compactLabel}</span>}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function RoomHeader({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <header
      className="room-header shrink-0 border-b border-line bg-surface/95 backdrop-blur-xl"
      style={{ viewTransitionName: "assessment-header" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1520px] items-center gap-4 px-[var(--assessment-outer)]">
        <PossoLogo />
        <div className="hidden h-7 w-px bg-line md:block" />
        <div className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-soft">{label}</div>
        <div className="hidden items-center gap-4 text-xs font-semibold text-ink-soft lg:flex">
          <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-soft px-2.5 py-1.5 font-medium text-muted">
            <Clock3 className="size-3.5" /> {detail}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-danger" /> Proctoring active
          </span>
          <span className="flex items-center gap-1.5">
            <Camera className="size-3.5 text-brand" /> Camera
          </span>
          <span className="flex items-center gap-1.5">
            <Mic className="size-3.5 text-brand" /> Mic
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-ink-soft lg:hidden">
          <span className="hidden items-center gap-1.5 text-muted sm:flex">
            <Clock3 className="size-3.5" /> {detail}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-danger" /> Live
          </span>
          <span className="hidden items-center gap-2 md:flex" aria-label="Camera and microphone on">
            <Camera className="size-3.5" />
            <Mic className="size-3.5" />
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

function ThemeToggle() {
  function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 shrink-0"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className="theme-icon-light" aria-hidden="true" />
      <Moon className="theme-icon-dark" aria-hidden="true" />
    </Button>
  );
}

export function LockedDeviceStatus({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
        className,
      )}
      aria-label="Required devices are locked on"
    >
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-soft px-3 py-2.5">
        <Camera className="size-4 text-brand" />
        <div>
          <p className="text-xs font-semibold text-ink-soft">Camera</p>
          <p className="text-[11px] text-muted">Locked on</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-soft px-3 py-2.5">
        <Mic className="size-4 text-brand" />
        <div>
          <p className="text-xs font-semibold text-ink-soft">Microphone</p>
          <p className="text-[11px] text-muted">Locked on</p>
        </div>
      </div>
    </div>
  );
}

export function AnswerStatus({
  mode,
  elapsed,
  onDone,
  doneLabel = "Done answering",
}: {
  mode: AnswerMode;
  elapsed: number;
  onDone: () => void;
  doneLabel?: string;
}) {
  if (mode === "asking") {
    return (
      <div className="grid min-h-[100px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-surface-soft px-[var(--assessment-panel-pad)] py-3.5 text-left sm:min-h-[68px]">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Up next</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink-soft">Answer recording starts automatically</p>
        </div>
        <div className="flex items-center gap-2 border-l border-line pl-4 text-xs font-semibold text-ink-soft">
          <AudioLines className="size-4" />
          <span className="hidden sm:inline">Listen to Sia</span>
          <span className="sm:hidden">Listen</span>
        </div>
      </div>
    );
  }

  if (mode === "saved") {
    return (
      <div className="flex min-h-[100px] w-full items-center justify-center gap-2 bg-success-soft px-[var(--assessment-panel-pad)] py-4 text-sm font-semibold text-success sm:min-h-[68px]">
        <CheckCircle2 className="size-4" /> Response captured
      </div>
    );
  }

  return (
    <div className="@container min-h-[100px] w-full bg-surface-soft px-[var(--assessment-panel-pad)] py-3 text-left sm:min-h-[68px]">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 @min-[32rem]:grid-cols-[auto_minmax(8rem,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-2.5 @min-[32rem]:min-w-40">
          <span className="relative flex size-3 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger/35" />
            <span className="relative m-auto size-2 rounded-full bg-danger" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-soft">Recording</p>
            <p className="mt-0.5 font-mono text-xs text-muted">{formatTime(elapsed)} elapsed</p>
          </div>
        </div>
        <div className="flex h-9 min-w-0 items-center justify-center border-l border-line pl-4 text-ink-soft @min-[32rem]:border-x @min-[32rem]:px-5">
          <SoundBars count={17} className="h-7 w-full max-w-52 gap-1" />
        </div>
        <Button size="sm" className="order-3 col-span-2 h-11 w-full shrink-0 px-3 @min-[32rem]:order-none @min-[32rem]:col-span-1 @min-[32rem]:w-auto @min-[32rem]:px-4" onClick={onDone}>
          <Check />
          <span className="hidden sm:inline">{doneLabel}</span>
          <span className="sm:hidden">{doneLabel === "Finish interview" ? "Finish" : "Done"}</span>
        </Button>
      </div>
    </div>
  );
}

export function IntegrityDialog({
  issue,
  onReconnect,
  title = "Required device disconnected",
  actionLabel = "Reconnect devices",
  busyLabel = "Reconnecting…",
  guidance = "Reconnect the device to keep this attempt valid. Camera and microphone cannot be disabled during the assessment.",
  busy = false,
  error = "",
}: {
  issue: string;
  onReconnect: () => void | Promise<void>;
  title?: string;
  actionLabel?: string;
  busyLabel?: string;
  guidance?: string;
  busy?: boolean;
  error?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    buttonRef.current?.focus();
  }, [issue]);

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 grid place-items-center bg-editor/75 p-3 backdrop-blur-md sm:p-5"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="integrity-title"
      aria-describedby={`integrity-description integrity-guidance${error ? " integrity-reconnect-error" : ""}`}
      aria-busy={busy}
      tabIndex={-1}
    >
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[var(--assessment-radius)] border border-line bg-surface shadow-float sm:max-h-[calc(100dvh-2.5rem)]">
        <header className="flex items-start gap-3 border-b border-line px-5 py-5 sm:gap-4 sm:px-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger">
            <ShieldCheck className="size-4.5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-danger">
              Recording paused
            </p>
            <h2 id="integrity-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">
              {title}
            </h2>
          </div>
        </header>

        <div className="px-5 py-5 sm:px-6">
          <p id="integrity-description" className="text-sm leading-6 text-muted">
            {issue}
          </p>
          <div id="integrity-guidance" className="mt-4 rounded-lg border border-line bg-surface-soft p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Next step
            </p>
            <p className="mt-1.5 text-xs leading-5 text-muted">{guidance}</p>
          </div>
          {error ? (
            <p id="integrity-reconnect-error" className="mt-4 border-l-2 border-danger pl-3 text-xs leading-5 text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="border-t border-line bg-surface-soft px-5 py-4 sm:flex sm:items-center sm:justify-end sm:px-6">
          <Button ref={buttonRef} className="w-full sm:w-auto sm:min-w-48" onClick={onReconnect} disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
            {busy ? busyLabel : actionLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
