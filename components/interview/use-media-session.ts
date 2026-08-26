"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

import { type MediaStatus } from "./config";

type MediaState = {
  status: MediaStatus;
  error: string;
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  integrityIssue: string;
};

type Action =
  | { type: "requesting" }
  | { type: "ready"; stream: MediaStream; devices: MediaDeviceInfo[]; camera: string; mic: string }
  | { type: "failed"; error: string; keepReady: boolean }
  | { type: "devices"; devices: MediaDeviceInfo[] }
  | { type: "camera"; id: string }
  | { type: "mic"; id: string }
  | { type: "issue"; issue: string }
  | { type: "stopped" };

const initialState: MediaState = {
  status: "idle",
  error: "Camera and microphone access is required to continue.",
  stream: null,
  devices: [],
  selectedCamera: "",
  selectedMic: "",
  integrityIssue: "",
};

function reducer(state: MediaState, action: Action): MediaState {
  switch (action.type) {
    case "requesting":
      return { ...state, status: "requesting", error: "" };
    case "ready":
      return {
        ...state,
        status: "ready",
        error: "",
        stream: action.stream,
        devices: action.devices,
        selectedCamera: action.camera,
        selectedMic: action.mic,
        integrityIssue: "",
      };
    case "failed":
      return { ...state, status: action.keepReady ? "ready" : "unavailable", error: action.error };
    case "devices":
      return { ...state, devices: action.devices };
    case "camera":
      return { ...state, selectedCamera: action.id };
    case "mic":
      return { ...state, selectedMic: action.id };
    case "issue":
      return { ...state, integrityIssue: action.issue };
    case "stopped":
      return { ...initialState };
  }
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useMediaSession(assessmentActive: boolean) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const streamRef = useRef<MediaStream | null>(null);
  const selectionRef = useRef({ camera: "", mic: "" });
  const requestIdRef = useRef(0);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    stopTracks(streamRef.current);
    streamRef.current = null;
    dispatch({ type: "stopped" });
  }, []);

  const request = useCallback(async (cameraId?: string, micId?: string) => {
    const requestedCamera = cameraId ?? selectionRef.current.camera;
    const requestedMic = micId ?? selectionRef.current.mic;
    const requestId = ++requestIdRef.current;
    dispatch({ type: "requesting" });

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Media devices are not available in this browser.");
      }

      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: requestedCamera ? { deviceId: { exact: requestedCamera } } : true,
        audio: requestedMic ? { deviceId: { exact: requestedMic } } : true,
      });

      if (requestId !== requestIdRef.current) {
        stopTracks(nextStream);
        return;
      }

      const videoTrack = nextStream.getVideoTracks()[0];
      const audioTrack = nextStream.getAudioTracks()[0];
      if (!videoTrack || !audioTrack || videoTrack.readyState !== "live" || audioTrack.readyState !== "live") {
        stopTracks(nextStream);
        throw new Error("A live camera and microphone are both required.");
      }

      const availableDevices = await navigator.mediaDevices.enumerateDevices();
      if (requestId !== requestIdRef.current) {
        stopTracks(nextStream);
        return;
      }

      const activeCamera = videoTrack.getSettings().deviceId || requestedCamera;
      const activeMic = audioTrack.getSettings().deviceId || requestedMic;
      const previousStream = streamRef.current;
      streamRef.current = nextStream;
      selectionRef.current = { camera: activeCamera, mic: activeMic };
      dispatch({ type: "ready", stream: nextStream, devices: availableDevices, camera: activeCamera, mic: activeMic });
      stopTracks(previousStream);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = error instanceof Error ? error.message : "Required devices are unavailable.";
      const currentStream = streamRef.current;
      const keepReady = Boolean(currentStream?.getTracks().every((track) => track.readyState === "live"));
      dispatch({ type: "failed", error: message, keepReady });
    }
  }, []);

  const changeCamera = useCallback((id: string) => {
    selectionRef.current.camera = id;
    dispatch({ type: "camera", id });
    void request(id, selectionRef.current.mic);
  }, [request]);

  const changeMic = useCallback((id: string) => {
    selectionRef.current.mic = id;
    dispatch({ type: "mic", id });
    void request(selectionRef.current.camera, id);
  }, [request]);

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.addEventListener) return;
    const refreshDevices = () => {
      void mediaDevices.enumerateDevices().then((devices) => dispatch({ type: "devices", devices })).catch(() => undefined);
    };
    mediaDevices.addEventListener("devicechange", refreshDevices);
    return () => mediaDevices.removeEventListener("devicechange", refreshDevices);
  }, []);

  useEffect(() => {
    const stream = state.stream;
    if (!assessmentActive || !stream) return;

    const onVideoLost = () => dispatch({ type: "issue", issue: "The camera connection was lost. This assessment requires continuous video." });
    const onAudioLost = () => dispatch({ type: "issue", issue: "The microphone connection was lost. This assessment requires continuous audio." });
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    videoTracks.forEach((track) => {
      track.enabled = true;
      track.addEventListener("ended", onVideoLost);
      track.addEventListener("mute", onVideoLost);
    });
    audioTracks.forEach((track) => {
      track.enabled = true;
      track.addEventListener("ended", onAudioLost);
      track.addEventListener("mute", onAudioLost);
    });

    return () => {
      videoTracks.forEach((track) => {
        track.removeEventListener("ended", onVideoLost);
        track.removeEventListener("mute", onVideoLost);
      });
      audioTracks.forEach((track) => {
        track.removeEventListener("ended", onAudioLost);
        track.removeEventListener("mute", onAudioLost);
      });
    };
  }, [assessmentActive, state.stream]);

  useEffect(() => {
    const stopOnExit = () => {
      stopTracks(streamRef.current);
      streamRef.current = null;
    };
    window.addEventListener("pagehide", stopOnExit);
    return () => {
      window.removeEventListener("pagehide", stopOnExit);
      stopOnExit();
    };
  }, []);

  return { ...state, request, changeCamera, changeMic, stop };
}
