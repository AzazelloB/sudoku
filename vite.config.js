/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import checker from 'vite-plugin-checker';
import path from 'path';

export default defineConfig({
  base: 'https://azazellob.github.io/sudoku',
  plugins: [
    solidPlugin(),
    checker({
      typescript: true,
      terminal: false,
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
