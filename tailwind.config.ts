import { _width } from '#tailwind-config/theme'
import { _width } from '#tailwind-config/theme'
import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      backgroundColor: {
        'main-blue': '#00041e',
        'second-blue': '#001FD2',
        'third-blue': '#0FA2FF',
      },
      colors: {
        'main-blue': '#00041e',
        'second-blue': '#001FD2',
        'third-blue': '#0FA2FF',
        'warning-red': '#F80113',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        title: ['Anton'],
      },
      textStrokeWidth: {
        '1': '0.1px',
      },
      textStrokeColor: {
        'main-blue': '#00041e',
        'second-blue': '#001FD2',
        'third-blue': '#0FA2FF',
      },
      aspectRatio: {
        '960/300': '960 / 300',
        '900/200': '900 / 200',
      },
      backgroundImage: {
        wave1: "url('/img/wave1.svg')",
        wave2: "url('/img/wave2.svg')",
        wave3: "url('/img/wave3.svg')",
        showcase: "url('/img/showcase.png')",
        'custom-gradient':
          'linear-gradient(to right, #00041e 95%, #154c79 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hidden': {
          '-ms-overflow-style': 'none' /* IE and Edge */,
          'scrollbar-width': 'none' /* Firefox */,
        },
        '.scrollbar-hidden::-webkit-scrollbar': {
          display: 'none' /* Chrome, Safari, and Opera */,
        },
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
} satisfies Config
