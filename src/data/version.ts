/**
 * Single source of truth for the running app version. Mirrors `package.json`'s
 * `version` field — keep in sync when bumping for a release.
 *
 * Used by:
 *  - The "What's New" modal (compares against settings.lastSeenVersion).
 *  - Settings → "About" footer (visible to users).
 *  - Backup-export filenames (so backups carry their producing version).
 */
export const APP_VERSION = "1.0.0-beta.1";

/**
 * Compare two semver-ish versions ("1.0.0-beta.1", "1.0.0", "1.1.0").
 * Returns negative if a < b, 0 if equal, positive if a > b.
 *
 * Pre-release strings sort BEFORE the matching release (1.0.0-beta.1 < 1.0.0)
 * — same convention as semver.
 */
export function compareVersions(a: string, b: string): number {
  if (a === b) return 0;
  const [aMain, aPre] = a.split("-");
  const [bMain, bPre] = b.split("-");
  const aParts = aMain.split(".").map((n) => parseInt(n, 10) || 0);
  const bParts = bMain.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const ap = aParts[i] ?? 0;
    const bp = bParts[i] ?? 0;
    if (ap !== bp) return ap - bp;
  }
  // Main parts equal — compare pre-release tags.
  // Anything-with-pre < no-pre (1.0.0-beta.1 < 1.0.0).
  if (aPre && !bPre) return -1;
  if (!aPre && bPre) return 1;
  if (aPre && bPre) return aPre < bPre ? -1 : aPre > bPre ? 1 : 0;
  return 0;
}
