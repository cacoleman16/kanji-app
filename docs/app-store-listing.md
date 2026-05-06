# Kanjido — App Store listing copy

Paste-ready text for App Store Connect submission. Tweak before submitting.

---

## App information

**Name** (max 30 chars)
> Kanjido

**Subtitle** (max 30 chars — appears under the name in search results)
> Spaced-repetition kanji study

**Bundle ID**
> com.kanjido.app

**Primary category**
> Education

**Secondary category**
> Reference

**Age rating**
> 4+ (no objectionable content)

**Pricing**
> Free download with In-App Purchases

**Availability**
> All countries / regions

---

## Keywords (max 100 characters, comma-separated)

> kanji,japanese,jlpt,joyou,spaced repetition,srs,flashcards,study,furigana,hiragana,katakana,heisig

---

## Description (max 4,000 chars)

```
Learn kanji the way memory actually works.

Kanjido is a minimalist Japanese-kanji study app built around SM-2 spaced
repetition — the same scheduling algorithm Anki uses, in an interface
designed to disappear when you study.

THE WAY OF KANJI

Each card is a single kanji on the front. Tap to flip. Rate Again, Hard,
Good, or Easy — Kanjido schedules the next review at exactly the right
moment for the kanji to stick.

WHAT YOU GET

• 12 default decks — JLPT N5 through N1 (2,200+ kanji), Jōyō kanji
  organized by school grade (2,100+ kanji)
• SM-2 spaced repetition with a tuned learning queue: review the most
  forgotten cards first, layer in new ones at your own pace
• Daily streaks, accuracy stats, weekly review history
• Bring your own decks — paste CSV, TSV, or JSON for instant import
• Anki .apkg import (Pro): drop your existing collection straight in
• Dark and light themes
• Adjustable card-back text size
• Vocab decks too — Japanese → English or English → Japanese flip

YOUR DATA STAYS YOURS

• No accounts. No sign-in. Nothing to forget.
• All progress stored locally on your device.
• Export to JSON anytime. iCloud Drive backup with one tap (Pro).
• No analytics. No ads. No tracking.

KANJIDO PRO ($3.99/month or $34.99/year, 7-day free trial)

• Every default deck unlocked (free tier includes JLPT N5)
• Unlimited custom decks with no card-count caps
• Anki .apkg import
• Automatic iCloud Drive backup
• Priority support

CANCEL ANYTIME in App Store → Settings → Subscriptions.

Designed for learners, not for re-engagement metrics. Pick up your phone,
review your due cards, put it down. The way of kanji is the long road —
walk it a little every day.
```

---

## What's New (release notes for v1.0)

```
First release. Welcome to Kanjido.

• 12 built-in decks: JLPT N5–N1 + Jōyō by grade
• SM-2 spaced repetition
• Custom decks with CSV / Anki import
• iCloud Drive backup (Pro)
• Dark and light themes

Made with care. Email hello@kanjido.app with feedback.
```

---

## Promotional text (170 chars — can update without re-review)

```
Spaced-repetition kanji study, on-device, no tracking. JLPT N5–N1, Jōyō by grade, custom decks, Anki import. Cancel anytime.
```

---

## Support URL

> https://kanjido.app/support  *(or set to your Vercel preview /support page until launch)*

## Marketing URL (optional)

> https://kanjido.app

## Privacy Policy URL

> https://kanjido.app/privacy *(currently served at https://kanji-app-brown-three.vercel.app/privacy in this codebase)*

---

## In-App Purchase products

Create both in App Store Connect → Features → In-App Purchases.

### Monthly

- **Reference Name**: Kanjido Pro Monthly
- **Product ID**: `com.kanjido.pro.monthly`
- **Type**: Auto-Renewable Subscription
- **Subscription Group**: Kanjido Pro (create if doesn't exist)
- **Subscription Duration**: 1 Month
- **Price Tier**: $3.99 USD (tier varies by region)
- **Display Name**: Kanjido Pro
- **Description**:
  > All decks unlocked, unlimited custom decks, Anki import, iCloud backup. Auto-renews monthly.

### Yearly

- **Reference Name**: Kanjido Pro Yearly
- **Product ID**: `com.kanjido.pro.yearly`
- **Type**: Auto-Renewable Subscription
- **Subscription Group**: Kanjido Pro
- **Subscription Duration**: 1 Year
- **Price Tier**: $34.99 USD
- **Introductory Offer**: Free Trial, 7 days, eligible for new subscribers only
- **Display Name**: Kanjido Pro (yearly)
- **Description**:
  > All decks unlocked, unlimited custom decks, Anki import, iCloud backup. 7-day free trial, then auto-renews yearly. Save 27% vs monthly.

---

## App Review notes (paste into App Review Information)

```
Kanjido is a Japanese kanji study app with SM-2 spaced repetition.

NO ACCOUNT REQUIRED. The free tier is fully functional with the JLPT N5 deck
(79 cards) and one user-created custom deck. Reviewers can test the full
study flow without any sign-in.

To test Pro features:
- Open Settings → tap the "Kanjido v0.1" footer 7 times → confirm "Dev:
  grant comp Pro?" — this comp-Pros the test build for review purposes only.
  This dev override is gated behind 7 consecutive taps on a hidden target.

In-app purchases are validated through RevenueCat, which abstracts StoreKit.
We have no server backend; entitlements are stored on-device.

The app does not collect any personal information. There is no analytics,
no ads, no third-party SDKs aside from RevenueCat (subscription validation
only) and EDRDG-licensed kanji data (CC-BY-SA, attribution preserved).

Privacy policy: <fill in launch URL>
Terms of service: <fill in launch URL>
```

---

## Screenshots checklist (6.7" iPhone, required)

Apple requires at least 3 screenshots; up to 10. Recommended set:

1. **Hero — study card front** (kanji huge, tap-to-flip hint visible)
2. **Study card back** (meaning, examples, on/kun, mnemonic, rating buttons)
3. **Home — deck list with stats** (streak + daily goal at top)
4. **Custom deck import** (paste CSV → preview)
5. **Pro paywall** (offers + features list)
6. **Stats** (last 7 days)

Use real screenshots from the iPhone simulator (15 Pro Max for 6.7"). Apple
also wants 6.5" if you target older devices and 13" iPad if you ship for iPad.

Tooling: Apple's [App Store screenshot specs](https://developer.apple.com/design/human-interface-guidelines/app-icons),
or Mockuphone for quick framing.
