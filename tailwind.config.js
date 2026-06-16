/** @type {import('tailwindcss').Config} */
const ink = (v) => `rgb(var(--ink-${v}) / <alpha-value>)`
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm saffron / Jain-gold theme for the Community panel
        brand: {
          50: '#fff8ed',
          100: '#ffefd3',
          200: '#ffdba5',
          300: '#ffc06d',
          400: '#ff9a32',
          500: '#ff7d0a',
          600: '#f05f00',
          700: '#c74604',
          800: '#9e370b',
          900: '#7f300c',
        },
        // Neutral scale is driven by CSS variables so it flips for dark mode.
        ink: {
          50: ink(50),
          100: ink(100),
          400: ink(400),
          600: ink(600),
          800: ink(800),
          900: ink(900),
        },
        // Card / input surface (solid white in light, elevated dark in dark mode).
        surface: 'rgb(var(--surface) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
        soft: '0 10px 30px -12px rgba(240,95,0,0.25)',
      },
    },
  },
  plugins: [],
}
