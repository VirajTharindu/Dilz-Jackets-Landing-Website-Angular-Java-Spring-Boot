/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        jackets: {
          matte: '#121212',
          carbon: '#2a2a2a',
          neon: '#ff4500',
          yellow: '#e6ff00'
        },
        biker: {
          matte: '#121212',
          carbon: '#2a2a2a',
          neon: '#ff4500',
          yellow: '#e6ff00'
        }
      }
    },
  },
  plugins: [],
}