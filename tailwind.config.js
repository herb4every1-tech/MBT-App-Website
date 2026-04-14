/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-primary': '#4A7C59',
        'accent-light': '#D4E6DA',
        'accent-glow': '#EBF4EE',
        'mbt-green': '#5e8d75',
        'mbt-dark': '#3a5445',
        'mbt-bg-soft': '#f8faf9',
        'brand-green': '#5F8D77',
        'brand-green-dark': '#4D7361',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"DM Serif Display"', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
