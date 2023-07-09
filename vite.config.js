/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// should end with /
const baseURL = 'https://azazellob.github.io/sudoku';

export default defineConfig({
  base: baseURL,
  plugins: [
    solidPlugin(),
    checker({
      typescript: true,
      terminal: false,
    }),
    VitePWA({
      workbox: {
        globPatterns: ['**/*'],
      },
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
      ],
      manifest: {
        id: `${baseURL}/`,
        start_url: `${baseURL}/`,
        scope: `${baseURL}/`,
        name: 'Sudoku',
        short_name: 'Sudoku',
        theme_color: '#138686',
        background_color: '#0f1624',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: [
      { find: '~', replacement: path.resolve(__dirname, 'src') },
    ],
  },
});
