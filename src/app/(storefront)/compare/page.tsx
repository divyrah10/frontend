'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { compareApi } from '@/lib/api'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([])
  const load = async () => setProducts((await compareApi.get()).data)
  useEffect(() => { load() }, [])
  const remove = async (id: string) => { await compareApi.remove(id); await load() }

  return (
    <div className="min-h-screen bg-cream-50 pt-28 pb-20">
      <div className="container mx-auto px-4">
        <p className="text-luxury-caps text-noir-400 mb-4">Side by side</p><h1 className="font-display text-5xl lg:text-7xl mb-12">Compare pieces</h1>
        {!products.length ? <div className="py-24 text-center border-y border-noir-950/10"><p className="text-noir-500 mb-6">Your comparison is empty.</p><Link href="/products"><Button>Browse collection</Button></Link></div> : (
          <div className="overflow-x-auto"><div className="grid gap-px bg-noir-950/10" style={{gridTemplateColumns:`repeat(${products.length}, minmax(240px, 1fr))`}}>
            {products.map(product => <article key={product.id} className="bg-cream-50 p-5 relative"><button onClick={() => remove(product.id)} className="absolute z-10 top-7 right-7 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center" aria-label={`Remove ${product.name}`}><X size={14}/></button><Link href={`/products/${product.slug}`}><div className="relative aspect-[3/4] bg-noir-100 mb-5">{product.images[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}</div><h2 className="text-2xl">{product.name}</h2></Link><p className="mt-2">{formatPrice(product.price)}</p><dl className="mt-6 text-sm divide-y divide-noir-950/10"><div className="py-3 flex justify-between"><dt>Stock</dt><dd>{product.in_stock ? 'Available' : 'Sold out'}</dd></div><div className="py-3 flex justify-between"><dt>Rating</dt><dd>{product.average_rating?.toFixed(1) || 'New'}</dd></div><div className="py-3"><dt className="text-noir-400 mb-2">Details</dt><dd>{product.short_description || 'A signature NOT JUST DARK piece.'}</dd></div></dl></article>)}
          </div></div>
        )}
      </div>
    </div>
  )
}
