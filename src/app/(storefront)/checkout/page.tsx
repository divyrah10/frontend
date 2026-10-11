'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, LockKeyhole, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/stores/cart'
import { useAuthHydrated, useAuthStore } from '@/stores/auth'
import { addressesApi, ordersApi, paymentsApi } from '@/lib/api'
import { Address } from '@/types'
import { formatPrice, apiErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, fetchCart, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const authHydrated = useAuthHydrated()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentConsent, setShowPaymentConsent] = useState(false)
  const [hasPaymentConsent, setHasPaymentConsent] = useState(false)
  const idempotencyKey = useRef<string | undefined>(undefined)
  if (!idempotencyKey.current && typeof crypto !== 'undefined') {
    idempotencyKey.current = crypto.randomUUID()
  }
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
    if (!authHydrated) return
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
  }, [authHydrated, fetchCart, isAuthenticated, router])

  useEffect(() => {
    if (!showPaymentConsent) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) setShowPaymentConsent(false)
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [showPaymentConsent, isProcessing])

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
      toast.error(apiErrorMessage(error, 'Could not save this address'))
    }
  }

  const openPaymentConsent = () => {
    if (!selectedAddressId) {
      toast.error('Choose a delivery address before continuing.')
      return
    }
    if (!window.Razorpay) {
      toast.error('Secure checkout is still loading. Please try again in a moment.')
      return
    }
    setHasPaymentConsent(false)
    setShowPaymentConsent(true)
  }

  const handleCheckout = async () => {
    if (!selectedAddressId || !cart) return
    if (!hasPaymentConsent) {
      toast.error('Please confirm the payment consent before continuing.')
      return
    }

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
        idempotency_key: idempotencyKey.current,
        payment_consent: true,
        payment_consent_version: 'razorpay_checkout_v1',
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

      if (!window.Razorpay) {
        throw new Error('Payment checkout failed to load')
      }
      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', () => {
        toast.error('Payment was not completed. Your order can be retried from your account.')
      })
      setShowPaymentConsent(false)
      razorpay.open()
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('We could not start the payment. Please try again.')
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

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId)

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
                    <label className="block text-sm font-medium mb-1">Mobile number</label>
                    <Input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="10-digit mobile, for the courier"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
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
                    {item.product_name}{item.attributes?.size ? ` · Size ${item.attributes.size}` : ''} x {item.quantity}
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
                <span className="text-accent-600">GST (5%, included)</span>
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
              onClick={openPaymentConsent}
              disabled={!selectedAddressId || isProcessing}
            >
              Review & Pay <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>

            <p className="text-xs text-accent-500 text-center mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>

      {showPaymentConsent && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close payment review"
            onClick={() => !isProcessing && setShowPaymentConsent(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-consent-title"
            className="relative z-10 max-h-[94vh] w-full max-w-4xl overflow-y-auto bg-[#f7f5f0] shadow-2xl sm:max-h-[90vh]"
          >
            <button
              type="button"
              onClick={() => setShowPaymentConsent(false)}
              disabled={isProcessing}
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white/70 transition hover:bg-white disabled:opacity-40"
              aria-label="Close payment review"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-[#151515] px-6 py-9 text-white sm:px-9 sm:py-12">
                <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/55">Final review</p>
                <h2 id="payment-consent-title" className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl">
                  Ready when<br />you are.
                </h2>

                <div className="mt-10 border-t border-white/15 pt-6">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/55">Payable now</span>
                    <span className="font-display text-3xl">{formatPrice(cart.total)}</span>
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-white/65">
                    <div className="flex justify-between"><span>{cart.items.length} item{cart.items.length === 1 ? '' : 's'}</span><span>{formatPrice(cart.subtotal)}</span></div>
                    <div className="flex justify-between"><span>GST (5%, included)</span><span>{formatPrice(cart.tax)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>Included</span></div>
                  </div>
                </div>

                {selectedAddress && (
                  <div className="mt-8 border-t border-white/15 pt-6">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Delivering to</p>
                    <p className="mt-3 text-sm font-medium">{selectedAddress.full_name}</p>
                    <p className="mt-1 max-w-xs text-sm leading-6 text-white/60">
                      {selectedAddress.address_line1}{selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-9 sm:px-10 sm:py-12">
                <div className="flex items-start gap-4 pr-10">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secure Razorpay checkout</p>
                    <p className="mt-1 text-sm leading-6 text-accent-600">Your payment opens in Razorpay after you confirm below.</p>
                  </div>
                </div>

                <div className="mt-8 space-y-5 border-y border-black/10 py-7 text-sm leading-6 text-accent-700">
                  <div className="flex gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>Razorpay receives your name, email, phone number, order amount and order reference only to process this payment.</p>
                  </div>
                  <div className="flex gap-3">
                    <LockKeyhole className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>NOT JUST DARK does not receive or store your card number, CVV, UPI PIN or online-banking credentials.</p>
                  </div>
                </div>

                <label className="mt-7 flex cursor-pointer items-start gap-3 text-sm leading-6">
                  <input
                    type="checkbox"
                    checked={hasPaymentConsent}
                    onChange={(event) => setHasPaymentConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-black"
                  />
                  <span>
                    I have reviewed my order and delivery address, and I authorize a payment of <strong>{formatPrice(cart.total)}</strong> through Razorpay. I agree to the{' '}
                    <Link href="/terms" target="_blank" className="underline underline-offset-4">Terms</Link>,{' '}
                    <Link href="/privacy" target="_blank" className="underline underline-offset-4">Privacy Policy</Link> and{' '}
                    <Link href="/returns" target="_blank" className="underline underline-offset-4">Returns Policy</Link>.
                  </span>
                </label>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentConsent(false)}
                    disabled={isProcessing}
                    className="sm:min-w-28"
                  >
                    Go back
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={!hasPaymentConsent || isProcessing}
                    className="sm:min-w-52"
                  >
                    {isProcessing ? 'Opening secure payment…' : `Authorize ${formatPrice(cart.total)}`}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
