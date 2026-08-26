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
  | { type: "failed"; error: string }
  | { type: "devices"; devices: MediaDeviceInfo[] }
  | { type: "issue"; issue: string }
  | { type: "stopped" };

type MediaRequestResult =
  | { ok: true; stream: MediaStream }
  | { ok: false; error: string };

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
      return { ...state, status: "unavailable", error: action.error };
    case "devices":
      return { ...state, devices: action.devices };
    case "issue":
      return { ...state, integrityIssue: action.issue };
    case "stopped":
      return { ...initialState };
  }
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function describeMediaError(error: unknown) {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "Camera or microphone access is blocked. Allow both devices for this site in your browser settings, then try again.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "A camera and microphone were not both found. Connect both devices, then try again.";
      case "NotReadableError":
      case "TrackStartError":
      case "AbortError":
        return "A required device is busy or unavailable. Close other apps using your camera or microphone, reconnect it, then try again.";
      case "OverconstrainedError":
      case "ConstraintNotSatisfiedError":
        return "The selected device is no longer available. Choose a connected camera or microphone, then try again.";
      case "SecurityError":
        return "This browser blocked secure media access. Open the assessment in a secure browser window, allow both devices, then try again.";
      default:
        break;
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return "We couldn't connect both required devices. Check your camera and microphone, then try again.";
}

export function useMediaSession(assessmentActive: boolean) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const streamRef = useRef<MediaStream | null>(null);
  const selectionRef = useRef({ camera: "", mic: "" });
  const requestIdRef = useRef(0);
  const intentionallyStoppedTracksRef = useRef(new WeakSet<MediaStreamTrack>());

  const stopSessionTracks = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => {
      intentionallyStoppedTracksRef.current.add(track);
      track.stop();
    });
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    stopSessionTracks(streamRef.current);
    streamRef.current = null;
    dispatch({ type: "stopped" });
  }, [stopSessionTracks]);

  const request = useCallback(async (cameraId?: string, micId?: string): Promise<MediaRequestResult> => {
    const requestedCamera = cameraId ?? selectionRef.current.camera;
    const requestedMic = micId ?? selectionRef.current.mic;
    const requestId = ++requestIdRef.current;
    let pendingStream: MediaStream | null = null;
    dispatch({ type: "requesting" });

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Media devices are not available in this browser.");
      }

      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: requestedCamera ? { deviceId: { exact: requestedCamera } } : true,
        audio: requestedMic ? { deviceId: { exact: requestedMic } } : true,
      });
      pendingStream = nextStream;

      if (requestId !== requestIdRef.current) {
        stopTracks(nextStream);
        return { ok: false, error: "A newer device check replaced this request." };
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
        return { ok: false, error: "A newer device check replaced this request." };
      }

      const activeCamera = videoTrack.getSettings().deviceId || requestedCamera;
      const activeMic = audioTrack.getSettings().deviceId || requestedMic;
      const previousStream = streamRef.current;
      streamRef.current = nextStream;
      pendingStream = null;
      selectionRef.current = { camera: activeCamera, mic: activeMic };
      dispatch({ type: "ready", stream: nextStream, devices: availableDevices, camera: activeCamera, mic: activeMic });
      stopSessionTracks(previousStream);
      return { ok: true, stream: nextStream };
    } catch (error) {
      stopTracks(pendingStream);
      const message = describeMediaError(error);
      if (requestId !== requestIdRef.current) return { ok: false, error: message };
      dispatch({ type: "failed", error: message });
      return { ok: false, error: message };
    }
  }, [stopSessionTracks]);

  const changeCamera = useCallback((id: string) => {
    void request(id, selectionRef.current.mic);
  }, [request]);

  const changeMic = useCallback((id: string) => {
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

    const onVideoLost = (event: Event) => {
      if (event.currentTarget instanceof MediaStreamTrack && intentionallyStoppedTracksRef.current.has(event.currentTarget)) return;
      dispatch({ type: "issue", issue: "The camera connection was lost. This assessment requires continuous video." });
    };
    const onAudioLost = (event: Event) => {
      if (event.currentTarget instanceof MediaStreamTrack && intentionallyStoppedTracksRef.current.has(event.currentTarget)) return;
      dispatch({ type: "issue", issue: "The microphone connection was lost. This assessment requires continuous audio." });
    };
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
      stopSessionTracks(streamRef.current);
      streamRef.current = null;
    };
    window.addEventListener("pagehide", stopOnExit);
    return () => {
      window.removeEventListener("pagehide", stopOnExit);
      stopOnExit();
    };
  }, [stopSessionTracks]);

  return { ...state, request, changeCamera, changeMic, stop };
}
