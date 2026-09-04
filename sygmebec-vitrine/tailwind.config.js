/** @type {import('tailwindcss').Config} */
const loginPalette = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#60a5fa',
  500: '#0000ff',
  600: '#0000cc',
  700: '#000099',
  800: '#000066',
  900: '#000033',
  950: '#00001f',
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Keep public pages and the administration login on one palette.
        primary: loginPalette,
        indigo: loginPalette,
        blue: loginPalette,
        violet: loginPalette,
        purple: loginPalette,
        navy: loginPalette,
        gold: loginPalette,
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#172033',
        },
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 43, 78, .08), 0 8px 24px rgba(16, 43, 78, .06)',
        elegant: '0 12px 30px rgba(16, 43, 78, .10)',
      },
    },
  },
  plugins: [],
}
