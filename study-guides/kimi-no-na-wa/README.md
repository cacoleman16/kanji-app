# 君の名は。 — chapter decks and study-guide instructions

This folder is the home for **study guides** for 新海誠『君の名は。』 (角川つばさ文庫 edition, illustrated by ちーこ).
The flashcard decks already live in the app. This README tells a future agent how to turn them into
chapter-by-chapter study guides, and how to make the decks more accurate as you read.

---

## What already exists

Each chapter has three decks, grouped in the app under one Vocabulary tile: **君の名は。 (Your Name) — Novel**.

- **Core Words (N4–N3)**: the everyday backbone words of the chapter, mostly N4–N3 plus a few common N2
  words and set phrases (跡形もなく, 思わず). Study this deck first.
- **Vocabulary**: the harder words: N2–N1, literary narration, and story terms (組紐, 口噛み酒 …).
- **Grammar & Expressions**: N3–N1 patterns, written-style devices, and Itomori dialect.

| Ch. | Title | Core Words | Vocabulary | Grammar & Expressions |
|---|---|---|---|---|
| 1 | 夢（ゆめ）: Dream | 51 | 75 | 21 |
| 2 | 端緒（たんしょ）: The First Clue | 58 | 69 | 19 |
| 3 | 日々（ひび）: Days | 55 | 67 | 16 |
| 4 | 探訪（たんぼう）: The Search | 56 | 64 | 19 |
| 5 | 記憶（きおく）: Memory | 55 | 56 | 14 |
| 6 | 再演（さいえん）: Re-staging | 57 | 59 | 14 |
| 7 | うつくしく、もがく: Beautifully, Struggling | 55 | 51 | 12 |
| 8 | 君の名は。（きみのなは）: Your Name Is… | 54 | 53 | 12 |
| | **Total** | **441** | **494** | **127** |

Files are in `agent-files/` (they need the `vocab_` prefix so `pipeline/bundle.py` picks them up):

```
agent-files/vocab_kiminonawa_chN_core.json     ← core words (N4–N3),   deck_id kiminonawa-chN-core
agent-files/vocab_kiminonawa_chN.json          ← vocabulary,           deck_id kiminonawa-chN-vocab
agent-files/vocab_kiminonawa_chN_grammar.json  ← grammar & expressions, deck_id kiminonawa-chN-grammar
```

**Chapter structure in this edition** (checked from photos): 第一章「夢」 is only the short prologue (pp.5–8).
第二章「端緒」 starts on p.9 with 瀧's dream, his first morning in 三葉's body, and then 三葉's day (breakfast, the
town broadcast, the comet on TV, the walk to school, her father's campaign speech, …). The other chapters' decks
were planned before this was known, so their scene-to-chapter mapping may be shifted; photos will settle it.

**How accurate are they?**
- **Chapter 1 (pp.5–8):** every card is checked against the printed pages. Each checked card has a `page` field
  and its `scene` starts with `p.N —`.
- **Chapter 2, pp.9 and 12–21:** checked the same way and listed first, in page order. pp.10–11 weren't
  photographed; their cards say so. Everything after the checked cards says "Not yet checked against the book".
- **Notebook words:** 匂い, 愛おしい, 光, 温度, 隙間, 結びつく, 乳房, 開く, 第一章, plus 跡形もなく, 一体感 and
  消え失せる from p.6, are tagged `"flagged_in_notebook": true`.
- **Chapters 3–8:** built from each chapter's scenes and the novel's style, not copied page by page. Expect some
  words to sit a chapter early or late, and some words the book uses to be missing. The "Refine a deck from page
  photos" prompt below fixes that.
- **No repeats:** each word or pattern lives in exactly one chapter, the earliest one that needs it. If a
  word you meet in Chapter 6 isn't in the Chapter 6 deck, check the earlier chapters.
- **Spoilers:** later chapters' `scene` and `context` fields describe what happens in those chapters. Study each
  deck when you reach that chapter.
- Example sentences are original, not quoted from the book.

### Card fields (all decks)

| Field | Meaning |
|---|---|
| `word`, `reading`, `meanings` | Front of the card, kana reading, English glosses. On grammar cards `word` is the pattern, e.g. `〜がたい`. |
| `pattern` | Grammar cards only: how the pattern is formed. |
| `jlpt` | Estimated level, `N5`–`N1`. `""` for dialect. Words beyond the JLPT lists are `N1`. |
| `priority` | `high` / `medium` / `low`: how much it matters for reading that chapter. |
| `difficulty_vs_n3` | `at_level` / `one_above` / `two_above`, measured against N3. |
| `kanji_difficulty` | `easy` / `medium` / `hard`. |
| `simpler_synonym` | An easier word an N3 learner already knows. |
| `category` | Theme slug: `literary`, `feelings`, `senses_body`, `onomatopoeia`, `nature_sky`, `shrine_tradition`, `town_life`, `tokyo_life`, `disaster`, `time_memory`, `dialect`, `casual_speech`, `story_terms`; for grammar: `grammar`, `literary_style`, `dialect`, `casual_speech`, `expression`. |
| `scene` | Where the word comes up in the chapter. |
| `context` | Nuance, look-alikes, kanji breakdown. Shown on the card back. |
| `example_sentence` / `example_reading` / `example_meaning` | An original example sentence, its reading in hiragana with spaces between words, and its English. |
| `flagged_in_notebook` | `true` if the reader wrote this word in their notebook. |
| `page` | The page the word appears on, for cards checked against the book (absent on unchecked cards and cover credits). |

The app shows `word`, `reading`, `meanings`, `category`, `context`, `jlpt` and the example sentence. The
other fields (`priority`, `scene`, `pattern`, `flagged_in_notebook`, …) are kept in the JSON for study
guides and future features.

---

## Prompt 1: make a study guide (paste this to an agent)

> You're working in the `kanji-app` repo. Read `study-guides/kimi-no-na-wa/README.md` first.
>
> Make a study guide for **君の名は。 Chapter N** (replace N). Inputs:
> - `agent-files/vocab_kiminonawa_chN_core.json`, `agent-files/vocab_kiminonawa_chN.json` and
>   `agent-files/vocab_kiminonawa_chN_grammar.json`. These are the source of truth for readings and meanings; if you find a mistake, fix it in the JSON too.
> - Any page photos or notebook photos I attach for this chapter.
>
> Write `study-guides/kimi-no-na-wa/chNN-<romanised title>.md` (e.g. `ch01-yume.md`) with these sections:
>
> 1. **At a glance**: 3–5 sentence summary of the chapter in simple Japanese (N3 level, furigana in
>    parentheses after hard kanji), then the same summary in English. Cover only this chapter and earlier;
>    no spoilers from later chapters.
> 2. **Who and where**: characters and places that appear, with readings (三葉 みつは, 糸守町 いともりまち …).
> 3. **Read these first**: the 10–15 `high`-priority words across the Core and Vocabulary decks, one line
>    each: word, reading, meaning.
> 4. **Vocabulary by scene**: every card in the Core and Vocabulary decks, grouped by scene in story order,
>    as a table (word | reading | meaning | note). Mark Core words with ○ and notebook words with ★.
> 5. **Grammar and style**: each grammar card explained in 3–6 lines: formation, nuance, how it differs from
>    the closest pattern an N3 learner knows, plus one new original example sentence (not the card's).
> 6. **Dialect corner** (if the chapter has dialect): Itomori form → standard Japanese → English.
> 7. **Kanji to notice**: 5–8 kanji from the chapter worth learning as characters, each with readings, and
>    whether the app already has it in an existing kanji deck (search `agent-files/*.json` and
>    `pipeline/out/*.json`).
> 8. **Check your understanding**: 6–8 comprehension questions in Japanese (N3 level) about the chapter's
>    events, then an answer key in a collapsible `<details>` block.
> 9. **Use it**: 3 short writing or speaking prompts that make the reader use this chapter's words and
>    grammar (e.g. 「懐かしい」と「ふと」を使って、子どものころの思い出を三文で書いてください。).
> 10. **Self-quiz**: 15 fill-in-the-blank sentences (original sentences, not from the book) using the
>     chapter's vocabulary, with the answer key in a `<details>` block.
>
> Rules:
> - No romaji anywhere except the file name.
> - Don't quote more than a short phrase (a few words) from the novel. Write all example and quiz
>   sentences yourself.
> - Keep readings consistent with the deck JSON.
> - Use the deck's `scene` field to place words, but if my page photos show a word is in a different
>   chapter, trust the photos.
> - When the guide is done, add a link to it in the "Study guides" list at the bottom of this README.

---

## Prompt 2: refine a deck from page photos (paste this to an agent)

Use this whenever you've photographed pages or notebook pages for a chapter.

> You're working in the `kanji-app` repo. Read `study-guides/kimi-no-na-wa/README.md` first.
>
> I've attached photos of pages from **君の名は。 Chapter N** and/or my notebook for it. Update the three
> Chapter N decks: `agent-files/vocab_kiminonawa_chN_core.json` (N4–N3 everyday words and common phrases),
> `agent-files/vocab_kiminonawa_chN.json` (harder words, N2–N1 and literary) and
> `agent-files/vocab_kiminonawa_chN_grammar.json`:
> 1. Read the pages. For every word in my notebook, make sure a card exists (add one if not) and set
>    `"flagged_in_notebook": true`. Use the reading printed in the book's furigana.
> 2. Add words and grammar from the pages that an N3 learner may not know solidly and that aren't in any
>    deck yet. N4–N3 words and common set phrases go in the Core deck; N2–N1, literary and story words go
>    in the Vocabulary deck. Follow the card format already in the files.
> 3. For every word you confirm on a page, set `"page": N` and start its `scene` with `p.N — `; keep each
>    chapter's checked cards first, in page order. If a card's `scene` doesn't match what the pages show, fix the `scene`. If a word clearly belongs to
>    another chapter, move it to that chapter's deck. Never keep the same `word` in two chapters of this
>    novel (earliest chapter wins).
> 4. Example sentences must be your own, not copied from the book. No romaji.
> 5. Update `card_count` and the deck `notes` (say which pages are now checked against the book).
> 6. Run `python3 pipeline/bundle.py`, check the decks load (each `card_count` should print), then commit
>    and open a PR.

---

## Rebuilding the app after editing a deck

```bash
python3 pipeline/bundle.py   # re-embeds every deck into kanji-app.html
# merging to main deploys (CI runs pipeline/build.py, then Vercel)
```

---

## Study guides

<!-- Add links here as guides are written, e.g. - [Chapter 1 夢](ch01-yume.md) -->
_None yet._
