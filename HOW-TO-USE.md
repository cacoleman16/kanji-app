# Kanji App POC — How to use it

## Files you now have

- `kanji-app.html` — the app itself (single file, open in any browser)
- `manifest.json` — PWA manifest (needed for "Add to Home Screen" to feel native)
- `genki2-preview.json` — 5-card sample data (currently embedded inside the HTML; separate file kept for reference until the real data pipeline runs)
- `kanji-preview.html` — earlier card-only preview (superseded by `kanji-app.html` but kept around)
- `kanji-app-plan.md` — the project plan

## Try it on your laptop

Just double-click `kanji-app.html`. It opens in your default browser and works fully offline after the first load (Google Fonts + React CDNs cache automatically).

Keyboard shortcuts during study:
- **Space** / **Enter** — flip card
- **1** / **2** / **3** / **4** — rate Again / Hard / Good / Easy (only when flipped)

Progress saves automatically to your browser's local storage (no account, no cloud).

## Try it on your iPhone

Because the app currently lives on your laptop, the easiest path is a quick local web server. Open Terminal, then:

```bash
cd ~/path/to/the/folder/with/kanji-app.html
python3 -m http.server 8000
```

Then on your iPhone (on the same Wi-Fi as your laptop):

1. Find your laptop's local IP (System Settings → Wi-Fi → details → IP Address, something like `192.168.1.42`).
2. In Safari on your iPhone, visit `http://192.168.1.42:8000/kanji-app.html`.
3. Tap the **Share** button → **Add to Home Screen**. Name it "Kanji."
4. Launch it from your home screen — it opens full-screen like a native app.

Later we'll deploy it to a real host (Vercel/Netlify, free) so you don't need your laptop running.

## What's working right now

- Home screen with deck picker, streak, daily goal
- Study session with flip card
- SM-2 spaced repetition with proper interval calculations
- Again / Hard / Good / Easy rating buttons with next-interval previews
- Intra-session "Again" re-queue (missed cards come back later in the same session)
- Session complete screen with session stats
- Stats page (last 7 days, total reviews, accuracy, longest streak)
- Settings (daily goal, new cards/day, export progress as JSON, reset)
- Local storage persistence
- iOS home screen install metadata

## What's intentionally NOT built yet

- Only Genki 2 preview deck (5 cards) is populated. Other decks show "Coming soon."
- Service worker for true offline mode — the app works offline via browser cache, but a real service worker gives bulletproof offline behavior. Adding it requires moving to a build pipeline (Vite).
- Cloud sync — intentionally deferred per your "local only for POC" decision.
- Audio for example words — deferred.
- Search / kanji lookup — deferred.
- Stroke order animation — not in scope for v1.

## What I want you to try and tell me

1. **Study flow feel** — does the rate → see next card loop feel fast and clean? Anything clunky?
2. **Interval previews** under the rating buttons (e.g. "1d," "4d") — useful or noise?
3. **Card layout on iPhone** specifically — I designed for iPhone sizes but you're the one who'll stare at it.
4. **Session length** — 5 cards is obviously tiny; the real decks (150+ cards) will feel different. Any upfront thoughts on ideal session size?
5. **Missing anything obvious** from the core loop?

Once you approve the shape, next I'll build the real data pipeline to generate the full Genki 2 deck (~172 kanji) from KANJIDIC2 + JMdict.
