'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, MessageSquare } from 'lucide-react'
import { dashboardApi } from '@/lib/api'
import { DashboardStats } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentOrders(5),
          dashboardApi.getTopProducts(5),
        ])
        setStats(statsRes.data)
        setRecentOrders(ordersRes.data)
        setTopProducts(productsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.revenue.total || 0),
      subtext: `${formatPrice(stats?.revenue.monthly || 0)} this month`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats?.orders.total || 0,
      subtext: `${stats?.orders.pending || 0} pending`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Customers',
      value: stats?.customers.total || 0,
      subtext: 'Registered users',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Products',
      value: stats?.products.total || 0,
      subtext: `${stats?.products.low_stock || 0} low stock`,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-display mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-lg border border-accent-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-accent-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs text-accent-400 mt-1">{stat.subtext}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats?.products.low_stock || 0) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-center gap-3">
          <AlertTriangle className="text-yellow-600" size={20} />
          <div>
            <p className="font-medium text-yellow-800">Low Stock Alert</p>
            <p className="text-sm text-yellow-700">
              {stats?.products.low_stock} products are running low on stock.{' '}
              <Link href="/admin/products" className="underline">
                View products
              </Link>
            </p>
          </div>
        </div>
      )}

      {(stats?.reviews.pending || 0) > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center gap-3">
          <MessageSquare className="text-blue-600" size={20} />
          <div>
            <p className="font-medium text-blue-800">Pending Reviews</p>
            <p className="text-sm text-blue-700">
              {stats?.reviews.pending} reviews waiting for approval.{' '}
              <Link href="/admin/reviews" className="underline">
                Review now
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-accent-100">
          <div className="p-4 border-b border-accent-100 flex items-center justify-between">
            <h2 className="font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-accent-100">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-accent-500">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-accent-500">No orders yet</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-accent-100">
          <div className="p-4 border-b border-accent-100 flex items-center justify-between">
            <h2 className="font-medium">Top Selling Products</h2>
            <Link href="/admin/products" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-accent-100">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="p-4 flex items-center gap-4">
                  <span className="text-accent-400 text-sm w-4">{index + 1}</span>
                  <div className="w-10 h-10 bg-accent-100 rounded overflow-hidden">
                    {product.image && (
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-accent-500">{product.total_sold} sold</p>
                  </div>
                  <p className="font-medium text-sm">{formatPrice(product.total_revenue)}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-accent-500">No sales data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
