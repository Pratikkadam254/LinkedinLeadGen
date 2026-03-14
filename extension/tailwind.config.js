/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        leadflow: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#a78bfa',
          dark: '#1e1b4b',
          light: '#e0e7ff',
        },
      },
    },
  },
  plugins: [],
};
