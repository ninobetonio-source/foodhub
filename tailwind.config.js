/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'fh-bg': '#000000',
        'fh-card': '#141414',
        'fh-elevated': '#1F1F1F',
        'fh-border': '#333333',
        'fh-text': '#FFFFFF',
        'fh-muted': '#999999',
        'fh-accent': '#FF9900',
        'fh-danger': '#E24B4A',
        'fh-success': '#3B6D11'
      },
      boxShadow: {
        glow: '0 0 40px rgba(245,166,35,0.12)'
      },
      fontFamily: {
        heading: ['Satoshi', 'Cabinet Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'sans-serif']
      },
      backgroundImage: {
        'fh-hero-grad': 'linear-gradient(90deg, rgba(13,13,15,0.72) 0%, rgba(13,13,15,0.0) 55%)'
      },
      transitionDuration: {
        200: '200ms'
      }
    }
  },
  plugins: []
};