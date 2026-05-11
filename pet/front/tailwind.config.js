/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coral: { DEFAULT: '#D85A30', light: '#E87A50', dark: '#B84A20' },
        teal: { DEFAULT: '#1D9E75', light: '#3DB895', dark: '#0D7E55' },
        warm: { DEFAULT: '#FAEEDA', light: '#FDF8F0', dark: '#F0E0C0' },
        dark: '#1A1A2E',
        'dark-deep': '#0F0C29',
        'dark-mid': '#302B63',
        'dark-light': '#24243e',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: {
        hero: ['80px', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }],
        h2: ['48px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.12)',
        glow: '0 0 30px rgba(216,90,48,0.5)',
        'glow-subtle': '0 0 60px rgba(216,90,48,0.15)',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
