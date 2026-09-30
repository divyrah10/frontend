import type { Metadata } from 'next'
import { Suspense } from 'react'

import { EarlyAccessClient } from './early-access-client'

export const metadata: Metadata = {
  title: 'Private Preview | NOT JUST DARK',
  description: 'Enter the NOT JUST DARK private collection before the public release.',
  robots: { index: false, follow: false },
}

export default function EarlyAccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-noir-950" />}>
      <EarlyAccessClient />
    </Suspense>
  )
}
