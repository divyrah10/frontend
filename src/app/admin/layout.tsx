'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  MessageSquare,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      const authenticated = await checkAuth()
      if (!authenticated) {
        router.push('/admin-login')
        return
      }

      // Check if user has admin permissions
      const adminRoles = ['super_admin', 'store_manager', 'customer_service']
      if (!user?.role?.name || !adminRoles.includes(user.role.name)) {
        router.push('/')
        return
      }

      setIsLoading(false)
    }
    verify()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-accent-900 text-white transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-accent-800">
          <Link href="/admin/dashboard" className="font-display text-lg">
            NOT JUST DARK
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent-800 text-white'
                        : 'text-accent-300 hover:bg-accent-800 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-accent-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-accent-300 hover:text-white transition-colors"
          >
            View Store &rarr;
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-accent-300 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-accent-100 flex items-center px-4 lg:px-8">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-accent-500">
              Welcome, <span className="font-medium text-accent-900">{user?.full_name}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
