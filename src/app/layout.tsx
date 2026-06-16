import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'NOT JUST DARK - Where Darkness Meets Elegance',
  description: 'Bold fashion for those who embrace individuality. Discover curated luxury fashion where darkness meets elegance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
