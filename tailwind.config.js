/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F0',
        brand: {
          yellow: '#FFD93D',
          blue: '#6BCBFF',
          green: '#95E1A3',
          pink: '#FF8FAB',
          purple: '#CDB4DB',
        }
      },
      fontFamily: {
        bubble: ['Fredoka', 'Baloo 2', 'sans-serif'],
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'bubbly': '0 8px 0 0 rgba(0, 0, 0, 0.06)',
        'bubbly-hover': '0 4px 0 0 rgba(0, 0, 0, 0.06)',
        'bubbly-yellow': '0 8px 0 0 #E2BF2F',
        'bubbly-yellow-hover': '0 4px 0 0 #E2BF2F',
        'bubbly-blue': '0 8px 0 0 #4FAADA',
        'bubbly-blue-hover': '0 4px 0 0 #4FAADA',
        'bubbly-pink': '0 8px 0 0 #E27993',
        'bubbly-pink-hover': '0 4px 0 0 #E27993',
        'bubbly-green': '0 8px 0 0 #7AC587',
        'bubbly-green-hover': '0 4px 0 0 #7AC587',
        'bubbly-purple': '0 8px 0 0 #B49BCE',
        'bubbly-purple-hover': '0 4px 0 0 #B49BCE',
      }
    },
  },
  plugins: [],
}
