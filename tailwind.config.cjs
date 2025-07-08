/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tezos: {
          blue: '#2C7DF7',
          'blue-light': '#5D9BFF',
          'gray-dark': '#1a202c',
          'gray-medium': '#2d3748',
          'gray-light': '#4a5568',
          'text-primary': '#e2e8f0',
          'text-secondary': '#a0aec0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 