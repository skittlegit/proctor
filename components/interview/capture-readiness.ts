export function hasConnectedCaptureTracks(stream: MediaStream | null | undefined): stream is MediaStream {
  return Boolean(stream && [stream.getVideoTracks()[0], stream.getAudioTracks()[0]]
    .every((track) => track && track.readyState === "live" && track.enabled));
}

// A live track can briefly be muted while iOS switches from prompt playback
// to microphone capture. Resolve immediately when ready, or on unmute; never
// treat an ended/disabled track as usable and never record missing media.
export function waitForCaptureReady(stream: MediaStream | null | undefined, signal?: AbortSignal, timeoutMs = 1500): Promise<boolean> {
  if (!hasConnectedCaptureTracks(stream) || signal?.aborted) return Promise.resolve(false);
  const tracks = [stream.getVideoTracks()[0], stream.getAudioTracks()[0]];
  if (tracks.every((track) => !track.muted)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const finish = (ready: boolean) => {
      clearTimeout(timer);
      tracks.forEach((track) => {
        track.removeEventListener("unmute", check);
        track.removeEventListener("ended", check);
      });
      signal?.removeEventListener("abort", abort);
      resolve(ready);
    };
    const check = () => {
      if (!hasConnectedCaptureTracks(stream)) finish(false);
      else if (tracks.every((track) => !track.muted)) finish(true);
    };
    const abort = () => finish(false);
    const timer = setTimeout(() => finish(false), timeoutMs);
    tracks.forEach((track) => {
      track.addEventListener("unmute", check);
      track.addEventListener("ended", check);
    });
    signal?.addEventListener("abort", abort, { once: true });
    check();
  });
}
