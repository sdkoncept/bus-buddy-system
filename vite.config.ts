import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".ngrok-free.dev", ".ngrok.io"],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // NOTE: favicon.ico precaching can fail on some Android WebView builds (served as https://localhost)
      // and throws an unhandled Workbox error that can interfere with app startup.
      // We keep PWA icons but exclude favicon.ico from explicit precache.
      includeAssets: ["pwa-192x192.png"],
      strategies: "generateSW",
      injectRegister: "auto",
      manifest: {
        name: "EagleLine Fleet Management",
        short_name: "EagleLine",
        description: "Fleet management, ticket booking, and real-time bus tracking",
        theme_color: "#3b82f6",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,ico,png,svg,woff2}"],
        globIgnores: ["**/index.html"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB limit
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "mapbox-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});