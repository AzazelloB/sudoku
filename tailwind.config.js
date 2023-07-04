/* eslint-disable @typescript-eslint/no-var-requires */
const { colors } = require('./src/constants/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors,
    },
    fontFamily: {
      mono: ['Martian Mono', 'monospace'],
    },
  },
  plugins: [],
};
