/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f5e6ff',
          100: '#dbb3ff',
          200: '#c280ff',
          300: '#a94dff',
          400: '#901aff',
          500: '#7600e6',
          600: '#5c00b3',
          700: '#420080',
          800: '#29004d',
          900: '#0f001a',
        },
      },
      plugins: [
        require('@tailwindcss/forms'),
      ],
    },
  },
  plugins: [],
};