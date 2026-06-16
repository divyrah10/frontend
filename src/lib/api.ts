import axios from 'axios'
import { getSessionId } from './utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add session ID for guest cart/compare
    config.headers['X-Session-Id'] = getSessionId()
  }
  return config
})

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, null, {
            params: { refresh_token: refreshToken }
          })

          const { access_token, refresh_token } = response.data
          localStorage.setItem('accessToken', access_token)
          localStorage.setItem('refreshToken', refresh_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post('/auth/register', data),

  login: (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', null, { params: { refresh_token: refreshToken } }),
}

// Products API
export const productsApi = {
  list: (params?: {
    page?: number
    page_size?: number
    category_slug?: string
    category_id?: string
    search?: string
    min_price?: number
    max_price?: number
    is_featured?: boolean
    sort_by?: string
    sort_order?: string
  }) => api.get('/products', { params }),

  getById: (id: string) => api.get(`/products/${id}`),

  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),

  getFeatured: (limit?: number) => api.get('/products/featured', { params: { limit } }),

  create: (data: any) => api.post('/products', data),

  update: (id: string, data: any) => api.put(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// Categories API
export const categoriesApi = {
  list: () => api.get('/categories'),
  getTree: () => api.get('/categories/tree'),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity: number = 1, attributes: any = {}) =>
    api.post('/cart/items', { product_id: productId, quantity, attributes }),
  update: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
  merge: () => api.post('/cart/merge'),
}

// Wishlist API
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId: string) => api.post(`/wishlist/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
}

// Compare API
export const compareApi = {
  get: () => api.get('/compare'),
  add: (productId: string) => api.post(`/compare/${productId}`),
  remove: (productId: string) => api.delete(`/compare/${productId}`),
  clear: () => api.delete('/compare'),
}

// Reviews API
export const reviewsApi = {
  getForProduct: (productId: string, page?: number) =>
    api.get(`/reviews/product/${productId}`, { params: { page } }),
  getStats: (productId: string) => api.get(`/reviews/product/${productId}/stats`),
  create: (data: { product_id: string; rating: number; title?: string; comment?: string }) =>
    api.post('/reviews', data),
  getPending: () => api.get('/reviews/pending'),
  approve: (reviewId: string) => api.post(`/reviews/${reviewId}/approve`),
  reject: (reviewId: string) => api.post(`/reviews/${reviewId}/reject`),
}

// Orders API
export const ordersApi = {
  list: (params?: { page?: number; page_size?: number; status?: string }) =>
    api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  listAll: (params?: { page?: number; status?: string }) =>
    api.get('/orders/admin/all', { params }),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.put(`/orders/${id}/status`, { status, admin_notes: notes }),
}

// Addresses API
export const addressesApi = {
  list: () => api.get('/addresses'),
  get: (id: string) => api.get(`/addresses/${id}`),
  create: (data: any) => api.post('/addresses', data),
  update: (id: string, data: any) => api.put(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
  setDefault: (id: string) => api.post(`/addresses/${id}/set-default`),
}

// Payments API
export const paymentsApi = {
  createOrder: (orderId: string, currency: string = 'INR') =>
    api.post('/payments/create-order', { order_id: orderId, currency }),
  verify: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/payments/verify', data),
}

// Users API
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { full_name?: string; phone?: string }) =>
    api.put('/users/me', data),
  list: (params?: { skip?: number; limit?: number }) =>
    api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
}

// Admin Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRecentOrders: (limit?: number) =>
    api.get('/admin/dashboard/recent-orders', { params: { limit } }),
  getSalesChart: (days?: number) =>
    api.get('/admin/dashboard/sales-chart', { params: { days } }),
  getTopProducts: (limit?: number) =>
    api.get('/admin/dashboard/top-products', { params: { limit } }),
}

// Inventory API
export const inventoryApi = {
  list: (params?: { page?: number; low_stock_only?: boolean; search?: string }) =>
    api.get('/admin/inventory', { params }),
  updateStock: (productId: string, quantity: number) =>
    api.put(`/admin/inventory/${productId}/stock`, { quantity }),
  addStock: (productId: string, quantity: number) =>
    api.post(`/admin/inventory/${productId}/add-stock`, { quantity }),
  getLowStockCount: () => api.get('/admin/inventory/low-stock-count'),
}

// Admin Setup API
export const adminApi = {
  checkSetup: () => api.get('/admin/check'),

  initialize: (data: { email: string; password: string; full_name: string; setup_key: string }) =>
    api.post('/admin/initialize', data),

  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }),

  listUsers: () => api.get('/admin/users'),

  inviteUser: (data: { email: string; full_name: string; role: string; temporary_password: string }) =>
    api.post('/admin/users/invite', data),

  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),

  deactivateUser: (userId: string) =>
    api.put(`/admin/users/${userId}/deactivate`),

  activateUser: (userId: string) =>
    api.put(`/admin/users/${userId}/activate`),
}
