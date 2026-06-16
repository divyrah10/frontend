'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { productsApi } from '@/lib/api'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await productsApi.list({
        page: currentPage,
        page_size: 20,
        search: search || undefined,
      })
      setProducts(response.data.items)
      setTotalPages(response.data.total_pages)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await productsApi.delete(id)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus size={18} className="mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-accent-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-400" />
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-accent-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent-50 border-b border-accent-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Product</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">SKU</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Price</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Stock</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-accent-700">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-accent-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-accent-500">
                    Loading...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-accent-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent-100 rounded overflow-hidden shrink-0">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt=""
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-accent-300 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-accent-500">{product.category?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-accent-600">{product.sku || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatPrice(product.price)}
                      {product.is_on_sale && (
                        <span className="text-accent-400 line-through ml-2">
                          {formatPrice(product.compare_at_price || 0)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={product.stock_quantity <= 5 ? 'text-red-600' : ''}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {product.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {product.is_featured && <Badge>Featured</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button size="sm" variant="ghost">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-accent-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-accent-100 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
