// Probe formats rather than inferring support from a browser name. Older
// Safari records MP4; Chromium commonly records WebM.
export function createAnswerRecorder(stream: MediaStream): MediaRecorder {
  const formats = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm",
  ];
  for (const mimeType of formats) {
    try {
      if (typeof MediaRecorder.isTypeSupported === "function" && !MediaRecorder.isTypeSupported(mimeType)) continue;
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
