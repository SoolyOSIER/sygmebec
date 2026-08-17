/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f2fb',
          100: '#cfe4f6',
          200: '#9fc8ec',
          300: '#69a9df',
          400: '#347fc8',
          500: '#0c5aa6',
          600: '#084b8a',
          700: '#093d70',
          800: '#0a335c',
          900: '#092e50',
        },
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
        navy: {
          50: '#eef6ff',
          100: '#dcecff',
          500: '#174a7c',
          700: '#0d3b66',
          900: '#082b4c',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d4a017',
          600: '#b78500',
          700: '#9a6e00',
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
