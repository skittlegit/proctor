/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS test runner. */
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
const { createAnswerRecorder, recordedBlob, finishAnswerRecording } = load("components/interview/recording-format.ts");
const { attachCameraPreview } = load("components/interview/camera-preview.ts");
class Track extends EventTarget {
  readyState = "live";
  enabled = true;
  muted = false;
}
const video = new Track();
const audio = new Track();
const stream = { getVideoTracks: () => [video], getAudioTracks: () => [audio] };

async function main() {
  const events = [];
  global.document = new EventTarget();
  global.document.visibilityState = "visible";
  global.MediaStream = class {
    constructor(tracks) { this.tracks = tracks; }
  };
  const preview = {
    muted: false, defaultMuted: false, playsInline: false,
    set srcObject(value) {
      if (value) {
        assert.equal(this.muted, true);
        assert.equal(this.playsInline, true);
        assert.deepEqual(value.tracks, [video]);
      }
      this.source = value;
    },
    play() { events.push("play"); return Promise.resolve(); },
    pause() { events.push("pause"); },
  };
  const detach = attachCameraPreview(preview, stream);
  video.dispatchEvent(new Event("unmute"));
  assert.deepEqual(events, ["play", "play"]);
  detach();
  assert.equal(preview.source, null);
  assert.equal(video.readyState, "live");
  assert.equal(audio.readyState, "live");
  video.dispatchEvent(new Event("unmute"));
  document.dispatchEvent(new Event("visibilitychange"));
  assert.deepEqual(events, ["play", "play", "pause"]);
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
  class FinalizingRecorder extends EventTarget {
    state = "recording";
    mimeType = "video/mp4";
    stop() { this.state = "inactive"; }
  }
  const capture = () => ({ recorder: new FinalizingRecorder(), chunks: [], failed: false });
  const active = capture();
  const finishing = finishAnswerRecording(active);
  // Safari may deliver no chunks until stop; track state after stop is irrelevant.
  audio.readyState = "ended";
  active.chunks.push(new Blob(["final MP4"], { type: "video/mp4" }));
  active.recorder.dispatchEvent(new Event("stop"));
  assert.equal(await (await finishing).text(), "final MP4");
  assert.deepEqual(active.chunks, []);
  const empty = capture();
  const emptyResult = finishAnswerRecording(empty);
  empty.recorder.dispatchEvent(new Event("stop"));
  assert.equal(await emptyResult, null);
  const broken = capture();
  broken.chunks.push(blob);
  const brokenResult = finishAnswerRecording(broken);
  broken.recorder.dispatchEvent(new Event("error"));
  assert.equal(await brokenResult, null);
  const interrupted = capture();
  interrupted.failed = true;
  interrupted.chunks.push(blob);
  const interruptedResult = finishAnswerRecording(interrupted);
  interrupted.recorder.dispatchEvent(new Event("stop"));
  assert.equal(await interruptedResult, null);
  const queued = capture();
  queued.recorder.state = "inactive";
  const queuedResult = finishAnswerRecording(queued);
  queued.chunks.push(blob);
  queued.recorder.dispatchEvent(new Event("stop"));
  assert.equal((await queuedResult).size, blob.size);
  const stalled = capture();
  assert.equal(await finishAnswerRecording(stalled, 5), null);
  assert.equal(stalled.failed, true);
  stalled.recorder.dispatchEvent(new Event("stop"));
  console.log("Media compatibility checks passed: recovery, cancellation, missing tracks, MP4/WebM negotiation, encoder fallback, and blob type.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
