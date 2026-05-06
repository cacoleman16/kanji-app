import { useState } from "react";

import { FREE_LIMITS, canCreateUserDeck, isPro } from "@/entitlements/entitlement";
import type { AppState, DeckKind } from "@/types";
import { createDeck, deleteDeck } from "@/userDecks/userDecks";

import type { Route } from "../routes";

interface MyDecksProps {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  onBack: () => void;
  go: (r: Route) => void;
}

export function MyDecks({ state, setState, onBack, go }: MyDecksProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<DeckKind>("kanji");

  const userIsPro = isPro(state);
  const canCreate = canCreateUserDeck(state);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    if (!canCreate) {
      go({
        name: "paywall",
        reason: `Free users can keep ${FREE_LIMITS.maxUserDecks} custom deck. Upgrade for unlimited.`,
      });
      return;
    }
    setState((s) => createDeck(s, name, newKind));
    setNewName("");
    setCreating(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete deck "${name}"? Cards in it won't be reviewable anymore.`)) return;
    setState((s) => deleteDeck(s, id));
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">My Decks</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="deck-detail-header">
        <div className="deck-detail-title">My decks</div>
        <div className="deck-detail-sub">
          {state.userDecks.length === 0
            ? "Create your first deck or import from CSV / JSON."
            : `${state.userDecks.length} deck${state.userDecks.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {creating ? (
        <div
          className="stat-card"
          style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Deck name"
            autoFocus
            style={{
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 15,
              fontFamily: "var(--font-ui)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setCreating(false);
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`filter-chip ${newKind === "kanji" ? "active" : ""}`}
              onClick={() => setNewKind("kanji")}
            >
              Kanji
            </button>
            <button
              className={`filter-chip ${newKind === "vocab" ? "active" : ""}`}
              onClick={() => setNewKind("vocab")}
            >
              Vocab
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </button>
            <button className="skip-btn" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : canCreate ? (
        <button
          className="study-cta"
          onClick={() => setCreating(true)}
          style={{ marginBottom: 12 }}
        >
          + New deck
        </button>
      ) : (
        <button
          className="study-cta"
          onClick={() =>
            go({
              name: "paywall",
              reason: `You've reached the free limit of ${FREE_LIMITS.maxUserDecks} custom deck.`,
            })
          }
          style={{
            marginBottom: 12,
            background: "var(--accent)",
            color: "#000",
          }}
        >
          Upgrade to Pro for unlimited decks
        </button>
      )}

      {!userIsPro && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            textAlign: "center",
            marginBottom: 16,
            letterSpacing: "0.02em",
          }}
        >
          Free tier: {FREE_LIMITS.maxUserDecks} deck · {FREE_LIMITS.maxCardsPerUserDeck} cards
          max
        </div>
      )}

      <div className="deck-list">
        {state.userDecks.map((d) => (
          <div
            key={d.id}
            className="deck-card"
            style={{ alignItems: "stretch", flexDirection: "column", gap: 10 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div>
                <div className="deck-name">{d.name}</div>
                <div className="deck-sub">
                  {d.cards.length} {d.kind === "vocab" ? "words" : "kanji"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                className="filter-chip"
                onClick={() => go({ name: "deck", deckId: d.id })}
              >
                Open
              </button>
              <button
                className="filter-chip"
                onClick={() => go({ name: "myDeckImport", deckId: d.id })}
              >
                Import cards
              </button>
              <button
                className="filter-chip"
                onClick={() => go({ name: "myDeckEdit", deckId: d.id })}
              >
                Edit
              </button>
              <button
                className="filter-chip"
                onClick={() => handleDelete(d.id, d.name)}
                style={{ borderColor: "rgba(248, 113, 113, 0.35)", color: "var(--again)" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
