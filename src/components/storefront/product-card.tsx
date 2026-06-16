'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Plus, Star } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddingToCart(true)
    await addToCart(product.id)
    setTimeout(() => setIsAddingToCart(false), 600)
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (inWishlist) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product.id)
    }
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-300">
          {/* Skeleton loader */}
          {!imageLoaded && <div className="absolute inset-0 skeleton !rounded-none" />}

          {/* Product Image */}
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-[1.2s] ease-luxury ${
                isHovered ? 'scale-[1.05]' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream-300">
              <span className="text-noir-300 text-[10px] tracking-[0.25em] uppercase">
                No Image
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-0 left-0 flex flex-col z-10">
            {product.is_on_sale && product.discount_percentage && (
              <span className="px-3 py-1.5 bg-noir-950 text-white text-[9px] font-normal tracking-[0.2em]">
                −{product.discount_percentage}%
              </span>
            )}
            {product.is_featured && (
              <span className="px-3 py-1.5 bg-white text-noir-950 text-[9px] font-normal tracking-[0.25em]">
                NEW
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center transition-all duration-500 ease-luxury ${
              inWishlist
                ? 'text-noir-950 opacity-100'
                : 'text-noir-950/70 hover:text-noir-950'
            } ${
              isHovered || inWishlist
                ? 'opacity-100 translate-y-0'
                : 'lg:opacity-0 lg:-translate-y-1'
            }`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={17}
              strokeWidth={1.25}
              fill={inWishlist ? 'currentColor' : 'none'}
              className="transition-transform duration-300 hover:scale-110"
            />
          </button>

          {/* Add to Bag — full-width bar slides up on hover */}
          {product.in_stock && (
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ease-luxury ${
                isHovered
                  ? 'opacity-100 translate-y-0'
                  : 'lg:opacity-0 lg:translate-y-full'
              }`}
            >
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full h-11 flex items-center justify-center gap-2.5 bg-white/95 backdrop-blur-sm text-noir-950 text-[10px] tracking-[0.3em] uppercase hover:bg-noir-950 hover:text-white transition-colors duration-400 disabled:opacity-70"
              >
                {isAddingToCart ? (
                  <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={13} strokeWidth={1.5} />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Sold Out Overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <span className="px-5 py-2 bg-noir-950 text-white text-[10px] tracking-[0.3em] uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-5 space-y-1.5">
          {/* Category */}
          {product.category && (
            <p className="text-[9px] text-noir-400 uppercase tracking-[0.3em]">
              {product.category.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-display text-base text-noir-950 line-clamp-1 group-hover:italic transition-all duration-300">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2.5">
            <span className="text-xs tracking-[0.08em] text-noir-950 font-light">
              {formatPrice(product.price)}
            </span>
            {product.is_on_sale && product.compare_at_price && (
              <span className="text-xs tracking-[0.08em] text-noir-400 line-through font-light">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex items-center gap-px">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={10}
                    strokeWidth={1}
                    className={
                      star <= Math.round(product.average_rating || 0)
                        ? 'text-noir-950 fill-noir-950'
                        : 'text-noir-300'
                    }
                  />
                ))}
              </div>
              <span className="text-[9px] text-noir-400 tracking-wide">
                ({product.review_count})
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
