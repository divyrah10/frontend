'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, Grid, List, ChevronDown } from 'lucide-react'
import { ProductCard } from '@/components/storefront/product-card'
import { Button } from '@/components/ui/button'
import { productsApi, categoriesApi } from '@/lib/api'
import { Product, Category } from '@/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const categorySlug = searchParams.get('category')
  const search = searchParams.get('search')
  const isFeatured = searchParams.get('is_featured')

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const response = await productsApi.list({
          page: currentPage,
          page_size: 12,
          category_slug: categorySlug || undefined,
          search: search || undefined,
          is_featured: isFeatured === 'true' ? true : undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        })
        setProducts(response.data.items)
        setTotalPages(response.data.total_pages)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.list()
        setCategories(response.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchProducts()
    fetchCategories()
  }, [currentPage, categorySlug, search, isFeatured, sortBy, sortOrder])

  const handleSort = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-')
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Page Header with proper spacing for fixed nav */}
      <div className="pt-32 lg:pt-36 pb-8 bg-gradient-to-b from-white to-cream-50">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl lg:text-5xl text-noir-900 mb-3">
          {categorySlug
            ? categories.find((c) => c.slug === categorySlug)?.name || 'Products'
            : search
            ? `Search: "${search}"`
            : isFeatured
            ? 'New Arrivals'
            : 'All Products'}
        </h1>
          <p className="text-noir-500 text-sm tracking-wide">
            {products.length} products found
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-accent-100">
        <button
          className="lg:hidden flex items-center gap-2 text-sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          Filters
        </button>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              className="appearance-none bg-transparent pr-8 py-2 text-sm cursor-pointer focus:outline-none"
              onChange={(e) => handleSort(e.target.value)}
              value={`${sortBy}-${sortOrder}`}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
            <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
          <div className="sticky top-24">
            <div className="mb-6">
              <h3 className="font-medium mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/products"
                    className={`text-sm ${!categorySlug ? 'font-medium text-primary-600' : 'text-accent-600 hover:text-accent-900'}`}
                  >
                    All Products
                  </a>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={`/products?category=${category.slug}`}
                      className={`text-sm ${categorySlug === category.slug ? 'font-medium text-primary-600' : 'text-accent-600 hover:text-accent-900'}`}
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-accent-200" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-accent-200 w-1/3" />
                    <div className="h-4 bg-accent-200 w-2/3" />
                    <div className="h-4 bg-accent-200 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-accent-500 mb-4">No products found</p>
              <Button variant="outline" onClick={() => window.location.href = '/products'}>
                View All Products
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
