import { isDeckUnlocked } from "@/entitlements/entitlement";
import type { AppState, CardProgress, Deck } from "@/types";

export interface DeckRecommendation {
  deck: Deck;
  /** Short, human-readable reason shown next to the suggestion. */
  reason: string;
}

/**
 * Status counts for a single deck against the current SM-2 progress map.
 */
function deckStats(deck: Deck, progress: Record<string, CardProgress>, now: number) {
  let learned = 0;
  let mastered = 0;
  let due = 0;
  let newCount = 0;
  // Default decks expose cardKeys synchronously even before the JSON has been
  // dynamically imported, so this stays cheap. User decks fall through to
  // `cards`, which they always have populated.
  const keys = deck.cardKeys ?? deck.cards.map((c) => c.kanji);
  for (const k of keys) {
    const p = progress[k];
    if (!p) {
      newCount++;
      continue;
    }
    learned++;
    if (p.due <= now) due++;
    if (p.interval >= 21 && p.reps >= 3) mastered++;
  }
  return { total: deck.cardCount, learned, mastered, due, newCount };
}

/**
 * Decide what deck to surface in the post-session "what's next?" card. Pure
 * function — no React, no localStorage. The Study screen calls it after a
 * completed session and renders the result.
 *
 * Priority order (return the FIRST matching rule):
 *
 *   1. Same deck has remaining new cards → "More new here". Best signal that
 *      the user should keep going on what they were already doing.
 *
 *   2. Same deck has remaining unmastered (learning) cards → also keep going,
 *      but with a different framing so it doesn't feel like a treadmill.
 *
 *   3. Next sequential default deck — for JLPT N5→N4→N3, Jōyō G1→G2,
 *      Top 100→500→1000. Heuristic: scan ORDER and find the next deck whose
 *      id is greater than current's id and is unlocked.
 *
 *   4. The unlocked deck (excluding the current one) with the most "new"
 *      cards. Lets a user who finished a small deck move on to a bigger one.
 *
 *   5. null — caller falls back to a generic "Browse decks" CTA.
 *
 * Locked decks are never recommended; we don't want to push the paywall on a
 * congratulatory screen.
 */
export function recommendNextDeck(
  currentDeck: Deck,
  decks: Deck[],
  state: AppState,
  now: number = Date.now(),
): DeckRecommendation | null {
  const cur = deckStats(currentDeck, state.progress, now);

  // Rule 1
  if (cur.newCount > 0) {
    return {
      deck: currentDeck,
      reason: `${cur.newCount} new card${cur.newCount === 1 ? "" : "s"} still to introduce`,
    };
  }

  // Rule 2
  const unmastered = cur.learned - cur.mastered;
  if (unmastered > 0) {
    return {
      deck: currentDeck,
      reason: `${unmastered} card${unmastered === 1 ? "" : "s"} still maturing`,
    };
  }

  const candidates = decks.filter(
    (d) => d.id !== currentDeck.id && d.available !== false && isDeckUnlocked(d, state),
  );

  // Rule 3 — sequential next within a known series.
  const series = pickNextInSeries(currentDeck.id, candidates);
  if (series) {
    return { deck: series.deck, reason: series.reason };
  }

  // Rule 4 — biggest pool of new cards.
  let best: { deck: Deck; newCount: number } | null = null;
  for (const d of candidates) {
    const s = deckStats(d, state.progress, now);
    if (s.newCount > 0 && (!best || s.newCount > best.newCount)) {
      best = { deck: d, newCount: s.newCount };
    }
  }
  if (best) {
    return {
      deck: best.deck,
      reason: `${best.newCount} new card${best.newCount === 1 ? "" : "s"} ready`,
    };
  }

  return null;
}

/**
 * Hand-rolled series progression for default decks. We don't have a generic
 * graph in the data layer, so this is a small lookup of "after X, suggest Y".
 *
 *   - JLPT: kanji-jlpt-n5 → n4 → n3 → n2 → n1
 *   - Jōyō by grade: kanji-jouyou-g1 → g2 → ... → g6 → secondary
 *   - Top frequency: kanji-top-100 → top-500 → top-1000
 *   - Kana: kana-hiragana → kana-katakana
 *
 * Vocab and grammar decks have no canonical "next" — those fall through to
 * Rule 4.
 */
function pickNextInSeries(
  currentId: string,
  candidates: Deck[],
): { deck: Deck; reason: string } | null {
  const SERIES: Array<{ ids: string[]; reason: (next: string) => string }> = [
    {
      ids: ["kanji-jlpt-n5", "kanji-jlpt-n4", "kanji-jlpt-n3", "kanji-jlpt-n2", "kanji-jlpt-n1"],
      reason: (next) => `Next level: ${next.toUpperCase().replace("KANJI-JLPT-", "")}`,
    },
    {
      ids: [
        "kanji-jouyou-g1",
        "kanji-jouyou-g2",
        "kanji-jouyou-g3",
        "kanji-jouyou-g4",
        "kanji-jouyou-g5",
        "kanji-jouyou-g6",
        "kanji-jouyou-secondary",
      ],
      reason: () => "Next Jōyō grade",
    },
    {
      ids: ["kanji-top-100", "kanji-top-500", "kanji-top-1000"],
      reason: () => "Bigger frequency tier",
    },
    {
      ids: ["kana-hiragana", "kana-katakana"],
      reason: () => "Now the other syllabary",
    },
  ];
  for (const s of SERIES) {
    const idx = s.ids.indexOf(currentId);
    if (idx === -1 || idx === s.ids.length - 1) continue;
    const nextId = s.ids[idx + 1];
    const deck = candidates.find((d) => d.id === nextId);
    if (deck) return { deck, reason: s.reason(nextId) };
  }
  return null;
}
