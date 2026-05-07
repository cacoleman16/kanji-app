import { APP_VERSION } from "@/data/version";

interface LegalProps {
  doc: "privacy" | "terms" | "support";
  onBack: () => void;
}

/**
 * Privacy Policy / Terms of Service / Support pages.
 *
 * Apple requires hosted URLs for these (`/privacy`, `/terms`, `/support`)
 * AND in-app access from the app itself. Vercel serves the SPA so any
 * unknown route falls through to App.tsx, which opens this screen via
 * URL routing (TODO when we wire client-side routing) or via Settings
 * links (already wired).
 *
 * Content is intentionally short, factual, and free of boilerplate
 * legalese — Kanjido stores everything on-device, has no analytics, no
 * tracking, no accounts, and no third-party data sharing besides Apple's
 * own subscription processing. There's not much to disclose.
 *
 * If you change anything material here (new SDK that touches user data,
 * new server-side feature, new third-party processor), update the
 * "Last updated" date inline and consider whether the change requires
 * a new privacy-manifest entry in `ios/App/App/PrivacyInfo.xcprivacy`.
 */
export function Legal({ doc, onBack }: LegalProps) {
  const title =
    doc === "privacy" ? "Privacy Policy" : doc === "terms" ? "Terms of Service" : "Support";

  return (
    <div className="fade-in legal-page">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">{title}</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="legal-content">
        <h1 className="legal-title">{title}</h1>
        <div className="legal-meta">Last updated: 2026-05-07 · Kanjido v{APP_VERSION}</div>

        {doc === "privacy" && <PrivacyContent />}
        {doc === "terms" && <TermsContent />}
        {doc === "support" && <SupportContent />}
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <>
      <p>
        Kanjido is built so that everything you do — your study progress, your custom decks,
        your settings — lives on your device. We don't operate a server that holds your data,
        and we don't use any analytics or tracking SDKs. There is no account to create.
      </p>

      <h2>What stays on your device</h2>
      <ul>
        <li>Your study progress (SM-2 ease, intervals, due dates per card).</li>
        <li>Your streak, daily review counts, and per-deck stats.</li>
        <li>Any custom decks and cards you create.</li>
        <li>Your app settings (theme, daily goal, notification preferences).</li>
      </ul>
      <p>
        This data is held in your browser's local storage (web) or in the app's local
        container (iOS). Uninstalling the app removes it.
      </p>

      <h2>iCloud Drive backup (iOS only, optional)</h2>
      <p>
        On iOS, Kanjido can periodically write a JSON backup of your progress to your iCloud
        Drive. This backup lives in your iCloud account, controlled by you. We don't read it,
        we don't have access to it, and it never touches our servers. You can disable the
        feature in Settings or delete the backup files directly in the Files app.
      </p>

      <h2>Subscription processing</h2>
      <p>
        Kanjido Pro is a subscription handled by Apple's StoreKit and managed via{" "}
        <strong>RevenueCat</strong>, a subscription-management platform. When you subscribe,
        the App Store sends a receipt to RevenueCat to verify the purchase and unlock Pro
        features. RevenueCat's servers receive an anonymous device-tied identifier and the
        receipt — they do not receive your study progress, your custom decks, your name, or
        your email. See RevenueCat's privacy policy at{" "}
        <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noreferrer">
          revenuecat.com/privacy
        </a>
        .
      </p>

      <h2>What we don't collect</h2>
      <ul>
        <li>No analytics events, no telemetry, no crash reporting beacons.</li>
        <li>No advertising identifiers, no fingerprinting, no third-party trackers.</li>
        <li>No location, no contacts, no calendar, no microphone, no camera.</li>
        <li>No name, email, age, or any personally identifying field.</li>
      </ul>

      <h2>Children</h2>
      <p>
        Kanjido is rated 4+ and contains no objectionable content. Because we don't collect
        any personal information from anyone, we don't collect any from children either.
      </p>

      <h2>Changes</h2>
      <p>
        Material changes to this policy will be reflected in the "Last updated" date above
        and surfaced in the app's "What's New" modal on the next release.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or concerns: open an issue on our GitHub repository, or use the Support
        page from Settings.
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p>
        By using Kanjido, you agree to the terms below. They're plain-English on purpose.
      </p>

      <h2>The app</h2>
      <p>
        Kanjido is a Japanese kanji and vocabulary study app. We try hard to make it
        accurate and reliable, but we provide it "as is" without warranty. If a card teaches
        you the wrong meaning or a sync goes sideways, we'll do our best to fix it, but we
        can't guarantee perfect data — Japanese is hard, and so is software.
      </p>

      <h2>Your data</h2>
      <p>
        You own your study data and custom decks. We don't claim any rights to them. The
        Privacy Policy describes how we don't collect them.
      </p>

      <h2>Subscription</h2>
      <p>
        Kanjido Pro is a recurring subscription. Pricing and the renewal period are shown
        before purchase and in your App Store subscription settings. You can cancel any time
        in Settings → Apple ID → Subscriptions; cancellation takes effect at the end of the
        current period. We don't issue refunds directly — refund requests go through Apple.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don't use Kanjido to import content you don't have the right to (e.g. ripped
        textbook decks). The app is designed for personal study; redistribution of imported
        copyrighted material is your responsibility.
      </p>

      <h2>Third-party content</h2>
      <p>
        Default decks are derived from publicly available, openly licensed sources —{" "}
        <strong>KANJIDIC2</strong> and <strong>JMdict</strong> (CC-BY-SA, EDRDG), Jōyō and
        JLPT lists. Attribution is preserved on each deck. We aren't affiliated with the
        Japanese government, the Japan Foundation, or any test-administration body.
      </p>

      <h2>Liability</h2>
      <p>
        Kanjido is provided as-is. To the extent permitted by law, we're not liable for any
        consequential, incidental, or indirect damages arising from your use of the app.
        Studying for an exam? We hope we help, but we can't promise a passing grade.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The "Last updated" date above reflects
        the most recent change.
      </p>
    </>
  );
}

function SupportContent() {
  return (
    <>
      <p>
        Need help, found a bug, or have a feature request? You can reach us in a few ways.
      </p>

      <h2>Quick fixes</h2>
      <ul>
        <li>
          <strong>Forgot your progress after closing the app?</strong> Open Settings →
          Backups and tap "Restore from iCloud" (iOS) or "Import" (web).
        </li>
        <li>
          <strong>Subscription not unlocking Pro?</strong> Open Settings →
          Subscription and tap "Refresh status". If still stuck, "Already paid? Restore
          purchases" forces a fresh receipt check with Apple.
        </li>
        <li>
          <strong>Daily reminder not firing?</strong> Settings → Notifications →
          confirm the toggle is on AND that iOS has notification permission for Kanjido
          (Settings app → Notifications → Kanjido).
        </li>
        <li>
          <strong>Import .apkg failing?</strong> Anki's newest format (.anki21b) isn't
          supported yet — re-export with "Support older Anki versions" enabled, or use
          plain-text export and paste it in.
        </li>
      </ul>

      <h2>Bug reports & feature requests</h2>
      <p>
        Open a GitHub issue at{" "}
        <a href="https://github.com/cacoleman16/kanji-app/issues" target="_blank" rel="noreferrer">
          github.com/cacoleman16/kanji-app/issues
        </a>
        . Include:
      </p>
      <ul>
        <li>What you were trying to do.</li>
        <li>What happened instead.</li>
        <li>Your iOS version (if relevant) and the Kanjido version (Settings → About).</li>
      </ul>
      <p>
        For privacy concerns or anything you'd rather not post publicly, email{" "}
        <a href="mailto:support@kanjido.app">support@kanjido.app</a>.
      </p>

      <h2>Account deletion</h2>
      <p>
        Kanjido has no accounts, so there's nothing for us to delete on a server. To remove
        all on-device data: Settings → Delete all my data. Active subscriptions are
        managed in your Apple ID's subscription settings — cancelling there stops the
        renewal.
      </p>

      <h2>Data export</h2>
      <p>
        Settings → Backups → Export saves a JSON file you can keep or migrate to another
        device. The format is documented in our GitHub repo if you want to inspect or
        process it yourself.
      </p>
    </>
  );
}
