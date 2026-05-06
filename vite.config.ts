import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "splash/*.png", "sql-wasm.wasm"],
      workbox: {
        // sql-wasm.wasm is ~660 KB; needs to be precached so Anki imports work offline
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm,webp}"],
        // Precache big chunks (decks chunk is >1 MB).
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      manifest: {
        name: "Kanjido — Spaced-repetition kanji study",
        short_name: "Kanjido",
        description:
          "Minimalist Japanese kanji study app with spaced repetition. Build your own decks; import from Anki or CSV.",
        start_url: "./index.html",
        display: "standalone",
        background_color: "#09090b",
        theme_color: "#09090b",
        orientation: "portrait",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-180.png", sizes: "180x180", type: "image/png", purpose: "any" },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split deck JSONs into their own chunk so first-paint of the React shell
        // doesn't have to wait on ~1.5 MB of card data.
        manualChunks(id) {
          if (id.includes("/agent-files/")) return "decks";
          return undefined;
        },
      },
    },
    // Decks chunk is intentionally large (~1 MB precompressed). Silence the
    // bundle-size warning so it doesn't drown signal in the build output.
    chunkSizeWarningLimit: 1500,
  },
});
