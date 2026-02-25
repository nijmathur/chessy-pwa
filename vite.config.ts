import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Chessy — Chess vs Computer',
        short_name: 'Chessy',
        description: 'Play chess against the computer. Works offline.',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#2C2C2C',
        theme_color: '#2C2C2C',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/pieces\/.*\.svg$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'chessy-pieces-v1',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  worker: { format: 'es' },
  build: { target: 'es2020', sourcemap: true },
});
