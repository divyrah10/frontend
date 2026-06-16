'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Heart, MapPin, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'
import { usersApi, ordersApi } from '@/lib/api'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account')
      return
    }

    const fetchData = async () => {
      try {
        const ordersRes = await ordersApi.list({ page_size: 5 })
        setOrders(ordersRes.data.items || [])
        setFormData({
          full_name: user?.full_name || '',
          phone: user?.phone || '',
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated, user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await usersApi.updateMe(formData)
      await fetchUser()
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="spinner mx-auto" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl mb-8">My Account</h1>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-accent-50 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={24} className="text-accent-600" />
              </div>
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-sm text-accent-500">{user?.email}</p>
            </div>

            <nav className="space-y-1">
              <Link href="/account" className="flex items-center gap-3 px-3 py-2 bg-white rounded text-sm font-medium">
                <User size={16} />
                Profile
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 px-3 py-2 hover:bg-white rounded text-sm text-accent-600">
                <Package size={16} />
                Orders
              </Link>
              <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2 hover:bg-white rounded text-sm text-accent-600">
                <Heart size={16} />
                Wishlist
              </Link>
              <Link href="/account/addresses" className="flex items-center gap-3 px-3 py-2 hover:bg-white rounded text-sm text-accent-600">
                <MapPin size={16} />
                Addresses
              </Link>
            </nav>

            <button
              onClick={logout}
              className="w-full mt-6 text-sm text-red-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile */}
          <div className="bg-white border border-accent-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-lg">Profile Information</h2>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="w-32 text-accent-500">Name:</span>
                  <span>{user?.full_name}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-accent-500">Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-accent-500">Phone:</span>
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-accent-500">Member since:</span>
                  <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-accent-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-lg">Recent Orders</h2>
              <Link href="/account/orders" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="divide-y divide-accent-100">
                {orders.map((order) => (
                  <div key={order.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-accent-500">
                        {new Date(order.created_at).toLocaleDateString()} &middot; {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
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
                ))}
              </div>
            ) : (
              <p className="text-accent-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
