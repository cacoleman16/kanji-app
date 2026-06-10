import { useMemo } from "react";

import { decksInGroup, type DeckGroup } from "@/data/groups";
import { useNow } from "@/hooks/useNow";
import type { AppState, Deck } from "@/types";

interface GroupDetailProps {
  group: DeckGroup | null | undefined;
  state: AppState;
  onBack: () => void;
  onOpenDeck: (deckId: string) => void;
}

export function GroupDetail({ group, state, onBack, onOpenDeck }: GroupDetailProps) {
  const members = useMemo<Deck[]>(() => (group ? decksInGroup(group) : []), [group]);
  const now = useNow();

  const perDeck = useMemo<
    Record<string, { due: number; newCount: number; learned: number; total: number }>
  >(() => {
    const result: Record<string, { due: number; newCount: number; learned: number; total: number }> =
      {};
    if (!group) return result;
    for (const d of members) {
      let due = 0;
      let newCount = 0;
      let learned = 0;
      const keys = d.cardKeys ?? d.cards.map((c) => c.kanji);
      for (const k of keys) {
        const p = state.progress[k];
        if (!p) newCount++;
        else {
          learned++;
          if (p.due <= now) due++;
        }
      }
      result[d.id] = { due, newCount, learned, total: d.cardCount };
    }
    return result;
  }, [members, state.progress, group, now]);

  const chapters = useMemo<Array<[number, Deck[]]>>(() => {
    if (!group) return [];
    const byChapter = new Map<number, Deck[]>();
    for (const d of members) {
      const n = group.chapterNum(d);
      if (!byChapter.has(n)) byChapter.set(n, []);
      byChapter.get(n)!.push(d);
    }
    return Array.from(byChapter.entries()).sort((a, b) => a[0] - b[0]);
  }, [members, group]);

  if (!group) {
    return (
      <div className="fade-in session-done">
        <div className="done-title">Group not found</div>
        <button className="primary-btn" onClick={onBack}>
          Home
        </button>
      </div>
    );
  }

  const totals = members.reduce(
    (acc, d) => {
      const i = perDeck[d.id];
      if (!i) return acc;
      acc.due += i.due;
      acc.newCount += i.newCount;
      acc.learned += i.learned;
      acc.total += i.total;
      return acc;
    },
    { due: 0, newCount: 0, learned: 0, total: 0 },
  );
  const chapterCount = chapters.length;

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">{group.short || group.name}</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="deck-detail-header">
        <div className="deck-detail-title">{group.name}</div>
        <div className="deck-detail-sub">
          {chapterCount} chapters · {totals.total} kanji
        </div>
      </div>

      <div className="deck-stats-grid">
        <div className="mini-stat">
          <div className="mini-stat-lbl">Learned</div>
          <div className="mini-stat-val">
            {totals.learned}
            <span className="sub">/ {totals.total}</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-lbl">Due now</div>
          <div
            className="mini-stat-val"
            style={{ color: totals.due > 0 ? "var(--again)" : "var(--text)" }}
          >
            {totals.due}
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-lbl">New left</div>
          <div className="mini-stat-val">{totals.newCount}</div>
        </div>
      </div>

      {chapters.map(([chapNum, decks]) => (
        <div key={chapNum}>
          <div className="section-label">Chapter {chapNum}</div>
          <div className="deck-list">
            {decks.map((d) => {
              const info = perDeck[d.id];
              if (!info) return null;
              const allDone = info.due + info.newCount === 0;
              const label = group.variantLabel ? group.variantLabel(d) : d.name;
              return (
                <button key={d.id} className="deck-card" onClick={() => onOpenDeck(d.id)}>
                  <div>
                    <div className="deck-name">{label}</div>
                    <div className="deck-sub">{info.total} kanji</div>
                  </div>
                  <div className="deck-meta-right">
                    <div className={`deck-due ${allDone ? "zero" : ""}`}>
                      {info.due > 0 && <span>{info.due} due</span>}
                      {info.due > 0 && info.newCount > 0 && <span> · </span>}
                      {info.newCount > 0 && <span>{info.newCount} new</span>}
                      {allDone && <span>All done</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
