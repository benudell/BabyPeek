/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        blush: {
          50: '#fff5f7',
          100: '#ffe0e8',
          200: '#ffc1d4',
          300: '#ff9ab5',
          400: '#ff6b93',
          500: '#ff3d6f',
        },
        cream: {
          50: '#fffdf7',
          100: '#fff9ed',
          200: '#fef3d9',
          300: '#fde8b8',
        },
        sage: {
          100: '#e8f0e8',
          200: '#c8dcc8',
          300: '#9dc09d',
          400: '#6fa06f',
          500: '#4d844d',
        },
      },
    },
  },
  plugins: [],
}
