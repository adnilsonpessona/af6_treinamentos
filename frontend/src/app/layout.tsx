import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plataforma de Treinamentos',
  description: 'Plataforma corporativa de treinamentos',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="min-h-screen bg-brand-canvas text-brand-text font-sans antialiased leading-relaxed">
        {children}
      </body>
    </html>
  )
}
