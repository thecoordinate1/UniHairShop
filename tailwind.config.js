/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFB800',
          hover: '#E5A400'
        },
        secondary: '#00C853',
        accent: '#FF3E6C',
        darkBg: '#0F172A',
        cardBg: '#1E293B',
        cardHover: '#334155'
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
