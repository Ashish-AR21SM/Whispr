/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#e0d4ff',
          200: '#c3a9ff',
          300: '#a47eff',
          400: '#8553ff',
          500: '#6728ff',
          600: '#5620cc',
          700: '#421899',
          800: '#2d1066',
          900: '#190833'
        },
        secondary: {
          100: '#d0e8ff',
          200: '#a1d1ff',
          300: '#72baff',
          400: '#43a3ff',
          500: '#148cff',
          600: '#0970cc',
          700: '#075499',
          800: '#043866',
          900: '#021c33'
        },
        dark: {
          300: '#3a3f5c',
          400: '#2e324a',
          500: '#222538',
          600: '#1a1c2e',
          700: '#141524',
          800: '#0e0e1a',
          900: '#080810'
        }
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [],
};
