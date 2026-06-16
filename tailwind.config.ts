import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Noir Luxe - Primary Dark Palette
        noir: {
          50: '#f7f7f8',
          100: '#ededf0',
          200: '#d8d8dd',
          300: '#b5b5be',
          400: '#8c8c99',
          500: '#6e6e7a',
          600: '#585864',
          700: '#484851',
          800: '#3e3e45',
          900: '#26262c',
          950: '#0c0c0e',
        },
        // Warm Ivory Cream Palette
        cream: {
          50: '#fffefb',
          100: '#fefcf7',
          200: '#fcfaf5',
          300: '#f9f6f0',
          400: '#f5f1e8',
          500: '#ebe5d9',
          600: '#d4cdc0',
          700: '#b3aa9c',
          800: '#8f8679',
          900: '#6b6358',
        },
        // Luxurious Gold Accent
        gold: {
          50: '#fdfbf3',
          100: '#faf5e1',
          200: '#f4e9c2',
          300: '#ebd89a',
          400: '#e0c36d',
          500: '#d4af37', // Primary gold
          600: '#c19a2e',
          700: '#a17d26',
          800: '#836326',
          900: '#6c5123',
          950: '#3d2c11',
        },
        // Rose/Burgundy Accent
        rose: {
          50: '#fdf3f4',
          100: '#fce7e9',
          200: '#f9d2d6',
          300: '#f4adb5',
          400: '#ec7d8c',
          500: '#b46470', // Muted rose
          600: '#9b4654',
          700: '#823946',
          800: '#6d3240',
          900: '#5e2e3b',
          950: '#34151c',
        },
        // Legacy support - mapping old colors to new
        primary: {
          50: '#fdfbf3',
          100: '#faf5e1',
          200: '#f4e9c2',
          300: '#ebd89a',
          400: '#e0c36d',
          500: '#d4af37',
          600: '#c19a2e',
          700: '#a17d26',
          800: '#836326',
          900: '#6c5123',
        },
        accent: {
          50: '#f7f7f8',
          100: '#ededf0',
          200: '#d8d8dd',
          300: '#b5b5be',
          400: '#8c8c99',
          500: '#6e6e7a',
          600: '#585864',
          700: '#484851',
          800: '#3e3e45',
          900: '#1a1a1e',
        },
        // Special luxury colors
        luxury: {
          gold: '#d4af37',
          champagne: '#f7e7ce',
          ivory: '#fffefb',
          charcoal: '#26262c',
          obsidian: '#0c0c0e',
          bronze: '#cd7f32',
          pearl: '#f5f5f1',
        }
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Archivo', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Bodoni Moda', 'Didot', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Archivo', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-down': 'fadeInDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      boxShadow: {
        'sm': '0 2px 8px -2px rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.06)',
        'DEFAULT': '0 4px 16px -4px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.06)',
        'md': '0 8px 24px -6px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.08)',
        'lg': '0 20px 50px -12px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(0,0,0,0.12)',
        'xl': '0 32px 64px -16px rgba(0,0,0,0.28), 0 16px 40px -12px rgba(0,0,0,0.16)',
        '2xl': '0 48px 100px -20px rgba(0,0,0,0.35), 0 24px 60px -16px rgba(0,0,0,0.2)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
        'inner': 'inset 0 2px 4px rgba(0,0,0,0.08)',
        'glow': '0 0 40px -10px rgba(212, 175, 55, 0.4)',
        'glow-lg': '0 0 60px -15px rgba(212, 175, 55, 0.5)',
        'dark': '0 20px 50px -12px rgba(0,0,0,0.5), 0 8px 24px -8px rgba(0,0,0,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.08)',
        'card-hover': '0 1px 3px rgba(0,0,0,0.04), 0 20px 40px -12px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-noir': 'linear-gradient(135deg, #0c0c0e 0%, #1a1a1e 50%, #26262c 100%)',
        'gradient-gold': 'linear-gradient(135deg, #a17d26 0%, #d4af37 50%, #ebd89a 100%)',
        'gradient-luxury': 'linear-gradient(180deg, #fcfaf5 0%, #fffefb 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
      },
      aspectRatio: {
        'portrait': '3 / 4',
        'landscape': '4 / 3',
        'wide': '16 / 9',
        'ultrawide': '21 / 9',
        'golden': '1.618 / 1',
      },
    },
  },
  plugins: [],
}
export default config
