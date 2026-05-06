/**
 * Native-platform bridge.
 *
 * The web build runs identically to the iOS-wrapped Capacitor build except
 * for native-only features (haptics, iCloud Drive backup, native share).
 * This module exposes a single API both call sites can use; on web it
 * gracefully no-ops, on iOS it dispatches to the Capacitor plugin.
 *
 * Plugins are imported dynamically so the web bundle doesn't pay for them.
 */

import { Capacitor } from "@capacitor/core";

export const isNative = (): boolean => Capacitor.isNativePlatform();
export const platform = (): "ios" | "android" | "web" =>
  Capacitor.getPlatform() as "ios" | "android" | "web";

// ============================================================
// Haptics (light tick on card flip + rate)
// ============================================================

export async function haptic(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
    await Haptics.impact({ style: map[style] });
  } catch {
    // Plugin missing or runtime didn't load; silently swallow.
  }
}

export async function hapticSelection(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch {
    /* ignore */
  }
}

// ============================================================
// Share / "Save to Files"
// ============================================================

export interface ShareTextOpts {
  title?: string;
  text: string;
  /** Optional filename hint when sharing to Files. */
  filename?: string;
}

/**
 * On iOS, this opens the native Share sheet (which includes "Save to Files",
 * "Mail", AirDrop, etc.). On web, falls back to a download via Blob URL.
 */
export async function shareText(opts: ShareTextOpts): Promise<void> {
  if (isNative()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title: opts.title ?? "Kanjido",
        text: opts.text,
        dialogTitle: opts.title ?? "Save your Kanjido backup",
      });
      return;
    } catch {
      // fall through to web download
    }
  }
  const blob = new Blob([opts.text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename ?? "kanjido-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// File system (iCloud Drive backup)
// ============================================================

/**
 * Write a JSON snapshot to the app's Documents directory, which iOS surfaces
 * via the Files app and (with the right Info.plist key) syncs to iCloud Drive.
 *
 * Returns the absolute file URI for downstream sharing or undefined on web.
 */
export async function writeBackupFile(filename: string, contents: string): Promise<string | undefined> {
  if (!isNative()) return undefined;
  try {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const result = await Filesystem.writeFile({
      path: filename,
      data: contents,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    return result.uri;
  } catch (err) {
    console.warn("writeBackupFile failed:", err);
    return undefined;
  }
}

/** Read a previously-written backup file from the Documents directory. */
export async function readBackupFile(filename: string): Promise<string | undefined> {
  if (!isNative()) return undefined;
  try {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const result = await Filesystem.readFile({
      path: filename,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return typeof result.data === "string" ? result.data : await result.data.text();
  } catch {
    return undefined;
  }
}

export interface BackupFileInfo {
  /** Filename relative to the Documents directory (e.g. "kanjido-progress-2026-05-06.json"). */
  name: string;
  /** mtime epoch ms — newest first preferred for "restore latest". */
  mtime: number;
  /** Approximate file size in bytes (for UI display). */
  size: number;
}

/**
 * List the Kanjido backup files present in iOS Documents (which iCloud
 * Drive syncs when the iCloud capability is configured). Returns newest
 * first. Empty array on web or when no backups exist.
 */
export async function listBackupFiles(): Promise<BackupFileInfo[]> {
  if (!isNative()) return [];
  try {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const dir = await Filesystem.readdir({ path: "", directory: Directory.Documents });
    const files = (dir.files ?? [])
      .filter(
        (f) =>
          f.type === "file" &&
          f.name.startsWith("kanjido-progress-") &&
          f.name.endsWith(".json"),
      )
      .map((f) => ({
        name: f.name,
        mtime: typeof f.mtime === "number" ? f.mtime : 0,
        size: typeof f.size === "number" ? f.size : 0,
      }))
      .sort((a, b) => b.mtime - a.mtime);
    return files;
  } catch {
    return [];
  }
}

// ============================================================
// Status bar (theme-aware on iOS)
// ============================================================

export async function setStatusBarStyle(theme: "dark" | "light"): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // On iOS dark UI → light status-bar text, and vice versa.
    await StatusBar.setStyle({ style: theme === "dark" ? Style.Light : Style.Dark });
  } catch {
    /* ignore */
  }
}
