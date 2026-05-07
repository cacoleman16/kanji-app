import { useEffect } from "react";

import { findReleaseNotes } from "@/data/releaseNotes";
import { APP_VERSION, compareVersions } from "@/data/version";
import type { AppState } from "@/types";

interface WhatsNewProps {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
}

/**
 * Small modal that fires once after an app upgrade, showing the highlights
 * from the new version's release notes. The decision logic:
 *
 *  - If `settings.lastSeenVersion` is missing OR older than APP_VERSION,
 *    AND a `RELEASE_NOTES` entry exists for APP_VERSION, show the modal.
 *  - On dismiss, write APP_VERSION back to `lastSeenVersion` so it doesn't
 *    fire again until the next upgrade.
 *  - If no release-notes entry exists for the current version (e.g. a
 *    point release with no user-visible changes), silently update
 *    `lastSeenVersion` so the modal doesn't fire late on a future bump.
 *
 * Renders nothing when there's nothing to announce.
 */
export function WhatsNew({ state, setState }: WhatsNewProps) {
  const last = state.settings.lastSeenVersion;
  const isUpgrade = !last || compareVersions(last, APP_VERSION) < 0;
  const notes = findReleaseNotes(APP_VERSION);

  // Quietly mark this version seen if there's no announcement to make —
  // prevents the modal from suddenly appearing later when the user is
  // multiple versions ahead of `lastSeenVersion`.
  useEffect(() => {
    if (isUpgrade && !notes && last !== APP_VERSION) {
      setState((s) => ({
        ...s,
        settings: { ...s.settings, lastSeenVersion: APP_VERSION },
      }));
    }
  }, [isUpgrade, notes, last, setState]);

  if (!isUpgrade || !notes) return null;

  const dismiss = () => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, lastSeenVersion: APP_VERSION },
    }));
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
      onClick={dismiss}
    >
      <div className="modal-card whats-new-card" onClick={(e) => e.stopPropagation()}>
        <div className="whats-new-version">v{APP_VERSION}</div>
        <div className="modal-title" id="whats-new-title">
          {notes.title}
        </div>
        <ul className="whats-new-list">
          {notes.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
        <div className="modal-actions">
          <button className="modal-btn primary" onClick={dismiss} autoFocus>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
