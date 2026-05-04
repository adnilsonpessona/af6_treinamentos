import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Paleta Índigo + Verde do design system LMS.
        brand: {
          primary: '#3730A3',
          dark: '#111827',
          success: '#16A34A',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          text: '#1E293B',
          light: '#EEF2FF',
          accent: '#FEF3C7',
        }
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl-lg': '1rem',
      },
      lineHeight: {
        'relaxed': '1.75',
        'looser': '2',
      },
      backgroundImage: {
        'gradient-progress': 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #3730A3 0%, #6366F1 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px 0 rgba(55, 48, 163, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
