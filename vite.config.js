import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/evolift/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg", "icons/*.png"],
      manifest: {
        id: "/evolift/",
        name: "Evolift",
        short_name: "Evolift",
        description:
          "Chaque séance compte. Ton carnet de musculation personnel.",
        lang: "fr",
        start_url: "/evolift/",
        scope: "/evolift/",
        display: "standalone",
        background_color: "#22272b",
        theme_color: "#22272b",
        icons: [
          {
            src: "icons/cat-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/cat-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/cat-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webp,woff2}"],
        navigateFallback: "/evolift/index.html",
        navigateFallbackDenylist: [/^\/(?!evolift\/)/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
