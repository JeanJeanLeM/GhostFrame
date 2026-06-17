/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f0e8',
          100: '#ebe5dc',
          200: '#d4c4a8',
          300: '#c4a574',
          400: '#b8956a',
          500: '#c4a574',
          600: '#a68b5b',
          700: '#8b7355',
          800: '#6b5b4f',
          900: '#3d3229',
        },
        success: {
          50: '#f0f5ef',
          100: '#e0ebe0',
          500: '#7d9b7a',
          600: '#6b8c69',
          700: '#5a7a58',
          800: '#4a6848',
        },
        warning: {
          50: '#faf8f5',
          100: '#f5f0e8',
          400: '#d4c4a8',
          500: '#c4a574',
          600: '#a68b5b',
          700: '#8b7355',
          800: '#6b5b4f',
        },
        error: {
          50: '#faf5f4',
          100: '#f5ebe8',
          500: '#b85c4a',
          600: '#a04a3a',
          700: '#8a3d2e',
          800: '#6b3226',
        },
        beige: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe5dc',
          300: '#d4c4a8',
          400: '#c4a574',
          500: '#a68b5b',
          600: '#8b7355',
          700: '#6b5b4f',
          800: '#5c4d42',
          900: '#3d3229',
          950: '#2d2520',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
