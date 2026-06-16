'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/storefront/product-card'
import { productsApi, reviewsApi } from '@/lib/api'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { Product, Review, ReviewStats } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')

  const { addToCart, isLoading: cartLoading } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const inWishlist = product ? isInWishlist(product.id) : false

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const response = await productsApi.getBySlug(slug as string)
        setProduct(response.data)

        // Fetch reviews
        const [reviewsRes, statsRes] = await Promise.all([
          reviewsApi.getForProduct(response.data.id),
          reviewsApi.getStats(response.data.id),
        ])
        setReviews(reviewsRes.data)
        setReviewStats(statsRes.data)

        // Fetch related products
        if (response.data.category) {
          const relatedRes = await productsApi.list({
            category_id: response.data.category.id,
            page_size: 4,
          })
          setRelatedProducts(relatedRes.data.items.filter((p: Product) => p.id !== response.data.id))
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, quantity)
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    if (product) {
      if (inWishlist) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist(product.id)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-32 lg:pt-36">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="aspect-square bg-noir-100 animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 bg-noir-100 w-1/4 animate-pulse rounded" />
              <div className="h-8 bg-noir-100 w-3/4 animate-pulse rounded" />
              <div className="h-6 bg-noir-100 w-1/3 animate-pulse rounded" />
              <div className="h-32 bg-noir-100 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50 pt-32 lg:pt-36">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-display mb-4 text-noir-900">Product Not Found</h1>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-32 lg:pt-36">
      <div className="container mx-auto px-4 pb-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-noir-500 mb-8">
        <Link href="/" className="hover:text-noir-900 transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-noir-900 transition-colors">Products</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-noir-900 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-noir-900 font-medium">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-cream-100 mb-4 rounded-lg overflow-hidden shadow-lg">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-noir-300">
                No Image
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_on_sale && <Badge variant="sale">-{product.discount_percentage}%</Badge>}
              {product.is_featured && <Badge>NEW</Badge>}
              {!product.in_stock && <Badge variant="secondary">SOLD OUT</Badge>}
            </div>

            {/* Navigation arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md"
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md"
                  onClick={() => setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-20 h-20 shrink-0 border-2 ${selectedImage === index ? 'border-accent-900' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image src={image} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-xs text-gold-600 uppercase tracking-[0.15em] font-medium mb-3">
              {product.category.name}
            </p>
          )}

          <h1 className="font-display text-3xl lg:text-4xl text-noir-900 mb-4">{product.name}</h1>

          {/* Rating */}
          {reviewStats && reviewStats.total_reviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= Math.round(reviewStats.average_rating) ? 'text-gold-500 fill-gold-500' : 'text-noir-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-noir-500">
                {reviewStats.average_rating.toFixed(1)} ({reviewStats.total_reviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-display text-noir-900">{formatPrice(product.price)}</span>
            {product.is_on_sale && product.compare_at_price && (
              <span className="text-lg text-noir-400 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-noir-600 mb-6 leading-relaxed">{product.short_description}</p>
          )}

          {/* Quantity and Add to Cart */}
          {product.in_stock ? (
            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-noir-700">Quantity:</span>
                <div className="flex items-center border border-noir-200 rounded-lg overflow-hidden">
                  <button
                    className="p-3 hover:bg-cream-100 transition-colors text-noir-700"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-3 min-w-[60px] text-center font-medium text-noir-900">{quantity}</span>
                  <button
                    className="p-3 hover:bg-cream-100 transition-colors text-noir-700"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-noir-500">
                  {product.stock_quantity} in stock
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-sm tracking-wide"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Add to Bag
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className={`h-14 w-14 p-0 ${inWishlist ? 'text-rose-500 border-rose-200' : ''}`}
                >
                  <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <p className="text-rose-600 font-medium mb-4">Currently out of stock</p>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
                className="w-full h-14"
              >
                <Heart size={18} className="mr-2" fill={inWishlist ? 'currentColor' : 'none'} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-sm text-noir-400 mb-6">SKU: {product.sku}</p>
          )}

          {/* Tabs */}
          <div className="border-t border-noir-100 pt-6">
            <div className="flex gap-8 border-b border-noir-100 mb-6">
              <button
                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'description' ? 'border-b-2 border-noir-900 text-noir-900' : 'text-noir-400 hover:text-noir-700'}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-noir-900 text-noir-900' : 'text-noir-400 hover:text-noir-700'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviewStats?.total_reviews || 0})
              </button>
            </div>

            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-noir-600 leading-relaxed">
                <p>{product.description || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-noir-100 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={star <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-noir-200'}
                              />
                            ))}
                          </div>
                          {review.is_verified_purchase && (
                            <Badge variant="success" className="text-xs">Verified Purchase</Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm mb-1 text-noir-900">{review.title || 'Review'}</p>
                        <p className="text-sm text-noir-600 mb-2">{review.comment}</p>
                        <p className="text-xs text-noir-400">
                          By {review.user_name} on {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-noir-500">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-noir-100">
            <h2 className="font-display text-2xl lg:text-3xl text-noir-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
