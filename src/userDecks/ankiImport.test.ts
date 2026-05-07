import { describe, expect, it } from "vitest";

import { parseAnkiPackage, stripAnkiFormatting } from "./ankiImport";

describe("stripAnkiFormatting", () => {
  it("strips simple HTML tags", () => {
    expect(stripAnkiFormatting("<b>hello</b> <i>world</i>")).toBe("hello world");
  });

  it("converts <br> to space", () => {
    expect(stripAnkiFormatting("line1<br>line2<br/>line3<br />line4")).toBe(
      "line1 line2 line3 line4",
    );
  });

  it("decodes common HTML entities", () => {
    expect(stripAnkiFormatting("a&nbsp;b &amp; c &lt;d&gt;")).toBe("a b & c <d>");
  });

  it("collapses Anki cloze markers without hint", () => {
    expect(stripAnkiFormatting("The {{c1::answer}} is here")).toBe("The answer is here");
  });

  it("collapses Anki cloze markers with hint", () => {
    expect(stripAnkiFormatting("The {{c1::answer::a clue}} is here")).toBe("The answer is here");
  });

  it("collapses runs of whitespace and trims", () => {
    expect(stripAnkiFormatting("   foo \n\n  bar  ")).toBe("foo bar");
  });

  it("handles a realistic Anki vocab card field", () => {
    const input = '<div style="font-size: 24px;">学校</div><br>がっこう<br><i>school</i>';
    expect(stripAnkiFormatting(input)).toBe("学校 がっこう school");
  });
});

describe("parseAnkiPackage failure shape", () => {
  it("returns an unzip failure for non-zip bytes", async () => {
    // Random bytes that aren't a zip — fflate should reject.
    const buf = new TextEncoder().encode("not a zip file at all").buffer as ArrayBuffer;
    const result = await parseAnkiPackage(buf);
    expect(result.cards).toEqual([]);
    expect(result.failure).not.toBeNull();
    expect(result.failure?.code).toBe("unzip");
    expect(result.failure?.title.toLowerCase()).toMatch(/valid \.apkg|isn't.*valid/);
    expect(result.failure?.hint).toMatch(/zip|re-download/i);
  });

  it("returns no errors[] entries when failure is set (errors live on failure)", async () => {
    const buf = new TextEncoder().encode("xxx").buffer as ArrayBuffer;
    const result = await parseAnkiPackage(buf);
    // The new shape funnels file-level problems into `failure` so the row-level
    // errors[] array stays clean for actual per-row issues.
    expect(result.errors).toEqual([]);
  });
});
