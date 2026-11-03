import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0e1512',
        card: '#15201b',
        line: '#24332c',
        gold: '#e8c36a',
        sand: '#f3ece0',
        mute: '#98a69d',
        leaf: '#6fbf8e',
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(0.72)', opacity: '0.7' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(232,195,106,0.55)' },
          '100%': { boxShadow: '0 0 0 14px rgba(232,195,106,0)' },
        },
      },
      animation: {
        breathe: 'breathe 8s ease-in-out infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
