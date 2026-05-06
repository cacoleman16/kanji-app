import { useState } from "react";

import { OFFERS, grantPro } from "@/entitlements/entitlement";
import { getSubscriptionProvider } from "@/entitlements/provider";
import type { AppState, ProPlan } from "@/types";

interface PaywallProps {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  onBack: () => void;
  /** Optional context string explaining what triggered the paywall. */
  reason?: string;
}

const FEATURES: Array<{ free: string; pro: string }> = [
  { free: "JLPT N5 deck (79 kanji)", pro: "All 12 default decks (4,300+ kanji)" },
  { free: "1 custom deck, 50 cards", pro: "Unlimited custom decks & cards" },
  { free: "CSV / TSV / JSON paste import", pro: "Anki .apkg import" },
  { free: "Local progress + manual export", pro: "iCloud backup *" },
];

export function Paywall({ setState, onBack, reason }: PaywallProps) {
  const [selected, setSelected] = useState<string>(OFFERS[0].id);
  const [busy, setBusy] = useState<"purchase" | "restore" | null>(null);
  const [thanks, setThanks] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const provider = getSubscriptionProvider();
  const offer = OFFERS.find((o) => o.id === selected) ?? OFFERS[0];

  const handlePurchase = async () => {
    setBusy("purchase");
    setErrorMsg(null);
    try {
      const result = await provider.purchase(offer.id);
      if (!result.success || !result.plan) {
        setErrorMsg(result.errorMessage ?? "Purchase didn't complete.");
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
      setErrorMsg(`Purchase failed: ${(err as Error).message}`);
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
      setErrorMsg(`Restore failed: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  if (thanks) {
    return (
      <div className="fade-in session-done">
        <div className="done-emoji">ありがとう</div>
        <div className="done-title">Welcome to Pro</div>
        <div className="done-sub">
          Every deck is unlocked. Custom-deck and Anki imports are uncapped. Have fun.
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

      <div className="deck-detail-header">
        <div className="deck-detail-title">Unlock the way of kanji</div>
        <div className="deck-detail-sub">
          {reason ?? "Full library, unlimited custom decks, Anki import."}
        </div>
      </div>

      <div className="deck-list" style={{ marginBottom: 20 }}>
        {FEATURES.map((row, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ display: "flex", justifyContent: "space-between", gap: 14 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: 4,
                }}
              >
                Free
              </div>
              <div style={{ fontSize: 13 }}>{row.free}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Pro
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{row.pro}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-label">Choose a plan</div>
      <div className="deck-list" style={{ marginBottom: 16 }}>
        {OFFERS.map((o) => (
          <button
            key={o.id}
            className="deck-card"
            onClick={() => setSelected(o.id)}
            style={{
              borderColor: selected === o.id ? "var(--accent)" : "var(--border)",
              borderWidth: selected === o.id ? 2 : 1,
              padding: selected === o.id ? "15px 17px" : "16px 18px",
            }}
          >
            <div>
              <div className="deck-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {o.label}
                {o.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {o.badge}
                  </span>
                )}
              </div>
              <div className="deck-sub">{o.pricePerPeriod}</div>
            </div>
            <div className="deck-meta-right">
              <div className="deck-due">{o.priceLabel}</div>
              {o.trialLabel && (
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
                  {o.trialLabel}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        className="study-cta"
        onClick={handlePurchase}
        disabled={!!busy}
        style={busy ? { opacity: 0.6, cursor: "wait" } : undefined}
      >
        {busy === "purchase" ? "Processing…" : `Subscribe — ${offer.priceLabel}`}
      </button>

      {errorMsg && (
        <div
          className="stat-card"
          style={{ marginBottom: 12, color: "var(--again)", fontSize: 13 }}
        >
          {errorMsg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <button className="undo-btn" onClick={handleRestore} disabled={!!busy}>
          {busy === "restore" ? "Restoring…" : "Restore purchases"}
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "0 4px",
          fontSize: 11,
          lineHeight: 1.5,
          color: "var(--text-dim)",
          textAlign: "center",
        }}
      >
        * iCloud backup ships with the iOS native build (M4). Auto-renews until cancelled. Manage
        in App Store → Settings → Subscriptions. Payment charged to your Apple ID.{" "}
        <a href="/terms" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>
          Terms
        </a>{" "}
        ·{" "}
        <a href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>
          Privacy
        </a>
      </div>
    </div>
  );
}
