import type { Config } from 'tailwindcss'

const defaultFonts = [
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Helvetica Neue',
  'Arial',
  '"Noto Sans"',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
]

export default (<Partial<Config>>{
  theme: {
    fontFamily: {
      sans: ['"JetBrains+Mono"', ...defaultFonts],
    },
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        logo: ['Rubik', ...defaultFonts],
      },
      boxShadow: {
        soft: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
        harder: 'rgba(0, 0, 0, 0.15) 0px 2px 8px',
      },
      colors: {
        background: 'var(--background)',
        'card-background': 'var(--card-background)',
        'input-background': 'var(--input-background)',
        text: 'var(--text)',
        'card-text': 'var(--card-text)',
        'main-brand': 'var(--main-brand)',
        'main-brand-hover': 'var(--main-brand-hover)',
        'light-shades': 'var(--light-shades)',
        'light-accent': 'var(--light-accent)',
        'light-accent-hover': 'var(--light-accent-hover)',
        'dark-accent': 'var(--dark-accent)',
        'dark-accent-hover': 'var(--dark-accent-hover)',
        'dark-shades': 'var(--dark-shades)',
        default: 'var(--default)',
        success: 'var(--success)',
        'success-hover': 'var(--success-hover)',
        warning: 'var(--warning)',
        'warning-hover': 'var(--warning-hover)',
        danger: 'var(--danger)',
        'danger-hover': 'var(--danger-hover)',
        info: 'var(--info)',
        'info-hover': 'var(--info-hover)',
        border: 'var(--border)',
        'disabled-background': 'var(--disabled-background)',
        'disabled-text': 'var(--disabled-text)',
        'disabled-border': 'var(--disabled-border)',
        placeholder: 'var(--placeholder)',
        'placeholder-disabled': 'var(--placeholder-disabled)',
        translucent: 'var(--translucent)',
        'modal-background': 'var(--modal-background)',
      },
    },
  },
  safelist: [
    {
      pattern: /(bg|text)-(light|dark)-(.*)/,
      variants: ['hover'],
    },
  ],
})
