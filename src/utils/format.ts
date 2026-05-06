import type { CSSProperties } from "react";

/**
 * Returns an inline `fontSize` style for a vocab word, scaled by character length.
 * Ported from legacy/kanji-app.html line 3515.
 */
export function vocabWordSize(word: string, base: "card" | "peek" = "card"): CSSProperties {
  const len = (word || "").length;
  if (base === "peek") {
    if (len <= 3) return {};
    if (len <= 5) return { fontSize: "64px" };
    if (len <= 7) return { fontSize: "44px" };
    return { fontSize: "34px" };
  }
  // study card front
  if (len <= 3) return {};
  if (len <= 5) return { fontSize: "clamp(34px, 10vw, 54px)" };
  if (len <= 7) return { fontSize: "clamp(26px, 7.5vw, 40px)" };
  return { fontSize: "clamp(20px, 6vw, 32px)" };
}
