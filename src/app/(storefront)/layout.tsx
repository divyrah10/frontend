import { Header } from '@/components/storefront/header'
import { Footer } from '@/components/storefront/footer'
import { MetaPixel } from '@/components/meta-pixel'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MetaPixel />
    </div>
  )
}
