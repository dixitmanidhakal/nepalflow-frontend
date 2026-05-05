/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // NepalFlow brand colors inspired by Nepal flag colors
        primary: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',  // main brand
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        nepal: {
          red:   '#DC143C',
          blue:  '#003893',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        nepali: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in':  'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
