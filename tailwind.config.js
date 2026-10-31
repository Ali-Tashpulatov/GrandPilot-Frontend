/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // No darkMode: 'class' needed — we drive theming purely via CSS vars + data-theme attribute
  theme: {
    extend: {
      colors: {
        brand: {
          // All resolved via CSS custom properties so dark/light toggling is automatic
          bg:              'var(--brand-bg)',
          sidebar:         'var(--brand-sidebar)',
          card:            'var(--brand-card)',
          'card-hover':    'var(--brand-card-hover)',
          // Accent colors stay fixed in both themes
          cyan:            '#22D3EE',
          'cyan-light':    '#67E8F9',
          'cyan-dark':     '#06B6D4',
          // Backward-compatible aliases
          purple:          '#22D3EE',
          'purple-light':  '#67E8F9',
          // Semantic status colors stay fixed
          success:         '#34D399',
          warning:         '#FBBF24',
          danger:          '#FB7185',
          // Text & border resolved from CSS vars
          text:            'var(--brand-text)',
          'text-secondary':'var(--brand-text-secondary)',
          'text-muted':    'var(--brand-text-muted)',
          border:          'var(--brand-border)',
          'border-subtle': 'var(--brand-border-subtle)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-cyan':        'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        'gradient-cyan-blue':   'linear-gradient(135deg, #0284C7 0%, #22D3EE 100%)',
        'gradient-purple-cyan': 'linear-gradient(135deg, #0EA5E9 0%, #22D3EE 100%)',
        'gradient-card':        'linear-gradient(180deg, rgba(19, 30, 54, 0.8) 0%, rgba(19, 30, 54, 0.4) 100%)',
      },
      boxShadow: {
        'cyan-sm':     '0 0 10px rgba(34, 211, 238, 0.2)',
        'cyan-md':     '0 0 20px rgba(34, 211, 238, 0.25)',
        'cyan-subtle': '0 0 15px rgba(34, 211, 238, 0.12)',
        'card-active': '0 0 0 1px #22D3EE, 0 0 16px rgba(34, 211, 238, 0.18)',
        // Light mode card shadow
        'card-light':  '0 1px 6px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan':  'glowCyan 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glowCyan: {
          '0%':   { boxShadow: '0 0 6px rgba(34, 211, 238, 0.2)' },
          '100%': { boxShadow: '0 0 18px rgba(34, 211, 238, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
