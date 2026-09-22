"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { waitForCaptureReady } from "@/components/interview/capture-readiness";
import { createAnswerRecorder, finishAnswerRecording } from "@/components/interview/recording-format";
import { StageTransition } from "@/components/interview/stage-transition";
import { useStageTransition } from "@/components/interview/use-stage-transition";
import CodingStage from "@/components/interview/coding-stage";
import CompleteStage from "@/components/interview/complete-stage";
import {
  assessment,
  CODE_DRAFT_KEY,
  codeLanguages,
  starterCode,
  starterCodeDrafts,
  type AnswerMode,
  type CodeLanguage,
  type Stage,
} from "@/components/interview/config";
import ConversationStage from "@/components/interview/conversation-stage";
import { CountdownStage, SetupStage, WelcomeStage } from "@/components/interview/entry-stages";
import ExplanationStage from "@/components/interview/explanation-stage";
import { IntegrityDialog } from "@/components/interview/shared";
import { useMediaSession } from "@/components/interview/use-media-session";

type SessionState = {
  stage: Stage;
  consent: boolean;
  countdownCount: number;
  assessmentStartedAt: number | null;
  questionIndex: number;
  answerMode: AnswerMode;
  answerStartedAt: number | null;
  language: CodeLanguage;
  code: string;
  codeDrafts: Record<CodeLanguage, string>;
};

type SessionAction =
  | { type: "stage"; stage: Stage }
  | { type: "consent"; consent: boolean }
  | { type: "countdown" }
  | { type: "countdown-tick" }
  | { type: "begin-interview"; startedAt: number }
  | { type: "answer-started"; startedAt: number }
  | { type: "answer-saving" }
  | { type: "answer-reset" }
  | { type: "answer-saved" }
  | { type: "next-question" }
  | { type: "begin-coding" }
  | { type: "language"; language: CodeLanguage }
  | { type: "code"; code: string }
  | { type: "code-workspace"; language: CodeLanguage; drafts: Record<CodeLanguage, string> }
  | { type: "begin-explanation" }
  | { type: "complete" };

const initialSession: SessionState = {
  stage: "welcome",
  consent: false,
  countdownCount: 3,
  assessmentStartedAt: null,
  questionIndex: 0,
  answerMode: "asking",
  answerStartedAt: null,
  language: "typescript",
  code: starterCode,
  codeDrafts: { ...starterCodeDrafts },
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "stage":
      return { ...state, stage: action.stage };
    case "consent":
      return { ...state, consent: action.consent };
    case "countdown":
      return { ...state, stage: "countdown", countdownCount: 3 };
    case "countdown-tick":
      return { ...state, countdownCount: Math.max(1, state.countdownCount - 1) };
    case "begin-interview":
      return { ...state, stage: "conversation", assessmentStartedAt: action.startedAt, countdownCount: 3, answerMode: "asking", answerStartedAt: null };
    case "answer-started":
      return { ...state, answerMode: "answering", answerStartedAt: action.startedAt };
    case "answer-saving":
      return { ...state, answerMode: "saving" };
    case "answer-reset":
      return { ...state, answerMode: "asking", answerStartedAt: null };
    case "answer-saved":
      return { ...state, answerMode: "saved", answerStartedAt: null };
    case "next-question":
      return { ...state, questionIndex: state.questionIndex + 1, answerMode: "asking", answerStartedAt: null };
    case "begin-coding":
      return { ...state, stage: "coding", answerMode: "saved", answerStartedAt: null };
    case "language":
      return { ...state, language: action.language, code: state.codeDrafts[action.language] };
    case "code":
      return { ...state, code: action.code, codeDrafts: { ...state.codeDrafts, [state.language]: action.code } };
    case "code-workspace":
      return { ...state, language: action.language, code: action.drafts[action.language], codeDrafts: action.drafts };
    case "begin-explanation":
      return { ...state, stage: "explanation", answerMode: "asking", answerStartedAt: null };
    case "complete":
      return { ...state, stage: "complete", answerMode: "saved", answerStartedAt: null };
  }
}

type ActiveRecording = {
  recorder: MediaRecorder;
  stream: MediaStream;
  chunks: Blob[];
  responseKey: string;
  failed: boolean;
  stopped?: boolean;
  failureReason?: string;
  release?: () => void;
};

type RecorderStartResult =
  | { ok: true }
  | { ok: false; error: string };

function hasLiveCaptureTracks(stream: MediaStream | null | undefined): stream is MediaStream {
  if (!stream) return false;
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];
  return Boolean(
    videoTrack
    && audioTrack
    && videoTrack.readyState === "live"
    && audioTrack.readyState === "live"
    && videoTrack.enabled
    && audioTrack.enabled
    && !videoTrack.muted
    && !audioTrack.muted
  );
}

function describeCaptureTracks(stream: MediaStream | null | undefined) {
  const unavailable = [
    { name: "camera", track: stream?.getVideoTracks()[0] },
    { name: "microphone", track: stream?.getAudioTracks()[0] },
  ].flatMap(({ name, track }) => {
    if (!track || track.readyState !== "live") return [`${name} stream has stopped or is unavailable`];
    if (!track.enabled) return [`${name} track is disabled`];
    if (track.muted) return [`${name} is connected but the browser is not receiving media from it; check the device mute/privacy switch and system input settings`];
    return [];
  });
  return `Answer capture could not start: ${unavailable.join("; ")}. Select Retry answer capture to reconnect the recording stream.`;
}

function describeRecorderError(error?: unknown) {
  if (typeof MediaRecorder === "undefined") {
    return "This browser cannot securely record your answer. Open the assessment in the latest Chrome or Edge, then retry capture.";
  }
  if (error instanceof DOMException && error.name === "NotSupportedError") {
    return "This browser cannot use the available camera and microphone format. Open the assessment in the latest Chrome or Edge, then retry capture.";
  }
  return "Your answer was not recorded. Check that your camera and microphone are connected, then retry capture and answer from the beginning.";
}

function useAccurateClock(enabled: boolean, interval: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, interval);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [enabled, interval]);

  return now;
}

export default function InterviewExperience() {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const [captureIssue, setCaptureIssue] = useState("");
  const [captureRetryError, setCaptureRetryError] = useState("");
  const [captureRetrying, setCaptureRetrying] = useState(false);
  const assessmentActive = ["countdown", "conversation", "coding", "explanation"].includes(session.stage);
  const media = useMediaSession(assessmentActive, session.answerMode === "answering" && (session.stage === "conversation" || session.stage === "explanation"));
  const stopMedia = media.stop;
  const stageRootRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<ActiveRecording | null>(null);
  const responseBlobsRef = useRef<Map<string, Blob>>(new Map());
  const recordingFailureRef = useRef("");
  const promptAudioRef = useRef<HTMLAudioElement>(null);
  const playbackGenerationRef = useRef(0);
  const [audioError, setAudioError] = useState("");
  const transitioningRef = useRef(false);

  const { phase: transitionPhase, navigate: dispatchWithTransition, onAnimationComplete } = useStageTransition(dispatch);

  const unlockPromptAudio = useCallback(() => {
    const audio = promptAudioRef.current;
    if (!audio) return;
    // Ignore a late unlock completion once a real prompt has started.
    const generation = ++playbackGenerationRef.current;
    audio.src = "/audio/sia/unlock.wav";
    audio.muted = false;
    void audio.play().then(() => {
      if (generation !== playbackGenerationRef.current) return;
      audio.pause();
      audio.muted = false;
    }).catch(() => {
      if (generation === playbackGenerationRef.current) audio.muted = false;
    });
  }, []);

  const clockEnabled = assessmentActive;
  const now = useAccurateClock(clockEnabled, 1000);
  const countdown = session.countdownCount;
  const answerElapsed = session.answerStartedAt ? Math.max(0, Math.floor((now - session.answerStartedAt) / 1000)) : 0;
  const sessionElapsed = session.assessmentStartedAt ? Math.max(0, Math.floor((now - session.assessmentStartedAt) / 1000)) : 0;

  const promptAudioSrc = session.stage === "conversation"
    ? assessment.questions[session.questionIndex].audio
    : session.stage === "explanation" ? "/audio/sia/walkthrough.mp3" : null;

  const startAnswerRecorder = useCallback((responseKey: string, streamOverride?: MediaStream): RecorderStartResult => {
    const stream = streamOverride ?? media.stream;
    if (!hasLiveCaptureTracks(stream)) {
      return {
        ok: false,
        error: describeCaptureTracks(stream),
      };
    }
    if (typeof MediaRecorder === "undefined") return { ok: false, error: describeRecorderError() };

    let recordingStream: MediaStream | null = null;
    const release = () => recordingStream?.getTracks().forEach((track) => track.stop());
    try {
      recordingStream = stream.clone();
      const recorder = createAnswerRecorder(recordingStream);
      const active: ActiveRecording = { recorder, stream: recordingStream, chunks: [], responseKey, failed: false, release };

      recorder.addEventListener("dataavailable", (event) => {
        if (!active.failed && event.data.size > 0) active.chunks.push(event.data);
      });
      recorder.addEventListener("error", () => {
        release();
        if (active.failed) return;
        active.failed = true;
        active.chunks = [];
        responseBlobsRef.current.delete(active.responseKey);
        if (recorderRef.current === active) recorderRef.current = null;
        dispatch({ type: "answer-reset" });
        setCaptureRetryError("");
        setCaptureIssue(describeRecorderError());
      });

      recorder.addEventListener("stop", () => {
        active.stopped = true;
        release();
        if (recorderRef.current !== active) return;
        active.failed = true;
        active.failureReason = "The browser stopped recording before you selected Done.";
        recorderRef.current = null;
        dispatch({ type: "answer-reset" });
        setCaptureIssue(active.failureReason + " Retry capture to replay the question.");
      });
      // Drain encoded data throughout the answer instead of buffering the
      // entire clip until Done. Still wait for stop to preserve the final data.
      recorder.start(1000);
      recorderRef.current = active;
      setCaptureIssue("");
      setCaptureRetryError("");
      dispatch({ type: "answer-started", startedAt: Date.now() });
      return { ok: true };
    } catch (error) {
      release();
      return { ok: false, error: describeRecorderError(error) };
    }
  }, [media.stream]);

  const stopAnswerRecorder = useCallback((): Promise<Blob | null> => {
    const active = recorderRef.current;
    recorderRef.current = null;
    if (!active) return Promise.resolve(null);

    // Check capture health before stopping, not while the encoder shuts down.
    if (!hasLiveCaptureTracks(active.stream)) {
      active.failed = true;
      active.failureReason = describeCaptureTracks(active.stream);
    }
    return finishAnswerRecording(active).then((blob) => {
      if (blob) responseBlobsRef.current.set(active.responseKey, blob);
      else {
        responseBlobsRef.current.delete(active.responseKey);
        recordingFailureRef.current = active.failureReason || "The recording was interrupted before it could finish.";
      }
      return blob;
    });
  }, []);

  useEffect(() => {
    if (!promptAudioSrc || session.answerMode !== "asking" || captureIssue || media.integrityIssue || transitionPhase !== "idle") return;
    const audio = promptAudioRef.current;
    if (!audio) return;
    const generation = ++playbackGenerationRef.current;
    let cancelled = false;
    let started = false;
    let played = false;
    const readinessAbort = new AbortController();
    const responseKey = session.stage === "conversation" ? `spoken-${session.questionIndex + 1}` : "walkthrough";
    const beginAnswer = async () => {
      if (cancelled || started || !played || audio.muted || !audio.ended) return;
      started = true;
      await waitForCaptureReady(media.stream, readinessAbort.signal);
      if (cancelled) return;
      const result = startAnswerRecorder(responseKey);
      if (!result.ok) {
        setCaptureRetryError("");
        setCaptureIssue(result.error);
      }
    };
    const fail = () => {
      if (!cancelled) setAudioError("Sia's question could not play. Select Play question to try again.");
    };
    // Keep the same unlocked audio element and avoid redundant source reloads.
    if (audio.getAttribute("src") !== promptAudioSrc) audio.src = promptAudioSrc;
    if (audio.readyState > 0) audio.currentTime = 0;
    audio.muted = false;
    const startupTimer = window.setTimeout(fail, 15_000);
    const onPlaying = () => {
      played = !audio.muted && audio.volume > 0;
      window.clearTimeout(startupTimer);
      if (!cancelled) setAudioError("");
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", beginAnswer);
    audio.addEventListener("error", fail);
    // Motion has finished revealing the page before the prompt starts.
    void audio.play().catch(fail);
    return () => {
      cancelled = true;
      readinessAbort.abort();
      if (playbackGenerationRef.current === generation) playbackGenerationRef.current += 1;
      window.clearTimeout(startupTimer);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", beginAnswer);
      audio.removeEventListener("error", fail);
      audio.pause();
    };
  }, [promptAudioSrc, captureIssue, media.integrityIssue, media.stream, session.answerMode, session.questionIndex, session.stage, startAnswerRecorder, transitionPhase]);

  const retryPromptAudio = () => {
    const audio = promptAudioRef.current;
    if (!audio) return;
    audio.load();
    void audio.play().then(() => setAudioError("")).catch(() => {
      setAudioError("The question audio is still unavailable. Check your connection and select Play question again.");
    });
  };

  const retryAnswerCapture = useCallback(async () => {
    if (captureRetrying) return;
    setCaptureRetrying(true);
    setCaptureRetryError("");

    try {
      let stream = media.stream;
      // Try the still-connected stream before opening competing capture on iOS.
      if (!await waitForCaptureReady(stream)) {
        const result = await media.request(undefined, undefined, true);
        if (!result.ok) {
          setCaptureRetryError(result.error);
          return;
        }
        stream = result.stream;
        await waitForCaptureReady(stream);
      }

      if (!hasLiveCaptureTracks(stream)) {
        setCaptureRetryError(describeCaptureTracks(stream));
        return;
      }
      media.clearRecoveredIssue();
      // Always replay the prompt after recovery. Never bypass it to record.
      dispatch({ type: "answer-reset" });
      setCaptureIssue("");
      setCaptureRetryError("");
    } finally {
      setCaptureRetrying(false);
    }
  }, [captureRetrying, media]);

  useEffect(() => {
    if (!media.integrityIssue || session.answerMode !== "answering") return;
    const active = recorderRef.current;
    if (!active) return;

    active.failed = true;
    active.chunks = [];
    responseBlobsRef.current.delete(active.responseKey);
    void stopAnswerRecorder();
    dispatch({ type: "answer-reset" });
    setCaptureRetryError("");
    setCaptureIssue("Answer capture stopped when a required device disconnected. Reconnect both devices, then retry capture and answer from the beginning.");
  }, [media.integrityIssue, session.answerMode, stopAnswerRecorder]);

  useEffect(() => {
    if (session.stage !== "countdown") return;
    // Schedule each number after its render instead of deriving it from a
    // deadline: a delayed mobile frame must not jump from 3 straight to 1.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      if (document.visibilityState !== "visible") return;
      timer = setTimeout(() => {
        if (countdown > 1) dispatch({ type: "countdown-tick" });
        else dispatchWithTransition({ type: "begin-interview", startedAt: Date.now() });
      }, 1000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [countdown, dispatchWithTransition, session.stage]);

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem(CODE_DRAFT_KEY);
      if (!draft) return;
      try {
        const saved = JSON.parse(draft) as { language?: unknown; drafts?: Partial<Record<CodeLanguage, unknown>> };
        const savedLanguage = typeof saved.language === "string" ? saved.language : "";
        const language: CodeLanguage = assessment.codingLanguages.some((option) => option === savedLanguage)
          ? savedLanguage as CodeLanguage
          : assessment.codingLanguages[0];
        const drafts = Object.fromEntries(
          assessment.codingLanguages.map((option) => [
            option,
            typeof saved.drafts?.[option] === "string"
              ? saved.drafts[option]
              : codeLanguages[option].starterCode,
          ]),
        ) as Record<CodeLanguage, string>;
        dispatch({ type: "code-workspace", language, drafts });
      } catch {
        dispatch({ type: "code", code: draft });
      }
    } catch {
      // Storage can be unavailable in privacy-focused browser modes.
    }
  }, []);

  useEffect(() => {
    const save = window.setTimeout(() => {
      const write = () => {
        try {
          window.localStorage.setItem(CODE_DRAFT_KEY, JSON.stringify({
            language: session.language,
            drafts: session.codeDrafts,
          }));
        } catch { /* no-op */ }
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(write, { timeout: 600 });
      else write();
    }, 400);
    return () => window.clearTimeout(save);
  }, [session.codeDrafts, session.language]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [session.stage, session.questionIndex]);

  useEffect(() => () => {
    void stopAnswerRecorder();
  }, [stopAnswerRecorder]);

  useEffect(() => {
    transitioningRef.current = false;
  }, [session.stage, session.questionIndex]);

  const finishConversationAnswer = useCallback(async () => {
    if (session.answerMode !== "answering" || transitioningRef.current) return;
    transitioningRef.current = true;
    dispatch({ type: "answer-saving" });
    const response = await stopAnswerRecorder();
    if (!response) {
      transitioningRef.current = false;
      dispatch({ type: "answer-reset" });
      setCaptureRetryError("");
      setCaptureIssue(recordingFailureRef.current + " Retry capture to replay the question and answer again.");
      return;
    }
    if (session.questionIndex < assessment.questions.length - 1) dispatchWithTransition({ type: "next-question" });
    else dispatchWithTransition({ type: "begin-coding" });

  }, [dispatchWithTransition, session.answerMode, session.questionIndex, stopAnswerRecorder]);

  const finishInterview = useCallback(async () => {
    if (session.answerMode !== "answering" || transitioningRef.current) return;
    transitioningRef.current = true;
    dispatch({ type: "answer-saving" });
    const response = await stopAnswerRecorder();
    if (!response) {
      transitioningRef.current = false;
      dispatch({ type: "answer-reset" });
      setCaptureRetryError("");
      setCaptureIssue(recordingFailureRef.current + " Retry capture to replay the question and answer again.");
      return;
    }
    dispatchWithTransition({ type: "complete" });
    try { window.localStorage.removeItem(CODE_DRAFT_KEY); } catch { /* no-op */ }
  }, [dispatchWithTransition, session.answerMode, stopAnswerRecorder]);

  useEffect(() => {
    if (session.stage === "complete") stopMedia();
  }, [session.stage, stopMedia]);

  const goBack = () => {
    stopMedia();
    dispatchWithTransition({ type: "stage", stage: "welcome" });
  };

  const announcement = useMemo(() => {
    if (captureIssue) return "Answer capture is blocked. Follow the recovery instructions in the dialog.";
    if (assessmentActive && media.integrityIssue) return "The assessment is blocked because a required device disconnected.";
    if (media.status === "requesting") return "Checking camera and microphone access.";
    if (session.stage === "setup" && media.status === "ready") return "Camera and microphone are ready.";
    if (session.stage === "setup" && media.status === "unavailable") return media.error;

    if (session.answerMode === "saving") return "Finishing your recording. Please wait.";

    switch (session.stage) {
      case "welcome":
        return "Interview invitation ready.";
      case "setup":
        return "Device setup ready.";
      case "countdown":
        return `Interview begins in ${countdown}.`;
      case "conversation":
        if (session.answerMode === "asking") return `Question ${session.questionIndex + 1}. Sia is asking the question.`;
        if (session.answerMode === "answering") return `Answer capture started for question ${session.questionIndex + 1}.`;
        return `Answer ${session.questionIndex + 1} captured.`;
      case "coding":
        return "Coding section ready.";
      case "explanation":
        if (session.answerMode === "asking") return "Sia is asking for your code explanation.";
        if (session.answerMode === "answering") return "Code explanation capture started.";
        return "Code explanation captured.";
      case "complete":
        return "Interview finished.";
    }
  }, [assessmentActive, captureIssue, countdown, media.error, media.integrityIssue, media.status, session.answerMode, session.questionIndex, session.stage]);

  const dialogOpen = Boolean(audioError || captureIssue || (assessmentActive && media.integrityIssue));

  useEffect(() => {
    const root = stageRootRef.current;
    if (!root) return;
    root.toggleAttribute("inert", dialogOpen);
    return () => root.removeAttribute("inert");
  }, [dialogOpen]);

  return (
    <>
      <a className="skip-link" href="#assessment-main">
        Skip to Assessment
      </a>
      <div ref={stageRootRef} className="contents" aria-hidden={dialogOpen || undefined}>
          <StageTransition stageKey={`${session.stage}-${session.questionIndex}`} busy={transitionPhase !== "idle"} onComplete={onAnimationComplete}>
            {session.stage === "welcome" && (
              <WelcomeStage
                onContinue={() => dispatchWithTransition({ type: "stage", stage: "setup" })}
              />
            )}
            {session.stage === "setup" && (
              <SetupStage
                mediaStatus={media.status}
                mediaError={media.error}
                stream={media.stream}
                devices={media.devices}
                selectedCamera={media.selectedCamera}
                selectedMic={media.selectedMic}
                consent={session.consent}
                onConsentChange={(consent) => dispatch({ type: "consent", consent })}
                onCameraChange={media.changeCamera}
                onMicChange={media.changeMic}
                onRequestMedia={() => void media.request()}
                onBack={goBack}
                onStart={() => {
                  unlockPromptAudio();
                  dispatchWithTransition({ type: "countdown" });
                }}
              />
            )}
            {session.stage === "countdown" && <CountdownStage count={countdown} />}
            {session.stage === "conversation" && (
              <ConversationStage
                questionIndex={session.questionIndex}
                answerMode={session.answerMode}
                answerElapsed={answerElapsed}
                sessionElapsed={sessionElapsed}
                stream={media.stream}
                onFinishAnswer={finishConversationAnswer}
              />
            )}
            {session.stage === "coding" && (
              <CodingStage
                code={session.code}
                language={session.language}
                sessionElapsed={sessionElapsed}
                stream={media.stream}
                onCodeChange={(code) => dispatch({ type: "code", code })}
                onLanguageChange={(language) => dispatch({ type: "language", language })}
                onSubmit={() => dispatchWithTransition({ type: "begin-explanation" })}
              />
            )}
            {session.stage === "explanation" && (
              <ExplanationStage
                code={session.code}
                language={session.language}
                answerMode={session.answerMode}
                answerElapsed={answerElapsed}
                sessionElapsed={sessionElapsed}
                stream={media.stream}
                onFinish={finishInterview}
              />
            )}
            {session.stage === "complete" && <CompleteStage />}
          </StageTransition>
      </div>

      <audio ref={promptAudioRef} src="/audio/sia/introduction-v2.mp3" preload="auto" />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {captureIssue ? (
        <IntegrityDialog
          title="Answer capture interrupted"
          issue={captureIssue}
          guidance="No answer has been saved. Retry capture to hear the question again. Recording starts after Sia finishes speaking; select Done after your answer."
          actionLabel="Retry answer capture"
          busyLabel="Retrying capture…"
          busy={captureRetrying}
          error={captureRetryError}
          onReconnect={retryAnswerCapture}
        />
      ) : assessmentActive && media.integrityIssue ? (
        <IntegrityDialog
          issue={media.integrityIssue}
          busy={media.status === "requesting"}
          error={media.status === "unavailable" ? media.error : ""}
          onReconnect={async () => { await media.request(); }}
        />
      ) : audioError ? (
        <IntegrityDialog
          title="Play Sia's question"
          issue={audioError}
          guidance="Your answer recording will begin after the question finishes playing."
          actionLabel="Play question"
          onReconnect={retryPromptAudio}
        />
      ) : null}
    </>
  );
}
