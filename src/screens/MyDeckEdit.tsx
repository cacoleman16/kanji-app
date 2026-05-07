import { useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import type { AppState, UserCard } from "@/types";
import { addCard, deleteCard, renameDeck, updateCard } from "@/userDecks/userDecks";

interface MyDeckEditProps {
  deckId: string;
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  onBack: () => void;
}

interface CardDraft {
  kanji: string;
  meanings: string;
  reading: string;
  keyword: string;
  jlpt: string;
}

const emptyDraft = (): CardDraft => ({
  kanji: "",
  meanings: "",
  reading: "",
  keyword: "",
  jlpt: "",
});

function draftToCard(d: CardDraft): UserCard | null {
  const kanji = d.kanji.trim();
  if (!kanji) return null;
  const meanings = d.meanings
    .split(/[;|/,]/)
    .map((m) => m.trim())
    .filter(Boolean);
  const c: UserCard = { kanji, meanings };
  if (d.reading.trim()) c.reading = d.reading.trim();
  if (d.keyword.trim()) c.keyword = d.keyword.trim();
  const jlpt = d.jlpt.trim().toUpperCase();
  if (["N5", "N4", "N3", "N2", "N1"].includes(jlpt)) c.jlpt = jlpt as UserCard["jlpt"];
  return c;
}

function cardToDraft(c: UserCard): CardDraft {
  return {
    kanji: c.kanji,
    meanings: c.meanings.join(", "),
    reading: c.reading ?? "",
    keyword: c.keyword ?? "",
    jlpt: c.jlpt ?? "",
  };
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  fontFamily: "var(--font-ui)",
  width: "100%",
};

export function MyDeckEdit({ deckId, state, setState, onBack }: MyDeckEditProps) {
  const deck = state.userDecks.find((d) => d.id === deckId);
  const [name, setName] = useState(deck?.name ?? "");
  const [draft, setDraft] = useState<CardDraft>(emptyDraft());
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ idx: number; kanji: string } | null>(null);

  if (!deck) {
    return (
      <div className="fade-in session-done">
        <div className="done-title">Deck not found</div>
        <button className="primary-btn" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  const saveName = () => {
    if (name.trim() && name.trim() !== deck.name) {
      setState((s) => renameDeck(s, deckId, name.trim()));
    }
  };

  const saveDraft = () => {
    const card = draftToCard(draft);
    if (!card) return;
    if (editingIdx !== null) {
      setState((s) => updateCard(s, deckId, editingIdx, card));
    } else {
      setState((s) => addCard(s, deckId, card));
    }
    setDraft(emptyDraft());
    setEditingIdx(null);
  };

  const editExisting = (idx: number) => {
    setEditingIdx(idx);
    setDraft(cardToDraft(deck.cards[idx]));
  };

  const askRemoveCard = (idx: number) => {
    if (!deck) return;
    setPendingDelete({ idx, kanji: deck.cards[idx].kanji });
  };
  const confirmRemoveCard = () => {
    if (!pendingDelete) return;
    const { idx } = pendingDelete;
    setState((s) => deleteCard(s, deckId, idx));
    if (editingIdx === idx) {
      setEditingIdx(null);
      setDraft(emptyDraft());
    }
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <button
          className="icon-btn"
          onClick={() => {
            saveName();
            onBack();
          }}
          aria-label="Back"
        >
          ←
        </button>
        <div className="topbar-title">Edit deck</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Deck name</div>
          <div className="settings-sub">{deck.cards.length} card{deck.cards.length === 1 ? "" : "s"}</div>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          className="settings-value"
          style={{ width: 180 }}
        />
      </div>

      <div className="section-label" style={{ marginTop: 24 }}>
        {editingIdx !== null ? `Editing card #${editingIdx + 1}` : "Add a card"}
      </div>
      <div
        className="stat-card"
        style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}
      >
        <input
          type="text"
          placeholder="Kanji or word (required)"
          value={draft.kanji}
          onChange={(e) => setDraft((d) => ({ ...d, kanji: e.target.value }))}
          style={{ ...inputStyle, fontFamily: "var(--font-jp)", fontSize: 18 }}
        />
        <input
          type="text"
          placeholder="Meaning(s) — comma or semicolon separated"
          value={draft.meanings}
          onChange={(e) => setDraft((d) => ({ ...d, meanings: e.target.value }))}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Reading (optional)"
          value={draft.reading}
          onChange={(e) => setDraft((d) => ({ ...d, reading: e.target.value }))}
          style={{ ...inputStyle, fontFamily: "var(--font-jp)" }}
        />
        <input
          type="text"
          placeholder="Mnemonic / keyword (optional)"
          value={draft.keyword}
          onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="JLPT level (N5–N1, optional)"
          value={draft.jlpt}
          onChange={(e) => setDraft((d) => ({ ...d, jlpt: e.target.value }))}
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="primary-btn"
            onClick={saveDraft}
            disabled={!draft.kanji.trim()}
            style={
              !draft.kanji.trim()
                ? { opacity: 0.5, cursor: "not-allowed", padding: "8px 14px", fontSize: 13 }
                : { padding: "8px 14px", fontSize: 13 }
            }
          >
            {editingIdx !== null ? "Save changes" : "Add card"}
          </button>
          {editingIdx !== null && (
            <button
              className="skip-btn"
              onClick={() => {
                setEditingIdx(null);
                setDraft(emptyDraft());
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="section-label">Cards</div>
      {deck.cards.length === 0 ? (
        <EmptyState
          mark="札"
          title="No cards yet"
          body="Add a card with the form above, or bulk-import a stack from CSV / TSV / JSON / Anki."
          style={{ marginTop: 8 }}
        />
      ) : (
        <div className="deck-list">
          {deck.cards.map((c, idx) => (
            <div
              key={`${c.kanji}-${idx}`}
              className="stat-card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                <span
                  style={{ fontFamily: "var(--font-jp)", fontSize: 22, minWidth: 32 }}
                >
                  {c.kanji}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 220,
                    }}
                  >
                    {c.meanings.slice(0, 3).join(" · ")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                    {[c.reading, c.jlpt].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button className="filter-chip" onClick={() => editExisting(idx)}>
                  Edit
                </button>
                <button
                  className="filter-chip"
                  onClick={() => askRemoveCard(idx)}
                  style={{ borderColor: "rgba(248, 113, 113, 0.35)", color: "var(--again)" }}
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={`Delete "${pendingDelete?.kanji ?? ""}"?`}
        body="The card and any review progress for it will be removed."
        tone="danger"
        confirmLabel="Delete card"
        onConfirm={confirmRemoveCard}
      />
    </div>
  );
}
