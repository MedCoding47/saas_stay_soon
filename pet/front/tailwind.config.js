/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FAF7F2', dark: '#F0EBE1', deeper: '#E8DDD0' },
        ink: { DEFAULT: '#0D0D0D', mid: '#2A2A2A', light: '#4A4A4A' },
        coral: { DEFAULT: '#D85A30', light: '#fef2ef', dark: '#c94d36', deeper: '#a83a26' },
        teal: { DEFAULT: '#1a8a7a', light: '#e6f7f4', dark: '#0f6b5e' },
        warm: { DEFAULT: '#FAEEDA', alt: '#f5ede4' },
        amber: { DEFAULT: '#f0a030', light: '#fef3e0' },
        muted: '#8c7e74',
        'muted-light': '#b8aaa0',
        border: '#E8E0D8',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(72px,11vw,150px)', { lineHeight: '0.9', fontWeight: '900', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(56px,8vw,110px)', { lineHeight: '0.92', fontWeight: '900', letterSpacing: '-0.035em' }],
        'display-md': ['clamp(40px,6vw,72px)', { lineHeight: '0.95', fontWeight: '700', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(32px,4vw,48px)', { lineHeight: '1.0', fontWeight: '700', letterSpacing: '-0.02em' }],
        hero: ['56px', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }],
        h2: ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        h3: ['28px', { lineHeight: '1.3', fontWeight: '600' }],
      },
      borderRadius: {
        '2xl': '16px', '3xl': '24px', '4xl': '32px', pill: '9999px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.1)',
        coral: '0 8px 24px rgba(216,90,48,0.3)',
        teal: '0 8px 24px rgba(26,138,122,0.3)',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-16px)' } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};
