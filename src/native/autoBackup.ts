/**
 * Auto-backup-to-iCloud orchestration.
 *
 * After each Study session completes, the app may want to silently snapshot
 * the user's progress to iCloud Drive so a deleted-and-reinstalled app
 * doesn't lose data. Conditions for the auto-write:
 *   - Running inside the iOS Capacitor shell (web no-ops cleanly)
 *   - User has Pro entitlement
 *   - User hasn't disabled auto-backup in Settings
 *   - Last successful auto-backup was at least 12 hours ago (throttle)
 *
 * Failures are silent — this is a "nice to have" that should never block
 * the user's flow. Manual backup via Settings still works regardless.
 */

import { isPro } from "@/entitlements/entitlement";
import type { AppState } from "@/types";

import { buildBackupFilename } from "./backupFilename";
import { isNative, writeBackupFile } from "./bridge";

/** Min time between auto-backups, in ms. 12 hours. */
const AUTO_BACKUP_INTERVAL_MS = 12 * 60 * 60 * 1000;

export function shouldAutoBackup(state: AppState, now: number = Date.now()): boolean {
  if (!isNative()) return false;
  if (!isPro(state)) return false;
  if (state.settings.autoBackupEnabled === false) return false;
  const last = state.settings.lastAutoBackupAt ?? 0;
  return now - last >= AUTO_BACKUP_INTERVAL_MS;
}

/**
 * Fire-and-forget auto-backup. Resolves with true if a backup was written,
 * false if conditions weren't met or the write failed.
 *
 * On success, calls `markComplete(now)` so the caller can persist the new
 * `lastAutoBackupAt` timestamp into settings.
 */
export async function tryAutoBackup(
  state: AppState,
  markComplete: (timestamp: number) => void,
  now: number = Date.now(),
): Promise<boolean> {
  if (!shouldAutoBackup(state, now)) return false;
  try {
    const filename = buildBackupFilename(state);
    const uri = await writeBackupFile(filename, JSON.stringify(state, null, 2));
    if (uri) {
      markComplete(now);
      return true;
    }
  } catch {
    // Silent.
  }
  return false;
}
