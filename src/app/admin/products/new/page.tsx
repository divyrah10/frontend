'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Upload, X, Plus, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { productsApi, categoriesApi } from '@/lib/api'
import { Category } from '@/types'
import toast from 'react-hot-toast'

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']
const AVAILABLE_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Navy', value: '#1a237e' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Charcoal', value: '#374151' },
  { name: 'Beige', value: '#d4c4a8' },
  { name: 'Brown', value: '#78350f' },
  { name: 'Burgundy', value: '#7f1d1d' },
  { name: 'Olive', value: '#4d5534' },
  { name: 'Cream', value: '#fef3c7' },
]
const GENDER_OPTIONS = ['Men', 'Women', 'Unisex']

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    compare_at_price: '',
    sku: '',
    stock_quantity: '0',
    category_id: '',
    is_active: true,
    is_featured: false,
    is_on_sale: false,
    discount_percentage: '',
  })

  // Product attributes
  const [gender, setGender] = useState<string>('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-calculate discount percentage when prices change
  useEffect(() => {
    if (formData.is_on_sale && formData.price && formData.compare_at_price) {
      const price = parseFloat(formData.price)
      const comparePrice = parseFloat(formData.compare_at_price)
      if (comparePrice > price && comparePrice > 0) {
        const discount = Math.round(((comparePrice - price) / comparePrice) * 100)
        setFormData(prev => ({ ...prev, discount_percentage: discount.toString() }))
      }
    }
  }, [formData.price, formData.compare_at_price, formData.is_on_sale])

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.list()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Add files to state
    setImages(prev => [...prev, ...validFiles])

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required')
      return
    }
    if (!formData.category_id) {
      setError('Please select a category')
      return
    }
    if (!gender) {
      setError('Please select a gender')
      return
    }

    setIsLoading(true)

    try {
      // Build attributes object
      const attributes: Record<string, any> = {
        gender,
        sizes: selectedSizes,
        colors: selectedColors,
        tags,
      }

      // Create product
      const productData = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        sku: formData.sku || null,
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_on_sale: formData.is_on_sale,
        attributes,
      }

      const response = await productsApi.create(productData)
      const productId = response.data.id

      // Upload images with progress
      if (images.length > 0) {
        toast.loading(`Uploading ${images.length} image(s)...`, { id: 'upload' })

        for (let i = 0; i < images.length; i++) {
          try {
            await productsApi.uploadImage(productId, images[i])
          } catch (uploadErr) {
            console.error(`Failed to upload image ${i + 1}:`, uploadErr)
            toast.error(`Failed to upload image ${i + 1}`)
          }
        }

        toast.dismiss('upload')
      }

      toast.success('Product created successfully!')
      router.push('/admin/products')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to create product'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display text-noir-900">Add New Product</h1>
          <p className="text-sm text-noir-500">Create a new product for your store</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-noir-100 p-6 shadow-sm">
              <h2 className="font-medium text-noir-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-noir-700 mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-noir-700 mb-1.5">
                    Short Description
                  </label>
                  <Input
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief description for product cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-noir-700 mb-1.5">
                    Full Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 text-sm border border-noir-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                    placeholder="Detailed product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-noir-700 mb-1.5">SKU</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Product SKU (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-noir-100 p-6 shadow-sm">
              <h2 className="font-medium text-noir-900 mb-4">Product Images</h2>
              <p className="text-sm text-noir-500 mb-4">Upload high-quality images. First image will be the main product image.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square bg-cream-100 rounded-lg overflow-hidden group">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-noir-900 text-cream-50 text-2xs rounded">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-noir-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <label className="aspect-square border-2 border-dashed border-noir-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 hover:bg-gold-50/50 transition-all">
                  <Upload size={24} className="text-noir-400 mb-2" />
                  <span className="text-xs text-noir-500">Add Image</span>
                  <span className="text-2xs text-noir-400 mt-1">Max 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-noir-100 p-6 shadow-sm">
              <h2 className="font-medium text-noir-900 mb-4">Pricing & Inventory</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-noir-700 mb-1.5">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-noir-700 mb-1.5">
                    Compare at Price (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    placeholder="Original price (for sales)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-noir-700 mb-1.5">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>

                {formData.is_on_sale && (
                  <div>
                    <label className="block text-sm font-medium text-noir-700 mb-1.5">
                      Discount %
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                      placeholder="Auto-calculated"
                      disabled
                    />
                    <p className="text-2xs text-noir-400 mt-1">Auto-calculated from prices</p>
                  </div>
                )}
              </div>
            </div>

            {/* Variants / Attributes */}
            <div className="bg-white rounded-xl border border-noir-100 p-6 shadow-sm">
              <h2 className="font-medium text-noir-900 mb-4">Product Attributes</h2>

              {/* Gender */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-noir-700 mb-2">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                        gender === g
                          ? 'bg-noir-900 text-cream-50 border-noir-900'
                          : 'bg-white text-noir-700 border-noir-200 hover:border-noir-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-noir-700 mb-2">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`w-12 h-10 text-sm rounded-lg border transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-noir-900 text-cream-50 border-noir-900'
                          : 'bg-white text-noir-700 border-noir-200 hover:border-noir-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <p className="text-2xs text-noir-500 mt-2">
                    Selected: {selectedSizes.join(', ')}
                  </p>
                )}
              </div>

              {/* Colors */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-noir-700 mb-2">
                  Available Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                        selectedColors.includes(color.name)
                          ? 'bg-noir-900 text-cream-50 border-noir-900'
                          : 'bg-white text-noir-700 border-noir-200 hover:border-noir-400'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-noir-200"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
                {selectedColors.length > 0 && (
                  <p className="text-2xs text-noir-500 mt-2">
                    Selected: {selectedColors.join(', ')}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-noir-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus size={16} />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="subtle" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-noir-100 p-6 shadow-sm">
              <h2 className="font-medium text-noir-900 mb-4">Status</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-noir-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-sm text-noir-700 group-hover:text-noir-900">
                    Active (visible on store)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-noir-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-sm text-noir-700 group-hover:text-noir-900">
                    Featured product
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.is_on_sale}
                    onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                    className="w-4 h-4 rounded border-noir-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-sm text-noir-700 group-hover:text-noir-900">
                    On sale
                  </span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl border border-noir-100 p-6 shadow-sm">
              <h2 className="font-medium text-noir-900 mb-4">
                Category <span className="text-rose-500">*</span>
              </h2>

              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-noir-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all bg-white"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-2xs text-noir-400 mt-2">
                Required for filtering on the store
              </p>
            </div>

            {/* Summary */}
            <div className="bg-cream-50 rounded-xl border border-cream-200 p-6">
              <h2 className="font-medium text-noir-900 mb-3">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-noir-500">Images</span>
                  <span className="text-noir-900">{images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noir-500">Sizes</span>
                  <span className="text-noir-900">{selectedSizes.length || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noir-500">Colors</span>
                  <span className="text-noir-900">{selectedColors.length || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noir-500">Tags</span>
                  <span className="text-noir-900">{tags.length || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Product'}
            </Button>

            <p className="text-2xs text-noir-400 text-center">
              Product will be saved and can be edited later
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
