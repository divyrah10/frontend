export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_active: boolean
  is_verified: boolean
  role: Role
  created_at: string
  last_login?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  subcategories?: Category[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  compare_at_price?: number
  sku?: string
  stock_quantity: number
  category?: Category
  images: string[]
  attributes: Record<string, any>
  is_active: boolean
  is_featured: boolean
  is_on_sale: boolean
  discount_percentage: number
  in_stock: boolean
  created_at: string
  average_rating?: number
  review_count: number
}

export interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_slug?: string
  product_image?: string
  product_price: number
  quantity: number
  attributes: Record<string, any>
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total_items: number
  subtotal: number
  tax: number
  total: number
}

export interface WishlistItem {
  id: string
  product_id: string
  product_name: string
  product_slug: string
  product_image?: string
  product_price: number
  in_stock: boolean
  created_at: string
}

export interface Address {
  id: string
  type: 'shipping' | 'billing'
  full_name: string
  phone?: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  attributes: Record<string, any>
}

export interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  shipping_address: Record<string, any>
  billing_address?: Record<string, any>
  customer_notes?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  user_name: string
  rating: number
  title?: string
  comment?: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: Record<number, number>
}

export interface DashboardStats {
  revenue: {
    total: number
    monthly: number
  }
  orders: {
    total: number
    monthly: number
    pending: number
  }
  customers: {
    total: number
  }
  products: {
    total: number
    low_stock: number
  }
  reviews: {
    pending: number
  }
}
