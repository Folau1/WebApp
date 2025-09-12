/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: 'var(--tg-theme-bg-color)',
          text: 'var(--tg-theme-text-color)',
          hint: 'var(--tg-theme-hint-color)',
          link: 'var(--tg-theme-link-color)',
          button: 'var(--tg-theme-button-color)',
          'button-text': 'var(--tg-theme-button-text-color)',
          'secondary-bg': 'var(--tg-theme-secondary-bg-color)',
          'header-bg': 'var(--tg-theme-header-bg-color)',
          'accent-text': 'var(--tg-theme-accent-text-color)',
          'section-bg': 'var(--tg-theme-section-bg-color)',
          'section-header-text': 'var(--tg-theme-section-header-text-color)',
          'subtitle-text': 'var(--tg-theme-subtitle-text-color)',
          'destructive-text': 'var(--tg-theme-destructive-text-color)',
        }
      }
    },
  },
  plugins: [],
}
