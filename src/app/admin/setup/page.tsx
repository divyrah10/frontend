'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [setupMessage, setSetupMessage] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    setup_key: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    checkSetupNeeded()
  }, [])

  const checkSetupNeeded = async () => {
    try {
      const response = await adminApi.checkSetup()
      setNeedsSetup(response.data.needs_setup)
      setSetupMessage(response.data.message)

      if (!response.data.needs_setup) {
        // Admin already exists, redirect to login
        setTimeout(() => router.push('/admin-login'), 2000)
      }
    } catch {
      setError('Failed to check setup status')
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await adminApi.initialize({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        setup_key: formData.setup_key
      })

      // Store the token
      localStorage.setItem('accessToken', response.data.access_token)
      await useAuthStore.getState().fetchUser()
      setSuccess(true)

      // Redirect to admin dashboard
      setTimeout(() => router.push('/admin/dashboard'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Setup failed. Please check your setup key.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-900">
        <div className="text-white text-center">
          <div className="spinner mb-4" />
          <p>Checking system status...</p>
        </div>
      </div>
    )
  }

  if (!needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white p-8 shadow-lg rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">System Already Configured</h1>
            <p className="text-accent-500 mb-6">{setupMessage}</p>
            <Link href="/admin-login">
              <Button className="w-full">Go to Admin Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white p-8 shadow-lg rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Setup Complete!</h1>
            <p className="text-accent-500 mb-4">Super admin account created successfully.</p>
            <p className="text-sm text-accent-400">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-accent-700" />
            <h1 className="font-display text-2xl">NOT JUST DARK</h1>
            <p className="text-accent-500 mt-2">Admin Setup</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">First-time Setup</p>
                <p>Create your super admin account. You'll need the setup key provided by your infrastructure team.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="admin@notjustdark.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Setup Key</label>
              <Input
                type="password"
                value={formData.setup_key}
                onChange={(e) => setFormData({ ...formData, setup_key: e.target.value })}
                required
                placeholder="Enter setup key"
              />
              <p className="text-xs text-accent-400 mt-1">
                Provided by your infrastructure team
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Super Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin-login" className="text-sm text-accent-500 hover:text-accent-700">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
