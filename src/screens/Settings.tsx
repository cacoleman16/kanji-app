import { useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { Modal } from "@/components/Modal";
import { grantPro, isPro, revokePro } from "@/entitlements/entitlement";
import { getSubscriptionProvider } from "@/entitlements/provider";
import { isNative, shareText, writeBackupFile } from "@/native/bridge";
import { DEFAULT_STATE, parseImport, todayStr } from "@/storage/state";
import type { AppState, ProPlan, Settings as SettingsT } from "@/types";

import type { Route } from "../routes";

interface ModalConfig {
  title: string;
  body?: ReactNode;
  tone?: "info" | "confirm" | "danger";
  confirmLabel?: string;
  cancelLabel?: string | null;
  onConfirm?: () => void;
}

interface SettingsProps {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  onBack: () => void;
  go: (r: Route) => void;
}

export function Settings({ state, setState, onBack, go }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionTaps, setVersionTaps] = useState(0);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [iCloudBusy, setICloudBusy] = useState(false);
  const userIsPro = isPro(state);
  const provider = getSubscriptionProvider();
  const update = <K extends keyof SettingsT>(key: K, val: SettingsT[K]) =>
    setState((s) => ({ ...s, settings: { ...s.settings, [key]: val } }));

  const showInfo = (title: string, body?: ReactNode) =>
    setModal({ title, body, tone: "info", cancelLabel: null });

  const reset = () =>
    setModal({
      title: "Delete all your data?",
      body: (
        <>
          This erases all study progress, custom decks, and settings. It cannot be undone. Your
          Pro subscription stays active.
        </>
      ),
      tone: "danger",
      confirmLabel: "Delete everything",
      onConfirm: () => setState(() => structuredClone(DEFAULT_STATE)),
    });

  const exportProgress = async () => {
    const filename = `kanjido-progress-${todayStr()}.json`;
    await shareText({
      title: "Kanjido backup",
      filename,
      text: JSON.stringify(state, null, 2),
    });
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
      setModal({
        title: "Replace current progress?",
        body: (
          <>
            Import {count} progress entr{count === 1 ? "y" : "ies"}? This replaces your current
            progress and settings.
          </>
        ),
        tone: "confirm",
        confirmLabel: "Replace",
        onConfirm: () => {
          setState(() => next);
          showInfo("Import complete", `Loaded ${count} entr${count === 1 ? "y" : "ies"}.`);
        },
      });
    } catch (err) {
      showInfo("Import failed", (err as Error).message);
    }
  };

  /** iCloud Drive backup — only works on the iOS native build. */
  const backupToICloud = async () => {
    if (!isNative()) {
      showInfo(
        "iCloud backup ships with the iOS app",
        "On this web preview, use Export instead. The iOS native build (M4) writes a Kanjido folder into your iCloud Drive automatically.",
      );
      return;
    }
    setICloudBusy(true);
    try {
      const filename = `kanjido-progress-${todayStr()}.json`;
      const uri = await writeBackupFile(filename, JSON.stringify(state, null, 2));
      if (uri) {
        showInfo("Backup written", `Saved to your Files app at ${filename}.`);
      } else {
        showInfo("Backup failed", "Could not write to the file system.");
      }
    } finally {
      setICloudBusy(false);
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
        showInfo("Pro restored", "Welcome back. All Pro features are unlocked.");
      } else {
        showInfo(
          "No purchases found",
          "We couldn't find a Pro subscription for this Apple ID. If you've subscribed on a different device, sign in with that Apple ID first.",
        );
      }
    } catch (err) {
      showInfo("Restore failed", (err as Error).message);
    }
  };

  const replayOnboarding = () =>
    setModal({
      title: "Replay the welcome flow?",
      body: "Walks through the 3-screen intro again. Doesn't change any progress.",
      tone: "confirm",
      confirmLabel: "Replay",
      onConfirm: () =>
        setState((s) => ({
          ...s,
          settings: { ...s.settings, onboardingComplete: false },
        })),
    });

  /** Tap the version footer 7 times to toggle Pro for testing. */
  const onVersionTap = () => {
    const next = versionTaps + 1;
    setVersionTaps(next);
    if (next >= 7) {
      setVersionTaps(0);
      setModal({
        title: userIsPro ? "Revoke comp Pro?" : "Grant comp Pro?",
        body: "Dev override for testing the paywall gates. No payment is involved.",
        tone: "confirm",
        confirmLabel: userIsPro ? "Revoke" : "Grant",
        onConfirm: () =>
          userIsPro ? setState(revokePro) : setState((s) => grantPro(s, "comp")),
      });
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
          <div className="settings-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            iCloud backup
            {!isNative() && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  background: "var(--surface-2)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                iOS only
              </span>
            )}
          </div>
          <div className="settings-sub">
            {isNative()
              ? "Save a JSON snapshot to your iCloud Drive's Kanjido folder."
              : "Available on the iOS native app — syncs your progress across devices."}
          </div>
        </div>
        <button
          className="primary-btn"
          style={{ padding: "8px 14px", fontSize: 13, opacity: iCloudBusy ? 0.6 : 1 }}
          onClick={backupToICloud}
          disabled={iCloudBusy}
        >
          {iCloudBusy ? "Saving…" : "Back up"}
        </button>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Replay welcome screen</div>
          <div className="settings-sub">
            Walk through the onboarding intro again
          </div>
        </div>
        <button className="filter-chip" onClick={replayOnboarding}>
          Replay
        </button>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label" style={{ color: "var(--again)" }}>
            Delete all my data
          </div>
          <div className="settings-sub">
            Erases progress, custom decks, and settings. Cannot be undone.
          </div>
        </div>
        <button className="danger-btn" onClick={reset}>
          Delete
        </button>
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>
        About
      </div>
      <div
        className="stat-card"
        style={{
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text)" }}>Kanjido</strong> — minimalist Japanese kanji
          study with SM-2 spaced repetition. Made with care.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <a
          href="/privacy"
          target="_blank"
          rel="noopener"
          className="filter-chip"
          style={{ textDecoration: "none" }}
        >
          Privacy Policy
        </a>
        <a
          href="/terms"
          target="_blank"
          rel="noopener"
          className="filter-chip"
          style={{ textDecoration: "none" }}
        >
          Terms of Service
        </a>
        <a
          href="mailto:hello@kanjido.app"
          className="filter-chip"
          style={{ textDecoration: "none" }}
        >
          Contact / support
        </a>
      </div>

      <div
        onClick={onVersionTap}
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "var(--text-dim)",
          textAlign: "center",
          letterSpacing: "0.04em",
          cursor: "default",
          userSelect: "none",
        }}
      >
        Kanjido v0.1 · {isNative() ? "iOS native" : "Web (PWA)"} · Local-only data
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.title ?? ""}
        body={modal?.body}
        tone={modal?.tone}
        confirmLabel={modal?.confirmLabel}
        cancelLabel={modal?.cancelLabel}
        onConfirm={modal?.onConfirm}
      />
    </div>
  );
}
