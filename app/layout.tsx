import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWARegister from '@/components/PWARegister'

export const metadata: Metadata = {
  title: 'Pare de Fumar',
  description: 'Pequenas escolhas. Um novo amanhã.',
  manifest: '/manifest.json',
  icons: { icon: '/icon-192.png', apple: '/apple-icon.png' },
  appleWebApp: { capable: true, title: 'Pare de Fumar', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#0e1512',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">
        <PWARegister />
        <div className="mx-auto min-h-dvh max-w-md">{children}</div>
      </body>
    </html>
  )
}
