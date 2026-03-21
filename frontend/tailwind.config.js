/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'plus-jakarta': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // Essential colors if they are used in the components
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ...
        }
      }
    },
  },
  plugins: [],
}
