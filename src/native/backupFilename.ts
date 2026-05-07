import { APP_VERSION } from "@/data/version";
import { todayStr } from "@/storage/state";
import type { AppState } from "@/types";

/**
 * Filename pattern for Kanjido backups in iCloud Drive / "Save to Files".
 *
 * Old format (still recognized by the regex below for backward compat):
 *   kanjido-progress-2026-05-07.json
 *
 * New format:
 *   kanjido-progress-2026-05-07-v1.0.0-beta.1-N420.json
 *                    └─ date ─┘ └─ version ─┘ └ count
 *
 * The extra metadata makes the picker UI useful — when a user has 30
 * backups in iCloud, they can see at a glance which one is the most
 * recent / largest / from-the-old-version-where-things-broke. We don't
 * embed it in JSON because Files.app shows file *names* in its picker,
 * not file contents.
 */

const BACKUP_PREFIX = "kanjido-progress-";

/**
 * Sanitize the version for filesystem use. iCloud Drive on iOS rejects
 * filenames with `/`, `\`, `:`, `?`, etc.; semver pre-release `+build`
 * segments are also unsafe. Allow only `[0-9a-zA-Z._-]`.
 */
function safeVersion(v: string): string {
  return v.replace(/[^0-9a-zA-Z._-]/g, "_");
}

/** Build the canonical backup filename for the given state, current date. */
export function buildBackupFilename(state: AppState, date: string = todayStr()): string {
  const entryCount = Object.keys(state.progress).length;
  const v = safeVersion(APP_VERSION);
  return `${BACKUP_PREFIX}${date}-v${v}-N${entryCount}.json`;
}

export interface ParsedBackupName {
  date: string;
  version: string | null;
  entryCount: number | null;
}

/**
 * Parse a backup filename back into its metadata. Returns null on any input
 * that doesn't match the expected `kanjido-progress-` prefix.
 *
 * Tolerates the old (pre-beta.1) format `kanjido-progress-YYYY-MM-DD.json`
 * by returning `version: null, entryCount: null` so the restore-picker UI
 * can still surface the file with a graceful "—" for missing fields.
 */
export function parseBackupName(name: string): ParsedBackupName | null {
  if (!name.startsWith(BACKUP_PREFIX)) return null;
  const stripped = name.slice(BACKUP_PREFIX.length).replace(/\.json$/, "");
  // New format: 2026-05-07-v1.0.0-beta.1-N420
  // Old format: 2026-05-07
  const newRe = /^(\d{4}-\d{2}-\d{2})-v([0-9a-zA-Z._-]+)-N(\d+)$/;
  const m = stripped.match(newRe);
  if (m) {
    return { date: m[1], version: m[2], entryCount: parseInt(m[3], 10) };
  }
  const oldRe = /^(\d{4}-\d{2}-\d{2})$/;
  const oldMatch = stripped.match(oldRe);
  if (oldMatch) {
    return { date: oldMatch[1], version: null, entryCount: null };
  }
  return null;
}
