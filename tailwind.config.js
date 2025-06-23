/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./Components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary:{
          50: '#e0f2f2',
          100: '#1a9c94',
          200: '#2ec4b6',
          300: '#156b66',
        }
      }
    },
  },
  plugins: [],
}