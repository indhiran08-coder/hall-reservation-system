/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          50:  '#f0f4fb',
          100: '#e0ebf7',
          200: '#c5d8f0',
          300: '#9cbde6',
          400: '#699adb',
          500: '#437cd0',
          600: '#2957a4',
          700: '#224789',
          800: '#1e3c72',
          900: '#1d345e',
          950: '#12203c'
        }
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)'
      }
    }
  },
  plugins: []
};
