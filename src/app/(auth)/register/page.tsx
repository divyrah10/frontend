'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  const { register, isLoading } = useAuthStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      })
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link href="/" className="font-display text-2xl">LOREM IPSUM</Link>
            <h1 className="text-xl mt-4">Create Account</h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-accent-500">
              Already have an account?{' '}
              <Link href="/login" className="text-accent-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
