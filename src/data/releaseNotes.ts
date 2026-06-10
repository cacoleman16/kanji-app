/**
 * Per-version release notes shown in the "What's New" modal after an upgrade.
 *
 * Add an entry here whenever a release ships user-visible changes. The modal
 * picks the entry whose `version` matches APP_VERSION — older entries are
 * ignored (we don't roll up multiple versions). When you bump APP_VERSION,
 * either add a new entry or leave the previous one out and the modal won't
 * appear.
 *
 * Keep it brief: 3–5 bullets, <80 chars each. The modal is a celebration,
 * not a changelog — point to CHANGELOG.md for the full history.
 */
export interface ReleaseNote {
  version: string;
  /** Headline shown at the top of the modal. */
  title: string;
  /** Each bullet is one sentence. Keep them tight. */
  highlights: string[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.0.0-beta.1",
    title: "Welcome to the Kanjido beta",
    highlights: [
      "52 decks / 14,700+ cards: kana, radicals, JLPT kanji + vocab N5–N1, Jōyō",
      "New: full JLPT vocabulary lists, Radicals, Katakana false-friends, Greetings",
      "Per-card review history — peek any card to see when you last saw it",
      "Custom decks via paste import or Anki .apkg",
    ],
  },
];

/** Look up release notes for a specific version, or null if none exist. */
export function findReleaseNotes(version: string): ReleaseNote | null {
  return RELEASE_NOTES.find((r) => r.version === version) ?? null;
}
