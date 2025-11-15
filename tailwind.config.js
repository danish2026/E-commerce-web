/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        muted: 'var(--muted)',
        accent: {
          1: 'var(--accent-1)',
          2: 'var(--accent-2)',
        },
        brand: 'rgb(var(--brand-rgb) / <alpha-value>)',
        glass: 'var(--glass)',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
      },
    },
  },
  plugins: [],
};

