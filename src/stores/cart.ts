import { create } from 'zustand'
import { Cart } from '@/types'
import { cartApi } from '@/lib/api'

interface CartState {
  cart: Cart | null
  isLoading: boolean

  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number, attributes?: Record<string, any>) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const response = await cartApi.get()
      set({ cart: response.data })
    } catch {
      set({ cart: null })
    } finally {
      set({ isLoading: false })
    }
  },

  addToCart: async (productId, quantity = 1, attributes = {}) => {
    set({ isLoading: true })
    try {
      const response = await cartApi.add(productId, quantity, attributes)
      set({ cart: response.data })
    } finally {
      set({ isLoading: false })
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true })
    try {
      const response = await cartApi.update(itemId, quantity)
      set({ cart: response.data })
    } finally {
      set({ isLoading: false })
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true })
    try {
      const response = await cartApi.remove(itemId)
      set({ cart: response.data })
    } finally {
      set({ isLoading: false })
    }
  },

  clearCart: async () => {
    set({ isLoading: true })
    try {
      await cartApi.clear()
      set({ cart: { items: [], total_items: 0, subtotal: 0, tax: 0, total: 0 } })
    } finally {
      set({ isLoading: false })
    }
  },
}))
