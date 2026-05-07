# Changelog

All notable changes to Kanjido. Format follows [Keep a Changelog](https://keepachangelog.com/);
versioning is [Semantic](https://semver.org/) — pre-1.0 is for the migration
period; 1.0.0-beta.1 is the first TestFlight-ready build.

## [1.0.0-beta.1] — 2026-05-07

First TestFlight-ready release. Migrated from a single 1.2 MB
`kanji-app.html` PWA to a Vite + React + TypeScript codebase wired for
Capacitor iOS, with a freemium model, 39 default decks, and 5,936
JMdict-derived examples on default kanji cards.

### Added — content
- **39 default decks** spanning 5 categories:
  - Kana × 2 (Hiragana, Katakana) — free, with paired-kana + dakuten/handakuten variants + real example words on the back
  - JLPT × 5 (N5 free, N4–N1 Pro)
  - Frequency tiers × 3 (Top 100 / 500 / 1,000)
  - Jōyō by grade × 7 (1–6 + Secondary)
  - Themed vocab × 17 (Numbers, Time, Counters, Body, Family, Food, Verbs, Adjectives, Verb pairs, Onomatopoeia, Travel, Weather, Office, Restaurant, Medical, Colors, Animals, Emotions, Proverbs)
  - Grammar × 3 (Particles, Patterns & Phrases, Verb Conjugations)
- **5,936 of 5,947 default kanji cards** carry JMdict-derived example compounds (~99.8% coverage)
- **Conjugation tables** on all 14 verb-conjugation grammar cards — replaces dense prose with structured Group/Rule/Example tables. Te-form gets the famous 行く → 行って exception flagged.
- **Custom decks**: create / rename / delete; add / edit / delete cards; CSV / TSV / JSON paste import with header inference; Anki `.apkg` import (Pro) with sql.js + fflate, both lazy-loaded.

### Added — UX
- **Onboarding** flow on first launch (3 steps)
- **In-app modal** replacing every native `confirm()` / `alert()`
- **ErrorBoundary** wrapping `<App />` with reload / export-state / hard-reset escape hatches
- **Stats screen** with 7-day / 30-day toggle, card-status distribution (New / Learning / Due / Mastered), per-deck progress bars, and all-time rating breakdown
- **Furigana toggle** (`ふ on / ふ off`) on vocab Study screens for kanji-recall practice
- **EN ↔ JP direction toggle** on vocab and kana Study screens
- **Three Home tabs**: Kanji / Vocab / Grammar
- **Empty states** with brand-amber kanji marks (自 for MyDecks, 始 for Stats)

### Added — iOS / Capacitor
- **Capacitor wrap** with `com.kanjido.app` bundle ID
- **Daily push notifications** via `@capacitor/local-notifications` with permission flow + custom time
- **iCloud Drive auto-backup** after each study session (Pro, 12-hour throttle, opt-out)
- **iCloud Drive restore** flow — lists backups, restores the most recent
- **Native share sheet** for export-progress (Save to Files, AirDrop, Mail)
- **Theme-aware status bar**, splash screen, haptics on rate / flip
- **`PrivacyInfo.xcprivacy`** privacy manifest declaring required-reason API usage (UserDefaults CA92.1, FileTimestamp C617.1, DiskSpace E174.1, SystemBootTime 35F9.1) — required by Apple since May 2024

### Added — paywall + subscriptions
- **Freemium model**: free tier = Kana × 2 + JLPT N5 + Numbers + Time/Days + 1 user deck (50-card cap). Pro = everything unlocked.
- **`com.kanjido.pro.monthly`** ($3.99 / month) and **`com.kanjido.pro.yearly`** ($34.99 / year, 7-day free trial — 27% savings)
- **Paywall screen** with offer cards, trust row (Apple-secured payment / cancel anytime), Apple-mandated auto-renew + Terms / Privacy disclosures
- **RevenueCat-backed `SubscriptionProvider`** ready to activate by setting `REVENUECAT_APPLE_PUBLIC_API_KEY` in `src/entitlements/revenueCatProvider.ts`. Falls back to a stub provider in dev / web / unconfigured native.
- **Restore purchases** flow

### Added — privacy / legal
- `/privacy` — full privacy policy (CC-BY-SA attribution, required-reason API disclosures, on-device-only data model)
- `/terms` — terms of service (subscription + cancellation policy, free vs Pro split, content rights, acceptable use)

### Added — performance / build
- **4 deck chunks** + separate `vendor-react` chunk for parallel HTTP/2 loading. First-paint critical path is **82 KB gzipped**.
- **Service-worker precache** including the sql.js WASM (~660 KB) so Anki imports work offline
- **Security headers** on Vercel: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy

### Added — quality
- **139 vitest tests** across 11 files: SM-2, queue, storage migrations v1→v5, entitlement gates, import parser, Anki import, Modal, Onboarding, Paywall, autoBackup
- **strict TypeScript** with `noUnusedLocals` and `noUnusedParameters`
- **eslint --max-warnings=0** in CI

### Removed (legacy / migration)
- Original `kanji-app.html` archived to `legacy/kanji-app.html`
- Personal-textbook decks moved to `legacy/agent-files/` (Integrated Approach Ch.1–15, Drive My Car v1+v2, Yotsuba, Japan Travel)
- WaniKani-derived `wk_meanings` fallback dropped — default decks now use only KANJIDIC2 + JMdict + Jonathan Waller's JLPT data (no Tofugu IP)

### Authorship + attribution
- **KANJIDIC2** (CC-BY-SA, EDRDG) — kanji metadata
- **JMdict** (CC-BY-SA, EDRDG) — example compound words
- **Jonathan Waller's JLPT lists** — JLPT level mappings
- All kana / themed vocab / grammar deck content hand-authored
