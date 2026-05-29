/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f4f5',
        panel: '#ffffff',
        ink: '#18181b',
        muted: '#71717a',
        line: '#e4e4e7',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'btn-primary': 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
        'grad-sprint': 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
        'grad-branch': 'linear-gradient(135deg, #5eead4 0%, #0d9488 100%)',
        'grad-global': 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
      },
    },
  },
  plugins: [],
}
