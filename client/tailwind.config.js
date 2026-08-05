import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        freelancer: {
          primary: '#00564C',
          light: '#008B7D'
        },
        client: {
          primary: '#FB9E01',
          dark: '#CC8102'
        }
      }
    }
  },
  plugins: [typography]
};
