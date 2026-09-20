/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyaya: {
          50: '#f0f4f9',
          100: '#e1e8f3',
          200: '#c7d5e7',
          300: '#9fb9d7',
          400: '#7198c3',
          500: '#4e79ae',
          600: '#3c6092',
          700: '#324e77',
          800: '#2c4363',
          900: '#1b2a41',
          950: '#0f172a',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 4px 12px 0 rgba(15, 23, 42, 0.12)',
      }
    },
  },
  plugins: [],
}
