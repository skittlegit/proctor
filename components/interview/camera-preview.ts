export function attachCameraPreview(video: HTMLVideoElement, stream: MediaStream) {
  // Configure inline, silent playback before attaching a source on iOS.
  // Preview elements consume video only; microphone capture belongs to the
  // recorder, not to hidden/responsive video elements.
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.srcObject = new MediaStream(stream.getVideoTracks());
  const resume = () => {
    if (document.visibilityState === "visible") void video.play().catch(() => undefined);
  };
  const tracks = stream.getVideoTracks();
  tracks.forEach((track) => track.addEventListener("unmute", resume));
  document.addEventListener("visibilitychange", resume);
  resume();
  return () => {
    tracks.forEach((track) => track.removeEventListener("unmute", resume));
    document.removeEventListener("visibilitychange", resume);
    video.pause();
    video.srcObject = null;
    // Never stop shared capture tracks when a preview unmounts.
  };
}
