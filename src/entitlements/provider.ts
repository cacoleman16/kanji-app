/**
 * Subscription-provider port.
 *
 * In M3 (now): a stub implementation that simulates a successful purchase by
 * locally toggling Pro state. The paywall UI works end-to-end against this
 * stub, including the "thank you" flow.
 *
 * In M4 (Capacitor wrap + App Store): swap the stub for a RevenueCat-backed
 * implementation that calls `Purchases.purchasePackage(...)` from
 * `@revenuecat/purchases-capacitor`. The interface is intentionally
 * RevenueCat-shaped so the swap is a single-file change.
 */

import { Capacitor } from "@capacitor/core";

import type { AppState, ProPlan } from "@/types";

import { OFFERS, type ProductOffer } from "./entitlement";
import { isRevenueCatConfigured, revenueCatProvider } from "./revenueCatProvider";

export interface PurchaseResult {
  success: boolean;
  /** Plan that was purchased (or null if cancelled / failed). */
  plan: ProPlan | null;
  providerCustomerId?: string;
  /** Epoch ms when the period expires. Undefined means "use the offer's default cycle". */
  expiresAt?: number;
  errorMessage?: string;
}

export interface SubscriptionProvider {
  /** List the offers available on this device + locale. May refresh from the store. */
  listOffers(): Promise<ProductOffer[]>;

  /** Initiate purchase of an offer. Resolves once StoreKit's modal closes. */
  purchase(offerId: string): Promise<PurchaseResult>;

  /** Restore previously-purchased entitlements (e.g. user reinstalled the app). */
  restore(): Promise<PurchaseResult>;

  /** Open the App Store native subscription-management screen. */
  manageSubscriptions(): Promise<void>;
}

// ============================================================
// Stub implementation (M3)
// ============================================================

/**
 * Simulates an instant successful purchase. Used during M3 development and as
 * a fallback when running in PWA mode (no native StoreKit available).
 */
export const stubProvider: SubscriptionProvider = {
  async listOffers() {
    return OFFERS;
  },

  async purchase(offerId) {
    const offer = OFFERS.find((o) => o.id === offerId);
    if (!offer) {
      return { success: false, plan: null, errorMessage: "Unknown offer" };
    }
    // Pretend this took a moment.
    await new Promise((r) => setTimeout(r, 600));
    const plan: ProPlan = offer.id === "yearly" ? "yearly" : "monthly";
    const periodMs = plan === "yearly" ? 365 * 86_400_000 : 30 * 86_400_000;
    return {
      success: true,
      plan,
      expiresAt: Date.now() + periodMs,
      providerCustomerId: "stub-customer",
    };
  },

  async restore() {
    // In the stub, "restore" is a no-op success — the real provider checks the
    // App Store / RevenueCat backend for past entitlements and rehydrates.
    return { success: true, plan: null };
  },

  async manageSubscriptions() {
    // The real provider deep-links to the App Store subscription page. In dev,
    // we just no-op so the button doesn't blow up.
    return;
  },
};

/**
 * Resolve a {@link SubscriptionProvider} for the current runtime.
 *
 * Resolution order:
 *   1. iOS Capacitor + RevenueCat API key set → real RevenueCat provider
 *   2. Otherwise (web, dev, missing key) → stub provider that simulates
 *      instant purchases. Lets the paywall UI work end-to-end without
 *      StoreKit available.
 *
 * Both implementations conform to {@link SubscriptionProvider} so call
 * sites don't change.
 */
export function getSubscriptionProvider(): SubscriptionProvider {
  if (Capacitor.isNativePlatform() && isRevenueCatConfigured()) {
    return revenueCatProvider;
  }
  return stubProvider;
}

/** Convenience helper: pick the named offer or fall back to the first one. */
export function findOffer(offers: ProductOffer[], id: string | undefined): ProductOffer {
  return offers.find((o) => o.id === id) ?? offers[0];
}

/** Marker so callers using the AppState shape can cast cleanly. */
export type _AppStateForProviderCheck = AppState;
