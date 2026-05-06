import { describe, expect, it } from "vitest";

import { detectFormat, parseDeckImport } from "./importParser";

describe("detectFormat", () => {
  it("detects JSON for objects and arrays", () => {
    expect(detectFormat("[]")).toBe("json");
    expect(detectFormat('{"cards":[]}')).toBe("json");
  });

  it("detects TSV when the first line contains tabs", () => {
    expect(detectFormat("kanji\tmeaning\n一\tone")).toBe("tsv");
  });

  it("falls back to CSV otherwise", () => {
    expect(detectFormat("kanji,meaning\n一,one")).toBe("csv");
    expect(detectFormat("just one column\nfoo\nbar")).toBe("csv");
  });
});

describe("parseDeckImport — CSV", () => {
  it("parses header + rows with mapped columns", () => {
    const csv = "Kanji,Meaning,Reading\n一,one,いち\n二,two,に";
    const result = parseDeckImport(csv);
    expect(result.format).toBe("csv");
    expect(result.cards).toHaveLength(2);
    expect(result.cards[0]).toEqual({ kanji: "一", meanings: ["one"], reading: "いち" });
    expect(result.cards[1]).toEqual({ kanji: "二", meanings: ["two"], reading: "に" });
  });

  it("uses positional defaults when no header row is present", () => {
    const csv = "一,one,いち\n二,two,に";
    const result = parseDeckImport(csv);
    expect(result.cards[0].kanji).toBe("一");
    expect(result.cards[0].meanings).toEqual(["one"]);
    expect(result.cards[0].reading).toBe("いち");
  });

  it("supports quoted fields containing commas", () => {
    const csv = 'kanji,meaning\n母,"mother, mom"';
    const result = parseDeckImport(csv);
    expect(result.cards[0].meanings).toEqual(["mother", "mom"]);
  });

  it("splits multi-meaning fields on common separators", () => {
    const csv = "kanji,meaning\n母,mother;mom|mama";
    const result = parseDeckImport(csv);
    expect(result.cards[0].meanings).toEqual(["mother", "mom", "mama"]);
  });

  it("normalizes JLPT level uppercase", () => {
    const csv = "kanji,meaning,jlpt\n一,one,n5";
    const result = parseDeckImport(csv);
    expect(result.cards[0].jlpt).toBe("N5");
  });

  it("collects errors for rows missing the front field", () => {
    const csv = "kanji,meaning\n,empty\n二,two";
    const result = parseDeckImport(csv);
    expect(result.cards).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/no front/);
  });
});

describe("parseDeckImport — TSV (Anki plain-text export shape)", () => {
  it("parses Anki-style two-column TSV", () => {
    const tsv = "Front\tBack\n一\tone\n二\ttwo";
    const result = parseDeckImport(tsv);
    expect(result.format).toBe("tsv");
    expect(result.cards).toHaveLength(2);
    expect(result.cards[0]).toEqual({ kanji: "一", meanings: ["one"] });
  });

  it("parses Anki-style export with header inference", () => {
    const tsv = "Expression\tReading\tMeaning\n母\tはは\tmother";
    const result = parseDeckImport(tsv);
    expect(result.cards[0]).toEqual({ kanji: "母", reading: "はは", meanings: ["mother"] });
  });
});

describe("parseDeckImport — JSON", () => {
  it("parses an array of card objects", () => {
    const json = JSON.stringify([
      { kanji: "一", meanings: ["one"], reading: "いち" },
      { word: "二", meaning: "two" },
    ]);
    const result = parseDeckImport(json);
    expect(result.format).toBe("json");
    expect(result.cards).toHaveLength(2);
    expect(result.cards[1]).toEqual({ kanji: "二", meanings: ["two"] });
  });

  it("parses { cards: [...] } shape", () => {
    const json = JSON.stringify({ cards: [{ kanji: "三", meanings: ["three"] }] });
    const result = parseDeckImport(json);
    expect(result.cards).toHaveLength(1);
  });

  it("accepts a single card object", () => {
    const json = JSON.stringify({ kanji: "四", meanings: ["four"] });
    const result = parseDeckImport(json);
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].kanji).toBe("四");
  });

  it("returns a parse error on malformed JSON instead of throwing", () => {
    const result = parseDeckImport("[{not json", "json");
    expect(result.cards).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/JSON parse error/);
  });

  it("strips invalid JLPT values", () => {
    const json = JSON.stringify([{ kanji: "一", meanings: ["one"], jlpt: "Z9" }]);
    const result = parseDeckImport(json);
    expect(result.cards[0].jlpt).toBeUndefined();
  });

  it("preserves on_yomi/kun_yomi arrays from JSON", () => {
    const json = JSON.stringify([
      { kanji: "学", meanings: ["study"], on_yomi: ["ガク"], kun_yomi: ["まな(ぶ)"] },
    ]);
    const result = parseDeckImport(json);
    expect(result.cards[0].on_yomi).toEqual(["ガク"]);
    expect(result.cards[0].kun_yomi).toEqual(["まな(ぶ)"]);
  });
});
