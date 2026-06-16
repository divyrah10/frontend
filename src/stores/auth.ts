import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { authApi, usersApi, cartApi } from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(email, password)
          const { access_token, refresh_token } = response.data

          localStorage.setItem('accessToken', access_token)
          localStorage.setItem('refreshToken', refresh_token)

          // Fetch user profile
          const userResponse = await usersApi.getMe()
          set({ user: userResponse.data, isAuthenticated: true })

          // Merge guest cart
          try {
            await cartApi.merge()
          } catch {}
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          await authApi.register(data)
          // Auto-login after registration
          await get().login(data.email, data.password)
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        try {
          const response = await usersApi.getMe()
          set({ user: response.data, isAuthenticated: true })
        } catch {
          set({ user: null, isAuthenticated: false })
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          set({ isAuthenticated: false })
          return false
        }

        try {
          await get().fetchUser()
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
