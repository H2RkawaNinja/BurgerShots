/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'burger': {
          50:  '#fff5f5',
          100: '#ffe0e0',
          200: '#ffb3b3',
          300: '#ff7070',
          400: '#e83535',
          500: '#C8171E',
          600: '#a31218',
          700: '#820e13',
          800: '#610a0e',
          900: '#3d0608',
          950: '#1f0304',
        },
        'navy': {
          50:  '#eef2ff',
          100: '#d4deff',
          200: '#a9beff',
          300: '#6e8eff',
          400: '#3d63f5',
          500: '#1B3F8B',
          600: '#15327a',
          700: '#102464',
          800: '#0b184d',
          900: '#060c2e',
          950: '#030617',
        },
        'amber': {
          50:  '#fff8ee',
          100: '#ffecd1',
          200: '#ffd49d',
          300: '#ffb55e',
          400: '#f0912a',
          500: '#E07B27',
          600: '#c4661a',
          700: '#a05014',
          800: '#7a3d10',
          900: '#522a0b',
          950: '#2a1505',
        },
        'dark': {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#b0b0b0',
          300: '#808080',
          400: '#555555',
          500: '#333333',
          600: '#242424',
          700: '#1a1a1a',
          800: '#141414',
          900: '#0f0f0f',
          950: '#080808',
        },
      },
      fontFamily: {
        'display': ['Bebas Neue', 'Impact', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'red':    '0 0 20px rgba(200, 23, 30, 0.4)',
        'amber':  '0 0 20px rgba(224, 123, 39, 0.4)',
        'card':   '0 4px 24px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-red':  'pulseRed 2s ease-in-out infinite',
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200, 23, 30, 0.4)' },
          '50%':      { boxShadow: '0 0 40px rgba(200, 23, 30, 0.7)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

