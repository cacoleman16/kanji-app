import { describe, expect, it } from "vitest";

import { DEFAULT_STATE } from "@/storage/state";

import { bootRestoreIfNeeded, mirrorStateToNative, validateMirrorPayload } from "./stateMirror";

describe("validateMirrorPayload", () => {
  it("accepts a serialized AppState", () => {
    expect(validateMirrorPayload(JSON.stringify(DEFAULT_STATE))).toBe(true);
  });

  it("rejects malformed JSON", () => {
    expect(validateMirrorPayload("{not json")).toBe(false);
    expect(validateMirrorPayload("")).toBe(false);
  });

  it("rejects JSON that isn't an AppState-shaped object", () => {
    expect(validateMirrorPayload("null")).toBe(false);
    expect(validateMirrorPayload("[1,2,3]")).toBe(false);
    expect(validateMirrorPayload('"a string"')).toBe(false);
    expect(validateMirrorPayload('{"settings":{}}')).toBe(false); // no progress field
  });

  it("accepts a minimal object with a progress field", () => {
    expect(validateMirrorPayload('{"progress":{}}')).toBe(true);
  });
});

describe("web no-op behavior", () => {
  // In the test environment Capacitor reports web platform, so the native
  // paths must short-circuit without touching any plugin.
  it("mirrorStateToNative does nothing on web", () => {
    expect(() => mirrorStateToNative('{"progress":{}}')).not.toThrow();
  });

  it("bootRestoreIfNeeded resolves 'not-native' on web", async () => {
    await expect(bootRestoreIfNeeded()).resolves.toBe("not-native");
  });
});
