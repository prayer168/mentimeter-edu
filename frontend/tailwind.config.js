/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wordPop: {
          '0%':   { opacity: '0', transform: 'scale(0.3)' },
          '70%':  { opacity: '1', transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        wordPop: 'wordPop 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
