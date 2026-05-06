import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor config for the Kanjido iOS wrap.
 *
 * Run `npx cap add ios` once (locally, requires Xcode) to generate the ios/
 * folder. Subsequent web builds: `npm run build && npx cap sync ios`.
 *
 * The bundle ID `com.kanjido.app` is reserved in App Store Connect under
 * the user's developer account; the App Store products
 *   - com.kanjido.pro.monthly  ($3.99/mo)
 *   - com.kanjido.pro.yearly   ($34.99/yr, 7-day trial)
 * are referenced by id from src/entitlements/entitlement.ts.
 */
const config: CapacitorConfig = {
  appId: "com.kanjido.app",
  appName: "Kanjido",
  webDir: "dist",
  ios: {
    contentInset: "automatic",
    // Loose status-bar text color is set at runtime via @capacitor/status-bar
    // because it depends on the theme (dark vs light mode).
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: "#09090b",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
