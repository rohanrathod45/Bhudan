/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          500: '#1d4ed8',
          600: '#1e40af',
          700: '#1e3a8a',
          800: '#172554',
          900: '#0f172a',
        },
        risk: {
          green: '#16a34a',
          yellow: '#ca8a04',
          orange: '#ea580c',
          red: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};