# Kanjido

**Kanjido** — minimalist Japanese kanji study app with SM-2 spaced repetition.
Built as a React PWA; the long-term plan is to wrap with Capacitor and ship to
the App Store.

Name etymology: **kanji** (漢字) + **-do** (道, "the way of") — judo, kendo,
shodo, kanjido.

> **Migration in progress.** M1 (Vite + React + TypeScript scaffold) and M2
> (strip personal/textbook content + custom-deck creation) are landed. M3
> (freemium subscriptions) and M4 (Capacitor + App Store submission) are next.
> The original 1.2 MB `kanji-app.html` is preserved at
> [`legacy/kanji-app.html`](./legacy/kanji-app.html) for reference. The full
> roadmap lives at `~/.claude/plans/audit-the-kanji-app-resilient-ullman.md`.

---

## Quickstart

```bash
npm install        # install dependencies
npm run dev        # local dev server with hot reload
npm test           # vitest (SM-2 algorithm + storage migrations + queue)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # vite production build → dist/
```

## Project layout

| Path | Role |
|---|---|
| [`src/`](./src) | Application source. Vite + React + TypeScript. |
| `src/srs/sm2.ts` | Pure SM-2 algorithm. Tested. |
| `src/srs/queue.ts` | Session queue + cross-deck mixed review. Tested. |
| `src/storage/` | Versioned localStorage layer with migrations. Tested. Provider-based so iCloud / file-based backup can swap in later (Phase 4 of the plan). |
| `src/screens/` | One file per screen: `Home`, `GroupDetail`, `DeckDetail`, `Study`, `MixedReview`, `Stats`, `Settings`. |
| `src/data/decks.ts` | Glob-imports deck JSONs from `agent-files/` at build time. |
| `src/data/groups.ts` | Deck groupings (e.g. Integrated Approach chapter list). |
| `src/types/` | Domain types (`Card`, `Deck`, `AppState`, `Rating`, …). |
| `src/styles/app.css` | All UI styles (CSS custom properties, dark/light themes). |
| `agent-files/*.json` | Deck data. **For now** still includes the original (textbook + personal) decks. M2 strips these and replaces with public-domain default content (JLPT N5–N1, Top Frequency, Jōyō by grade). |
| `legacy/` | Pre-migration code preserved for reference: original `kanji-app.html`, the Python build pipeline, and the inlined React UMD copies. Not part of the build. |
| [`vite.config.ts`](./vite.config.ts) | Vite config with `vite-plugin-pwa` (manifest, service worker). |
| [`vercel.json`](./vercel.json) | Vercel: framework Vite, `outputDirectory: dist`, cache headers for `sw.js` / `index.html` / `assets/`. |
| [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) | GitHub Actions: install → lint → typecheck → test → build → `vercel --prod`. |

## Architecture (M1 state)

```
index.html → src/main.tsx → src/App.tsx (route switch)
                                ↓
              ┌──────┬──────┬───┴────┬────────┬────────┬──────────┐
              Home  Group  Deck    Study   Stats   Settings  MixedReview
                            │
                            └─ uses src/srs/queue.ts → src/srs/sm2.ts
                                            ↑
                              src/storage/state.ts (versioned, provider-based)
                                            ↑
                                        localStorage
```

Local-only persistence. No accounts, no backend. Apple-style "Add to Home Screen"
on iPhone works via the PWA manifest + service worker.

## Custom decks

Tap **My Decks** (✎ icon in the home screen top bar) to create your own decks.
You can:

- **Create / rename / delete** decks (kanji or vocab kind).
- **Add / edit / delete** individual cards.
- **Bulk import** by pasting CSV, TSV, or JSON. Format is auto-detected;
  field-mapping is inferred from headers (`Kanji`, `Word`, `Meaning`, `Reading`,
  `JLPT`, etc.). Anki plain-text exports (`Front<TAB>Back`) work as-is.

The import parser lives at [`src/userDecks/importParser.ts`](./src/userDecks/importParser.ts)
and is covered by 17 unit tests for CSV / TSV / JSON edge cases.

## Outstanding (M3 / M4)

1. **Anki `.apkg` import** — bundle `sql.js`, parse the zipped SQLite, support
   field-mapping for user-defined Anki note types. (M2 ships CSV/TSV/JSON
   paste; `.apkg` is deferred to a follow-up.)
2. **Default deck rebuild** — the migration kept `kanji_top_freq.json` and
   `vocab_top_freq.json` (public-domain frequency data) and stripped textbook
   decks. Phase 2 of the plan calls for new JLPT N5–N1 + Jōyō-by-grade decks
   sourced from KANJIDIC2.
3. **Freemium subscription gate** (M3) — RevenueCat + paywall + restore-purchases.
4. **Capacitor wrap + App Store** (M4) — privacy manifest, Apple Developer enrollment, TestFlight.
5. **Replace PWA app icons** — the legacy generator was a Python/Pillow pipeline; new icons go under `public/icons/`.

## Testing

```bash
npm test           # 120 unit tests across SM-2, queue, storage migrations,
                   # entitlement gates, import parser, Modal, ErrorBoundary,
                   # and the auto-backup orchestration.
```

## Performance / bundle layout

The web build is split into independent chunks so the browser can fetch
them in parallel (HTTP/2 multiplexing) and cache them separately. Sizes
on the latest build:

| Chunk | Raw | Gzipped | What's in it |
|---|---|---|---|
| `vendor-react` | 142 KB | 45 KB | React + ReactDOM (caches across deploys; rarely changes) |
| `index` | 113 KB | 31 KB | App shell — all UI, screens, hooks, types |
| CSS | 30 KB | 6 KB | Stylesheet |
| `decks-kana` | 21 KB | 3 KB | Hiragana + Katakana decks |
| `decks-grammar` | 21 KB | 9 KB | Particles + patterns + verb conjugations |
| `decks-vocab` | 66 KB | 18 KB | All 11 themed vocab decks |
| `decks-kanji` | 2.1 MB | 586 KB | JLPT N5–N1, Jōyō by grade, Top 100/500/1000 |
| **`ankiImport` + sql.js** | 75 KB | 28 KB | Lazy-loaded only when `.apkg` upload opens |
| `sql-wasm.wasm` | 660 KB | — | sql.js binary, lazy + service-worker-precached |

First-paint critical path: `vendor-react + index + CSS = ~82 KB gzipped`.
The kanji-decks chunk is heavy but loads in parallel and is precached by
the PWA service worker after first load — subsequent visits are instant.

The schema-v2 regression test in `src/storage/state.test.ts` ensures existing
users' localStorage progress (`kanji-app` key) loads identically into the new
codebase. Don't break it without bumping `SCHEMA_VERSION` and adding a
migration.
