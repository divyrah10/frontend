'use client'

import { useEffect, useState } from 'react'
import { Eye, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = async () => {
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
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
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
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
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
                <p>Tax: {formatPrice(selectedOrder.tax)}</p>
                <p>Shipping: {formatPrice(selectedOrder.shipping_cost)}</p>
                <p className="text-lg font-medium">Total: {formatPrice(selectedOrder.total)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
