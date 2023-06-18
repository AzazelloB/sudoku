/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // color palette
        // Mint
        // #DDFFE7

        // Spearmint
        // #98D7C2

        // Teal Green
        // #167D7F

        // Teal
        // #29A0B1
        primary: {
          DEFAULT: '#167D7F',
          dark: '#0F5B5D',
          light: '#29A0B1',
        },
        secondary: {
          DEFAULT: '#29A0B1',
          dark: '#167D7F',
          light: '#98D7C2',
        },
      },
    },
  },
  plugins: [],
};
