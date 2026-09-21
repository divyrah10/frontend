'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { cart, fetchCart, updateQuantity, removeFromCart, isLoading } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchCart()
  }, [])

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId)
    } else {
      await updateQuantity(itemId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/checkout'
    } else {
      window.location.href = '/checkout'
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-accent-300 mb-6" />
        <h1 className="font-display text-2xl mb-4">Your bag is empty</h1>
        <p className="text-accent-500 mb-8">Looks like you haven&apos;t added anything to your bag yet.</p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl mb-8">Shopping Bag</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="border border-accent-100">
            {cart.items.map((item, index) => (
              <div
                key={item.id}
                className={`flex gap-4 p-4 ${index !== cart.items.length - 1 ? 'border-b border-accent-100' : ''}`}
              >
                {/* Image */}
                <div className="relative w-24 h-32 bg-accent-50 shrink-0">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent-300 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <Link href={`/products/${item.product_slug || item.product_id}`} className="font-medium hover:text-primary-600">
                    {item.product_name}
                  </Link>
                  <p className="text-sm text-accent-500 mt-1">{formatPrice(item.product_price)}</p>

                  {/* Attributes */}
                  {Object.keys(item.attributes).length > 0 && (
                    <div className="text-xs text-accent-500 mt-1">
                      {Object.entries(item.attributes).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-accent-200">
                      <button
                        className="p-2 hover:bg-accent-50 disabled:opacity-50"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isLoading}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 min-w-[40px] text-center text-sm">{item.quantity}</span>
                      <button
                        className="p-2 hover:bg-accent-50 disabled:opacity-50"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      className="text-accent-400 hover:text-red-500 transition-colors"
                      onClick={() => removeFromCart(item.id)}
                      disabled={isLoading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/products" className="inline-block mt-4 text-sm text-accent-500 hover:text-accent-900">
            &larr; Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-accent-50 p-6">
            <h2 className="font-display text-xl mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-accent-600">Subtotal ({cart.total_items} items)</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-600">Estimated Tax (18% GST)</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>

            <div className="border-t border-accent-200 my-4 pt-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>

            <p className="text-xs text-accent-500 text-center mt-4">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
