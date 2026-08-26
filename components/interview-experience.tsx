"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import {
  assessment,
  CODE_DRAFT_KEY,
  starterCode,
  type AnswerMode,
  type Stage,
  type TestStatus,
} from "@/components/interview/config";
import { CountdownStage, SetupStage, WelcomeStage } from "@/components/interview/entry-stages";
import { IntegrityDialog, PossoLogo } from "@/components/interview/shared";
import { useMediaSession } from "@/components/interview/use-media-session";

const ConversationStage = dynamic(() => import("@/components/interview/conversation-stage"), {
  loading: () => <StageLoading />,
});
const CodingStage = dynamic(() => import("@/components/interview/coding-stage"), {
  loading: () => <StageLoading />,
});
const ExplanationStage = dynamic(() => import("@/components/interview/explanation-stage"), {
  loading: () => <StageLoading />,
});
const CompleteStage = dynamic(() => import("@/components/interview/complete-stage"), {
  loading: () => <StageLoading />,
});

type SessionState = {
  stage: Stage;
  consent: boolean;
  countdownDeadline: number | null;
  questionIndex: number;
  answerMode: AnswerMode;
  answerStartedAt: number | null;
  code: string;
  codeDeadline: number | null;
  testStatus: TestStatus;
};

type SessionAction =
  | { type: "stage"; stage: Stage }
  | { type: "consent"; consent: boolean }
  | { type: "countdown"; deadline: number }
  | { type: "begin-interview" }
  | { type: "answer-started"; startedAt: number }
  | { type: "answer-saved" }
  | { type: "next-question" }
  | { type: "begin-coding"; deadline: number }
  | { type: "code"; code: string }
  | { type: "test-status"; status: TestStatus }
  | { type: "begin-explanation" }
  | { type: "complete" };

const initialSession: SessionState = {
  stage: "welcome",
  consent: false,
  countdownDeadline: null,
  questionIndex: 0,
  answerMode: "asking",
  answerStartedAt: null,
  code: starterCode,
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
    case "answer-saved":
      return { ...state, answerMode: "saved", answerStartedAt: null };
    case "next-question":
      return { ...state, questionIndex: state.questionIndex + 1, answerMode: "asking", answerStartedAt: null };
    case "begin-coding":
      return { ...state, stage: "coding", codeDeadline: action.deadline, answerMode: "saved", answerStartedAt: null, testStatus: "idle" };
    case "code":
      return { ...state, code: action.code };
    case "test-status":
      return { ...state, testStatus: action.status };
    case "begin-explanation":
      return { ...state, stage: "explanation", codeDeadline: null, answerMode: "asking", answerStartedAt: null };
    case "complete":
      return { ...state, stage: "complete", answerMode: "saved", answerStartedAt: null };
  }
}

function StageLoading() {
  return (
    <main className="grid h-dvh place-items-center bg-canvas text-ink">
      <div className="flex flex-col items-center gap-4"><PossoLogo /><span className="size-5 animate-spin rounded-full border-2 border-line border-t-brand" /><p className="text-sm text-muted">Preparing the next section...</p></div>
    </main>
  );
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
  const assessmentActive = ["countdown", "conversation", "coding", "explanation"].includes(session.stage);
  const media = useMediaSession(assessmentActive);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const responseBlobsRef = useRef<Map<string, Blob>>(new Map());
  const responseKeyRef = useRef("");
  const transitionTimerRef = useRef<number | null>(null);
  const testTimerRef = useRef<number | null>(null);
  const transitioningRef = useRef(false);

  const clockEnabled = session.stage === "countdown" || session.stage === "coding" || session.answerMode === "answering";
  const tickRate = session.stage === "countdown" ? 100 : 1000;
  const now = useAccurateClock(clockEnabled, tickRate);
  const countdown = session.countdownDeadline ? Math.max(1, Math.ceil((session.countdownDeadline - now) / 1000)) : 3;
  const answerElapsed = session.answerStartedAt ? Math.max(0, Math.floor((now - session.answerStartedAt) / 1000)) : 0;
  const codeTimeRemaining = session.codeDeadline ? Math.max(0, Math.ceil((session.codeDeadline - now) / 1000)) : assessment.codingSeconds;

  const activePrompt = useMemo(() => {
    if (session.stage === "conversation") return assessment.questions[session.questionIndex].prompt;
    if (session.stage === "explanation") return "Walk me through your approach and one tradeoff you considered.";
    return "";
  }, [session.questionIndex, session.stage]);

  const startAnswerRecorder = useCallback((responseKey: string) => {
    const stream = media.stream;
    if (!stream || typeof MediaRecorder === "undefined") return false;

    try {
      const preferredType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
      recorderChunksRef.current = [];
      responseKeyRef.current = responseKey;
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) recorderChunksRef.current.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const blob = new Blob(recorderChunksRef.current, { type: recorder.mimeType || "video/webm" });
        if (blob.size > 0) responseBlobsRef.current.set(responseKeyRef.current, blob);
        recorderChunksRef.current = [];
      }, { once: true });
      recorder.start(500);
      recorderRef.current = recorder;
      dispatch({ type: "answer-started", startedAt: Date.now() });
      return true;
    } catch {
      return false;
    }
  }, [media.stream]);

  const stopAnswerRecorder = useCallback(() => {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (!recorder || recorder.state === "inactive") return;
    try {
      recorder.requestData();
      recorder.stop();
    } catch {
      // The device lifecycle will surface an integrity issue when capture is interrupted.
    }
  }, []);

  useEffect(() => {
    if (!activePrompt || session.answerMode !== "asking") return;
    let cancelled = false;
    let started = false;
    let fallbackTimer = 0;
    const schedule = window.setTimeout.bind(window);
    const responseKey = session.stage === "conversation" ? `spoken-${session.questionIndex + 1}` : "walkthrough";

    const beginAnswer = () => {
      if (cancelled || started) return;
      started = true;
      if (!startAnswerRecorder(responseKey)) {
        dispatch({ type: "answer-started", startedAt: Date.now() });
      }
    };

    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      const utterance = new SpeechSynthesisUtterance(activePrompt);
      utterance.rate = 0.94;
      utterance.pitch = 1.02;
      utterance.onend = beginAnswer;
      utterance.onerror = beginAnswer;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      fallbackTimer = schedule(beginAnswer, 30_000);
    } else {
      fallbackTimer = schedule(beginAnswer, 500);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      window.speechSynthesis?.cancel();
    };
  }, [activePrompt, session.answerMode, session.questionIndex, session.stage, startAnswerRecorder]);

  useEffect(() => {
    if (session.stage !== "countdown" || !session.countdownDeadline) return;
    const delay = Math.max(0, session.countdownDeadline - Date.now());
    const timer = window.setTimeout(() => dispatch({ type: "begin-interview" }), delay);
    return () => window.clearTimeout(timer);
  }, [session.countdownDeadline, session.stage]);

  useEffect(() => {
    if (session.stage !== "coding" || !session.codeDeadline) return;
    const delay = Math.max(0, session.codeDeadline - Date.now());
    const timer = window.setTimeout(() => dispatch({ type: "begin-explanation" }), delay);
    return () => window.clearTimeout(timer);
  }, [session.codeDeadline, session.stage]);

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem(CODE_DRAFT_KEY);
      if (draft) dispatch({ type: "code", code: draft });
    } catch {
      // Storage can be unavailable in privacy-focused browser modes.
    }
  }, []);

  useEffect(() => {
    if (session.code === starterCode) return;
    const save = window.setTimeout(() => {
      const write = () => {
        try { window.localStorage.setItem(CODE_DRAFT_KEY, session.code); } catch { /* no-op */ }
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(write, { timeout: 600 });
      else write();
    }, 400);
    return () => window.clearTimeout(save);
  }, [session.code]);

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

  useEffect(() => {
    if (session.stage === "countdown") void import("@/components/interview/conversation-stage");
    if (session.stage === "conversation") void import("@/components/interview/coding-stage");
    if (session.stage === "coding") void import("@/components/interview/explanation-stage");
  }, [session.stage]);

  useEffect(() => () => {
    stopAnswerRecorder();
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    if (testTimerRef.current) window.clearTimeout(testTimerRef.current);
  }, [stopAnswerRecorder]);

  const finishConversationAnswer = useCallback(() => {
    if (session.answerMode !== "answering" || transitioningRef.current) return;
    transitioningRef.current = true;
    stopAnswerRecorder();
    dispatch({ type: "answer-saved" });
    transitionTimerRef.current = window.setTimeout(() => {
      transitioningRef.current = false;
      if (session.questionIndex < assessment.questions.length - 1) dispatch({ type: "next-question" });
      else dispatch({ type: "begin-coding", deadline: Date.now() + assessment.codingSeconds * 1000 });
    }, 550);
  }, [session.answerMode, session.questionIndex, stopAnswerRecorder]);

  const runTests = useCallback(() => {
    if (session.testStatus === "running") return;
    dispatch({ type: "test-status", status: "running" });
    if (testTimerRef.current) window.clearTimeout(testTimerRef.current);
    testTimerRef.current = window.setTimeout(() => dispatch({ type: "test-status", status: "passed" }), 700);
  }, [session.testStatus]);

  const finishInterview = useCallback(() => {
    if (session.answerMode !== "answering" || transitioningRef.current) return;
    transitioningRef.current = true;
    stopAnswerRecorder();
    dispatch({ type: "complete" });
    media.stop();
    try { window.localStorage.removeItem(CODE_DRAFT_KEY); } catch { /* no-op */ }
  }, [media, session.answerMode, stopAnswerRecorder]);

  const goBack = () => {
    media.stop();
    dispatch({ type: "stage", stage: "welcome" });
  };

  return (
    <>
      {session.stage === "welcome" && <WelcomeStage onContinue={() => dispatch({ type: "stage", stage: "setup" })} />}
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
          onStart={() => dispatch({ type: "countdown", deadline: Date.now() + 3000 })}
        />
      )}
      {session.stage === "countdown" && <CountdownStage count={countdown} />}
      {session.stage === "conversation" && <ConversationStage questionIndex={session.questionIndex} answerMode={session.answerMode} answerElapsed={answerElapsed} stream={media.stream} onFinishAnswer={finishConversationAnswer} />}
      {session.stage === "coding" && <CodingStage code={session.code} timeRemaining={codeTimeRemaining} testStatus={session.testStatus} stream={media.stream} onCodeChange={(code) => dispatch({ type: "code", code })} onRunTests={runTests} onSubmit={() => dispatch({ type: "begin-explanation" })} />}
      {session.stage === "explanation" && <ExplanationStage code={session.code} answerMode={session.answerMode} answerElapsed={answerElapsed} stream={media.stream} onFinish={finishInterview} />}
      {session.stage === "complete" && <CompleteStage />}
      {assessmentActive && media.integrityIssue && <IntegrityDialog issue={media.integrityIssue} onReconnect={() => void media.request()} />}
    </>
  );
}
