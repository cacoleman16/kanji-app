import { afterEach, describe, expect, it, vi } from "vitest";

import { grantPro } from "@/entitlements/entitlement";
import { DEFAULT_STATE } from "@/storage/state";
import type { AppState } from "@/types";

import * as bridge from "./bridge";

// Mock the platform bridge so the tests can pretend to be on iOS.
vi.mock("./bridge", async () => {
  const actual = await vi.importActual<typeof import("./bridge")>("./bridge");
  return {
    ...actual,
    isNative: vi.fn(() => false),
    writeBackupFile: vi.fn(async () => "stub://uri"),
  };
});

import { shouldAutoBackup, tryAutoBackup } from "./autoBackup";

const NOW = 1_700_000_000_000;

const free = (): AppState => structuredClone(DEFAULT_STATE);
const pro = (): AppState => grantPro(free(), "monthly");
const onIos = (state: AppState): AppState => state; // platform is mocked separately

afterEach(() => {
  vi.clearAllMocks();
});

describe("shouldAutoBackup", () => {
  it("is false on the web (isNative=false), even for Pro users", () => {
    vi.mocked(bridge.isNative).mockReturnValue(false);
    expect(shouldAutoBackup(pro(), NOW)).toBe(false);
  });

  it("is false for free users on iOS", () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    expect(shouldAutoBackup(free(), NOW)).toBe(false);
  });

  it("is true for Pro users on iOS with no prior auto-backup", () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    expect(shouldAutoBackup(onIos(pro()), NOW)).toBe(true);
  });

  it("is false for Pro users on iOS within the 12-hour throttle", () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    const recent: AppState = {
      ...pro(),
      settings: { ...pro().settings, lastAutoBackupAt: NOW - 60 * 60 * 1000 }, // 1h ago
    };
    expect(shouldAutoBackup(recent, NOW)).toBe(false);
  });

  it("is true for Pro users on iOS after the 12-hour window elapses", () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    const old: AppState = {
      ...pro(),
      settings: { ...pro().settings, lastAutoBackupAt: NOW - 13 * 60 * 60 * 1000 },
    };
    expect(shouldAutoBackup(old, NOW)).toBe(true);
  });

  it("is false when the user has explicitly disabled auto-backup", () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    const disabled: AppState = {
      ...pro(),
      settings: { ...pro().settings, autoBackupEnabled: false },
    };
    expect(shouldAutoBackup(disabled, NOW)).toBe(false);
  });
});

describe("tryAutoBackup", () => {
  it("calls writeBackupFile + markComplete when conditions are met", async () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    const markComplete = vi.fn();
    const ok = await tryAutoBackup(onIos(pro()), markComplete, NOW);
    expect(ok).toBe(true);
    expect(bridge.writeBackupFile).toHaveBeenCalledOnce();
    expect(markComplete).toHaveBeenCalledWith(NOW);
  });

  it("does nothing on the web", async () => {
    vi.mocked(bridge.isNative).mockReturnValue(false);
    const markComplete = vi.fn();
    const ok = await tryAutoBackup(pro(), markComplete, NOW);
    expect(ok).toBe(false);
    expect(bridge.writeBackupFile).not.toHaveBeenCalled();
    expect(markComplete).not.toHaveBeenCalled();
  });

  it("does nothing when the user is free", async () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    const markComplete = vi.fn();
    const ok = await tryAutoBackup(free(), markComplete, NOW);
    expect(ok).toBe(false);
    expect(bridge.writeBackupFile).not.toHaveBeenCalled();
  });

  it("returns false when the underlying write fails", async () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    vi.mocked(bridge.writeBackupFile).mockResolvedValueOnce(undefined);
    const markComplete = vi.fn();
    const ok = await tryAutoBackup(onIos(pro()), markComplete, NOW);
    expect(ok).toBe(false);
    expect(markComplete).not.toHaveBeenCalled();
  });

  it("swallows write exceptions silently", async () => {
    vi.mocked(bridge.isNative).mockReturnValue(true);
    vi.mocked(bridge.writeBackupFile).mockRejectedValueOnce(new Error("boom"));
    const markComplete = vi.fn();
    const ok = await tryAutoBackup(onIos(pro()), markComplete, NOW);
    expect(ok).toBe(false);
    expect(markComplete).not.toHaveBeenCalled();
  });
});
