import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_STATE } from "@/storage/state";
import type { AppState, UserDeck } from "@/types";

import { MyDeckImport } from "./MyDeckImport";

afterEach(cleanup);

const TEST_DECK: UserDeck = {
  id: "user-test",
  name: "My Test Deck",
  kind: "vocab",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  cards: [],
};

function makeState(opts: { pro?: boolean; userDecks?: UserDeck[] } = {}): AppState {
  return {
    ...DEFAULT_STATE,
    pro: opts.pro ? { active: true, plan: "comp" } : { active: false },
    userDecks: opts.userDecks ?? [TEST_DECK],
  };
}

describe("<MyDeckImport />", () => {
  it("renders 'Deck not found' when the deckId doesn't match", () => {
    render(
      <MyDeckImport
        deckId="does-not-exist"
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    expect(screen.getByText("Deck not found")).toBeTruthy();
  });

  it("renders the upload + paste UI for an existing deck", () => {
    render(
      <MyDeckImport
        deckId="user-test"
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    expect(screen.getByText('Import into "My Test Deck"')).toBeTruthy();
    expect(screen.getByText("Upload .apkg")).toBeTruthy();
    expect(screen.getByText("Or paste cards directly")).toBeTruthy();
  });

  it("shows a Pro badge next to the .apkg row for free users", () => {
    render(
      <MyDeckImport
        deckId="user-test"
        state={makeState({ pro: false })}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    expect(screen.getByText("Pro")).toBeTruthy();
  });

  it("routes free users to the paywall when they tap Upload .apkg", () => {
    const go = vi.fn();
    render(
      <MyDeckImport
        deckId="user-test"
        state={makeState({ pro: false })}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={go}
      />,
    );
    fireEvent.click(screen.getByText("Upload .apkg"));
    expect(go).toHaveBeenCalledTimes(1);
    expect(go.mock.calls[0][0]).toMatchObject({
      name: "paywall",
      reason: expect.stringContaining("Anki"),
    });
  });

  it("parses CSV pasted into the textarea and shows a preview", () => {
    render(
      <MyDeckImport
        deckId="user-test"
        state={makeState({ pro: true })}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: "Kanji,Meaning,Reading\n学,study,がく\n校,school,こう" },
    });
    // Preview heading reports the parsed count.
    expect(screen.getByText(/2 cards parsed/i)).toBeTruthy();
    // Both rows show up in the preview list.
    expect(screen.getByText("学")).toBeTruthy();
    expect(screen.getByText("校")).toBeTruthy();
  });

  it("disables the Append button when no cards have been parsed", () => {
    render(
      <MyDeckImport
        deckId="user-test"
        state={makeState({ pro: true })}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    // No textarea content + no .apkg → the import CTA isn't rendered yet.
    expect(screen.queryByText(/Append \d+ card/)).toBeNull();
    expect(screen.queryByText(/Replace deck with/)).toBeNull();
  });
});
