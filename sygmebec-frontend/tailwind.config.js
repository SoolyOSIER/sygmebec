/** @type {import('tailwindcss').Config} */
const loginPalette = {
  50:  '#eef2ff',
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
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // The login screen is the visual source of truth.  Aliases make
        // legacy utility classes resolve to the same blue scale as well.
        primary: loginPalette,
        indigo: loginPalette,
        blue: loginPalette,
        violet: loginPalette,
        purple: loginPalette,
        navy: loginPalette,
        gold: loginPalette,
        secondary: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        slate: {
          25: '#f8fafc',
        },
        border: '#e2e8f0',
        success: '#16a34a',
        warning: '#d97706',
        danger:  '#dc2626',
        info:    '#0284c7',
      },
      borderWidth: {
        3: '3px',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(30,58,110,.08), 0 1px 2px -1px rgba(30,58,110,.08)',
        panel: '0 4px 24px 0 rgba(30,58,110,.10)',
        glow:  '0 0 0 3px rgba(212,160,23,.25)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in':  'fadeIn 0.15s ease-out',
        'spin-slow':'spin 2s linear infinite',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateY(-8px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
}
