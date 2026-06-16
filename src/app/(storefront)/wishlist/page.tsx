'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const { items, fetchWishlist, removeFromWishlist, isLoading } = useWishlistStore()
  const { addToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated])

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId)
    await removeFromWishlist(productId)
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-accent-300 mb-6" />
        <h1 className="font-display text-2xl mb-4">Sign in to view your wishlist</h1>
        <p className="text-accent-500 mb-8">Save your favorite items and access them anytime.</p>
        <Link href="/login?redirect=/wishlist">
          <Button size="lg">Sign In</Button>
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-accent-300 mb-6" />
        <h1 className="font-display text-2xl mb-4">Your wishlist is empty</h1>
        <p className="text-accent-500 mb-8">Start adding items you love to your wishlist.</p>
        <Link href="/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl mb-8">My Wishlist ({items.length})</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <Link href={`/products/${item.product_slug}`}>
              <div className="relative aspect-[3/4] bg-accent-50 mb-4">
                {item.product_image ? (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-accent-300">
                    No Image
                  </div>
                )}

                {!item.in_stock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              <h3 className="text-sm font-medium line-clamp-1">{item.product_name}</h3>
              <p className="text-sm mt-1">{formatPrice(item.product_price)}</p>
            </Link>

            <div className="mt-3 flex gap-2">
              {item.in_stock ? (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(item.product_id)}
                  disabled={isLoading}
                >
                  <ShoppingBag size={14} className="mr-1" />
                  Add to Bag
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="flex-1" disabled>
                  Out of Stock
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeFromWishlist(item.product_id)}
                disabled={isLoading}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
