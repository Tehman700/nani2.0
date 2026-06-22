/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface:                    '#f9f9f9',
        'surface-dim':              '#dadada',
        'surface-container-low':    '#f3f3f4',
        'surface-container':        '#eeeeee',
        'surface-container-high':   '#e8e8e8',
        'surface-container-highest':'#e2e2e2',
        'on-surface':               '#1a1c1c',
        'on-surface-variant':       '#4c4546',
        outline:                    '#7e7576',
        'outline-variant':          '#cfc4c5',
        primary:                    '#000000',
        'on-primary':               '#ffffff',
        secondary:                  '#5d5f5f',
        'secondary-container':      '#dcdddd',
        error:                      '#ba1a1a',
        'error-container':          '#ffdad6',
        'inverse-surface':          '#2f3131',
        'inverse-on-surface':       '#f0f1f1',
      },
      borderRadius: {
        DEFAULT: '0px',
        sm:      '0px',
        md:      '0px',
        lg:      '0px',
        xl:      '0px',
        '2xl':   '0px',
        '3xl':   '0px',
        full:    '9999px',
      },
      fontFamily: {
        display: ['Hanken Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: 0.7 },
          '100%': { transform: 'scale(2.4)', opacity: 0   },
        },
        'slide-in-x': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)'    },
        },
      },
      animation: {
        'fade-in-up':  'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-ring':  'pulse-ring 1.6s ease-out infinite',
        'slide-in-x':  'slide-in-x 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
