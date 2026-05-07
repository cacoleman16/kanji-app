/**
 * Daily-review reminder notifications.
 *
 * On iOS native, schedule a single repeating local notification at the user's
 * preferred time (default 8 PM). The body mentions the count of cards due
 * if we know it. Free for all users — review reminders are the #1 retention
 * mechanic and shouldn't be paywalled.
 *
 * Permission flow:
 *   1. User flips the toggle in Settings → we call requestPermission()
 *   2. If granted, schedule the daily reminder
 *   3. If denied, surface a friendly modal explaining how to enable in
 *      Settings → Notifications → Kanjido
 *
 * On the web this module no-ops cleanly so call-sites don't need branching.
 */

import { isNative } from "./bridge";

/** Stable id used by every Kanjido daily reminder so we can update/cancel it. */
const DAILY_NOTIFICATION_ID = 1001;

export interface NotificationStatus {
  /** True if the user has granted permission and we'll fire reminders. */
  granted: boolean;
  /** False on web or other unsupported platforms. */
  supported: boolean;
}

export async function getNotificationStatus(): Promise<NotificationStatus> {
  if (!isNative()) return { granted: false, supported: false };
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const { display } = await LocalNotifications.checkPermissions();
    return { granted: display === "granted", supported: true };
  } catch {
    return { granted: false, supported: false };
  }
}

/**
 * Request permission to send local notifications. iOS shows the system
 * "Allow Kanjido to send notifications?" prompt the first time it's called.
 */
export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (!isNative()) return { granted: false, supported: false };
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const { display } = await LocalNotifications.requestPermissions();
    return { granted: display === "granted", supported: true };
  } catch {
    return { granted: false, supported: false };
  }
}

export interface DailyReminderConfig {
  /** Hour of day in 24h format (0–23). */
  hour: number;
  /** Minute of hour (0–59). */
  minute: number;
  /** Optional dynamic body: "12 cards due today". */
  dueCount?: number;
}

/**
 * Schedule (or replace) the daily review reminder at the given time. Idempotent;
 * cancels any previous reminder first. No-op on web.
 */
export async function scheduleDailyReminder(cfg: DailyReminderConfig): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    // Cancel any prior reminder so we don't stack.
    try {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIFICATION_ID }] });
    } catch {
      /* ignore cancel-of-nothing */
    }
    const body =
      cfg.dueCount && cfg.dueCount > 0
        ? `${cfg.dueCount} card${cfg.dueCount === 1 ? "" : "s"} due — keep your streak going.`
        : "Time to study. Keep your streak going.";
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_NOTIFICATION_ID,
          title: "Kanjido",
          body,
          schedule: {
            on: { hour: cfg.hour, minute: cfg.minute },
            allowWhileIdle: true,
          },
          smallIcon: "ic_stat_kanjido",
        },
      ],
    });
  } catch (err) {
    console.warn("scheduleDailyReminder failed:", err);
  }
}

/** Cancel the daily reminder (e.g. when the user turns off notifications). */
export async function cancelDailyReminder(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIFICATION_ID }] });
  } catch {
    /* ignore */
  }
}
