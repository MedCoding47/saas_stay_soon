/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coral: { DEFAULT: '#D85A30', light: '#fef2ef', dark: '#c94d36', deeper: '#a83a26' },
        teal: { DEFAULT: '#1a8a7a', light: '#e6f7f4', dark: '#0f6b5e', deeper: '#0a5248' },
        'teal-dark': { DEFAULT: '#0F6E56', light: '#e6f7f4' },
        warm: { DEFAULT: '#FAEEDA', alt: '#f5ede4', dark: '#f0e4d6', deeper: '#e8d4c0' },
        amber: { DEFAULT: '#f0a030', light: '#fef3e0', dark: '#d48720' },
        dark: '#1a1a2e',
        'dark-deep': '#0f0c29',
        'dark-mid': '#302b63',
        'dark-light': '#24243e',
        muted: '#8c7e74',
        'muted-light': '#b8aaa0',
        urgent: '#e8634a',
        nouveau: '#1a8a7a',
        sos: '#f0a030',
        whatsapp: '#25D366',

        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        ring: 'hsl(var(--ring))',
        border: 'hsl(var(--border))',
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
      fontSize: {
        hero: ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        h2: ['40px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        h3: ['28px', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.005em' }],
      },
      borderRadius: { '2xl': '16px', '3xl': '24px', '4xl': '32px', pill: '30px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 3px 7px rgba(0,0,0,0.03), 0 7px 15px rgba(0,0,0,0.02), 0 14px 28px rgba(0,0,0,0.02)',
        'card-hover': '0 4px 18px rgba(0,0,0,0.06), 0 2px 7px rgba(0,0,0,0.04), 0 0.8px 2.9px rgba(0,0,0,0.03), 0 0.175px 1px rgba(0,0,0,0.02)',
        'card-coral': '0 8px 30px rgba(232,99,74,0.15)',
        'glass': '0 8px 32px rgba(0,0,0,0.06)',
        'coral': '0 0 24px rgba(232,99,74,0.3)',
        'coral-subtle': '0 0 60px rgba(232,99,74,0.1)',
        'teal': '0 0 24px rgba(26,138,122,0.3)',
        'modal': '0 14px 52px rgba(0,0,0,0.08), 0 7px 15px rgba(0,0,0,0.04), 0 3px 7px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.01)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'pulse-urgent': 'pulseUrgent 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        pulseUrgent: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
