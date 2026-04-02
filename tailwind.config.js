/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kompas: {
          orange: '#E8651A',
          coral: '#F4845F',
          purple: '#9333EA',
          indigo: '#4F46E5',
        },
        lh: {
          // Canvas / layout
          bg: '#f2f4f8',
          surface: '#ffffff',
          card: '#FFFFFF',
          // Borders
          border: '#c7ced6',
          'border-light': '#e6e9ef',
          // Text — Prism tokens
          'text-primary': '#1f2124',
          'text-default': '#2e3d4b',
          'text-secondary': '#52647a',
          'text-muted': '#7a8fa3',
          // Brand / orange
          brand: '#ec470a',
          'brand-bg': '#ffe6d7',
          'brand-500': '#fb6214',
          // Neutral surface
          'neutral-bg': '#e6e9ef',
        },
        // Prism design system tokens
        prism: {
          // Primary interactive blue
          blue:       '#125fe3',
          'blue-hover': '#0e4fc4',
          'blue-pressed': '#0b3fa0',
          'blue-bg':  'rgba(5,38,105,0.06)',
          'blue-bg-hover': 'rgba(5,38,105,0.10)',
          // Text
          'text-emphasis': '#1f2124',
          'text-default':  '#2e3d4b',
          'text-subtle':   '#52647a',
          'text-muted':    '#a8b0bd',
          'text-inverse':  '#ffffff',
          'text-brand':    '#fd8237',
          // Borders
          'border-default':  '#e6e9ef',
          'border-emphasis': '#dbe0e6',
          'border-brand':    '#fd8237',
          // Surfaces
          surface:   '#ffffff',
          canvas:    '#f2f4f8',
          subdued:   '#f9fafb',
          inverse:   '#2e3d4b',
          // Status
          'error':   '#d93025',
          'warning': '#f59e0b',
          'success': '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
