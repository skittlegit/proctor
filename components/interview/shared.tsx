"use client";

import {
  AudioLines,
  Camera,
  Check,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mic,
  ShieldCheck,
} from "lucide-react";
import { memo, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { type AnswerMode, formatTime } from "./config";

export function AssessmentFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="assessment-content shell-pad mx-auto flex w-full max-w-[1520px] items-center">
      <div
        className={cn(
          "grid w-full min-w-0 gap-[var(--assessment-gap)] md:h-full md:min-h-0 md:max-h-[var(--assessment-frame-max)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
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
      <circle cx="24" cy="14.5" r="12" fill="currentColor" />
      <circle cx="33.5" cy="24" r="12" fill="currentColor" />
      <circle cx="24" cy="33.5" r="12" fill="currentColor" />
      <circle cx="14.5" cy="24" r="12" fill="currentColor" />
      <path
        d="M13.4 14.5C16.7 12.9 20.2 12 24 12s7.3.9 10.6 2.5C36.2 17.8 37 20.2 37 24s-.8 6.2-2.4 9.5C31.3 35.1 27.8 36 24 36s-7.3-.9-10.6-2.5C11.8 30.2 11 27.8 11 24s.8-6.2 2.4-9.5Z"
        fill="var(--surface)"
      />
      <path
        d="M24 12.2c4.8 2.8 8.8 6.8 11.8 11.8-3 5-7 9-11.8 11.8-4.8-2.8-8.8-6.8-11.8-11.8 3-5 7-9 11.8-11.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PossoLogo({ compact = false, responsiveCompact = false }: { compact?: boolean; responsiveCompact?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5" role="img" aria-label="Posso Build">
      <PossoSymbol />
      {!compact && (
        <span
          aria-hidden="true"
          className={cn(
            "whitespace-nowrap text-[23px] leading-none font-extrabold tracking-[-0.055em] text-ink sm:text-[25px]",
            responsiveCompact && "max-[419px]:hidden",
          )}
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
    if (!video) return;
    video.srcObject = stream;
    if (stream) void video.play().catch(() => undefined);
  }, [stream]);

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-[var(--assessment-radius)] bg-editor",
        className,
      )}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="size-full -scale-x-100 transform-gpu object-cover [backface-visibility:hidden]"
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

function SoundBars() {
  return (
    <div className="flex h-6 items-center justify-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
        <span
          key={bar}
          className="sound-bar w-0.5 rounded-full bg-current"
          style={{ "--bar-delay": `${bar * 85}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function AIOrb({
  state,
  size = "large",
}: {
  state: "speaking" | "listening" | "thinking";
  size?: "small" | "large";
}) {
  const labels = {
    speaking: "Maya is asking",
    listening: "Maya is listening",
    thinking: "Maya is ready",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "short-mobile-orb grid shrink-0 place-items-center rounded-full bg-ink text-white",
          size === "large" ? "size-20 sm:size-24 xl:size-28" : "size-16",
        )}
        aria-hidden="true"
      >
        {state === "thinking" ? <Check className="size-6" /> : <SoundBars />}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted">
        <span
          className={cn(
            "size-1.5 rounded-full",
            state === "listening" ? "bg-danger" : state === "thinking" ? "bg-success" : "bg-ink",
          )}
        />
        {labels[state]}
      </div>
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
        <PossoLogo responsiveCompact />
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-muted">
          <LockKeyhole className="size-3.5 text-brand" />
          <span className={cn("max-w-[52vw] truncate", compactLabel && "hidden sm:inline")}>
            {label}
          </span>
          {compactLabel && <span className="sm:hidden">{compactLabel}</span>}
        </div>
      </div>
    </header>
  );
}

export function RoomHeader({
  label,
  detail,
  progress,
}: {
  label: string;
  detail: string;
  progress: number;
}) {
  return (
    <header
      className="room-header shrink-0 border-b border-line bg-surface/95 backdrop-blur-xl"
      style={{ viewTransitionName: "assessment-header" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1520px] items-center gap-4 px-[var(--assessment-outer)]">
        <PossoLogo responsiveCompact />
        <div className="hidden h-7 w-px bg-line md:block" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="truncate text-xs font-semibold text-ink-soft">{label}</div>
            <span className="hidden shrink-0 text-xs text-muted xl:inline">{detail}</span>
          </div>
          <Progress value={progress} className="mt-1.5 max-w-sm" aria-label="Assessment progress" />
        </div>
        <div className="hidden items-center gap-4 text-xs font-semibold text-ink-soft lg:flex">
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
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft lg:hidden">
          <span className="size-1.5 rounded-full bg-danger" /> Live
        </div>
      </div>
    </header>
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
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-soft px-4 py-3 text-left">
        <span className="grid size-9 place-items-center rounded-md bg-brand text-white">
          <AudioLines className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-soft">Listen to the full question</p>
          <p className="mt-0.5 text-xs text-muted">Your answer begins automatically when Maya finishes.</p>
        </div>
      </div>
    );
  }

  if (mode === "saved") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg bg-success-soft px-4 py-3 text-sm font-semibold text-success">
        <CheckCircle2 className="size-4" /> Response captured
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-line bg-surface-soft px-3 py-3 text-left sm:gap-4 sm:px-4 lg:flex lg:justify-between">
      <div className="flex items-center gap-3">
        <span className="relative grid size-9 place-items-center rounded-md bg-brand text-white">
          <Mic className="size-4" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-surface-soft bg-danger" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-soft">Answer recording</p>
          <p className="mt-0.5 font-mono text-xs text-muted">{formatTime(elapsed)}</p>
        </div>
      </div>
      <Button size="sm" className="h-11 w-auto shrink-0 px-3 sm:px-4" onClick={onDone}>
        <Check /> {doneLabel}
      </Button>
    </div>
  );
}

export function IntegrityDialog({
  issue,
  onReconnect,
  title = "Required device disconnected",
  actionLabel = "Reconnect devices",
  busyLabel = "Reconnecting...",
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
      className="fixed inset-0 z-50 grid place-items-center bg-editor/75 p-5 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="integrity-title"
      aria-describedby={`integrity-description integrity-guidance${error ? " integrity-reconnect-error" : ""}`}
      aria-busy={busy}
      tabIndex={-1}
    >
      <div className="w-full max-w-md rounded-[var(--assessment-radius)] border border-line bg-surface p-7 text-center shadow-float">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-danger-soft text-danger">
          <ShieldCheck className="size-5" />
        </div>
        <h2 id="integrity-title" className="mt-4 text-lg font-semibold text-ink">{title}</h2>
        <p id="integrity-description" className="mt-2 text-sm leading-6 text-muted">{issue}</p>
        <p id="integrity-guidance" className="mt-4 border-y border-line bg-surface-soft p-3 text-xs leading-5 text-muted">
          {guidance}
        </p>
        {error && (
          <p id="integrity-reconnect-error" className="mt-3 text-sm leading-5 text-danger" role="alert">
            {error}
          </p>
        )}
        <Button ref={buttonRef} className="mt-5 w-full" onClick={onReconnect} disabled={busy}>
          {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {busy ? busyLabel : actionLabel}
        </Button>
      </div>
    </div>
  );
}
