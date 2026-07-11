export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F3EC',
        forest: {
          DEFAULT: '#1F3327',
          light: '#2C4736',
          dark: '#132119'
        },
        blush: '#E3B4B0',
        gold: '#C9A227',
        ink: '#2B2620'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace']
      },
      borderRadius: {
        seal: '999px'
      }
    }
  },
  plugins: []
};
