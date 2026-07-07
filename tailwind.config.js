/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'filter-hide': '1010px',
      },
      fontFamily: {
        'albert': ['Albert Sans', 'sans-serif'],
      },
      colors: {
        'announcement': '#2c3bc5',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
