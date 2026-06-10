import { useEffect, useState } from "react";

/**
 * A timestamp that refreshes when the app returns to the foreground.
 *
 * Due counts are a function of Date.now(), but React only re-renders on
 * state changes — so an SRS app left open overnight (the single most common
 * usage pattern: open it in the morning where you left it) shows yesterday's
 * counts until something else triggers a render.
 *
 * This hook returns a `now` value that updates on:
 *   - `visibilitychange` → visible (fires on iOS WKWebView foregrounding
 *     and on browser tab switches — no Capacitor plugin needed)
 *   - `focus` (covers desktop window refocus where visibility may not change)
 *
 * Use it as the `now` input + dependency of any due-count memo:
 *
 *   const now = useNow();
 *   const due = useMemo(() => countDue(decks, progress, now), [decks, progress, now]);
 *
 * It deliberately does NOT tick on an interval — re-rendering mid-study
 * for a counter nobody is looking at is worse than a count that's a few
 * minutes stale while the app is actively in use.
 */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return now;
}
