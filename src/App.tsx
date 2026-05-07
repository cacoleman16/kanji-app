import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WhatsNew } from "@/components/WhatsNew";
import { allDecks } from "@/data/allDecks";
import { DECK_GROUPS, groupFor } from "@/data/groups";
import { DeckDetail } from "@/screens/DeckDetail";
import { GroupDetail } from "@/screens/GroupDetail";
import { Home } from "@/screens/Home";
import { Legal } from "@/screens/Legal";
import { MixedReview } from "@/screens/MixedReview";
import { MyDeckEdit } from "@/screens/MyDeckEdit";
import { MyDeckImport } from "@/screens/MyDeckImport";
import { MyDecks } from "@/screens/MyDecks";
import { Onboarding } from "@/screens/Onboarding";
import { Paywall } from "@/screens/Paywall";
import { Settings } from "@/screens/Settings";
import { Stats } from "@/screens/Stats";
import { Study } from "@/screens/Study";
import { buildMixedDeck } from "@/srs/queue";
import { loadState, saveState } from "@/storage/state";
import type { AppState } from "@/types";

import type { Route } from "./routes";

export function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [route, setRoute] = useState<Route>({ name: "home" });
  // Compute the export-banner visibility once at mount from the same load —
  // previously we called loadState() a second time, which is wasteful since
  // localStorage parsing isn't cheap with our schema-v5 + migrations.
  const [showExportBanner, setShowExportBanner] = useState<boolean>(() => {
    const initial = state;
    const last = initial.streak?.lastActiveDay;
    if (!last || !Object.keys(initial.progress).length) return false;
    return Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000) >= 30;
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setStateFn = useCallback((updater: (s: AppState) => AppState) => {
    setState((prev) => updater(prev));
  }, []);

  const go = useCallback((r: Route) => setRoute(r), []);

  const themePref = state.settings.theme || "dark";
  // For "system" mode we resolve the effective theme by listening to
  // `prefers-color-scheme` and re-render whenever it flips. For the explicit
  // dark/light values it just collapses to the preference.
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    if (themePref !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    // Safari < 14 only supports the older addListener API.
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    // Sync once on mount (in case OS flipped while the app was unmounted).
    setSystemPrefersDark(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, [themePref]);
  const effectiveTheme: "dark" | "light" =
    themePref === "system" ? (systemPrefersDark ? "dark" : "light") : themePref;
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    // Sync the iOS native status-bar text color with the theme.
    void import("@/native/bridge").then((m) => m.setStatusBarStyle(effectiveTheme));
  }, [effectiveTheme]);

  const screen = useMemo(() => {
    const decks = allDecks(state);
    switch (route.name) {
      case "deck": {
        const deck = decks.find((d) => d.id === route.deckId);
        const parent = deck ? groupFor(deck) : null;
        const isUserDeck = !!deck?.userCreated;
        return (
          <DeckDetail
            deck={deck}
            state={state}
            setState={setStateFn}
            onBack={() =>
              go(
                isUserDeck
                  ? { name: "myDecks" }
                  : parent
                    ? { name: "group", groupId: parent.id }
                    : { name: "home" },
              )
            }
            onStudy={(opts) => go({ name: "study", deckId: route.deckId, ...opts })}
          />
        );
      }
      case "group":
        return (
          <GroupDetail
            group={DECK_GROUPS.find((g) => g.id === route.groupId)}
            state={state}
            onBack={() => go({ name: "home" })}
            onOpenDeck={(deckId) => go({ name: "deck", deckId })}
          />
        );
      case "study": {
        const deck = decks.find((d) => d.id === route.deckId);
        return (
          <Study
            deck={deck}
            includeAll={!!route.includeAll}
            state={state}
            setState={setStateFn}
            onDone={() => go({ name: "deck", deckId: route.deckId })}
          />
        );
      }
      case "mixedReview":
        return (
          <MixedReview
            state={state}
            onBack={() => go({ name: "home" })}
            onStart={(jlpt) => go({ name: "mixedStudy", jlpt })}
          />
        );
      case "mixedStudy": {
        const mixed = buildMixedDeck(decks, state.progress, route.jlpt, Date.now());
        return (
          <Study
            deck={mixed}
            state={state}
            setState={setStateFn}
            onDone={() => go({ name: "home" })}
          />
        );
      }
      case "stats":
        return <Stats state={state} onBack={() => go({ name: "home" })} />;
      case "settings":
        return (
          <Settings
            state={state}
            setState={setStateFn}
            onBack={() => go({ name: "home" })}
            go={go}
          />
        );
      case "myDecks":
        return (
          <MyDecks
            state={state}
            setState={setStateFn}
            onBack={() => go({ name: "home" })}
            go={go}
          />
        );
      case "myDeckEdit":
        return (
          <MyDeckEdit
            deckId={route.deckId}
            state={state}
            setState={setStateFn}
            onBack={() => go({ name: "myDecks" })}
          />
        );
      case "myDeckImport":
        return (
          <MyDeckImport
            deckId={route.deckId}
            state={state}
            setState={setStateFn}
            onBack={() => go({ name: "myDecks" })}
            go={go}
          />
        );
      case "paywall":
        return (
          <Paywall
            setState={setStateFn}
            onBack={() => go({ name: "home" })}
            reason={route.reason}
          />
        );
      case "legal":
        return <Legal doc={route.doc} onBack={() => go({ name: "settings" })} />;
      default:
        return (
          <Home
            state={state}
            onOpenDeck={(deckId) => go({ name: "deck", deckId })}
            onOpenGroup={(groupId) => go({ name: "group", groupId })}
            onNav={go}
          />
        );
    }
  }, [route, state, go, setStateFn]);

  // Stable string key for the current route — used to auto-clear the per-
  // screen ErrorBoundary when the user navigates away from a broken screen.
  const routeKey = useMemo(() => {
    switch (route.name) {
      case "deck":
      case "study":
      case "myDeckEdit":
      case "myDeckImport":
        return `${route.name}:${route.deckId}`;
      case "group":
        return `group:${route.groupId}`;
      case "mixedStudy":
        return `mixedStudy:${route.jlpt}`;
      case "legal":
        return `legal:${route.doc}`;
      case "paywall":
        return `paywall:${route.reason ?? ""}`;
      default:
        return route.name;
    }
  }, [route]);

  // First-launch onboarding takes over the screen until dismissed.
  if (!state.settings.onboardingComplete) {
    return (
      <div className="shell" style={{ padding: 0 }}>
        <Onboarding setState={setStateFn} />
      </div>
    );
  }

  return (
    <div className="shell" id="kanjido-shell">
      <a href="#kanjido-main" className="sr-only focusable">
        Skip to main content
      </a>
      {showExportBanner && (
        <div className="export-banner">
          <span>Back after a while — export your progress so Safari doesn't clear it.</span>
          <div className="export-banner-btns">
            <button
              className="export-banner-cta"
              onClick={() => {
                go({ name: "settings" });
                setShowExportBanner(false);
              }}
            >
              Export
            </button>
            <button
              className="export-banner-dismiss"
              onClick={() => setShowExportBanner(false)}
              aria-label="Dismiss export reminder"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <main id="kanjido-main">
        <ErrorBoundary
          scope="screen"
          resetKey={routeKey}
          onGoHome={() => go({ name: "home" })}
        >
          {screen}
        </ErrorBoundary>
      </main>
      <WhatsNew state={state} setState={setStateFn} />
    </div>
  );
}
