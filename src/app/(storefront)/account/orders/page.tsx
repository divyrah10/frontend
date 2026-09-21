'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronDown, Package, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi } from '@/lib/api'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/reveal'

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [openOrder, setOpenOrder] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      const response = await ordersApi.list({ page_size: 50 })
      setOrders(response.data.items)
    } catch {
      toast.error('Could not load your orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSuccess(new URLSearchParams(window.location.search).get('success'))
    loadOrders()
  }, [])

  const cancelOrder = async (id: string) => {
    if (!confirm('Cancel this order and release its reserved items?')) return
    try {
      await ordersApi.cancel(id)
      toast.success('Order cancelled')
      loadOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'This order cannot be cancelled')
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <Reveal>
          <p className="text-luxury-caps text-noir-400 mb-4">Private client area</p>
          <div className="flex flex-wrap items-end justify-between gap-5 mb-10">
            <h1 className="font-display text-5xl lg:text-7xl">Your orders</h1>
            <Link href="/account" className="link-editorial text-sm">Back to account</Link>
          </div>
        </Reveal>

        {success && (
          <div className="mb-8 border border-emerald-200 bg-emerald-50 p-5 flex gap-3 text-emerald-900">
            <CheckCircle2 className="shrink-0" />
            <div><p className="font-medium">Payment received</p><p className="text-sm">Order {success} is confirmed.</p></div>
          </div>
        )}

        {loading ? <div className="spinner mx-auto" /> : orders.length === 0 ? (
          <div className="border border-noir-950/10 bg-white p-12 text-center">
            <Package className="mx-auto mb-5 text-noir-300" size={36} />
            <h2 className="text-3xl mb-3">Your archive is empty</h2>
            <p className="text-noir-500 mb-6">Pieces you order will appear here.</p>
            <Link href="/products"><Button>Explore the collection</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Reveal key={order.id} delay={Math.min(index * 70, 280)}>
                <article className="bg-white border border-noir-950/10 transition-shadow hover:shadow-luxury">
                  <button className="w-full p-5 lg:p-7 text-left flex items-center gap-4" onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}>
                    <div className="w-11 h-11 border border-noir-950/10 flex items-center justify-center"><Truck size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs tracking-[0.2em] uppercase text-noir-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="font-medium truncate mt-1">{order.order_number}</p>
                    </div>
                    <div className="text-right hidden sm:block"><p>{formatPrice(order.total)}</p><p className="text-xs uppercase tracking-wider text-noir-400">{order.status}</p></div>
                    <ChevronDown className={`transition-transform ${openOrder === order.id ? 'rotate-180' : ''}`} size={18} />
                  </button>
                  {openOrder === order.id && (
                    <div className="px-5 lg:px-7 pb-7 animate-fade-in">
                      <div className="hairline-t pt-5 space-y-3">
                        {order.items.map(item => <div key={item.id} className="flex justify-between text-sm"><span>{item.product_name} × {item.quantity}</span><span>{formatPrice(item.subtotal)}</span></div>)}
                      </div>
                      <div className="mt-6 flex justify-between items-center gap-4">
                        <p className="text-sm text-noir-500">Shipping to {order.shipping_address.city}</p>
                        {['pending', 'confirmed'].includes(order.status) && <Button variant="outline" size="sm" onClick={() => cancelOrder(order.id)}>Cancel order</Button>}
                      </div>
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
