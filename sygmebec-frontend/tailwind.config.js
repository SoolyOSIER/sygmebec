/** @type {import('tailwindcss').Config} */

// Calibrated by sampling actual pixels from the login screen:
// panel gradient #000097 → #000035, button/link #0000CC,
// focus ring/outline #0000FF, field bg #E8F0FE, heading text #0F172A.
const loginBlue = {
  50:  '#f0f0f8',
  100: '#ddddee',
  200: '#9999ff',
  300: '#5c5cff',
  400: '#1a1aff',
  500: '#0000ff', // focus ring / "Anile" outline
  600: '#0000cc', // "Konekte" button fill / "Enskri" link
  700: '#000099',
  800: '#000066',
  900: '#000034', // panel's darkest corner
  950: '#000022',
}

// Real gold, sampled from the EBEC crest's bridge/arch (#FFC700) —
// this was previously aliased to loginBlue, so gold-* rendered blue.
const gold = {
  50:  '#fffbeb',
  100: '#fff4cc',
  200: '#ffeba3',
  300: '#ffe070',
  400: '#ffd43d',
  500: '#ffc700',
  600: '#d6a700',
  700: '#ad8700',
  800: '#856700',
  900: '#5c4800',
  950: '#382c00',
}

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // The login screen is the visual source of truth for the blue family.
        primary: loginBlue,
        indigo: loginBlue,
        blue: loginBlue,
        navy: loginBlue,
        // Gold now maps to a real amber/gold scale, not blue.
        gold,
        // violet/purple no longer alias blue — they keep Tailwind's own
        // scales unless a specific brand shade is needed elsewhere.
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
          900: '#0f172a', // matches the measured heading text color
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
        card:  '0 1px 3px 0 rgba(0,0,204,.08), 0 1px 2px -1px rgba(0,0,204,.08)',
        panel: '0 4px 24px 0 rgba(0,0,151,.12)',
        glow:  '0 0 0 3px rgba(255,199,0,.28)', // gold focus glow, e.g. for CTA emphasis
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