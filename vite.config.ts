/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // F07 Offline Mode — precache the whole built app so a plan renders and
    // recomputes with no network. citations.json is bundled into the JS via
    // import (models/Citations.ts), so evidence content is covered by the JS
    // glob. registerType 'prompt' pairs with OfflineIndicator.vue: new deploys
    // are announced instead of silently pinning a stale service worker.
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Wake Windows — Infant Nap Schedule Planner',
        short_name: 'Wake Windows',
        description:
          "Plan an infant's nap schedule from wake windows, age, and bedtime — checked against cited sleep guidance.",
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    // Dev-server port can be assigned externally (PORT env, e.g. by a preview
    // harness); Vite's default applies otherwise.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  test: {
    // e2e/ holds Playwright specs (npm run test:e2e); Vitest must not load them.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
