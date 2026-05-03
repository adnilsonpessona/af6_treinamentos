import type { Metadata } from 'next'
import { Manrope, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-ui',
  weight: ['400', '500', '600', '700', '800'],
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-reading',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Plataforma de Treinamentos',
  description: 'Plataforma corporativa de treinamentos',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${manrope.variable} ${sourceSerif.variable} min-h-screen bg-brand-canvas text-brand-text font-sans antialiased leading-relaxed`}>
        {children}
      </body>
    </html>
  )
}
