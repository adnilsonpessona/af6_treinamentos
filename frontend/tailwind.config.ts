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
        // Paleta de cores moderna para LMS
        brand: {
          primary: '#0056b3',      // Azul corporativo (#0056b3)
          dark: '#0f172a',         // Slate-900 para áreas de foco (player)
          success: '#10b981',      // Emerald-500 para progresso e conclusão
          surface: '#f9fafb',      // Zinc-50 para áreas de leitura (fundo claro)
          border: '#e4e4e7',       // Zinc-200 para bordas sutis
          text: '#18181b',         // Zinc-900 para texto
          light: '#fafafa',        // Branco suave
          accent: '#059669',       // Emerald-600 para hover em progresso
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
        'gradient-progress': 'linear-gradient(90deg, #0056b3 0%, #0f172a 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #0056b3 0%, #0f172a 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px 0 rgba(0, 86, 179, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
