'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { addressesApi, ordersApi, paymentsApi } from '@/lib/api'
import { Address } from '@/types'
import { formatPrice } from '@/lib/utils'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, fetchCart, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
      return
    }

    const fetchData = async () => {
      await fetchCart()
      try {
        const response = await addressesApi.list()
        setAddresses(response.data)
        const defaultAddr = response.data.find((a: Address) => a.is_default)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (response.data.length > 0) {
          setSelectedAddressId(response.data[0].id)
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [isAuthenticated])

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await addressesApi.create(newAddress)
      setAddresses([...addresses, response.data])
      setSelectedAddressId(response.data.id)
      setShowNewAddress(false)
      setNewAddress({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
      })
    } catch (error) {
      console.error('Error adding address:', error)
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddressId || !cart) return

    setIsProcessing(true)
    try {
      // Create order
      const orderResponse = await ordersApi.create({
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          attributes: item.attributes,
        })),
        shipping_address_id: selectedAddressId,
      })

      const order = orderResponse.data

      // Create Razorpay order
      const paymentResponse = await paymentsApi.createOrder(order.id)
      const { razorpay_order_id, amount, currency, key_id } = paymentResponse.data

      // Open Razorpay checkout
      const options = {
        key: key_id,
        amount,
        currency,
        name: 'NOT JUST DARK',
        description: `Order ${order.order_number}`,
        order_id: razorpay_order_id,
        handler: async (response: any) => {
          try {
            await paymentsApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            await clearCart()
            router.push(`/account/orders?success=${order.order_number}`)
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user?.full_name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#1a1a1a',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="spinner mx-auto" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Address */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-accent-100 p-6 mb-6">
            <h2 className="font-medium text-lg mb-4">Shipping Address</h2>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-accent-900 bg-accent-50'
                        : 'border-accent-200 hover:border-accent-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="sr-only"
                    />
                    <p className="font-medium">{address.full_name}</p>
                    <p className="text-sm text-accent-600 mt-1">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </p>
                    <p className="text-sm text-accent-600">
                      {address.city}, {address.state} - {address.postal_code}
                    </p>
                    {address.phone && (
                      <p className="text-sm text-accent-600">Phone: {address.phone}</p>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-accent-500 mb-4">No saved addresses. Please add one below.</p>
            )}

            <button
              className="mt-4 text-sm text-primary-600 hover:underline"
              onClick={() => setShowNewAddress(!showNewAddress)}
            >
              {showNewAddress ? 'Cancel' : '+ Add new address'}
            </button>

            {showNewAddress && (
              <form onSubmit={handleAddAddress} className="mt-4 space-y-4 border-t border-accent-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <Input
                    value={newAddress.address_line1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <Input
                    value={newAddress.address_line2}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <Input
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <Input
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">PIN Code</label>
                    <Input
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit">Save Address</Button>
              </form>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-accent-50 p-6 sticky top-24">
            <h2 className="font-display text-xl mb-6">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-accent-600">
                    {item.product_name} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-accent-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-accent-600">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-600">Tax (18% GST)</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>

            <div className="border-t border-accent-200 mt-4 pt-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={handleCheckout}
              disabled={!selectedAddressId || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </Button>

            <p className="text-xs text-accent-500 text-center mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
