import { useState } from "react";

import { OFFERS, grantPro } from "@/entitlements/entitlement";
import { getSubscriptionProvider } from "@/entitlements/provider";
import type { AppState, ProPlan } from "@/types";

interface PaywallProps {
  setState: (updater: (s: AppState) => AppState) => void;
  onBack: () => void;
  /** Optional context string explaining what triggered the paywall. */
  reason?: string;
}

/** Concise, scan-friendly value props. Pro-only items are bolded so the eye lands. */
const FEATURES = [
  <>
    All <strong>12 default decks</strong> — JLPT N5–N1 + Jōyō by grade (4,300+ kanji)
  </>,
  <>
    <strong>Unlimited custom decks</strong> with no card-count caps
  </>,
  <>
    <strong>Anki .apkg import</strong> — bring everything from your existing collection
  </>,
  <>
    <strong>iCloud backup *</strong> — your progress follows your Apple ID
  </>,
  <>SM-2 spaced-repetition scheduling tuned to your pace</>,
  <>Cancel anytime in App Store → Subscriptions</>,
];

export function Paywall({ setState, onBack, reason }: PaywallProps) {
  const [selected, setSelected] = useState<string>("yearly");
  const [busy, setBusy] = useState<"purchase" | "restore" | null>(null);
  const [thanks, setThanks] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const provider = getSubscriptionProvider();
  const offer = OFFERS.find((o) => o.id === selected) ?? OFFERS[0];

  const ctaLabel = (() => {
    if (busy === "purchase") return "Processing…";
    if (offer.id === "yearly") return `Start 7-day free trial`;
    return `Continue — ${offer.priceLabel}`;
  })();

  const handlePurchase = async () => {
    setBusy("purchase");
    setErrorMsg(null);
    try {
      const result = await provider.purchase(offer.id);
      if (!result.success || !result.plan) {
        setErrorMsg(result.errorMessage ?? "Purchase didn't complete. No charge was made.");
        return;
      }
      setState((s) =>
        grantPro(s, result.plan as ProPlan, {
          providerCustomerId: result.providerCustomerId,
          expiresAt: result.expiresAt,
        }),
      );
      setThanks(true);
    } catch (err) {
      setErrorMsg(`Couldn't complete the purchase: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    setBusy("restore");
    setErrorMsg(null);
    try {
      const result = await provider.restore();
      if (result.success && result.plan) {
        setState((s) =>
          grantPro(s, result.plan as ProPlan, {
            providerCustomerId: result.providerCustomerId,
            expiresAt: result.expiresAt,
          }),
        );
        setThanks(true);
      } else {
        setErrorMsg("No previous purchases found for this Apple ID.");
      }
    } catch (err) {
      setErrorMsg(`Couldn't restore: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  if (thanks) {
    return (
      <div className="fade-in session-done">
        <div className="paywall-mark pop-in" style={{ fontSize: 88, marginBottom: 20 }}>
          道
        </div>
        <div className="done-title">Welcome to Kanjido Pro</div>
        <div className="done-sub" style={{ maxWidth: 320 }}>
          Every deck is unlocked. Custom decks and Anki imports are uncapped. The way of kanji
          opens.
        </div>
        <button className="primary-btn" onClick={onBack}>
          Start studying
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">Kanjido Pro</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="paywall-hero">
        <div className="paywall-mark">道</div>
        <div className="paywall-title">Unlock the way of kanji</div>
        <div className="paywall-sub">
          {reason ?? "Full library, unlimited custom decks, and Anki import."}
        </div>
      </div>

      <div className="feature-list">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-row">
            <span className="feature-check">✓</span>
            <span className="feature-text">{f}</span>
          </div>
        ))}
      </div>

      <div className="section-label">Choose a plan</div>
      <div style={{ marginBottom: 12 }}>
        {OFFERS.map((o) => {
          const isSelected = selected === o.id;
          return (
            <button
              key={o.id}
              className={`offer-card ${isSelected ? "selected" : ""}`}
              onClick={() => setSelected(o.id)}
              aria-pressed={isSelected}
            >
              <span className="offer-radio" />
              <div className="offer-info">
                <div className="offer-label">
                  {o.label}
                  {o.badge && <span className="offer-badge">{o.badge}</span>}
                </div>
                <div className="offer-meta">{o.pricePerPeriod}</div>
                {o.trialLabel && <div className="offer-trial">{o.trialLabel}</div>}
              </div>
              <div className="offer-price">
                <div className="offer-price-main">{o.priceLabel}</div>
                {o.id === "yearly" && (
                  <div className="offer-price-sub">~$0.10 / day</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="paywall-error" role="alert">
          {errorMsg}
        </div>
      )}

      <button
        className="paywall-cta"
        onClick={handlePurchase}
        disabled={!!busy}
      >
        {busy === "purchase" && <span className="paywall-spinner" aria-hidden />}
        {ctaLabel}
      </button>

      <div className="paywall-trust">
        <span>🔒 Apple-secured payment</span>
        <span>↻ Cancel anytime</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <button className="undo-btn" onClick={handleRestore} disabled={!!busy}>
          {busy === "restore" ? (
            <>
              <span className="paywall-spinner" aria-hidden /> Restoring…
            </>
          ) : (
            "Already paid? Restore purchases"
          )}
        </button>
      </div>

      <div className="paywall-fineprint">
        {offer.id === "yearly" ? (
          <>
            7-day free trial. Cancel before it ends and you won't be charged. After the trial,
            $34.99 / year. Auto-renews until cancelled.
          </>
        ) : (
          <>$3.99 charged monthly until cancelled. Auto-renews each month.</>
        )}{" "}
        Manage in App Store → Settings → Subscriptions. Payment charged to your Apple ID.{" "}
        <a href="/terms" target="_blank" rel="noopener">
          Terms
        </a>{" "}
        ·{" "}
        <a href="/privacy" target="_blank" rel="noopener">
          Privacy
        </a>
        <br />
        <span style={{ opacity: 0.7 }}>
          * iCloud backup is part of the iOS native build (M4).
        </span>
      </div>
    </div>
  );
}
