import { create } from 'zustand'
import { WishlistItem } from '@/types'
import { wishlistApi } from '@/lib/api'

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean

  fetchWishlist: () => Promise<void>
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true })
    try {
      const response = await wishlistApi.get()
      set({ items: response.data.items })
    } catch {
      set({ items: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  addToWishlist: async (productId) => {
    set({ isLoading: true })
    try {
      await wishlistApi.add(productId)
      await get().fetchWishlist()
    } finally {
      set({ isLoading: false })
    }
  },

  removeFromWishlist: async (productId) => {
    set({ isLoading: true })
    try {
      await wishlistApi.remove(productId)
      set((state) => ({
        items: state.items.filter((item) => item.product_id !== productId),
      }))
    } finally {
      set({ isLoading: false })
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.product_id === productId)
  },
}))
