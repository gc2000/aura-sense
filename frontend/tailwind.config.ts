import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Aura dark theme palette
        aura: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3d',
          accent: '#6c63ff',
          'accent-glow': '#6c63ff40',
          'accent-dim': '#4a45b0',
          cyan: '#00d4ff',
          'cyan-glow': '#00d4ff30',
          green: '#00ff88',
          'green-glow': '#00ff8830',
          red: '#ff4444',
          'red-glow': '#ff444430',
          amber: '#ffaa00',
          text: '#e8e8f0',
          'text-dim': '#8888aa',
          'text-muted': '#555570',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        // "Breathing" animations
        breathe: 'breathe 3s ease-in-out infinite',
        'breathe-fast': 'breathe 1.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px #6c63ff40' },
          '50%': { boxShadow: '0 0 60px #6c63ff80, 0 0 100px #6c63ff30' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(100%)' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 30px #6c63ff50',
        'glow-cyan': '0 0 30px #00d4ff50',
        'glow-green': '0 0 30px #00ff8850',
        'glow-red': '0 0 30px #ff444450',
      },
    },
  },
  plugins: [
    ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) => {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
        '.pb-safe': {
          'padding-bottom': 'max(2rem, env(safe-area-inset-bottom))',
        },
        '.safe-top': {
          'padding-top': 'max(0px, env(safe-area-inset-top))',
        },
      })
    },
  ],
}

export default config
