/**
 * RevenueCat-backed SubscriptionProvider.
 *
 * Active when:
 *   1. Running inside the iOS Capacitor shell (Capacitor.isNativePlatform()), AND
 *   2. The Apple iOS public API key is set in REVENUECAT_APPLE_PUBLIC_API_KEY
 *      below.
 *
 * If either condition is false, getSubscriptionProvider() falls back to the
 * stub provider so dev/web builds keep working.
 *
 * Setup checklist (one-time):
 *   1. Sign up at https://app.revenuecat.com (free up to $2.5k/month)
 *   2. Create a Project for Kanjido. In Project Settings → API Keys, copy
 *      the Apple public SDK key (starts with `appl_…`).
 *   3. In App Store Connect, create the two IAP products with the exact
 *      product IDs we reference: com.kanjido.pro.monthly and
 *      com.kanjido.pro.yearly.
 *   4. In RevenueCat → Products, link those App Store products.
 *   5. In RevenueCat → Entitlements, create one called "pro" and attach
 *      both products to it.
 *   6. In RevenueCat → Offerings, create one called "default" with both
 *      products as packages: $rc_monthly and $rc_annual.
 *   7. Drop the API key into REVENUECAT_APPLE_PUBLIC_API_KEY below.
 *   8. Run `npx cap sync ios` to install the native pod.
 *
 * The interface match with stubProvider is exact, so consumers don't change.
 */

import type { ProPlan } from "@/types";

import { OFFERS, type ProductOffer } from "./entitlement";
import type { PurchaseResult, SubscriptionProvider } from "./provider";

/**
 * Apple iOS public SDK key from RevenueCat dashboard.
 * Starts with `appl_` and is safe to ship in client code (it's the *public*
 * key, not the secret server key).
 *
 * Leave empty to fall back to the stub provider.
 */
const REVENUECAT_APPLE_PUBLIC_API_KEY = "";

/** Entitlement identifier created in RevenueCat → Entitlements. */
const PRO_ENTITLEMENT_ID = "pro";

/**
 * Map our internal offer ids ("monthly" / "yearly") to RevenueCat package
 * identifiers. The standard RC package IDs are $rc_monthly + $rc_annual,
 * but you can override them in the dashboard — keep this map in sync.
 */
const OFFER_TO_PACKAGE: Record<string, string> = {
  monthly: "$rc_monthly",
  yearly: "$rc_annual",
};

let purchasesInitialized = false;

/**
 * Lazily import + configure the RevenueCat SDK on first use.
 * Web builds never trigger this — getSubscriptionProvider() returns the
 * stub before this module's purchase() / restore() is called on web.
 */
async function ensureInitialized() {
  if (purchasesInitialized) return;
  const { Purchases, LOG_LEVEL } = await import("@revenuecat/purchases-capacitor");
  await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
  await Purchases.configure({ apiKey: REVENUECAT_APPLE_PUBLIC_API_KEY });
  purchasesInitialized = true;
}

/**
 * Convert a RevenueCat package's product to our local ProductOffer shape so
 * the paywall UI uses live (localized) prices instead of the hard-coded
 * defaults.
 */
/**
 * Loose typing on the input to match whatever shape the SDK actually returns
 * for PurchasesPackage; the SDK's product fields are sometimes typed as
 * string | null rather than string | undefined depending on platform.
 */
interface RcPackageLike {
  identifier: string;
  product?: {
    title?: string | null;
    priceString?: string | null;
    pricePerMonthString?: string | null;
  };
}

function packageToOffer(rcPackage: RcPackageLike): ProductOffer | null {
  const id =
    rcPackage.identifier === "$rc_annual"
      ? "yearly"
      : rcPackage.identifier === "$rc_monthly"
        ? "monthly"
        : null;
  if (!id) return null;
  const fallback = OFFERS.find((o) => o.id === id);
  const product = rcPackage.product ?? {};
  return {
    id,
    appleProductId: id === "yearly" ? "com.kanjido.pro.yearly" : "com.kanjido.pro.monthly",
    label: id === "yearly" ? "Yearly" : "Monthly",
    priceLabel: product.priceString || fallback?.priceLabel || "",
    pricePerPeriod:
      product.pricePerMonthString || product.priceString || fallback?.pricePerPeriod || "",
    badge: id === "yearly" ? "Save 27%" : undefined,
    trialLabel: id === "yearly" ? "7-day free trial" : undefined,
  };
}

export const revenueCatProvider: SubscriptionProvider = {
  async listOffers() {
    try {
      await ensureInitialized();
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return OFFERS;
      const live: ProductOffer[] = [];
      for (const pkg of current.availablePackages) {
        const o = packageToOffer(pkg);
        if (o) live.push(o);
      }
      // Sort yearly first (matches the paywall's default selection).
      live.sort((a, b) => (a.id === "yearly" ? -1 : b.id === "yearly" ? 1 : 0));
      return live.length > 0 ? live : OFFERS;
    } catch {
      // Network or config issue — fall back to the static defaults so the
      // paywall still renders with reasonable copy.
      return OFFERS;
    }
  },

  async purchase(offerId): Promise<PurchaseResult> {
    try {
      await ensureInitialized();
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) {
        return { success: false, plan: null, errorMessage: "No offerings configured" };
      }
      const packageId = OFFER_TO_PACKAGE[offerId];
      const pkg = current.availablePackages.find((p) => p.identifier === packageId);
      if (!pkg) {
        return { success: false, plan: null, errorMessage: `Unknown offer: ${offerId}` };
      }
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      const entitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
      if (!entitlement) {
        return {
          success: false,
          plan: null,
          errorMessage: "Purchase did not activate the Pro entitlement.",
        };
      }
      const expires = entitlement.expirationDate
        ? new Date(entitlement.expirationDate).getTime()
        : undefined;
      return {
        success: true,
        plan: offerId === "yearly" ? "yearly" : "monthly",
        providerCustomerId: customerInfo.originalAppUserId,
        expiresAt: expires,
      };
    } catch (err) {
      const e = err as { code?: string; message?: string };
      // RevenueCat error codes: PURCHASE_CANCELLED_ERROR is the user backing out.
      if (e.code === "PURCHASE_CANCELLED_ERROR") {
        return { success: false, plan: null }; // No error message — just cancelled.
      }
      return {
        success: false,
        plan: null,
        errorMessage: e.message ?? "Purchase failed.",
      };
    }
  },

  async restore(): Promise<PurchaseResult> {
    try {
      await ensureInitialized();
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const customerInfo = await Purchases.restorePurchases();
      const info = customerInfo.customerInfo;
      const entitlement = info.entitlements.active[PRO_ENTITLEMENT_ID];
      if (!entitlement) {
        return { success: true, plan: null };
      }
      const expires = entitlement.expirationDate
        ? new Date(entitlement.expirationDate).getTime()
        : undefined;
      return {
        success: true,
        plan: (entitlement.productIdentifier?.includes("yearly") ? "yearly" : "monthly") as ProPlan,
        providerCustomerId: info.originalAppUserId,
        expiresAt: expires,
      };
    } catch (err) {
      const e = err as { message?: string };
      return {
        success: false,
        plan: null,
        errorMessage: e.message ?? "Restore failed.",
      };
    }
  },

  async manageSubscriptions(): Promise<void> {
    // Apple's deep link to the user's subscription-management page in the
    // App Store. RevenueCat's own deep-link helper was deprecated; this
    // URL scheme is the canonical Apple-blessed path.
    window.open("https://apps.apple.com/account/subscriptions", "_blank");
  },
};

/** True when this provider is configured + ready to use. */
export function isRevenueCatConfigured(): boolean {
  return REVENUECAT_APPLE_PUBLIC_API_KEY.length > 0;
}
