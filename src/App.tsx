import { useCallback, useEffect, useMemo, useState } from "react";

import { allDecks } from "@/data/allDecks";
import { DECK_GROUPS, groupFor } from "@/data/groups";
import { DeckDetail } from "@/screens/DeckDetail";
import { GroupDetail } from "@/screens/GroupDetail";
import { Home } from "@/screens/Home";
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

  const theme = state.settings.theme || "dark";
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Sync the iOS native status-bar text color with the theme.
    void import("@/native/bridge").then((m) => m.setStatusBarStyle(theme));
  }, [theme]);

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
      <main id="kanjido-main">{screen}</main>
    </div>
  );
}
