'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await adminApi.login(email, password)

      // Store the token
      localStorage.setItem('accessToken', response.data.access_token)

      // The response already contains user data, no need to fetch again
      const user = response.data.user

      // Check if user has admin role
      const adminRoles = ['super_admin', 'store_manager', 'customer_service']
      if (!adminRoles.includes(user.role.name)) {
        setError('Access denied. Admin privileges required.')
        localStorage.removeItem('accessToken')
        return
      }

      toast.success(`Welcome back, ${user.full_name}!`)
      router.push('/admin/dashboard')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Invalid email or password'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <Image
              src="/wordmark-black.png"
              alt="NOT JUST DARK"
              width={180}
              height={74}
              className="mx-auto mb-4 object-contain"
            />
            <p className="text-accent-500 mt-2">Admin Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@notjustdark.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/" className="block text-sm text-accent-500 hover:text-accent-700">
              Back to Store
            </Link>
          </div>
        </div>

        <p className="text-center text-accent-400 text-xs mt-6">
          This portal is for authorized staff only.
        </p>
      </div>
    </div>
  )
}
