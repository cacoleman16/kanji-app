import { useRef, useState, type ChangeEvent } from "react";

import { grantPro, isPro, revokePro } from "@/entitlements/entitlement";
import { getSubscriptionProvider } from "@/entitlements/provider";
import { DEFAULT_STATE, parseImport, todayStr } from "@/storage/state";
import type { AppState, ProPlan, Settings as SettingsT } from "@/types";

import type { Route } from "../routes";

interface SettingsProps {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  onBack: () => void;
  go: (r: Route) => void;
}

export function Settings({ state, setState, onBack, go }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionTaps, setVersionTaps] = useState(0);
  const userIsPro = isPro(state);
  const provider = getSubscriptionProvider();
  const update = <K extends keyof SettingsT>(key: K, val: SettingsT[K]) =>
    setState((s) => ({ ...s, settings: { ...s.settings, [key]: val } }));
  const reset = () => {
    if (confirm("Erase all progress and start over? This cannot be undone.")) {
      setState(() => structuredClone(DEFAULT_STATE));
    }
  };
  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanji-progress-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const pickImportFile = () => fileInputRef.current?.click();
  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const next = parseImport(text);
      const count = Object.keys(next.progress).length;
      if (
        !confirm(
          `Import ${count} progress entr${count === 1 ? "y" : "ies"}? This replaces your current progress.`,
        )
      )
        return;
      setState(() => next);
      alert("Import complete.");
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
    }
  };

  const theme = state.settings.theme || "dark";

  const handleRestore = async () => {
    try {
      const result = await provider.restore();
      if (result.success && result.plan) {
        setState((s) =>
          grantPro(s, result.plan as ProPlan, {
            providerCustomerId: result.providerCustomerId,
            expiresAt: result.expiresAt,
          }),
        );
        alert("Pro restored.");
      } else {
        alert("No previous purchases found for this Apple ID.");
      }
    } catch (err) {
      alert(`Restore failed: ${(err as Error).message}`);
    }
  };

  /** Tap the version footer 7 times to toggle Pro for testing. */
  const onVersionTap = () => {
    const next = versionTaps + 1;
    setVersionTaps(next);
    if (next >= 7) {
      setVersionTaps(0);
      if (userIsPro) {
        if (confirm("Dev: revoke Pro?")) setState(revokePro);
      } else {
        if (confirm("Dev: grant comp Pro?")) setState((s) => grantPro(s, "comp"));
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack}>
          ←
        </button>
        <div className="topbar-title">Settings</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="section-title">Settings</div>

      <div className="section-label">Subscription</div>
      <div
        className="stat-card"
        style={{
          marginBottom: 20,
          background: userIsPro ? "var(--accent-soft)" : "var(--surface)",
          borderColor: userIsPro ? "var(--accent)" : "var(--border)",
          borderWidth: 1,
          borderStyle: "solid",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {userIsPro ? "Kanjido Pro" : "Free tier"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {userIsPro
                ? state.pro.plan === "yearly"
                  ? "Yearly · auto-renews"
                  : state.pro.plan === "monthly"
                    ? "Monthly · auto-renews"
                    : state.pro.plan === "comp"
                      ? "Comped"
                      : "Lifetime"
                : "JLPT N5 + 1 custom deck"}
            </div>
          </div>
          {!userIsPro && (
            <button
              className="primary-btn"
              style={{ padding: "8px 14px", fontSize: 13 }}
              onClick={() => go({ name: "paywall" })}
            >
              Upgrade
            </button>
          )}
        </div>
        {userIsPro && (
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            <button
              className="filter-chip"
              onClick={() => provider.manageSubscriptions()}
            >
              Manage subscription
            </button>
            <button className="filter-chip" onClick={handleRestore}>
              Refresh status
            </button>
          </div>
        )}
        {!userIsPro && (
          <button
            className="undo-btn"
            onClick={handleRestore}
            style={{ marginTop: 10, padding: "4px 0" }}
          >
            Already paid? Restore purchases
          </button>
        )}
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Daily goal</div>
          <div className="settings-sub">Cards to review per day</div>
        </div>
        <input
          type="number"
          className="settings-value"
          min="1"
          max="500"
          value={state.settings.dailyGoal}
          onChange={(e) => update("dailyGoal", parseInt(e.target.value) || 30)}
        />
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">New cards per day</div>
          <div className="settings-sub">Max new kanji introduced each day</div>
        </div>
        <input
          type="number"
          className="settings-value"
          min="0"
          max="100"
          value={state.settings.newPerDay}
          onChange={(e) => update("newPerDay", parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Card back text size</div>
          <div className="settings-sub">Font size for meanings and readings</div>
        </div>
        <select
          className="settings-value"
          value={state.settings.cardBackFontSize || "medium"}
          onChange={(e) =>
            update("cardBackFontSize", e.target.value as SettingsT["cardBackFontSize"])
          }
          style={{
            background: "var(--surface-2)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 14,
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Vocab card direction</div>
          <div className="settings-sub">Which side shows first on vocab cards</div>
        </div>
        <select
          className="settings-value"
          value={state.settings.vocabDirection || "ja-en"}
          onChange={(e) =>
            update("vocabDirection", e.target.value as SettingsT["vocabDirection"])
          }
          style={{
            background: "var(--surface-2)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 14,
          }}
        >
          <option value="ja-en">Japanese → English</option>
          <option value="en-ja">English → Japanese</option>
        </select>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Theme</div>
          <div className="settings-sub">Switch between dark and light mode</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => update("theme", "dark")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: theme === "dark" ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: theme === "dark" ? "var(--surface-2)" : "transparent",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: theme === "dark" ? 600 : 400,
            }}
          >
            Dark
          </button>
          <button
            onClick={() => update("theme", "light")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: theme === "light" ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: theme === "light" ? "var(--surface-2)" : "transparent",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: theme === "light" ? 600 : 400,
            }}
          >
            Light
          </button>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Export progress</div>
          <div className="settings-sub">Download your progress as JSON backup</div>
        </div>
        <button
          className="primary-btn"
          style={{ padding: "8px 14px", fontSize: 13 }}
          onClick={exportProgress}
        >
          Export
        </button>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Import progress</div>
          <div className="settings-sub">
            Restore from a previous JSON backup (replaces current progress)
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
        <button
          className="primary-btn"
          style={{ padding: "8px 14px", fontSize: 13 }}
          onClick={pickImportFile}
        >
          Import
        </button>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label" style={{ color: "var(--again)" }}>
            Reset all progress
          </div>
          <div className="settings-sub">Erase everything and start over</div>
        </div>
        <button className="danger-btn" onClick={reset}>
          Reset
        </button>
      </div>

      <div
        onClick={onVersionTap}
        style={{
          marginTop: 32,
          fontSize: 11,
          color: "var(--text-dim)",
          textAlign: "center",
          letterSpacing: "0.04em",
          cursor: "default",
          userSelect: "none",
        }}
      >
        Kanjido v0.1 · Local storage only · No data leaves your device
      </div>
    </div>
  );
}
