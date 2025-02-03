import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectRegister: false,

      manifest: {
        name: "PolygonApp",
        short_name: "PolygonApp",
        description: "App for measuring land area offline",
        theme_color: "#44C4A1",
        background_color: "#44C4A1",
        start_url: "/",
        icons: [
          { src: "logos/logo-64-64.png", sizes: "64x64", type: "image/png" },
          {
            src: "logos/logo-192-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logos/logo-512-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          { src: "logos/logo-512-512.png", sizes: "512x512", type: "any" },
          {
            src: "logos/maskable-logo-512-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        orientation: "portrait-primary",
        dir: "ltr",
        display: "standalone",
        categories: ["business"],
      },

      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },

      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
});
