'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { login, isLoading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      router.push(redirect)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link href="/" className="font-display text-2xl">LOREM IPSUM</Link>
            <h1 className="text-xl mt-4">Sign In</h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm mb-6">
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
                placeholder="your@email.com"
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

          <div className="mt-6 text-center text-sm">
            <p className="text-accent-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-accent-900 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
