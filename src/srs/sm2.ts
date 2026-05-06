/**
 * SM-2 spaced-repetition algorithm.
 *
 * Ported from the inline implementation in legacy/kanji-app.html (lines
 * 3531–3578). Behavior is intentionally identical so existing user progress
 * (schemaVersion 2) continues to schedule cards the same way after migration.
 */

import type { CardProgress, Rating } from "@/types";

export const MS_DAY = 24 * 60 * 60 * 1000;
export const MS_MIN = 60 * 1000;

/** Floor for the ease factor — Anki's classic 1.3. */
export const EASE_FLOOR = 1.3;
/** Default ease for a brand-new card. */
export const DEFAULT_EASE = 2.5;

/**
 * Compute the next SM-2 state for a card given the user's rating.
 *
 * @param prev   Previous progress, or null/undefined for a new card.
 * @param rating "again" | "hard" | "good" | "easy".
 * @param now    Epoch ms; defaults to Date.now() so callers in tests can pin time.
 */
export function sm2(
  prev: CardProgress | null | undefined,
  rating: Rating,
  now: number = Date.now(),
): CardProgress {
  let ease = prev?.ease ?? DEFAULT_EASE;
  let interval = prev?.interval ?? 0; // days
  let reps = prev?.reps ?? 0;

  if (rating === "again") {
    reps = 0;
    ease = Math.max(EASE_FLOOR, ease - 0.2);
    // Re-appear in 10 minutes (intra-session); resets to "new" for the next session.
    return {
      ease,
      interval: 0,
      reps,
      due: now + 10 * MS_MIN,
      lastReview: now,
      learning: true,
    };
  }

  if (reps === 0) {
    // First graduation from new/learning
    if (rating === "hard") interval = 1;
    else if (rating === "good") interval = 1;
    else if (rating === "easy") interval = 4;
  } else if (reps === 1) {
    if (rating === "hard") interval = Math.max(1, Math.round(interval * 1.2));
    else if (rating === "good") interval = 6;
    else if (rating === "easy") interval = Math.round(6 * 1.3);
  } else {
    if (rating === "hard") interval = Math.max(1, Math.round(interval * 1.2));
    else if (rating === "good") interval = Math.round(interval * ease);
    else if (rating === "easy") interval = Math.round(interval * ease * 1.3);
  }

  if (rating === "hard") ease = Math.max(EASE_FLOOR, ease - 0.15);
  if (rating === "easy") ease = ease + 0.15;

  reps += 1;
  return {
    ease,
    interval,
    reps,
    due: now + interval * MS_DAY,
    lastReview: now,
    learning: false,
  };
}

/**
 * Human-friendly preview of what the interval would be for each rating.
 * Used by the rating buttons to show "Good → 6d, Easy → 8d" hints.
 */
export function previewIntervals(prev: CardProgress | null | undefined): Record<Rating, string> {
  const labels = {} as Record<Rating, string>;
  for (const r of ["again", "hard", "good", "easy"] as Rating[]) {
    const next = sm2(prev, r);
    if (r === "again") labels[r] = "10m";
    else if (next.interval < 1) labels[r] = "<1d";
    else if (next.interval === 1) labels[r] = "1d";
    else if (next.interval < 30) labels[r] = `${next.interval}d`;
    else if (next.interval < 365) labels[r] = `${Math.round(next.interval / 30)}mo`;
    else labels[r] = `${Math.round(next.interval / 365)}y`;
  }
  return labels;
}
