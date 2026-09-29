import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette: blue, yellow, gold
        brand: {
          50: '#eef4ff', 100: '#dce7ff', 200: '#bfd3ff', 300: '#93b4ff', 400: '#5e8bfa',
          500: '#3a66f0', 600: '#2449d6', 700: '#1d3bae', 800: '#1b3389', 900: '#1a2f6e', 950: '#111c45',
        },
        sun: { 300: '#ffe066', 400: '#ffd43b', 500: '#fab005' },
        gold: { light: '#e6c766', DEFAULT: '#c9a227', dark: '#9c7a12' },
        // Theme tokens (switch automatically in dark mode, see globals.css)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        line: 'var(--line)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
      },
    },
  },
  plugins: [],
};
export default config;
