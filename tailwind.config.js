/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        oxblu: {
          100: '#11244A',
          200: '#0B1C3E',
          300: '#061831',
          400: '#051024',
          500: '#030A1C',
        },
        oxblu1: "rgba(17, 36, 74,0.2)",   // #11244a8e
        oxblu2: "rgba(11, 28, 62,0.2)",   // #0B1C3E
        oxblu3: "rgba(6, 24, 49,0.2)",    // #061831
        oxblu4: "rgba(5, 16, 36,0.2)",    // #051024
        oxblu5: "rgba(3, 10, 28,0.2)",    // #030A1C
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
