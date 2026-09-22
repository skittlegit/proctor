// Probe formats rather than inferring support from a browser name. Older
// Safari records MP4; Chromium commonly records WebM.
export function createAnswerRecorder(stream: MediaStream): MediaRecorder {
  // Prefer WebM where advertised, including newer Safari. The default iOS
  // encoder has stalled during finalization in device testing of this app.
  const formats = [
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const mimeType of formats) {
    try {
      if (typeof MediaRecorder.isTypeSupported !== "function" || !MediaRecorder.isTypeSupported(mimeType)) continue;
      return new MediaRecorder(stream, { mimeType });
    } catch {
      // An advertised encoder can still be unavailable on the current device.
    }
  }
  return new MediaRecorder(stream);
}

export function recordedBlob(chunks: Blob[], recorderMimeType: string): Blob {
  // Preserve Safari's actual container instead of labelling its MP4 as WebM.
  const type = recorderMimeType || chunks.find((chunk) => chunk.type)?.type || "";
  return new Blob(chunks, { type });
}

export function finishAnswerRecording(
  active: { recorder: MediaRecorder; chunks: Blob[]; failed: boolean; stopped?: boolean; failureReason?: string },
): Promise<Blob | null> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      active.recorder.removeEventListener("stop", finalize);
      active.recorder.removeEventListener("error", fail);
      active.chunks = [];
      resolve(blob);
    };
    const fail = () => {
      active.failureReason ||= "The browser encoder failed while finishing the recording.";
      active.failed = true;
      settle(null);
    };
    const finalize = () => {
      // The stop event follows the final encoded data. Source-track state
      // after stopping cannot tell us whether that completed data is valid.
      if (active.failed) return settle(null);
      const blob = recordedBlob(active.chunks, active.recorder.mimeType);
      if (!blob.size) active.failureReason = "The browser returned an empty recording.";
      settle(blob.size > 0 ? blob : null);
    };
    active.recorder.addEventListener("stop", finalize);
    active.recorder.addEventListener("error", fail);
    if (active.stopped) { finalize(); return; }
    try {
      // An unexpectedly inactive recorder may still have its final events
      // queued. Wait for stop instead of saving incomplete chunks.
      if (active.recorder.state !== "inactive") active.recorder.stop();
    } catch {
      fail();
    }
  });
}
