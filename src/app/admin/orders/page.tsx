'use client'

import { useCallback, useEffect, useState } from 'react'
import { Copy, Eye, ChevronDown, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { isPaidOrder } from '@/lib/orders'
import { ordersApi } from '@/lib/api'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils'

const statusOptions = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const shipmentStatusOptions = [
  ['order_confirmed', 'Order confirmed'],
  ['processing', 'Processing'],
  ['ready_to_ship', 'Ready to ship'],
  ['picked_up', 'Picked up'],
  ['in_transit', 'In transit'],
  ['out_for_delivery', 'Out for delivery'],
  ['delivered', 'Delivered'],
  ['delivery_delayed', 'Delivery delayed'],
  ['ndr', 'Delivery issue / NDR'],
  ['rto_in_transit', 'RTO in transit'],
  ['rto_delivered', 'RTO delivered'],
  ['cancelled', 'Cancelled'],
]


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [shipmentDraft, setShipmentDraft] = useState({
    provider: 'shiprocket', awb_code: '', courier_name: '', status: 'order_confirmed',
    tracking_url: '', estimated_delivery: '', event_title: '', event_description: '', event_location: '',
  })
  const [savingShipment, setSavingShipment] = useState(false)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await ordersApi.listAll({
        page: currentPage,
        status: statusFilter || undefined,
      })
      setOrders(response.data.items)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const openOrder = (order: Order) => {
    setSelectedOrder(order)
    setShipmentDraft({
      provider: order.shipment?.provider || 'shiprocket',
      awb_code: order.shipment?.awb_code || '',
      courier_name: order.shipment?.courier_name || '',
      status: order.shipment?.status || 'order_confirmed',
      tracking_url: order.shipment?.tracking_url || '',
      estimated_delivery: order.shipment?.estimated_delivery?.slice(0, 10) || '',
      event_title: '', event_description: '', event_location: '',
    })
  }

  const saveShipment = async () => {
    if (!selectedOrder) return
    setSavingShipment(true)
    try {
      const response = await ordersApi.updateShipment(selectedOrder.id, {
        ...shipmentDraft,
        estimated_delivery: shipmentDraft.estimated_delivery || undefined,
        event_title: shipmentDraft.event_title || undefined,
        event_description: shipmentDraft.event_description || undefined,
        event_location: shipmentDraft.event_location || undefined,
      })
      setSelectedOrder(response.data)
      setShipmentDraft((current) => ({ ...current, event_title: '', event_description: '', event_location: '' }))
      toast.success('Shipment tracking updated')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not update shipment')
    } finally {
      setSavingShipment(false)
    }
  }

  const runShiprocket = async (action: 'push' | 'refresh') => {
    if (!selectedOrder) return
    setSavingShipment(true)
    try {
      const response = action === 'push'
        ? await ordersApi.pushToShiprocket(selectedOrder.id)
        : await ordersApi.refreshTracking(selectedOrder.id)
      openOrder(response.data)
      toast.success(action === 'push' ? 'Order sent to Shiprocket' : 'Tracking refreshed')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Shiprocket request failed')
    } finally {
      setSavingShipment(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'cancelled':
      case 'refunded':
        return 'danger'
      case 'shipped':
      case 'processing':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display">Orders</h1>

        <select
          className="border border-accent-200 rounded px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-accent-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent-50 border-b border-accent-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Order</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Items</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Total</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-accent-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-accent-500">
                    Loading...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm">{order.order_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm">{order.shipping_address.full_name}</p>
                        <p className="text-xs text-accent-500">{order.shipping_address.city}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.items.length} items</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          className="appearance-none bg-transparent pr-6 text-sm cursor-pointer focus:outline-none"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        >
                          {statusOptions.slice(1).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-accent-400"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-accent-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => openOrder(order)}>
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-accent-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-accent-100 flex items-center justify-between">
              <h2 className="text-lg font-medium">Order {selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-accent-500 hover:text-accent-900">
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                  <p className="text-sm text-accent-600">
                    {selectedOrder.shipping_address.full_name}<br />
                    {selectedOrder.shipping_address.address_line1}<br />
                    {selectedOrder.shipping_address.address_line2 && (
                      <>{selectedOrder.shipping_address.address_line2}<br /></>
                    )}
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}<br />
                    {selectedOrder.shipping_address.postal_code}<br />
                    {selectedOrder.shipping_address.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Order Info</h3>
                  <p className="text-sm text-accent-600">
                    Status: <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>{selectedOrder.status}</Badge><br />
                    Date: {new Date(selectedOrder.created_at).toLocaleString()}<br />
                    {selectedOrder.customer_notes && (
                      <>Notes: {selectedOrder.customer_notes}</>
                    )}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-medium mb-2">Items</h3>
              <div className="border border-accent-100 rounded mb-6">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 border-b border-accent-100 last:border-b-0 flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-accent-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div className="text-right space-y-1 text-sm">
                <p>Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
                <p>GST: {formatPrice(selectedOrder.tax)}</p>
                <p>Shipping: {formatPrice(selectedOrder.shipping_cost)}</p>
                <p className="text-lg font-medium">Total: {formatPrice(selectedOrder.total)}</p>
              </div>

              <section className="mt-8 border-t border-accent-100 pt-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Truck size={18} />
                    <h3 className="font-sans text-sm font-semibold uppercase tracking-wider">Shipment tracking</h3>
                  </div>
                  {selectedOrder.shipment && !isPaidOrder(selectedOrder.status) && (
                    <span className="text-xs text-accent-500">Customer link works once the order is paid</span>
                  )}
                  {selectedOrder.shipment && isPaidOrder(selectedOrder.status) && (
                    <button
                      className="inline-flex items-center gap-2 text-xs font-medium text-accent-600 hover:text-accent-900"
                      onClick={() => {
                        const url = `${window.location.origin}/track/${selectedOrder.shipment!.tracking_token}`
                        navigator.clipboard.writeText(url)
                        toast.success('Customer tracking link copied')
                      }}
                    >
                      <Copy size={13} /> Copy customer link
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium text-accent-600">Provider
                    <select className="mt-1.5 w-full border border-accent-200 bg-white px-3 py-2.5 text-sm" value={shipmentDraft.provider} onChange={(e) => setShipmentDraft({ ...shipmentDraft, provider: e.target.value })}>
                      <option value="shiprocket">Shiprocket</option>
                      <option value="delhivery">Delhivery</option>
                      <option value="manual">Manual</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-accent-600">Shipment status
                    <select className="mt-1.5 w-full border border-accent-200 bg-white px-3 py-2.5 text-sm" value={shipmentDraft.status} onChange={(e) => setShipmentDraft({ ...shipmentDraft, status: e.target.value })}>
                      {shipmentStatusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-medium text-accent-600">AWB / tracking number
                    <input className="mt-1.5 w-full border border-accent-200 px-3 py-2.5 text-sm" value={shipmentDraft.awb_code} onChange={(e) => setShipmentDraft({ ...shipmentDraft, awb_code: e.target.value })} placeholder="Assigned after pickup booking" />
                  </label>
                  <label className="text-xs font-medium text-accent-600">Courier
                    <input className="mt-1.5 w-full border border-accent-200 px-3 py-2.5 text-sm" value={shipmentDraft.courier_name} onChange={(e) => setShipmentDraft({ ...shipmentDraft, courier_name: e.target.value })} placeholder="e.g. Delhivery Surface" />
                  </label>
                  <label className="text-xs font-medium text-accent-600">Estimated delivery
                    <input type="date" className="mt-1.5 w-full border border-accent-200 px-3 py-2.5 text-sm" value={shipmentDraft.estimated_delivery} onChange={(e) => setShipmentDraft({ ...shipmentDraft, estimated_delivery: e.target.value })} />
                  </label>
                  <label className="text-xs font-medium text-accent-600">Courier tracking URL
                    <input type="url" className="mt-1.5 w-full border border-accent-200 px-3 py-2.5 text-sm" value={shipmentDraft.tracking_url} onChange={(e) => setShipmentDraft({ ...shipmentDraft, tracking_url: e.target.value })} placeholder="https://…" />
                  </label>
                </div>

                <div className="mt-6 border-l-2 border-accent-900 bg-accent-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-700">Add timeline update</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="border border-accent-200 px-3 py-2.5 text-sm" value={shipmentDraft.event_title} onChange={(e) => setShipmentDraft({ ...shipmentDraft, event_title: e.target.value })} placeholder="e.g. Package reached Delhi hub" />
                    <input className="border border-accent-200 px-3 py-2.5 text-sm" value={shipmentDraft.event_location} onChange={(e) => setShipmentDraft({ ...shipmentDraft, event_location: e.target.value })} placeholder="Location (optional)" />
                    <textarea className="border border-accent-200 px-3 py-2.5 text-sm sm:col-span-2" rows={2} value={shipmentDraft.event_description} onChange={(e) => setShipmentDraft({ ...shipmentDraft, event_description: e.target.value })} placeholder="Customer-facing detail (optional)" />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  {selectedOrder.shipment?.awb_code ? (
                    <Button variant="outline" onClick={() => runShiprocket('refresh')} disabled={savingShipment}>Refresh from Shiprocket</Button>
                  ) : (
                    <Button variant="outline" onClick={() => runShiprocket('push')} disabled={savingShipment}>
                      {selectedOrder.shipment?.provider_shipment_id ? 'Retry Shiprocket' : 'Send to Shiprocket'}
                    </Button>
                  )}
                  <Button onClick={saveShipment} disabled={savingShipment}>{savingShipment ? 'Saving…' : 'Save tracking update'}</Button>
                </div>

                {selectedOrder.shipment?.events?.length ? (
                  <div className="mt-6 space-y-3 border-t border-accent-100 pt-5">
                    {selectedOrder.shipment.events.slice(0, 4).map((event) => (
                      <div key={event.id} className="flex gap-3 text-sm">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-800" />
                        <div className="flex-1"><p className="font-medium">{event.title}</p><p className="text-xs text-accent-500">{new Date(event.occurred_at).toLocaleString()}{event.location ? ` · ${event.location}` : ''}</p></div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
