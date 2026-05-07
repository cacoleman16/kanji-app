import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_STATE } from "@/storage/state";
import type { AppState, CardProgress, Deck, KanjiCard } from "@/types";

import { DeckDetail } from "./DeckDetail";

afterEach(cleanup);

function makeKanjiCard(kanji: string, keyword: string): KanjiCard {
  return {
    kanji,
    meanings: [keyword],
    on_yomi: [],
    kun_yomi: [],
    examples: [],
    keyword,
    etymology: "",
    stroke_count: 1,
    jlpt: "N5",
  };
}

const TEST_DECK: Deck = {
  id: "test-deck",
  name: "Test Deck",
  subtitle: "Three cards",
  kind: "kanji",
  cards: [makeKanjiCard("一", "one"), makeKanjiCard("二", "two"), makeKanjiCard("三", "three")],
};

function makeProgress(reps = 5, intervalDays = 30): CardProgress {
  return {
    ease: 2.5,
    interval: intervalDays,
    reps,
    due: Date.now() + intervalDays * 24 * 60 * 60 * 1000,
    lastReview: Date.now() - 24 * 60 * 60 * 1000,
  };
}

function makeState(progress: AppState["progress"] = {}): AppState {
  return { ...DEFAULT_STATE, progress };
}

describe("<DeckDetail />", () => {
  it("renders the deck name and stats", () => {
    render(
      <DeckDetail
        deck={TEST_DECK}
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    // Title appears in topbar + header — check at least one is present.
    expect(screen.getAllByText("Test Deck").length).toBeGreaterThan(0);
    expect(screen.getByText("Three cards")).toBeTruthy();
  });

  it("hides the reset-progress link when no cards have progress", () => {
    render(
      <DeckDetail
        deck={TEST_DECK}
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Reset progress for this deck/i)).toBeNull();
  });

  it("shows the reset-progress link once at least one card is learned", () => {
    render(
      <DeckDetail
        deck={TEST_DECK}
        state={makeState({ 一: makeProgress() })}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    expect(screen.getByText(/Reset progress for this deck/i)).toBeTruthy();
  });

  it("clears progress for the deck's cards when reset is confirmed", () => {
    const setState = vi.fn();
    render(
      <DeckDetail
        deck={TEST_DECK}
        state={makeState({
          一: makeProgress(),
          二: makeProgress(),
          外: makeProgress(), // a card NOT in this deck — must remain
        })}
        setState={setState}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(/Reset progress for this deck/i));
    // Modal opens, click "Reset progress" button.
    fireEvent.click(screen.getByText("Reset progress"));
    expect(setState).toHaveBeenCalledTimes(1);
    const updater = setState.mock.calls[0][0] as (s: AppState) => AppState;
    const next = updater(
      makeState({
        一: makeProgress(),
        二: makeProgress(),
        外: makeProgress(),
      }),
    );
    expect(next.progress["一"]).toBeUndefined();
    expect(next.progress["二"]).toBeUndefined();
    // Cross-deck card must be untouched.
    expect(next.progress["外"]).toBeDefined();
  });

  it("opens the peek modal with review history when a card tile is clicked", () => {
    render(
      <DeckDetail
        deck={TEST_DECK}
        state={makeState({ 一: makeProgress(10, 60) })}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    // Tile button uses the keyword as visible text.
    const tile = screen.getAllByText("一")[0]; // appears in the tile-kanji span
    fireEvent.click(tile);
    // Review-history block exposes the "Status" / "Last seen" labels.
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Last seen")).toBeTruthy();
    expect(screen.getByText("Reps")).toBeTruthy();
  });

  it("renders 'Deck not found' when deck is undefined", () => {
    render(
      <DeckDetail
        deck={undefined}
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    expect(screen.getByText("Deck not found")).toBeTruthy();
  });

  it("hides the search input on small decks (< 30 cards)", () => {
    render(
      <DeckDetail
        deck={TEST_DECK}
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("Search cards")).toBeNull();
  });

  it("emits a screen-reader-friendly aria-label combining kanji, gloss, and status", () => {
    render(
      <DeckDetail
        deck={TEST_DECK}
        state={makeState({ 一: makeProgress(10, 60) })}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    // Mastered: interval 60 + reps 10 → mastered status. Card 一 → "one".
    const tile = screen.getByLabelText(/^一,\s*one,\s*mastered$/);
    expect(tile).toBeTruthy();
    // A "new" (unstudied) card carries "new card" in its label.
    expect(screen.getByLabelText(/^二,\s*two,\s*new card$/)).toBeTruthy();
  });

  it("shows the search input and filters on large decks", () => {
    // Build a 30-card deck — one with a unique keyword we'll search for.
    const cards = Array.from({ length: 30 }, (_, i) => makeKanjiCard(`字${i}`, `gloss${i}`));
    cards[7] = makeKanjiCard("特別", "uniqueneedle");
    const bigDeck: Deck = { ...TEST_DECK, cards };
    render(
      <DeckDetail
        deck={bigDeck}
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        onStudy={vi.fn()}
      />,
    );
    const input = screen.getByLabelText("Search cards") as HTMLInputElement;
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: "uniqueneedle" } });
    // Match-count chip appears.
    expect(screen.getByText(/1 match/i)).toBeTruthy();
    // The needle's kanji is in the grid.
    expect(screen.getAllByText("特別").length).toBeGreaterThanOrEqual(1);
  });
});
