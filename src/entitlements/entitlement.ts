/**
 * Pro / Free entitlement gates.
 *
 * The `isPro()` predicate is the single source of truth for "should this
 * feature be unlocked?". All UI gates and feature checks call through this so
 * we have one place to flip when the underlying provider (RevenueCat) signs
 * the user in.
 *
 * Free-tier limits, all in {@link FREE_LIMITS} below:
 *  - JLPT N5 default deck is free; all other default decks are Pro-locked.
 *  - At most 1 user-created deck, capped at 50 cards.
 *  - Anki .apkg import is Pro-only (CSV/TSV/JSON paste stays free as a
 *    "preview your data" entry path).
 */

import type { AppState, Deck } from "@/types";

export const FREE_LIMITS = {
  /**
   * Default decks (`available !== false`) that free users can study fully.
   * Hiragana + Katakana are the absolute-beginner gateway; JLPT N5 is the
   * first kanji deck. Together this is enough content for a learner to
   * commit weeks of study before bumping into the paywall.
   */
  freeDeckIds: new Set<string>([
    "kana-hiragana",
    "kana-katakana",
    "kanji-jlpt-n5",
    "vocab-numbers",
    "vocab-time",
  ]),
  /** Maximum number of user-created decks a free user can keep. */
  maxUserDecks: 1,
  /** Maximum cards per user-created deck on the free tier. */
  maxCardsPerUserDeck: 50,
} as const;

export interface ProductOffer {
  id: string;
  /** App Store Connect product identifier — used by StoreKit/RevenueCat. */
  appleProductId: string;
  label: string;
  priceLabel: string;
  /** Per-period price in user's local currency, formatted. */
  pricePerPeriod: string;
  /** Optional badge ("Best value", "Save 27%", etc.). */
  badge?: string;
  trialLabel?: string;
}

/**
 * Catalog of subscription offers shown on the paywall. Prices match the
 * intended App Store Connect tiers; localized prices are rendered by the
 * native StoreKit layer at runtime (M4) and overwrite these defaults.
 */
export const OFFERS: ProductOffer[] = [
  {
    id: "yearly",
    appleProductId: "com.kanjido.pro.yearly",
    label: "Yearly",
    priceLabel: "$34.99 / year",
    pricePerPeriod: "$2.92 / month",
    badge: "Save 27%",
    trialLabel: "7-day free trial",
  },
  {
    id: "monthly",
    appleProductId: "com.kanjido.pro.monthly",
    label: "Monthly",
    priceLabel: "$3.99 / month",
    pricePerPeriod: "$3.99 / month",
  },
];

/** Single-question check used everywhere: "is the user Pro right now?" */
export function isPro(state: AppState): boolean {
  if (!state.pro?.active) return false;
  if (state.pro.expiresAt && state.pro.expiresAt < Date.now()) return false;
  return true;
}

/** True if a default-content deck is unlocked on the user's current tier. */
export function isDeckUnlocked(deck: Deck, state: AppState): boolean {
  if (deck.userCreated) return true;
  if (isPro(state)) return true;
  return FREE_LIMITS.freeDeckIds.has(deck.id);
}

/** True if the free user can create another user-deck right now. */
export function canCreateUserDeck(state: AppState): boolean {
  if (isPro(state)) return true;
  return state.userDecks.length < FREE_LIMITS.maxUserDecks;
}

/** Effective per-deck card limit — Infinity for Pro, FREE_LIMITS.maxCardsPerUserDeck otherwise. */
export function userDeckCardLimit(state: AppState): number {
  return isPro(state) ? Infinity : FREE_LIMITS.maxCardsPerUserDeck;
}

/** True if Anki .apkg upload is allowed. */
export function canImportApkg(state: AppState): boolean {
  return isPro(state);
}

/** Mark Pro active locally (called from the paywall after a successful purchase or as a dev override). */
export function grantPro(
  state: AppState,
  plan: NonNullable<AppState["pro"]["plan"]>,
  opts?: { providerCustomerId?: string; expiresAt?: number },
): AppState {
  return {
    ...state,
    pro: {
      active: true,
      plan,
      since: state.pro?.since ?? Date.now(),
      expiresAt: opts?.expiresAt,
      providerCustomerId: opts?.providerCustomerId ?? state.pro?.providerCustomerId,
    },
  };
}

export function revokePro(state: AppState): AppState {
  return { ...state, pro: { active: false } };
}
