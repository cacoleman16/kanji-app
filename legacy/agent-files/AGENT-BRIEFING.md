# Agent Briefing — Kanji Flashcard App
_Last updated: April 17, 2026_

---

## Who you are and what you're doing

You are a coding agent helping Chae build a minimalist Japanese kanji flashcard app. The project is a web PWA (eventually wrapped for iOS via Capacitor) with SM-2 spaced repetition, organized by textbook deck. A working proof-of-concept HTML app already exists. Your job is to help extend the data, improve the app, and eventually ship it.

This document is your complete project briefing. Read it in full before writing a single line of code.

---

## The app in one paragraph

A dark-mode, mobile-first PWA where the user studies kanji flashcards one at a time. Front of card: the kanji character, huge. Back: meanings, on/kun readings, 3 example words (kanji + kana, no romaji), a Heisig-style keyword, and a short etymology mnemonic. Cards are organized into decks (by textbook or JLPT level). The review engine uses SM-2 spaced repetition (same as Anki). Progress is stored locally in the browser — no account, no backend. Once the web POC feels good, Capacitor wraps it for the App Store.

---

## File inventory

### App files (the working POC)

**`kanji-app.html`**
The entire app in a single HTML file. Pure HTML + CSS + vanilla JS (no build step). Opens directly in any browser. This is the canonical POC. Key implementation details:
- Dark theme using CSS custom properties (`--bg: #09090b`, `--accent: #fbbf24` amber, `--good: #34d399` green, `--again: #f87171` red)
- Fonts: Inter (UI text) + Noto Sans JP (Japanese characters), loaded from Google Fonts CDN
- Layout: `max-width: 520px`, centered, `env(safe-area-inset-*)` padding for iPhone notch
- Screens rendered in JS by swapping `data-screen` — no router, no framework
- SM-2 implemented in JS: tracks `ease_factor`, `interval`, `repetitions`, `due_date` per card
- Progress stored in `localStorage` (key: `kanji_app_v1`)
- Keyboard shortcuts: Space/Enter = flip, 1/2/3/4 = Again/Hard/Good/Easy
- Deck data is currently **hard-coded inline** as a JS object. The real version will load from JSON files.

**`kanji-preview.html`**
An earlier, simpler card-only preview (no navigation, no SM-2). Superseded by `kanji-app.html`. Kept for reference. Shows a single card with the Genki 2 preview data. Same visual design system as the main app.

**`manifest.json`**
PWA manifest for "Add to Home Screen." Sets `display: standalone`, `background_color: #09090b`, `theme_color: #09090b`. Icons are inline SVGs (the character 漢 on a dark rounded-rect). `start_url: ./kanji-app.html`.

### Data files

**`genki2-preview.json`**
5-card hand-curated sample deck used to establish and validate the card schema. This is the reference format all other JSON files must match. Cards: 昔, 神, 働, 別, 度.

Schema:
```json
{
  "deck_id": "string",
  "deck_name": "string",
  "version": "string",
  "notes": "string",
  "cards": [
    {
      "kanji": "字",
      "meanings": ["string"],
      "on_yomi": ["カタカナ"],
      "kun_yomi": ["ひらがな(おくりがな)"],
      "examples": [
        { "kanji": "漢字", "kana": "かんじ", "meaning": "english" },
        { "kanji": "漢字", "kana": "かんじ", "meaning": "english" },
        { "kanji": "漢字", "kana": "かんじ", "meaning": "english" }
      ],
      "keyword": "single word",
      "etymology": "Radical (component) + component — short mnemonic hook.",
      "stroke_count": 9,
      "jlpt": "N3",
      "grade": 3,
      "decks": ["Deck Name", "JLPT N3"]
    }
  ]
}
```

**`integrated_ch1_kanji.json`** — 41 cards, An Integrated Approach Ch.1 (book p.22)
**`integrated_ch2_kanji.json`** — 33 cards, An Integrated Approach Ch.2 (book p.42)
**`integrated_ch3_kanji.json`** — 23 cards, An Integrated Approach Ch.3 (book p.62)
**`integrated_ch4_kanji.json`** — 36 cards, An Integrated Approach Ch.4 (book p.80)
**`integrated_ch5_kanji.json`** — 24 cards, An Integrated Approach Ch.5 (book p.102)
**`integrated_ch7_kanji.json`** — 28 cards, An Integrated Approach Ch.7 (book p.141)

These 6 files (185 total cards) were generated from the *An Integrated Approach to Intermediate Japanese (Revised Edition)* PDF. Each card follows the same schema as `genki2-preview.json`. The `decks` array on each card reads `["An Integrated Approach Ch.X", "JLPT NX"]`.

How they were made: PyMuPDF rendered each kanji-list page at 4× resolution; Claude read the 書くのを覚える漢字 section visually; card data was filled from language knowledge. See `PLAN.md` for the full methodology.

### Documentation files

**`HOW-TO-USE.md`**
End-user instructions. Covers: how to open on laptop, how to install on iPhone via local `python3 -m http.server`, keyboard shortcuts, what's working, what's intentionally deferred. Key deferred items: real deck data (only 5 preview cards loaded), service worker, cloud sync, audio, search, stroke order animation.

**`kanji-app-plan.md`**
The full project plan. Contains all locked-in decisions, the 4-stage roadmap, and open questions. Critical reading — summarized below.

**`PLAN.md`** _(in outputs folder)_
Documents how the *An Integrated Approach* JSON files were created. Includes the PDF page-offset formula, extraction method, card schema, output file inventory, and known gaps. Read this before touching the JSON files.

---

## Locked-in decisions (do not relitigate these)

| Decision | Choice |
|----------|--------|
| Review algorithm | SM-2 spaced repetition |
| Tech stack | React + Vite + TypeScript + Tailwind + Dexie.js (PWA) → Capacitor for iOS |
| Current POC | Vanilla HTML/JS single file — no framework yet |
| First full deck | Genki 2 |
| Card back contents | Meanings + examples (kanji/kana, no romaji) + on/kun readings + keyword + etymology |
| Mnemonic style | Heisig-style single keyword + short AI etymology hint |
| Progress storage | Local only, IndexedDB (via Dexie.js in final version, localStorage in POC) |
| Theme | Dark mode default |
| Japanese font | Noto Sans JP |
| Extras in v1 | Stats page, daily goal, streak counter |
| Daily goal default | 30 cards/day |
| Data source | KANJIDIC2 + JMdict (CC-licensed) |
| Decks in scope | JLPT N5–N1, Genki 1, Genki 2, Quartet 1, Quartet 2, An Integrated Approach |
| Audio | Deferred |
| Stroke order animation | Not in v1 scope |
| Cloud sync | Deferred |

---

## Visual design system

Memorize these tokens. Every UI element you write must use them.

```css
--bg: #09090b;           /* page background */
--surface: #18181b;      /* card / panel background */
--surface-2: #27272a;    /* secondary surface */
--surface-3: #3f3f46;    /* tertiary surface */
--border: #3f3f46;       /* border color */
--text: #fafafa;          /* primary text */
--text-muted: #a1a1aa;   /* secondary text */
--text-dim: #71717a;     /* tertiary / labels */
--accent: #fbbf24;       /* amber — brand accent, streak, highlights */
--accent-soft: rgba(251,191,36,0.12);
--good: #34d399;         /* green — Good/Easy ratings */
--good-soft: rgba(52,211,153,0.12);
--again: #f87171;        /* red — Again rating */
--again-soft: rgba(248,113,113,0.12);
--hard: #fbbf24;         /* amber — Hard rating */
--easy: #60a5fa;         /* blue — Easy rating */
--font-jp: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
--font-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

Layout rules:
- `max-width: 520px`, centered
- `env(safe-area-inset-*)` for iPhone notch/home-bar padding
- `overscroll-behavior: none` on body
- Border-radius convention: 14px for deck cards/panels, 12px for buttons, 8px for small elements
- Typography: 32px / 700 for big titles, 14px / 500 for topbar labels, 11px / uppercase / letter-spacing 0.1em for section labels

SM-2 rating colors:
- Again → `--again` (#f87171)
- Hard → `--hard` (#fbbf24)
- Good → `--good` (#34d399)
- Easy → `--easy` (#60a5fa)

---

## SM-2 algorithm (exact implementation)

Each card stores: `ease_factor` (float, starts 2.5), `interval` (int days), `repetitions` (int), `due_date` (ISO string).

On rating:

```
Again  → interval = 1,   ease_factor = max(1.3, ef - 0.20), repetitions = 0
Hard   → interval = max(1, floor(interval × 1.2)), ease_factor = max(1.3, ef - 0.15)
Good   → interval = floor(interval × ease_factor) [min 1 day], no ef change
Easy   → interval = floor(interval × ease_factor × 1.3) [min 1 day], ease_factor = ef + 0.15
```

New cards have `interval = 0`, `repetitions = 0`. First "Good" on a new card → interval = 1 day. First "Easy" → 4 days.

Session order each day:
1. Cards where `due_date <= today`
2. New cards up to the daily new-cards cap (default 10)
3. "Again" cards from this session are re-queued at the end of the current session

---

## Screen inventory (current POC)

1. **Home** — Greeting, streak counter (🔥 N days), daily goal progress bar, deck list. Each deck row shows: deck name, total cards, due today count, % learned indicator.
2. **Study session** — Full-screen card. Front: kanji large-centered. Tap/Space/Enter to flip. Back: meanings (top), examples (mid), readings (lower), keyword + etymology (bottom). Rating buttons: Again / Hard / Good / Easy with next-interval preview labels (e.g. "1d", "4d"). Progress bar top.
3. **Session complete** — Summary: cards reviewed, accuracy %, new cards learned, streak update.
4. **Stats** — Last 7 days bar chart, total reviews, accuracy %, longest streak, upcoming review load (next 7 days).
5. **Settings** — Daily goal slider, new-cards/day cap, theme toggle, export JSON, import JSON, reset all data.

---

## What's built vs. what's not

### Working in the POC
- All 5 screens above
- SM-2 scheduling
- Again/Hard/Good/Easy with interval previews
- Intra-session Again re-queue
- Local storage persistence
- iOS "Add to Home Screen" metadata (manifest + apple-mobile-web-app tags)
- Keyboard shortcuts

### Not built yet (in priority order)
1. **Real deck data** — only `genki2-preview.json` (5 cards) loaded. The 185 *An Integrated Approach* cards exist as JSON but are not wired into the app yet.
2. **Data pipeline** — Stage 1 in the plan: parse KANJIDIC2 + JMdict to generate full Genki 1, Genki 2, JLPT N5–N1, Quartet decks.
3. **React/Vite migration** — current POC is vanilla JS; the production build should be React + TypeScript + Tailwind + Dexie.js + vite-plugin-pwa.
4. **Service worker** — for bulletproof offline. Requires Vite build pipeline.
5. **Deployment** — Vercel or Netlify (free tier). Domain not yet set.
6. **Capacitor iOS wrap** — after web POC is approved.
7. **Audio** — deferred.
8. **Stroke order animation** — not in v1.
9. **Search / kanji lookup** — deferred.
10. **Cloud sync** — deferred.

---

## Data pipeline (Stage 1 — not yet built)

The goal is a single static JSON bundle that ships with the app. Steps:

1. Download **KANJIDIC2** (XML, EDRDG Creative Commons) — 13,000+ kanji with meanings, readings, JLPT, grade, stroke count, frequency.
2. Download **JMdict** (XML, EDRDG Creative Commons) — 200k+ entries. For each kanji, pick 2–4 common vocabulary entries containing it.
3. Download deck-to-kanji mapping lists (JLPT N5–N1 widely available; Genki 1 & 2 from public GitHub repos; Quartet needs verification; *An Integrated Approach* — **already done, 185 cards in JSON**).
4. Generate Heisig-style keyword per kanji (KANJIDIC primary meaning as base; AI-generate etymology hook).
5. Emit `kanji.json` (all characters, normalized) and `decks.json` (deck metadata + per-deck kanji lists).

Legal: KANJIDIC2 and JMdict are CC-licensed. Textbook content is not copied — only the list of which kanji appear in each chapter (factual, not copyrightable).

---

## The *An Integrated Approach* data — what was done and how

The textbook *An Integrated Approach to Intermediate Japanese (Revised Edition)* was provided as a PDF (image-based fliphtml5.com snapshot). PyMuPDF was used to render each kanji-list page at 4× scale. Claude read the 書くのを覚える漢字 vocabulary list on each page and identified the primary new kanji per vocabulary item. Card data was filled from language knowledge.

Output files match `genki2-preview.json` schema exactly. The `decks` array tags each card as `"An Integrated Approach Ch.X"` plus its JLPT level. These files are ready to load into the app.

PDF page formula: `PDF page number = book page number` (no offset for this PDF).

Kanji-list pages:
- Ch.1 → PDF p.22 → 41 cards
- Ch.2 → PDF p.42 → 33 cards
- Ch.3 → PDF p.62 → 23 cards
- Ch.4 → PDF p.80 → 36 cards
- Ch.5 → PDF p.102 → 24 cards
- Ch.7 → PDF p.141 → 28 cards

Ch.6 and Ch.8+ were not in the pages provided. To extend: render those pages with PyMuPDF at 4×, read visually, add cards to `build_kanji_json.py`.

---

## How to load the *An Integrated Approach* JSON files into the app

The current POC hard-codes the preview deck inline. To add the new decks:

1. In `kanji-app.html`, find the `DECKS` object (or equivalent deck-data variable).
2. Add a fetch/load path for each `integrated_chX_kanji.json` file.
3. Map the loaded cards into the app's internal card format (schema is identical to `genki2-preview.json`).
4. Add each chapter as a selectable deck on the Home screen.

For the Vite/React migration, decks should be loaded via `import` or `fetch` at startup and merged into IndexedDB via Dexie.

---

## Open questions (answers needed before certain work can proceed)

1. Do you want Ch.6 and Ch.8+ from *An Integrated Approach*? If yes, provide those PDF pages or the kanji list.
2. Confirm daily goal default: currently 30 in the plan, 20 in the settings screen. Which is right?
3. Font feel: clean sans (Noto Sans JP — current), handwriting style, or serif Mincho?
4. Do you want the etymology hint *in addition to* the Heisig keyword on the card back, or choose one? (Currently both are included.)
5. Ready to migrate from vanilla HTML to React/Vite/TypeScript, or keep iterating on the HTML POC first?
6. Deployment target confirmed as Vercel or Netlify?
7. Do you want Genki 1 cards before the data pipeline runs, or is *An Integrated Approach* the priority deck?

---

## Next concrete steps (recommended order)

1. **Wire the 185 *An Integrated Approach* cards into the existing HTML app** — load the 6 JSON files and add the chapter decks to the Home screen. No framework migration needed yet; just fetch + parse.
2. **Build the Genki 2 full deck** via the data pipeline (KANJIDIC2 + JMdict). This is the first deck Chae wants fully populated.
3. **Deploy to Vercel** so the app is accessible from iPhone without running a local server.
4. **Migrate to React/Vite** — scaffold the production project, port the SM-2 logic and all screens, replace localStorage with Dexie.js.
5. **Add service worker** via vite-plugin-pwa for true offline support.
6. **Capacitor iOS wrap** after the PWA feels right on Safari.

---

## Constraints and things not to break

- No romaji anywhere on card backs — Chae's explicit requirement.
- No backend, no accounts — local-only until Chae explicitly decides otherwise.
- Do not change the card schema without updating all 6 *An Integrated Approach* JSON files and `genki2-preview.json`.
- Do not use localStorage for the Dexie migration — IndexedDB is the target.
- Keep the single-file HTML POC working as a fallback throughout development.
- All Japanese text must render in `--font-jp` (Noto Sans JP stack), not the UI font.
- SM-2 ease factor floor is 1.3 — never let it go below this.
