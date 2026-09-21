const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  new Function("exports", code)(exports);
  return exports;
}

const { waitForCaptureReady } = load("components/interview/capture-readiness.ts");
const { createAnswerRecorder, recordedBlob } = load("components/interview/recording-format.ts");
class Track extends EventTarget {
  readyState = "live";
  enabled = true;
  muted = false;
}
const video = new Track();
const audio = new Track();
const stream = { getVideoTracks: () => [video], getAudioTracks: () => [audio] };

async function main() {
  assert.equal(await waitForCaptureReady(stream), true);
  audio.muted = true;
  const recovery = waitForCaptureReady(stream);
  audio.muted = false;
  audio.dispatchEvent(new Event("unmute"));
  assert.equal(await recovery, true);
  audio.muted = true;
  assert.equal(await waitForCaptureReady(stream, undefined, 5), false);
  const abort = new AbortController();
  const cancelled = waitForCaptureReady(stream, abort.signal);
  abort.abort();
  assert.equal(await cancelled, false);
  const ended = waitForCaptureReady(stream);
  audio.readyState = "ended";
  audio.dispatchEvent(new Event("ended"));
  assert.equal(await ended, false);
  audio.readyState = "live";
  audio.muted = false;
  audio.enabled = false;
  assert.equal(await waitForCaptureReady(stream), false);
  assert.equal(await waitForCaptureReady(null), false);

  global.MediaRecorder = class {
    static isTypeSupported(type) { return type === "video/mp4"; }
    constructor(_stream, options) { this.mimeType = options?.mimeType || "default"; }
  };
  assert.equal(createAnswerRecorder(stream).mimeType, "video/mp4");
  global.MediaRecorder.isTypeSupported = (type) => type.startsWith("video/webm");
  assert.equal(createAnswerRecorder(stream).mimeType, "video/webm;codecs=vp8,opus");
  global.MediaRecorder = class {
    static isTypeSupported() { return true; }
    constructor(_stream, options) {
      if (options) throw new DOMException("Encoder unavailable", "NotSupportedError");
      this.mimeType = "default";
    }
  };
  assert.equal(createAnswerRecorder(stream).mimeType, "default");
  const blob = recordedBlob([new Blob(["capture"], { type: "video/mp4" })], "");
  assert.equal(blob.type, "video/mp4");
  assert.equal(blob.size, 7);
  console.log("Media compatibility checks passed: recovery, cancellation, missing tracks, MP4/WebM negotiation, encoder fallback, and blob type.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
