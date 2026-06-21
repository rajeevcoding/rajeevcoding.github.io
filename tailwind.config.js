import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // primary indigo
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        accent: {
          pink:   '#EC4899',
          teal:   '#14B8A6',
          amber:  '#F59E0B',
          violet: '#8B5CF6',
        },
        surface: {
          light:  '#F8FAFC',
          card:   '#FFFFFF',
          dark:   '#0F172A',
          'dark-card': '#1E293B',
          'dark-elevated': '#334155',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'aurora': 'linear-gradient(135deg, #6366F1 0%, #EC4899 50%, #14B8A6 100%)',
        'aurora-soft': 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(236,72,153,0.1) 50%, rgba(20,184,166,0.15) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow':  'glow 3s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%':   { opacity: 0.4 },
          '100%': { opacity: 0.8 },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [typography],
};
