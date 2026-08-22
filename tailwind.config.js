/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appleBlue: {
          DEFAULT: '#007AFF',
          hover: '#0062CC',
          light: '#3395FF'
        },
        appleDark: {
          DEFAULT: '#0A0A0C',
          surface: '#121217',
          card: '#1A1A22',
          elevated: '#242430'
        },
        primary: {
          DEFAULT: '#F5A623',
          hover: '#E09418'
        },
        secondary: '#34C759',
        accent: '#FF2D55',
        glassBorder: 'rgba(255, 255, 255, 0.12)',
        glassBg: 'rgba(255, 255, 255, 0.05)'
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'sans-serif']
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px'
      },
      boxShadow: {
        'apple-glass': '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'apple-blue': '0 10px 30px -5px rgba(0, 122, 255, 0.4)',
        'apple-gold': '0 10px 30px -5px rgba(245, 166, 35, 0.35)'
      },
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    },
  },
  plugins: [],
}
