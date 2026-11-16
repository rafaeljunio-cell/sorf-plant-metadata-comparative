/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sorf: {
          dark: '#0f291e',
          primary: '#15803d',
          accent: '#22c55e',
          light: '#f0fdf4',
          manual: '#2563eb',
          ia: '#ea580c',
          diff: '#fee2e2',
          diffText: '#b91c1c',
        }
      }
    },
  },
  plugins: [],
}
