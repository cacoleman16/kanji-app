/**
 * Native state mirror — the safety net under localStorage on iOS.
 *
 * WKWebView's localStorage is *usually* persistent, but iOS reserves the
 * right to evict website data under storage pressure, and a Capacitor app's
 * web data is not guaranteed to be included in device backups. For an SRS
 * app whose entire value is months of accumulated review history, that's an
 * unacceptable single point of failure.
 *
 * The mirror keeps a second copy of the serialized AppState in the app's
 * Library directory via @capacitor/filesystem:
 *
 *   - `Directory.Library` is app-private (not user-visible in Files),
 *     included in iCloud/iTunes device backups, and never evicted under
 *     storage pressure — it only disappears when the app is uninstalled.
 *   - We intentionally do NOT use @capacitor/preferences (UserDefaults):
 *     Apple discourages multi-hundred-KB blobs there since the entire
 *     plist loads into memory at process launch, and a Pro user's state
 *     (6,500 default cards + unlimited imported decks) can reach several MB.
 *
 * Write path: `mirrorStateToNative` is called after every successful
 * localStorage save. Writes are coalesced — one write in flight at a time,
 * with the newest payload winning — so a fast study session doesn't queue
 * up dozens of redundant disk writes. The mirror being at most one write
 * behind is fine: localStorage remains the primary store, and the mirror
 * only matters in the eviction scenario.
 *
 * Read path: `bootRestoreIfNeeded` runs in main.tsx before React mounts.
 * If localStorage has no app state (fresh eviction or reinstall... though
 * reinstall also clears Library) but the mirror file exists and validates,
 * its contents are copied back into localStorage so `loadState()` proceeds
 * exactly as if nothing happened.
 *
 * Everything no-ops on web — the dynamic plugin imports never load.
 */

import { LEGACY_V1_KEY, STORAGE_KEY } from "@/storage/state";

import { isNative } from "./bridge";

export const MIRROR_FILENAME = "kanjido-state-mirror.json";

// ---- Write-behind coalescing state -------------------------------------
let writeInFlight = false;
let pendingPayload: string | null = null;

async function writeMirrorFile(contents: string): Promise<void> {
  const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
  await Filesystem.writeFile({
    path: MIRROR_FILENAME,
    data: contents,
    directory: Directory.Library,
    encoding: Encoding.UTF8,
  });
}

/**
 * Queue a mirror write of the serialized state. Safe to call on every state
 * change — concurrent calls coalesce so at most one Filesystem write runs at
 * a time and only the newest payload is persisted.
 */
export function mirrorStateToNative(serialized: string): void {
  if (!isNative()) return;
  pendingPayload = serialized;
  if (writeInFlight) return; // the in-flight writer will pick up the new payload
  writeInFlight = true;
  void (async () => {
    try {
      while (pendingPayload !== null) {
        const payload = pendingPayload;
        pendingPayload = null;
        await writeMirrorFile(payload);
      }
    } catch (err) {
      console.warn("Kanjido state mirror write failed:", err);
      pendingPayload = null;
    } finally {
      writeInFlight = false;
    }
  })();
}

/** Read the raw mirror contents, or null when absent / unreadable / on web. */
export async function readNativeMirror(): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const result = await Filesystem.readFile({
      path: MIRROR_FILENAME,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });
    return typeof result.data === "string" ? result.data : await result.data.text();
  } catch {
    return null;
  }
}

/**
 * Delete the mirror file. Called from the ErrorBoundary hard-reset so a
 * corrupted state can't resurrect itself from the mirror on next launch.
 */
export async function clearNativeMirror(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    await Filesystem.deleteFile({ path: MIRROR_FILENAME, directory: Directory.Library });
  } catch {
    /* already gone — fine */
  }
}

/**
 * Sanity-check a mirror payload before trusting it. Pure — exported for
 * tests. Requires parseable JSON shaped like an AppState (object with a
 * `progress` field). Anything else is treated as corrupt and ignored.
 */
export function validateMirrorPayload(raw: string): boolean {
  try {
    const parsed: unknown = JSON.parse(raw);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      "progress" in parsed
    );
  } catch {
    return false;
  }
}

export type BootRestoreResult = "not-native" | "not-needed" | "no-mirror" | "restored";

/**
 * Boot-time recovery. Runs before React mounts (see main.tsx). When
 * localStorage already holds app state this is a no-op; when it's empty —
 * the WKWebView-eviction scenario — the mirror is validated and copied back
 * so the rest of the app loads as if nothing happened.
 */
export async function bootRestoreIfNeeded(): Promise<BootRestoreResult> {
  if (!isNative()) return "not-native";
  try {
    if (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_V1_KEY)) {
      return "not-needed";
    }
  } catch {
    // localStorage itself unavailable — nothing we can restore into.
    return "not-needed";
  }
  const raw = await readNativeMirror();
  if (!raw || !validateMirrorPayload(raw)) return "no-mirror";
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    console.info("Kanjido: restored app state from native mirror after localStorage loss.");
    return "restored";
  } catch {
    return "no-mirror";
  }
}
