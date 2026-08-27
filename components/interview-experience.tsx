"use client";

import {
  addTransitionType,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  ViewTransition,
} from "react";

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
  type TestStatus,
} from "@/components/interview/config";
import ConversationStage from "@/components/interview/conversation-stage";
import { CountdownStage, SetupStage, WelcomeStage } from "@/components/interview/entry-stages";
import ExplanationStage from "@/components/interview/explanation-stage";
import { IntegrityDialog } from "@/components/interview/shared";
import { useMediaSession } from "@/components/interview/use-media-session";

type SessionState = {
  stage: Stage;
  consent: boolean;
  countdownDeadline: number | null;
  questionIndex: number;
  answerMode: AnswerMode;
  answerStartedAt: number | null;
  language: CodeLanguage;
  code: string;
  codeDrafts: Record<CodeLanguage, string>;
  codeDeadline: number | null;
  testStatus: TestStatus;
};

type SessionAction =
  | { type: "stage"; stage: Stage }
  | { type: "consent"; consent: boolean }
  | { type: "countdown"; deadline: number }
  | { type: "begin-interview" }
  | { type: "answer-started"; startedAt: number }
  | { type: "answer-reset" }
  | { type: "answer-saved" }
  | { type: "next-question" }
  | { type: "begin-coding"; deadline: number }
  | { type: "language"; language: CodeLanguage }
  | { type: "code"; code: string }
  | { type: "code-workspace"; language: CodeLanguage; drafts: Record<CodeLanguage, string> }
  | { type: "test-status"; status: TestStatus }
  | { type: "begin-explanation" }
  | { type: "complete" };

type StageTransition =
  | "assessment-open"
  | "assessment-back"
  | "assessment-launch"
  | "assessment-live"
  | "assessment-question"
  | "assessment-workspace"
  | "assessment-handoff"
  | "assessment-complete";

const initialSession: SessionState = {
  stage: "welcome",
  consent: false,
  countdownDeadline: null,
  questionIndex: 0,
  answerMode: "asking",
  answerStartedAt: null,
  language: "typescript",
  code: starterCode,
  codeDrafts: { ...starterCodeDrafts },
  codeDeadline: null,
  testStatus: "idle",
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "stage":
      return { ...state, stage: action.stage };
    case "consent":
      return { ...state, consent: action.consent };
    case "countdown":
      return { ...state, stage: "countdown", countdownDeadline: action.deadline };
    case "begin-interview":
      return { ...state, stage: "conversation", countdownDeadline: null, answerMode: "asking", answerStartedAt: null };
    case "answer-started":
      return { ...state, answerMode: "answering", answerStartedAt: action.startedAt };
    case "answer-reset":
      return { ...state, answerMode: "asking", answerStartedAt: null };
    case "answer-saved":
      return { ...state, answerMode: "saved", answerStartedAt: null };
    case "next-question":
      return { ...state, questionIndex: state.questionIndex + 1, answerMode: "asking", answerStartedAt: null };
    case "begin-coding":
      return { ...state, stage: "coding", codeDeadline: action.deadline, answerMode: "saved", answerStartedAt: null, testStatus: "idle" };
    case "language":
      return { ...state, language: action.language, code: state.codeDrafts[action.language], testStatus: "idle" };
    case "code":
      return { ...state, code: action.code, codeDrafts: { ...state.codeDrafts, [state.language]: action.code } };
    case "code-workspace":
      return { ...state, language: action.language, code: action.drafts[action.language], codeDrafts: action.drafts };
    case "test-status":
      return { ...state, testStatus: action.status };
    case "begin-explanation":
      return { ...state, stage: "explanation", codeDeadline: null, answerMode: "asking", answerStartedAt: null };
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
  const media = useMediaSession(assessmentActive);
  const stopMedia = media.stop;
  const stageRootRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<ActiveRecording | null>(null);
  const responseBlobsRef = useRef<Map<string, Blob>>(new Map());
  const pendingResponseKeyRef = useRef("");
  const transitionTimerRef = useRef<number | null>(null);
  const testTimerRef = useRef<number | null>(null);
  const transitioningRef = useRef(false);

  const dispatchWithTransition = useCallback((action: SessionAction, transition: StageTransition) => {
    startTransition(() => {
      addTransitionType(transition);
      dispatch(action);
    });
  }, []);

  const unlockSpeechSynthesis = useCallback(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    synthesis.resume();
    void synthesis.getVoices();

    // Mobile browsers often require speech to be initialized inside a user gesture.
    const unlockUtterance = new SpeechSynthesisUtterance(" ");
    unlockUtterance.volume = 0.01;
    unlockUtterance.rate = 10;
    synthesis.speak(unlockUtterance);
  }, []);

  const clockEnabled = session.stage === "countdown" || session.stage === "coding" || session.answerMode === "answering";
  const tickRate = session.stage === "countdown" ? 100 : 1000;
  const now = useAccurateClock(clockEnabled, tickRate);
  const countdown = session.countdownDeadline ? Math.min(3, Math.max(1, Math.ceil((session.countdownDeadline - now) / 1000))) : 3;
  const answerElapsed = session.answerStartedAt ? Math.max(0, Math.floor((now - session.answerStartedAt) / 1000)) : 0;
  const codeTimeRemaining = session.codeDeadline ? Math.max(0, Math.ceil((session.codeDeadline - now) / 1000)) : assessment.codingSeconds;

  const activePrompt = useMemo(() => {
    if (session.stage === "conversation") return assessment.questions[session.questionIndex].prompt;
    if (session.stage === "explanation") return "Walk me through your approach and one tradeoff you considered.";
    return "";
  }, [session.questionIndex, session.stage]);

  const startAnswerRecorder = useCallback((responseKey: string, streamOverride?: MediaStream): RecorderStartResult => {
    pendingResponseKeyRef.current = responseKey;
    const stream = streamOverride ?? media.stream;
    if (!hasLiveCaptureTracks(stream)) {
      return {
        ok: false,
        error: "Answer capture could not start because a live camera and microphone were not detected. Reconnect both devices, then retry capture.",
      };
    }
    if (typeof MediaRecorder === "undefined") return { ok: false, error: describeRecorderError() };

    try {
      const preferredType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
      const active: ActiveRecording = { recorder, stream, chunks: [], responseKey, failed: false };

      recorder.addEventListener("dataavailable", (event) => {
        if (!active.failed && event.data.size > 0) active.chunks.push(event.data);
      });
      recorder.addEventListener("error", () => {
        if (active.failed) return;
        active.failed = true;
        active.chunks = [];
        responseBlobsRef.current.delete(active.responseKey);
        if (recorderRef.current === active) recorderRef.current = null;
        dispatch({ type: "answer-reset" });
        setCaptureRetryError("");
        setCaptureIssue(describeRecorderError());
      });

      recorder.start(500);
      recorderRef.current = active;
      setCaptureIssue("");
      setCaptureRetryError("");
      dispatch({ type: "answer-started", startedAt: Date.now() });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: describeRecorderError(error) };
    }
  }, [media.stream]);

  const stopAnswerRecorder = useCallback((): Promise<Blob | null> => {
    const active = recorderRef.current;
    recorderRef.current = null;
    if (!active) return Promise.resolve(null);

    return new Promise((resolve) => {
      let settled = false;
      const settle = (blob: Blob | null) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (blob) responseBlobsRef.current.set(active.responseKey, blob);
        resolve(blob);
      };
      const finalize = () => {
        if (active.failed || !hasLiveCaptureTracks(active.stream)) {
          settle(null);
          return;
        }
        const blob = new Blob(active.chunks, { type: active.recorder.mimeType || "video/webm" });
        active.chunks = [];
        settle(blob.size > 0 ? blob : null);
      };
      const fail = () => {
        active.failed = true;
        active.chunks = [];
        responseBlobsRef.current.delete(active.responseKey);
        settle(null);
      };
      const timeout = window.setTimeout(fail, 4_000);

      if (active.recorder.state === "inactive") {
        finalize();
        return;
      }

      active.recorder.addEventListener("stop", finalize, { once: true });
      active.recorder.addEventListener("error", fail, { once: true });
      try {
        active.recorder.requestData();
        active.recorder.stop();
      } catch {
        fail();
      }
    });
  }, []);

  useEffect(() => {
    if (!activePrompt || session.answerMode !== "asking" || captureIssue || media.integrityIssue) return;
    let cancelled = false;
    let started = false;
    let fallbackTimer = 0;
    let speechStarted = false;
    let speechAttempt = 0;
    const resumeTimers: number[] = [];
    const schedule = window.setTimeout.bind(window);
    const responseKey = session.stage === "conversation" ? `spoken-${session.questionIndex + 1}` : "walkthrough";

    const beginAnswer = () => {
      if (cancelled || started) return;
      started = true;
      const result = startAnswerRecorder(responseKey);
      if (!result.ok) {
        setCaptureRetryError("");
        setCaptureIssue(result.error);
      }
    };

    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      const synthesis = window.speechSynthesis;
      const speakPrompt = () => {
        if (cancelled) return;
        speechAttempt += 1;
        const utterance = new SpeechSynthesisUtterance(activePrompt);
        const voices = synthesis.getVoices();
        const voice = voices.find((candidate) => candidate.lang.toLowerCase().startsWith("en") && candidate.localService)
          ?? voices.find((candidate) => candidate.lang.toLowerCase().startsWith("en"));
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang || "en-US";
        utterance.rate = 0.94;
        utterance.pitch = 1.02;
        utterance.volume = 1;
        utterance.onstart = () => { speechStarted = true; };
        utterance.onend = beginAnswer;
        utterance.onerror = (event) => {
          if (cancelled || event.error === "canceled" || event.error === "interrupted") return;
          if (!speechStarted && speechAttempt < 2) {
            resumeTimers.push(schedule(speakPrompt, 120));
            return;
          }
          beginAnswer();
        };

        synthesis.cancel();
        synthesis.resume();
        synthesis.speak(utterance);
      };

      speakPrompt();
      [100, 450, 1_200].forEach((delay) => {
        resumeTimers.push(schedule(() => synthesis.resume(), delay));
      });
      resumeTimers.push(schedule(() => {
        if (!speechStarted && !synthesis.speaking && speechAttempt < 2) speakPrompt();
      }, 1_000));

      const resumeWhenVisible = () => {
        if (document.visibilityState === "visible") synthesis.resume();
      };
      document.addEventListener("visibilitychange", resumeWhenVisible);
      fallbackTimer = schedule(beginAnswer, 30_000);

      return () => {
        cancelled = true;
        window.clearTimeout(fallbackTimer);
        resumeTimers.forEach((timer) => window.clearTimeout(timer));
        document.removeEventListener("visibilitychange", resumeWhenVisible);
        synthesis.cancel();
      };
    } else {
      fallbackTimer = schedule(beginAnswer, 500);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [activePrompt, captureIssue, media.integrityIssue, session.answerMode, session.questionIndex, session.stage, startAnswerRecorder]);

  const retryAnswerCapture = useCallback(async () => {
    if (captureRetrying) return;
    setCaptureRetrying(true);
    setCaptureRetryError("");

    try {
      let stream = media.stream;
      if (media.integrityIssue || !hasLiveCaptureTracks(stream)) {
        const result = await media.request();
        if (!result.ok) {
          setCaptureRetryError(result.error);
          return;
        }
        stream = result.stream;
      }

      const responseKey = pendingResponseKeyRef.current
        || (session.stage === "conversation" ? `spoken-${session.questionIndex + 1}` : "walkthrough");
      const result = startAnswerRecorder(responseKey, stream ?? undefined);
      if (!result.ok) {
        setCaptureRetryError(result.error);
        return;
      }

      setCaptureIssue("");
      setCaptureRetryError("");
    } finally {
      setCaptureRetrying(false);
    }
  }, [captureRetrying, media, session.questionIndex, session.stage, startAnswerRecorder]);

  useEffect(() => {
    if (!media.integrityIssue || session.answerMode !== "answering") return;
    const active = recorderRef.current;
    if (!active) return;

    active.failed = true;
    active.chunks = [];
    pendingResponseKeyRef.current = active.responseKey;
    responseBlobsRef.current.delete(active.responseKey);
    void stopAnswerRecorder();
    dispatch({ type: "answer-reset" });
    setCaptureRetryError("");
    setCaptureIssue("Answer capture stopped when a required device disconnected. Reconnect both devices, then retry capture and answer from the beginning.");
  }, [media.integrityIssue, session.answerMode, stopAnswerRecorder]);

  useEffect(() => {
    if (session.stage !== "countdown" || !session.countdownDeadline) return;
    const delay = Math.max(0, session.countdownDeadline - Date.now());
    const timer = window.setTimeout(() => dispatchWithTransition({ type: "begin-interview" }, "assessment-live"), delay);
    return () => window.clearTimeout(timer);
  }, [dispatchWithTransition, session.countdownDeadline, session.stage]);

  useEffect(() => {
    if (session.stage !== "coding" || !session.codeDeadline) return;
    const delay = Math.max(0, session.codeDeadline - Date.now());
    const timer = window.setTimeout(() => dispatchWithTransition({ type: "begin-explanation" }, "assessment-handoff"), delay);
    return () => window.clearTimeout(timer);
  }, [dispatchWithTransition, session.codeDeadline, session.stage]);

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
        const drafts: Record<CodeLanguage, string> = {
          typescript: typeof saved.drafts?.typescript === "string" ? saved.drafts.typescript : codeLanguages.typescript.starterCode,
          javascript: typeof saved.drafts?.javascript === "string" ? saved.drafts.javascript : codeLanguages.javascript.starterCode,
          python: typeof saved.drafts?.python === "string" ? saved.drafts.python : codeLanguages.python.starterCode,
          java: typeof saved.drafts?.java === "string" ? saved.drafts.java : codeLanguages.java.starterCode,
        };
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

    const focusHeading = () => {
      const heading = document.querySelector<HTMLElement>("[data-stage-heading]");
      if (!heading) return false;
      heading.focus({ preventScroll: true });
      return true;
    };

    if (focusHeading()) return;
    const observer = new MutationObserver(() => {
      if (focusHeading()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [session.stage, session.questionIndex]);

  useEffect(() => () => {
    void stopAnswerRecorder();
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    if (testTimerRef.current) window.clearTimeout(testTimerRef.current);
  }, [stopAnswerRecorder]);

  const finishConversationAnswer = useCallback(async () => {
    if (session.answerMode !== "answering" || transitioningRef.current) return;
    transitioningRef.current = true;
    const response = await stopAnswerRecorder();
    if (!response) {
      transitioningRef.current = false;
      dispatch({ type: "answer-reset" });
      setCaptureRetryError("");
      setCaptureIssue(describeRecorderError());
      return;
    }
    dispatch({ type: "answer-saved" });
    transitionTimerRef.current = window.setTimeout(() => {
      transitioningRef.current = false;
      if (session.questionIndex < assessment.questions.length - 1) dispatchWithTransition({ type: "next-question" }, "assessment-question");
      else dispatchWithTransition({ type: "begin-coding", deadline: Date.now() + assessment.codingSeconds * 1000 }, "assessment-workspace");
    }, 550);
  }, [dispatchWithTransition, session.answerMode, session.questionIndex, stopAnswerRecorder]);

  const runTests = useCallback(() => {
    if (session.testStatus === "running") return;
    dispatch({ type: "test-status", status: "running" });
    if (testTimerRef.current) window.clearTimeout(testTimerRef.current);
    testTimerRef.current = window.setTimeout(() => dispatch({ type: "test-status", status: "passed" }), 700);
  }, [session.testStatus]);

  const finishInterview = useCallback(async () => {
    if (session.answerMode !== "answering" || transitioningRef.current) return;
    transitioningRef.current = true;
    const response = await stopAnswerRecorder();
    if (!response) {
      transitioningRef.current = false;
      dispatch({ type: "answer-reset" });
      setCaptureRetryError("");
      setCaptureIssue(describeRecorderError());
      return;
    }
    dispatchWithTransition({ type: "complete" }, "assessment-complete");
    stopMedia();
    try { window.localStorage.removeItem(CODE_DRAFT_KEY); } catch { /* no-op */ }
  }, [dispatchWithTransition, session.answerMode, stopAnswerRecorder, stopMedia]);

  const goBack = () => {
    stopMedia();
    dispatchWithTransition({ type: "stage", stage: "welcome" }, "assessment-back");
  };

  const announcement = useMemo(() => {
    if (captureIssue) return "Answer capture is blocked. Follow the recovery instructions in the dialog.";
    if (assessmentActive && media.integrityIssue) return "The assessment is blocked because a required device disconnected.";
    if (media.status === "requesting") return "Checking camera and microphone access.";
    if (session.stage === "setup" && media.status === "ready") return "Camera and microphone are ready.";
    if (session.stage === "setup" && media.status === "unavailable") return media.error;

    switch (session.stage) {
      case "welcome":
        return "Interview invitation ready.";
      case "setup":
        return "Device setup ready.";
      case "countdown":
        return `Interview begins in ${countdown}.`;
      case "conversation":
        if (session.answerMode === "asking") return `Question ${session.questionIndex + 1}. Maya is asking the question.`;
        if (session.answerMode === "answering") return `Answer capture started for question ${session.questionIndex + 1}.`;
        return `Answer ${session.questionIndex + 1} captured.`;
      case "coding":
        if (session.testStatus === "running") return "Preparing the sample preview.";
        if (session.testStatus === "passed") return "Sample preview ready.";
        return "Coding section ready.";
      case "explanation":
        if (session.answerMode === "asking") return "Maya is asking for your code explanation.";
        if (session.answerMode === "answering") return "Code explanation capture started.";
        return "Code explanation captured.";
      case "complete":
        return "Interview finished.";
    }
  }, [assessmentActive, captureIssue, countdown, media.error, media.integrityIssue, media.status, session.answerMode, session.questionIndex, session.stage, session.testStatus]);

  const dialogOpen = Boolean(captureIssue || (assessmentActive && media.integrityIssue));
  const transitionKey = session.stage === "conversation"
    ? `conversation-${session.questionIndex}`
    : session.stage;

  useEffect(() => {
    const root = stageRootRef.current;
    if (!root) return;
    root.toggleAttribute("inert", dialogOpen);
    return () => root.removeAttribute("inert");
  }, [dialogOpen]);

  return (
    <>
      <div ref={stageRootRef} className="contents" aria-hidden={dialogOpen || undefined}>
        <ViewTransition
          key={transitionKey}
          name="assessment-stage"
          share={{
            "assessment-open": "assessment-open",
            "assessment-back": "assessment-back",
            "assessment-launch": "assessment-launch",
            "assessment-live": "assessment-live",
            "assessment-question": "assessment-question",
            "assessment-workspace": "assessment-workspace",
            "assessment-handoff": "assessment-handoff",
            "assessment-complete": "assessment-complete",
            default: "assessment-stage-swap",
          }}
          default="none"
        >
          <div className="assessment-stage">
            {session.stage === "welcome" && (
              <WelcomeStage
                onContinue={() => dispatchWithTransition({ type: "stage", stage: "setup" }, "assessment-open")}
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
                  unlockSpeechSynthesis();
                  dispatchWithTransition({ type: "countdown", deadline: Date.now() + 3000 }, "assessment-launch");
                }}
              />
            )}
            {session.stage === "countdown" && <CountdownStage count={countdown} />}
            {session.stage === "conversation" && (
              <ConversationStage
                questionIndex={session.questionIndex}
                answerMode={session.answerMode}
                answerElapsed={answerElapsed}
                stream={media.stream}
                onFinishAnswer={finishConversationAnswer}
              />
            )}
            {session.stage === "coding" && (
              <CodingStage
                code={session.code}
                language={session.language}
                timeRemaining={codeTimeRemaining}
                testStatus={session.testStatus}
                stream={media.stream}
                onCodeChange={(code) => dispatch({ type: "code", code })}
                onLanguageChange={(language) => dispatch({ type: "language", language })}
                onRunTests={runTests}
                onSubmit={() => dispatchWithTransition({ type: "begin-explanation" }, "assessment-handoff")}
              />
            )}
            {session.stage === "explanation" && (
              <ExplanationStage
                code={session.code}
                language={session.language}
                answerMode={session.answerMode}
                answerElapsed={answerElapsed}
                stream={media.stream}
                onFinish={finishInterview}
              />
            )}
            {session.stage === "complete" && <CompleteStage />}
          </div>
        </ViewTransition>
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {captureIssue ? (
        <IntegrityDialog
          title="Answer capture interrupted"
          issue={captureIssue}
          guidance="No answer has been saved. Retry capture, then answer the visible question from the beginning and select Done when you finish."
          actionLabel="Retry answer capture"
          busyLabel="Retrying capture..."
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
      ) : null}
    </>
  );
}
