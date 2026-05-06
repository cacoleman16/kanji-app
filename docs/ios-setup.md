# iOS native build — first-time setup

The Capacitor wiring is in this branch (`capacitor.config.ts`,
`src/native/bridge.ts`, plugin deps). The actual `ios/` Xcode project hasn't
been generated yet because that step requires Xcode + CocoaPods on the
machine doing it. Run these commands once when you're ready.

## Prerequisites

- macOS with **Xcode 15+** (App Store)
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Program** enrolled ($99/year) — needed to sign builds for
  TestFlight and the App Store
- **Apple Developer account configured in Xcode**: Xcode → Settings → Accounts

## First-time generation

```bash
# From the repo root
npm install                # makes sure capacitor deps are present
npm run build              # produces dist/ for Capacitor to copy

# Generate the ios/ folder (this commits to git after; it's part of the project)
npx cap add ios

# Open the iOS project in Xcode
npx cap open ios
```

In Xcode:

1. Select the `App` target → **Signing & Capabilities** tab
2. Set **Team** to your Apple Developer team
3. Verify **Bundle Identifier** is `com.kanjido.app` (matches `capacitor.config.ts`)
4. Add capabilities:
   - **iCloud** → check "iCloud Documents", select container `iCloud.com.kanjido.app`
     (this enables iCloud Drive backup)
   - **In-App Purchase**
5. Build to a device (Run ▸) — make sure it launches and you see the home
   screen with the JLPT N5 deck unlocked

## Subsequent builds

```bash
npm run build              # rebuild web assets
npx cap sync ios           # copy dist/ into the iOS project + sync plugins
npx cap open ios           # open Xcode for archive/TestFlight upload
```

## RevenueCat wiring (when you're ready to take real money)

1. Sign up at [revenuecat.com](https://www.revenuecat.com) (free up to $2.5k/mo).
2. Create a project for Kanjido. Get the iOS public API key.
3. Install the SDK: `npm install --save @revenuecat/purchases-capacitor`
4. In `src/entitlements/provider.ts`, replace the `getSubscriptionProvider()`
   stub branch:
   ```ts
   export function getSubscriptionProvider(): SubscriptionProvider {
     if (Capacitor.isNativePlatform()) return revenueCatProvider;  // new
     return stubProvider;
   }
   ```
   The full RevenueCat-backed provider implementation goes in a new file
   `src/entitlements/revenueCatProvider.ts`. The `SubscriptionProvider`
   interface is intentionally RevenueCat-shaped, so it's a structural fit.
5. In App Store Connect, create the products with these exact IDs (already
   referenced in `entitlement.ts`):
   - `com.kanjido.pro.monthly` — auto-renewable, $3.99/mo
   - `com.kanjido.pro.yearly` — auto-renewable, $34.99/yr, 7-day intro trial
6. In RevenueCat, attach those products to an "Offering" called `default`.
7. Test in the iOS simulator with a sandbox Apple ID (configured in
   App Store Connect → Users and Access → Sandbox Testers).

## Privacy manifest (required since May 2024)

`ios/App/App/PrivacyInfo.xcprivacy` — Xcode generates a starter when you add
the iOS platform. Edit to declare:

- **NSPrivacyAccessedAPITypes**:
  - `NSPrivacyAccessedAPICategoryUserDefaults` — reason `CA92.1`
    (persisting user settings)
  - `NSPrivacyAccessedAPICategoryFileTimestamp` — reason `C617.1`
    (managing iCloud backup file)
- **NSPrivacyTrackingDomains**: `[]` (none — we don't track)
- **NSPrivacyTracking**: `false`

The current `public/privacy.html` already declares these reasons publicly.

## App icons

```bash
# Re-render placeholder icons from branding/kanjido-icon.svg
npm run icons

# When you have a designer master, replace branding/kanjido-icon.svg, then
# re-run npm run icons. The output PNGs live in public/icons/ and the
# native iOS project picks them up via assets.xcassets.
```

For App Store submission, replace the SVG with a designer-rendered 1024×1024
master. The current placeholder is the kanji 道 (way) on a dark amber square.

## TestFlight

1. Archive the build in Xcode: Product → Archive
2. Distribute App → App Store Connect → Upload
3. In App Store Connect → TestFlight → add up to 100 internal testers via
   Apple ID email (no review required for internal testing)
4. Get feedback for a week, fix what's broken, re-archive
5. When you're confident, submit for App Store review (typically 24–48 hour
   review)

## Common gotchas

- **Capacitor sync after `npm install`**: any new plugin needs `npx cap sync
  ios` to update the iOS project's pod list.
- **CocoaPods install errors on Apple Silicon**: try
  `arch -x86_64 pod install` if the native install fails.
- **In-app purchases require a paid Apple Developer Program** — TestFlight
  doesn't show purchases for builds where the developer hasn't agreed to the
  paid-apps contract in App Store Connect.
- **iCloud backup** needs the right entitlement file + Info.plist key
  (`NSUbiquitousContainers`); Xcode handles this when you check the iCloud
  capability with the right container.
