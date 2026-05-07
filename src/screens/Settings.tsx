import { useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { APP_VERSION } from "@/data/version";
import { grantPro, isPro, revokePro } from "@/entitlements/entitlement";
import { getSubscriptionProvider } from "@/entitlements/provider";
import { isNative, listBackupFiles, readBackupFile, shareText, writeBackupFile } from "@/native/bridge";
import {
  cancelDailyReminder,
  requestNotificationPermission,
  scheduleDailyReminder,
} from "@/native/notifications";
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
        "On this web preview, use Export instead. The iOS native build writes Kanjido backups to iCloud Drive automatically.",
      );
      return;
    }
    setICloudBusy(true);
    try {
      const filename = `kanjido-progress-${todayStr()}.json`;
      const uri = await writeBackupFile(filename, JSON.stringify(state, null, 2));
      if (uri) {
        showInfo("Backup written", `Saved as ${filename} in your iCloud Drive's Kanjido folder.`);
      } else {
        showInfo("Backup failed", "Could not write to the file system.");
      }
    } finally {
      setICloudBusy(false);
    }
  };

  /** Find the latest iCloud backup file and ask to restore it. */
  const restoreFromICloud = async () => {
    if (!isNative()) {
      showInfo(
        "iCloud restore ships with the iOS app",
        "On this web preview, use Import instead. The iOS native build reads back from iCloud Drive automatically.",
      );
      return;
    }
    setICloudBusy(true);
    try {
      const files = await listBackupFiles();
      if (files.length === 0) {
        showInfo(
          "No backups found",
          "There aren't any kanjido-progress-*.json files in your iCloud Drive's Kanjido folder yet. Tap 'Back up' first.",
        );
        return;
      }
      const latest = files[0];
      const text = await readBackupFile(latest.name);
      if (!text) {
        showInfo("Couldn't read backup", `Failed to open ${latest.name}.`);
        return;
      }
      const next = parseImport(text);
      const count = Object.keys(next.progress).length;
      const ageMs = latest.mtime ? Date.now() - latest.mtime : 0;
      const ageDays = Math.floor(ageMs / 86_400_000);
      const ageLabel =
        ageDays === 0
          ? "today"
          : ageDays === 1
            ? "1 day ago"
            : `${ageDays} days ago`;
      setModal({
        title: "Restore from iCloud?",
        body: (
          <>
            Latest backup: <strong>{latest.name}</strong>, written {ageLabel}.
            <br />
            Restoring replaces your current progress with {count} entr
            {count === 1 ? "y" : "ies"}.
          </>
        ),
        tone: "confirm",
        confirmLabel: "Restore",
        onConfirm: () => {
          setState(() => next);
          showInfo("Restored", `Loaded ${count} entr${count === 1 ? "y" : "ies"} from iCloud.`);
        },
      });
    } catch (err) {
      showInfo("Restore failed", (err as Error).message);
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

  const reminderHour = state.settings.notificationsHour ?? 20;
  const reminderMinute = state.settings.notificationsMinute ?? 0;
  const remindersOn = state.settings.notificationsEnabled === true;

  const reminderTimeStr = `${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}`;

  const handleToggleReminders = async (next: boolean) => {
    if (next) {
      // Asking permission can prompt iOS's system dialog.
      const status = await requestNotificationPermission();
      if (!status.supported) {
        showInfo(
          "Notifications ship with the iOS app",
          "Daily review reminders run on the iOS native build (M4). On the web, set a phone alarm or add Kanjido to your Home Screen.",
        );
        return;
      }
      if (!status.granted) {
        showInfo(
          "Notification permission denied",
          "Open iOS Settings → Notifications → Kanjido and turn 'Allow Notifications' on.",
        );
        return;
      }
      await scheduleDailyReminder({ hour: reminderHour, minute: reminderMinute });
      setState((s) => ({
        ...s,
        settings: { ...s.settings, notificationsEnabled: true },
      }));
    } else {
      await cancelDailyReminder();
      setState((s) => ({
        ...s,
        settings: { ...s.settings, notificationsEnabled: false },
      }));
    }
  };

  const handleReminderTimeChange = async (value: string) => {
    const [h, m] = value.split(":").map((s) => parseInt(s, 10));
    if (isNaN(h) || isNaN(m)) return;
    setState((s) => ({
      ...s,
      settings: { ...s.settings, notificationsHour: h, notificationsMinute: m },
    }));
    if (remindersOn) {
      await scheduleDailyReminder({ hour: h, minute: m });
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
        <button className="icon-btn" onClick={onBack} aria-label="Back to home">
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

      <div className="section-label" style={{ marginTop: 24 }}>
        Study
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

      <div className="section-label" style={{ marginTop: 24 }}>
        Appearance
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

      <div className="section-label" style={{ marginTop: 24 }}>
        Notifications
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Daily reminder
            {!isNative() && <Badge>iOS only</Badge>}
          </div>
          <div className="settings-sub">
            {isNative()
              ? `Push a daily "review your cards" reminder at ${reminderTimeStr}.`
              : "Available on the iOS native app — daily push to keep your streak alive."}
          </div>
        </div>
        <input
          type="checkbox"
          checked={remindersOn}
          onChange={(e) => void handleToggleReminders(e.target.checked)}
          aria-label="Daily review reminder"
          style={{ width: 22, height: 22 }}
        />
      </div>

      {isNative() && remindersOn && (
        <div className="settings-row">
          <div>
            <div className="settings-label">Reminder time</div>
            <div className="settings-sub">When to fire the daily reminder</div>
          </div>
          <input
            type="time"
            className="settings-value"
            value={reminderTimeStr}
            onChange={(e) => void handleReminderTimeChange(e.target.value)}
            style={{ width: 110, fontFamily: "var(--font-ui)" }}
          />
        </div>
      )}

      <div className="section-label" style={{ marginTop: 24 }}>
        Backup & Sync
      </div>

      {isNative() && userIsPro && (
        <div className="settings-row">
          <div>
            <div className="settings-label">Auto-backup after sessions</div>
            <div className="settings-sub">
              Snapshot your progress to iCloud Drive after each study session, throttled to once
              per 12 hours.
            </div>
          </div>
          <input
            type="checkbox"
            checked={state.settings.autoBackupEnabled !== false}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                settings: { ...s.settings, autoBackupEnabled: e.target.checked },
              }))
            }
            aria-label="Auto-backup after each session"
            style={{ width: 22, height: 22 }}
          />
        </div>
      )}

      <div className="settings-row">
        <div>
          <div className="settings-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            iCloud backup
            {!isNative() && <Badge>iOS only</Badge>}
          </div>
          <div className="settings-sub">
            {isNative()
              ? "Save and restore JSON snapshots in your iCloud Drive's Kanjido folder."
              : "Available on the iOS native app — your progress lives in your iCloud."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="filter-chip"
            onClick={restoreFromICloud}
            disabled={iCloudBusy}
            style={iCloudBusy ? { opacity: 0.6 } : undefined}
            aria-label="Restore the latest backup from iCloud"
          >
            Restore
          </button>
          <button
            className="primary-btn"
            style={{ padding: "8px 14px", fontSize: 13, opacity: iCloudBusy ? 0.6 : 1 }}
            onClick={backupToICloud}
            disabled={iCloudBusy}
            aria-label="Save a backup to iCloud now"
          >
            {iCloudBusy ? "…" : "Back up"}
          </button>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Export progress</div>
          <div className="settings-sub">
            Save a JSON snapshot of all your progress + settings to a file you control.
          </div>
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
            Load a previously-exported JSON file. Replaces your current progress.
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

      <div className="section-label" style={{ marginTop: 24 }}>
        Data
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Replay welcome screen</div>
          <div className="settings-sub">Walk through the 3-step onboarding intro again.</div>
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
            Erase progress, custom decks, and settings. Cannot be undone — your iCloud backups
            (if any) survive.
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
        <button
          className="filter-chip"
          onClick={() => go({ name: "legal", doc: "privacy" })}
        >
          Privacy Policy
        </button>
        <button
          className="filter-chip"
          onClick={() => go({ name: "legal", doc: "terms" })}
        >
          Terms of Service
        </button>
        <button
          className="filter-chip"
          onClick={() => go({ name: "legal", doc: "support" })}
        >
          Support
        </button>
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
        Kanjido v{APP_VERSION} · {isNative() ? "iOS native" : "Web (PWA)"} · Local-only data
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
