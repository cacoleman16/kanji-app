# Kanji Study App — Project Plan

_Last updated: April 17, 2026_

## What we're building

A minimalist flashcard web app (PWA) for studying Japanese kanji, organized by the decks that matter to you: JLPT N5–N1, Genki 1, Genki 2, Quartet 1, Quartet 2, and An Integrated Approach to Intermediate Japanese. Each card shows a single kanji on the front; the back shows meaning, example words (kanji + kana, no romaji), on'yomi/kun'yomi, and a Heisig-style memory keyword. The review engine uses SM-2 spaced repetition (the same algorithm Anki uses). Progress is stored locally in your browser so there's no account and no backend to worry about. Once the web POC feels good on your laptop and iPhone (via "Add to Home Screen"), we wrap it with Capacitor to ship a real App Store app.

## Your locked-in decisions

| Decision | Choice |
|---|---|
| Content source | Curated public data (KANJIDIC2, JMdict, Tatoeba) |
| Review algorithm | SM-2 spaced repetition |
| Tech stack | React PWA → Capacitor for iOS later |
| First deck to build | Genki 2 |
| Card back contents | Meanings + example words (kanji/kana, no romaji) + on/kun readings + Heisig keyword + etymology hint |
| Mnemonic style | Heisig-style keyword + short AI-generated etymology hook (like the "wood + school" style on your example card) |
| Progress storage | Local only (IndexedDB) |
| Extras in v1 | Stats page + daily goal + streak counter |
| Daily goal default | 30 cards/day |
| Font | Start with the most commonly-used web font for Japanese (Noto Sans JP), font-switcher added later |
| Theme default | Dark mode |
| First load | ~5MB content bundle, fully offline after |
| Decks in scope | JLPT N5–N1, Genki 1, Genki 2, Quartet 1, Quartet 2. Integrated Approach to Intermediate Japanese is **deferred** (no open chapter list; we'll revisit when you can share your edition's kanji index). |

---

## Stage 1 — Data pipeline (the unglamorous but critical part)

All content is assembled offline into a single static JSON bundle that ships with the app. No runtime API calls, no licensing issues.

### Data sources I'll pull from

- **KANJIDIC2** (EDRDG, Creative Commons) — 13,000+ kanji with English meanings, on'yomi, kun'yomi, JLPT level, school grade, stroke count, and frequency rank. This is the backbone.
- **JMdict** (EDRDG, Creative Commons) — Japanese-English dictionary with ~200k entries. Used to select 2–4 high-frequency example words for each kanji (filtered by common-usage tags).
- **KRADFILE / RADKFILE** (EDRDG) — Kanji radical decomposition. Useful later for a "related kanji" feature and for richer mnemonics.
- **Tatoeba** (CC-BY) — Optional, for example sentences in a future version.
- **Deck-to-kanji mapping files** — Public lists mapping each textbook chapter / JLPT level to its kanji set:
  - JLPT N5–N1: widely published lists
  - Genki 1 & 2: chapter-by-chapter kanji lists (available from multiple open GitHub repos)
  - Quartet 1 & 2: kanji appendix lists (less standardized, will verify)
  - Integrated Approach to Intermediate Japanese: chapter lists (will verify availability)

### The build script does this

1. Parse KANJIDIC2 → normalize to JSON keyed by kanji character
2. For each kanji, query JMdict for vocabulary entries that (a) contain this kanji and (b) are tagged "common." Pick 2–4 based on frequency.
3. Generate a Heisig-style keyword for each kanji. Approach: use KANJIDIC's primary/concise meaning as the base keyword; flag cases where a better hook is obvious. All keywords are stored as a user-editable field so you can override any you dislike.
4. Map each kanji to the decks it appears in (a kanji can belong to many decks: e.g., 校 is in JLPT N4, Genki 1 Ch3, and Grade 1 school).
5. Emit `decks.json` and `kanji.json` — a few MB total, cached offline after first load.

### Legal note

KANJIDIC2 and JMdict are licensed under Creative Commons — free to redistribute with attribution. Genki/Quartet textbook content itself is copyrighted, so we use only the **list of which kanji appear in each chapter** (factual information, not copyrightable) and pair them with free dictionary data. No textbook content is copied.

---

## Stage 2 — Web POC (React PWA)

### Tech stack

- **React + Vite** — fast dev loop, small bundles
- **TypeScript** — catches bugs early
- **Tailwind CSS** — fast to write clean minimalist UI
- **Dexie.js** — friendly IndexedDB wrapper for local progress storage
- **vite-plugin-pwa** — adds service worker + manifest so the app installs to your iPhone home screen and works offline
- **Framer Motion** (optional) — smooth card-flip animation

### Screens

**1. Home / deck picker**
Grid of decks (JLPT levels, Genki, Quartet, Integrated Approach). Each card shows: deck name, # cards total, # due today, % learned. Streak counter and daily-goal progress bar pinned at the top.

**2. Study session**
Clean, full-screen card. Front: just the kanji, huge. Tap to flip. Back: meaning at top, example words (kanji+kana) mid, readings below, keyword/mnemonic at bottom. Four rating buttons at the bottom: **Again / Hard / Good / Easy** (standard SM-2 rating). Progress bar shows remaining cards this session.

**3. Stats**
- Cards reviewed today / this week
- Accuracy %
- Retention rate per deck
- Upcoming review load (next 7 days)
- Streak history

**4. Settings**
- Daily goal (cards/day, default: 20)
- New-cards-per-day cap (default: 10)
- Theme (light/dark)
- Export progress (JSON backup)
- Import progress (restore from backup)

### SM-2 algorithm — how cards get scheduled

Each card tracks: `ease_factor` (starts 2.5), `interval` (days), `repetitions` (streak of correct), and `due_date`. On review:

- **Again** → interval resets to 1 day, ease decreases by 0.2 (min 1.3), repetitions resets
- **Hard** → interval × 1.2, ease decreases by 0.15
- **Good** → interval × ease_factor, no ease change
- **Easy** → interval × ease_factor × 1.3, ease increases by 0.15

New cards have no interval — they enter the queue when you "learn" them. The session order each day is: (1) cards due today, (2) new cards up to your daily cap, (3) optional extra review if you want to push ahead.

### Card back layout (matches your example image)

```
┌──────────────────────────────────────┐
│  school                              │  ← meaning (top)
│                                      │
│  学校 がっこう   school              │  ← example words
│  校長 こうちょう principal           │    (kanji + kana, no romaji)
│  母校 ぼこう   alma mater            │
│                                      │
│  On: コウ                            │  ← readings
│  Kun: (none)                         │
│                                      │
│  Keyword: school                     │  ← mnemonic
│  (tap to edit)                       │
└──────────────────────────────────────┘
```

---

## Stage 3 — Test on your devices

- Deploy the PWA to a free host (Vercel or Netlify)
- On your iPhone: Safari → Share → "Add to Home Screen." The app installs like a native app, works offline after first load, runs full-screen.
- You study for a week or two. We iterate on anything that feels off.

## Stage 4 — Wrap for App Store (when the POC feels right)

- Add Capacitor to the React project (~30 minutes of config)
- Build native shell targeting iOS
- Requires Apple Developer account ($99/year) if you want it on the App Store. For personal use you can also sideload for free via Xcode.
- Native features we could add at this point: haptics on card flip, native audio, widgets showing daily streak, Apple Watch complication.

---

## Things I still need from you

Please look these over and let me know:

1. **Confirmation on deck list.** Did I capture every deck you want? You mentioned Genki 1, Genki 2, Quartet, An Integrated Approach to Intermediate Japanese, and JLPT N5–N1. Want me to add anything else (KKLC, Jōyō grade levels, WaniKani levels)?

2. **Integrated Approach to Intermediate Japanese** — do you own a copy, and could you share the chapter-by-chapter kanji list? It's the least standardized of the four textbooks and a list from your edition would be more reliable than what I can piece together.

3. **Default daily goal.** I suggested 20 cards/day. Does that match the pace you want? Most learners do 10–25.

4. **Japanese font preference.** Do you want the kanji rendered in a handwriting/brushstroke style, a clean sans-serif (like Noto Sans JP), or a serif Mincho style? Affects the "feel" a lot.

5. **Light vs. dark default.** Minor but shapes the visual tone.

6. **Your example card image.** The card you shared is from Tuttle's _Japanese Kanji Flash Cards Volume 1_. The etymology hook ("wood school structure where information is exchanged") is nice — do you want that etymology-style hint added **in addition to** the Heisig keyword? Would require more effort to source (no free database I know of), but I could AI-generate them once per kanji and let you edit.

7. **Offline-first strictness.** Are you okay with the first load needing internet (to download the ~5MB deck bundle), then fully offline after that? That's the standard PWA model.

---

## Risks / things that could slow us down

- **Quartet and Integrated Approach deck lists** may not be cleanly available as open data. I'll try several sources; if they're thin I'll flag it and either transcribe from you or defer those decks to v2.
- **Mnemonic quality.** Single-word keywords from KANJIDIC are functional but not magical. If you want the _really_ evocative Heisig stories, we'd need to either license Heisig data or AI-generate them (slower first build, but better memory hooks). You decided "Heisig-style keywords" in the questionnaire which I read as the simpler option — confirm if I should go bigger here.
- **iOS PWA quirks.** Safari PWAs have some limits (no background sync, limited storage before asking permission). Not blockers for a study app, but good to know.

---

## Suggested next step

Review this plan, answer the 7 questions above, and then I'll:

1. Start Stage 1 by building the data pipeline and shipping you a `genki2.json` preview file so you can sanity-check the content before I invest in the UI.
2. Once you approve the data, I'll scaffold the React PWA and we'll iterate on the card design until it matches your taste.
