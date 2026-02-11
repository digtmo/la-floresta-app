/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blossom: {
          50: '#fff1f5',
          100: '#ffe4eb',
          200: '#fecdd8',
          300: '#fda4b8',
          400: '#fb718f',
          500: '#f43f6f',
          600: '#e11d56'
        }
      },
      boxShadow: {
        soft: '0 12px 30px -15px rgba(148, 163, 184, 0.6)'
      }
    }
  },
  plugins: []
};
