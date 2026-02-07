/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotpink: {
          50: '#fff1f6',
          100: '#ffe4ed',
          200: '#ffc9de',
          300: '#ff9fc3',
          400: '#ff66a1',
          500: '#ff337f',
          600: '#f01160',
          700: '#cc0044',
          800: '#a8033b',
          900: '#8c0734',
          950: '#56001a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
