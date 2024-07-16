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
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        title: ['Anton'],
        title2: ['Montserrat'],
      },
      textStrokeWidth: {
        '1': '0.1px',
      },
      textStrokeColor: {
        black: '#000',
        white: '#fff',
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
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme, e }) {
      const textStrokeWidth = theme('textStrokeWidth', {})
      const textStrokeColor = theme('textStrokeColor', {})

      const utilities = {}

      for (const key in textStrokeWidth) {
        utilities[`.${e(`text-stroke-${key}`)}`] = {
          WebkitTextStrokeWidth: textStrokeWidth[key],
          textStrokeWidth: textStrokeWidth[key],
        }
      }

      for (const key in textStrokeColor) {
        const value = textStrokeColor[key]

        utilities[`.${e(`text-stroke-${key}`)}`] = {
          WebkitTextStrokeColor: value,
          textStrokeColor: value,
        }
      }
      addUtilities(utilities, ['responsive', 'hover'])
    },
  ],
} satisfies Config
