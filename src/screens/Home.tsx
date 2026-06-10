import { useMemo, useState } from "react";

import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { useNow } from "@/hooks/useNow";
import { allDecks } from "@/data/allDecks";
import { decksInGroup, groupFor, type DeckGroup } from "@/data/groups";
import { isDeckUnlocked, isPro } from "@/entitlements/entitlement";
import { dueCountsByJlpt } from "@/srs/queue";
import { todayStr } from "@/storage/state";
import type { AppState, Deck, Jlpt } from "@/types";

import type { Route } from "../routes";

interface DeckInfo {
  due: number;
  newCount: number;
  total: number;
}

type Tile =
  | {
      kind: "group";
      group: DeckGroup;
      memberCount: number;
      due: number;
      newCount: number;
      total: number;
    }
  | { kind: "deck"; deck: Deck; info: DeckInfo };

interface HomeProps {
  state: AppState;
  onOpenDeck: (deckId: string) => void;
  onOpenGroup: (groupId: string) => void;
  onNav: (r: Route) => void;
}

export function Home({ state, onOpenDeck, onOpenGroup, onNav }: HomeProps) {
  const today = todayStr();
  const todayStats = state.stats.byDay[today] || {
    reviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };
  const goal = state.settings.dailyGoal;
  const pct = Math.min(100, Math.round((todayStats.reviewed / goal) * 100));
  const [activeTab, setActiveTab] = useState<"kanji" | "vocab" | "grammar">("kanji");

  const decks = useMemo(() => allDecks(state), [state]);
  // Refreshes on app foregrounding so overnight-stale due counts correct
  // themselves the moment the user comes back.
  const now = useNow();

  const mixedDueCounts = useMemo(
    () => dueCountsByJlpt(decks, state.progress, now),
    [decks, state.progress, now],
  );

  const dueByDeck = useMemo<Record<string, DeckInfo>>(() => {
    const result: Record<string, DeckInfo> = {};
    for (const d of decks) {
      if (d.available === false) {
        result[d.id] = { due: 0, newCount: 0, total: d.cardCount };
        continue;
      }
      let due = 0;
      let newCount = 0;
      // Default decks expose `cardKeys` from the build-time index so this
      // loop runs without forcing a dynamic JSON import. User-created decks
      // (live in localStorage) iterate their populated `.cards` instead.
      const keys = d.cardKeys ?? d.cards.map((c) => c.kanji);
      for (const k of keys) {
        const p = state.progress[k];
        if (!p) newCount++;
        else if (p.due <= now) due++;
      }
      result[d.id] = { due, newCount, total: d.cardCount };
    }
    return result;
  }, [decks, state.progress, now]);

  const { kanjiTiles, vocabTiles, grammarTiles } = useMemo(() => {
    const seenGroups = new Set<string>();
    const kanjiTiles: Tile[] = [];
    const vocabTiles: Tile[] = [];
    const grammarTiles: Tile[] = [];
    for (const d of decks) {
      const bucket =
        d.kind === "grammar" ? grammarTiles : d.kind === "vocab" ? vocabTiles : kanjiTiles;
      const g = groupFor(d);
      if (g) {
        if (seenGroups.has(g.id)) continue;
        seenGroups.add(g.id);
        const members = decksInGroup(g);
        let due = 0;
        let newCount = 0;
        let total = 0;
        for (const m of members) {
          const info = dueByDeck[m.id];
          if (!info) continue;
          due += info.due;
          newCount += info.newCount;
          total += info.total;
        }
        bucket.push({ kind: "group", group: g, memberCount: members.length, due, newCount, total });
      } else {
        bucket.push({ kind: "deck", deck: d, info: dueByDeck[d.id] });
      }
    }
    return { kanjiTiles, vocabTiles, grammarTiles };
  }, [decks, dueByDeck]);

  /** Build a screen-reader-friendly label like "JLPT N5: 12 due, 3 new" or "Mastered, all done". */
  const tileAriaLabel = (
    name: string,
    due: number,
    newCount: number,
    extra?: string,
    locked?: boolean,
  ): string => {
    const parts = [name];
    if (extra) parts.push(extra);
    if (locked) parts.push("Pro, locked");
    if (due === 0 && newCount === 0) parts.push("all done");
    else {
      if (due > 0) parts.push(`${due} due`);
      if (newCount > 0) parts.push(`${newCount} new`);
    }
    return parts.join(", ");
  };

  const renderTile = (t: Tile) => {
    if (t.kind === "group") {
      const g = t.group;
      const allDone = t.due + t.newCount === 0;
      return (
        <button
          key={"grp:" + g.id}
          className="deck-card"
          onClick={() => onOpenGroup(g.id)}
          aria-label={tileAriaLabel(
            g.name,
            t.due,
            t.newCount,
            `${t.memberCount} chapters, ${t.total} kanji`,
          )}
        >
          <div>
            <div className="deck-name">{g.name}</div>
            <div className="deck-sub">
              {t.memberCount} chapters · {t.total} kanji
            </div>
          </div>
          <div className="deck-meta-right">
            <div className={`deck-due ${allDone ? "zero" : ""}`}>
              {t.due > 0 && <span>{t.due} due</span>}
              {t.due > 0 && t.newCount > 0 && <span> · </span>}
              {t.newCount > 0 && <span>{t.newCount} new</span>}
              {allDone && <span>All done</span>}
            </div>
          </div>
        </button>
      );
    }
    const d = t.deck;
    const info = t.info;
    const available = d.available !== false;
    const unlocked = isDeckUnlocked(d, state);
    return (
      <button
        key={d.id}
        className={`deck-card ${!available ? "disabled" : ""}`}
        onClick={() => {
          if (!available) return;
          if (!unlocked) {
            onNav({ name: "paywall", reason: `${d.name} is unlocked with Kanjido Pro.` });
            return;
          }
          onOpenDeck(d.id);
        }}
        disabled={!available}
        aria-label={
          !available
            ? `${d.name}, coming soon`
            : tileAriaLabel(d.name, info.due, info.newCount, d.subtitle, !unlocked)
        }
      >
        <div>
          <div
            className="deck-name"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {d.name}
            {!unlocked && available && <Badge variant="pro">Pro</Badge>}
          </div>
          <div className="deck-sub">{available ? d.subtitle : "Coming soon"}</div>
        </div>
        <div className="deck-meta-right">
          {available && unlocked ? (
            <div className={`deck-due ${info.due + info.newCount === 0 ? "zero" : ""}`}>
              {info.due > 0 && <span>{info.due} due</span>}
              {info.due > 0 && info.newCount > 0 && <span> · </span>}
              {info.newCount > 0 && <span>{info.newCount} new</span>}
              {info.due + info.newCount === 0 && <span>All done</span>}
            </div>
          ) : null}
        </div>
      </button>
    );
  };

  const userIsPro = isPro(state);

  const levels: Jlpt[] = ["N5", "N4", "N3", "N2", "N1"];

  return (
    <div className="fade-in">
      <div className="topbar">
        <div className="topbar-left"></div>
        <div className="topbar-title">Kanjido</div>
        <div className="topbar-right">
          <button
            className="icon-btn"
            onClick={() => onNav({ name: "myDecks" })}
            aria-label="My decks"
            title="My decks"
          >
            ✎
          </button>
          <button className="icon-btn" onClick={() => onNav({ name: "stats" })} aria-label="Stats">
            ◌
          </button>
          <button
            className="icon-btn"
            onClick={() => onNav({ name: "settings" })}
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </div>

      <div className="home-header">
        <div className="greeting">Today</div>
        <div className="big-title">
          {todayStats.reviewed === 0 ? "Let's study." : `${todayStats.reviewed} reviewed.`}
        </div>
      </div>

      <div className="streak-row">
        <div className="stat-card">
          <div className="stat-label">Streak</div>
          <div className="stat-value">
            {state.streak.current}
            <span className="stat-unit">day{state.streak.current === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Daily goal</div>
          <div className="stat-value">
            {todayStats.reviewed}
            <span className="stat-unit">/ {goal}</span>
          </div>
          <div className="daily-progress">
            <div className="daily-bar">
              <div className="daily-bar-fill" style={{ width: pct + "%" }} />
            </div>
          </div>
        </div>
      </div>

      {!userIsPro && (
        <button
          className="deck-card"
          onClick={() => onNav({ name: "paywall" })}
          style={{
            borderColor: "var(--accent)",
            background: "var(--accent-soft)",
            marginBottom: 12,
          }}
        >
          <div>
            <div className="deck-name">Unlock Kanjido Pro</div>
            <div className="deck-sub">All decks · unlimited custom decks · Anki import</div>
          </div>
          <div className="deck-meta-right">
            <div className="deck-due">$3.99/mo</div>
          </div>
        </button>
      )}

      <div className="home-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "kanji"}
          className={`home-tab ${activeTab === "kanji" ? "active" : ""}`}
          onClick={() => setActiveTab("kanji")}
        >
          Kanji
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "vocab"}
          className={`home-tab ${activeTab === "vocab" ? "active" : ""}`}
          onClick={() => setActiveTab("vocab")}
        >
          Vocab
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "grammar"}
          className={`home-tab ${activeTab === "grammar" ? "active" : ""}`}
          onClick={() => setActiveTab("grammar")}
        >
          Grammar
        </button>
      </div>

      {activeTab === "kanji" && (
        <>
          {mixedDueCounts.all > 0 && (
            <button
              className="deck-card"
              onClick={() => onNav({ name: "mixedReview" })}
              style={{ borderColor: "var(--accent)" }}
            >
              <div>
                <div className="deck-name">Review Due — All Kanji Decks</div>
                <div className="deck-sub">
                  {levels
                    .filter((l) => mixedDueCounts[l] > 0)
                    .map((l) => `${l} ${mixedDueCounts[l]}`)
                    .join(" · ") || "Mixed"}
                </div>
              </div>
              <div className="deck-meta-right">
                <div className="deck-due">
                  <span>{mixedDueCounts.all} due</span>
                </div>
              </div>
            </button>
          )}
          <div className="section-label">Kanji decks</div>
          <div className="deck-list">{kanjiTiles.map(renderTile)}</div>
        </>
      )}

      {activeTab === "vocab" && vocabTiles.length > 0 && (
        <>
          <div className="section-label">Vocabulary</div>
          <div className="deck-list">{vocabTiles.map(renderTile)}</div>
        </>
      )}

      {activeTab === "vocab" && vocabTiles.length === 0 && (
        <EmptyState
          mark="言"
          title="No vocab decks yet"
          body="More themed vocab decks ship in the next release. In the meantime, build your own from CSV / TSV / Anki."
          secondary={
            <button className="link-btn" onClick={() => onNav({ name: "myDecks" })}>
              Open My Decks
            </button>
          }
          style={{ marginTop: 8 }}
        />
      )}

      {activeTab === "grammar" && grammarTiles.length > 0 && (
        <>
          <div className="section-label">Grammar</div>
          <div className="deck-list">{grammarTiles.map(renderTile)}</div>
        </>
      )}

      {activeTab === "grammar" && grammarTiles.length === 0 && (
        <EmptyState
          mark="文"
          title="No grammar decks yet"
          body="Grammar pattern + verb-conjugation decks ship with Pro."
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
}
