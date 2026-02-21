/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'linkedin-primary': '#0A66C2',
        'linkedin-primary-light': '#70B5F9',
        'linkedin-primary-lighter': '#D0E8FF',
        'linkedin-primary-dark': '#084EA0',
        'linkedin-bg': '#F3F2EF',
        'linkedin-surface': '#FFFFFF',
        'linkedin-surface-alt': '#EEF3F8',
        'linkedin-text': '#191919',
        'linkedin-text-muted': '#666666',
        'linkedin-text-light': '#8E8E8E',
        'linkedin-green': '#057642',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
