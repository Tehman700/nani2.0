/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060f1a',
          900: '#0a1929',
          800: '#0f2744',
          700: '#1e3a5f',
          600: '#2d5282',
        },
        sky: {
          400: '#38bdf8',
          300: '#7dd3fc',
          200: '#bae6fd',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: 0.8 },
          '100%': { transform: 'scale(2.2)', opacity: 0 },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
}
