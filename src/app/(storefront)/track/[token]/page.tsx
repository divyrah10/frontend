'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowUpRight, Check, Clock3, MapPin, PackageCheck, Truck } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { PublicTracking } from '@/types'

const milestones = [
  { key: 'order_confirmed', label: 'Confirmed' },
  { key: 'ready_to_ship', label: 'Prepared' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
]

const progressByStatus: Record<string, number> = {
  order_confirmed: 0,
  processing: 0,
  ready_to_ship: 1,
  picked_up: 2,
  in_transit: 2,
  delivery_delayed: 2,
  ndr: 3,
  out_for_delivery: 3,
  delivered: 4,
  rto_in_transit: 2,
  rto_delivered: 4,
  cancelled: 0,
}

const prettyStatus = (value: string) => value.replaceAll('_', ' ')

export default function TrackingPage() {
  const params = useParams<{ token: string }>()
  const [tracking, setTracking] = useState<PublicTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!params.token) return
    ordersApi.getPublicTracking(params.token)
      .then((response) => setTracking(response.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.token])

  if (loading) {
    return <div className="min-h-[70vh] bg-cream-50 pt-36"><div className="spinner mx-auto" /></div>
  }

  if (notFound || !tracking) {
    return (
      <main className="min-h-[70vh] bg-cream-50 px-4 pt-36 pb-20 text-center">
        <PackageCheck className="mx-auto mb-6 text-noir-300" size={42} />
        <p className="text-luxury-caps text-noir-400 mb-4">Shipment tracking</p>
        <h1 className="font-display text-5xl mb-5">This link has expired.</h1>
        <p className="text-noir-500 mb-8">Sign in to your account to find the latest link for your order.</p>
        <Link href="/login?redirect=/account/orders" className="link-editorial">View your orders</Link>
      </main>
    )
  }

  const { shipment } = tracking
  const currentStep = progressByStatus[shipment.status] ?? 0
  const isException = ['delivery_delayed', 'ndr', 'rto_in_transit', 'rto_delivered', 'cancelled'].includes(shipment.status)

  return (
    <main className="min-h-screen bg-cream-50 pt-28 pb-24">
      <section className="container mx-auto max-w-6xl px-4">
        <div className="grid lg:grid-cols-[0.85fr_1.4fr] border border-noir-950/10 bg-white shadow-luxury">
          <aside className="relative overflow-hidden bg-noir-950 p-7 text-white lg:p-12">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-gold-500/30" />
            <div className="relative">
              <p className="text-luxury-caps text-gold-400">Private delivery</p>
              <h1 className="mt-5 font-display text-5xl leading-none lg:text-6xl">Your piece<br /><em>in motion.</em></h1>

              <div className="mt-14 space-y-7 border-t border-white/15 pt-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">Order</p>
                  <p className="mt-2 font-medium">{tracking.order_number}</p>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Destination</p>
                    <p className="mt-2">{tracking.destination_city || 'India'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">Pieces</p>
                    <p className="mt-2">{tracking.item_count}</p>
                  </div>
                </div>
                {shipment.awb_code && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">AWB</p>
                    <p className="mt-2 font-mono text-sm tracking-wider">{shipment.awb_code}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-9 lg:p-12">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-noir-400">Current status</p>
                <h2 className="mt-2 text-4xl capitalize">{prettyStatus(shipment.status)}</h2>
                <p className="mt-2 text-sm text-noir-500">
                  {shipment.courier_name ? `${shipment.courier_name} · ` : ''}
                  {shipment.estimated_delivery
                    ? `Expected ${new Date(shipment.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`
                    : 'We will show the delivery estimate after dispatch.'}
                </p>
              </div>
              {shipment.tracking_url && (
                <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-noir-950 pb-1 text-sm">
                  Courier page <ArrowUpRight size={15} />
                </a>
              )}
            </div>

            {isException && (
              <div className="mt-7 border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                This delivery needs attention. Our team is working with the courier and the latest detail is shown below.
              </div>
            )}

            <div className="mt-10 pb-3">
              <div className="flex items-start">
                {milestones.map((milestone, index) => {
                  const complete = index <= currentStep && shipment.status !== 'cancelled'
                  return (
                    <div key={milestone.key} className="relative flex-1 text-center">
                      {index < milestones.length - 1 && <div className={`absolute left-1/2 top-4 h-px w-full ${index < currentStep ? 'bg-noir-950' : 'bg-noir-200'}`} />}
                      <div className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border ${complete ? 'border-noir-950 bg-noir-950 text-white' : 'border-noir-200 bg-white text-noir-300'}`}>
                        {complete ? <Check size={14} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </div>
                      <p className={`mt-3 px-0.5 text-[9px] uppercase tracking-[0.06em] sm:text-[11px] sm:tracking-[0.12em] ${complete ? 'text-noir-950' : 'text-noir-400'}`}>{milestone.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 border-t border-noir-950/10 pt-8">
              <div className="mb-6 flex items-center gap-3"><Truck size={18} /><h3 className="font-sans text-sm font-medium uppercase tracking-[0.2em]">Journey</h3></div>
              <div className="space-y-0">
                {shipment.events.map((event, index) => (
                  <div key={event.id} className="grid grid-cols-[22px_1fr] gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-gold-500 ring-4 ring-gold-100' : 'bg-noir-300'}`} />
                      {index < shipment.events.length - 1 && <span className="h-full min-h-16 w-px bg-noir-200" />}
                    </div>
                    <div className="pb-7">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-noir-400">{new Date(event.occurred_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      {event.description && <p className="mt-1 text-sm text-noir-500">{event.description}</p>}
                      {event.location && <p className="mt-2 flex items-center gap-1.5 text-xs text-noir-400"><MapPin size={12} />{event.location}</p>}
                    </div>
                  </div>
                ))}
                {shipment.events.length === 0 && <p className="flex items-center gap-2 text-sm text-noir-500"><Clock3 size={16} />Waiting for the first courier update.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
