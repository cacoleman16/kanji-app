/**
 * Domain types for the Kanji app.
 *
 * The shapes here mirror what was previously inlined in legacy/kanji-app.html
 * so existing localStorage entries (schemaVersion 2) load unchanged.
 */

// ============================================================
// Cards
// ============================================================

export type Jlpt = "N5" | "N4" | "N3" | "N2" | "N1";

/** Compound example shown on the back of a kanji card. */
export interface KanjiExample {
  kanji: string;
  kana: string;
  meaning: string;
}

/** A kanji-front card. */
export interface KanjiCard {
  kanji: string;
  meanings: string[];
  on_yomi: string[];
  kun_yomi: string[];
  examples: KanjiExample[];
  keyword: string;
  etymology?: string;
  stroke_count?: number | null;
  jlpt?: Jlpt | null;
  grade?: number | null;
  /** Names of decks this kanji appears in (for cross-deck attribution). */
  decks?: string[];
  /** Kana-only: paired character from the other syllabary (e.g. ア for あ). */
  paired_kana?: string;
  /** Kana-only: voiced variant (e.g. が for か). */
  dakuten?: VoicedVariant;
  /** Kana-only: half-voiced variant (h-row only — ぱ ぴ ぷ ぺ ぽ). */
  handakuten?: VoicedVariant;
}

/** A voiced/half-voiced kana variant (dakuten / handakuten). */
export interface VoicedVariant {
  kana: string;
  romaji: string;
}

/** A vocabulary card (word/phrase, not a single kanji). */
export interface VocabCard {
  /**
   * Treated as the card's primary identifier and front-of-card text.
   * Named `kanji` for legacy compatibility with progress entries keyed by kanji.
   */
  kanji: string;
  meanings: string[];
  reading: string;
  category?: string;
  context?: string;
  jlpt?: Jlpt;
  example_sentence?: string;
  example_reading?: string;
  example_meaning?: string;
  on_yomi?: string[];
  kun_yomi?: string[];
  examples?: KanjiExample[];
  keyword?: string;
  etymology?: string;
}

export type AnyCard = KanjiCard | VocabCard;

// ============================================================
// Decks
// ============================================================

export type DeckKind = "kanji" | "vocab" | "grammar";

export interface Deck<C extends AnyCard = AnyCard> {
  id: string;
  name: string;
  subtitle?: string;
  kind: DeckKind;
  /** Default-shipped decks may be hidden until ready; user decks are always available. */
  available?: boolean;
  cards: C[];
  /** True for decks the user created (vs. default content). */
  userCreated?: boolean;
}

// ============================================================
// SM-2 progress
// ============================================================

export type Rating = "again" | "hard" | "good" | "easy";

/** Per-card SM-2 state. Keyed in {@link AppState.progress} by card.kanji. */
export interface CardProgress {
  ease: number;
  /** Whole days; 0 = still learning / due intra-session. */
  interval: number;
  reps: number;
  /** Epoch ms when the card next becomes due. */
  due: number;
  /** Epoch ms of the most recent review. */
  lastReview: number;
  /** True between an "again" rating and the next non-again rating. */
  learning?: boolean;
}

// ============================================================
// Persistent app state
// ============================================================

export interface DailyStats {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export interface Settings {
  dailyGoal: number;
  newPerDay: number;
  cardBackFontSize: "small" | "medium" | "large";
  theme: "dark" | "light";
  vocabDirection: "ja-en" | "en-ja";
  /** True once the user has dismissed the first-run onboarding flow. */
  onboardingComplete: boolean;
  /** Epoch ms of the most recent successful auto-backup to iCloud (iOS Pro). */
  lastAutoBackupAt?: number;
  /** When false, skip auto-backup-after-session. Default true (opt-out). */
  autoBackupEnabled?: boolean;
  /** When true, schedule a daily local notification at notificationsHour:Minute. */
  notificationsEnabled?: boolean;
  /** Hour of the daily reminder, 0-23. Default 20 (8 PM). */
  notificationsHour?: number;
  /** Minute of the daily reminder, 0-59. Default 0. */
  notificationsMinute?: number;
}

export interface Streak {
  current: number;
  longest: number;
  /** ISO yyyy-mm-dd of last day with a review, or null. */
  lastActiveDay: string | null;
}

// ============================================================
// User-created decks
// ============================================================

/**
 * A user-created card. Mirrors the runtime shape of {@link KanjiCard} /
 * {@link VocabCard} but with everything except `kanji` + `meanings` optional —
 * users may import sparse data and we should not crash on missing fields.
 */
export interface UserCard {
  /** Front-of-card text + progress key. */
  kanji: string;
  meanings: string[];
  reading?: string;
  on_yomi?: string[];
  kun_yomi?: string[];
  examples?: KanjiExample[];
  keyword?: string;
  etymology?: string;
  jlpt?: Jlpt;
  /** Free-text note for vocab cards. */
  context?: string;
  example_sentence?: string;
  example_reading?: string;
  example_meaning?: string;
}

export interface UserDeck {
  /** Stable id; `user-{slug}-{epoch}` for new decks. */
  id: string;
  name: string;
  /** "kanji" or "vocab" — controls which card-back layout the Study screen uses. */
  kind: DeckKind;
  /** Epoch ms. */
  createdAt: number;
  /** Epoch ms. */
  updatedAt: number;
  cards: UserCard[];
}

// ============================================================
// Entitlement (Pro / Free)
// ============================================================

export type ProPlan = "monthly" | "yearly" | "lifetime" | "comp";

export interface Entitlement {
  /** True if the user has an active Pro entitlement. */
  active: boolean;
  /** Which plan, when known. "comp" = comped (manually granted by dev/support). */
  plan?: ProPlan;
  /** Epoch ms when Pro became active. */
  since?: number;
  /** Epoch ms when the current period expires. Absent for lifetime/comp. */
  expiresAt?: number;
  /** Stable identifier from the underlying provider (e.g. RevenueCat user id). */
  providerCustomerId?: string;
}

export interface AppState {
  schemaVersion: number;
  progress: Record<string, CardProgress>;
  stats: { byDay: Record<string, DailyStats> };
  settings: Settings;
  streak: Streak;
  /** User-created decks (added in schema v3). */
  userDecks: UserDeck[];
  /** Pro entitlement (added in schema v4). */
  pro: Entitlement;
}
