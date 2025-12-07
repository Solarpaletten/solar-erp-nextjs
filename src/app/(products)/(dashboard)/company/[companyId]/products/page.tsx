'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Edit, Copy, Trash2, Save, X } from 'lucide-react'

interface Product {
  id: number
  company_id: number
  name: string
  code: string
  sku?: string
  description?: string
  unit: string
  price: number
  cost_price?: number
  currency: string
  vat_rate?: number
  category?: string
  subcategory?: string
  min_stock?: number
  current_stock?: number
  is_active: boolean
  is_service: boolean
  created_at: string
  updated_at: string
}

interface ColumnFilter {
  id: string
  name: string
  code: string
  sku: string
  unit: string
  currency: string
  category: string
}

export default function ProductsPage() {
  const params = useParams()
  const companyId = params?.companyId as string

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])

  // Column filters
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({
    id: '',
    name: '',
    code: '',
    sku: '',
    unit: '',
    currency: '',
    category: ''
  })

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    sku: '',
    description: '',
    unit: 'pcs',
    price: '0',
    cost_price: '',
    currency: 'EUR',
    vat_rate: '',
    category: '',
    subcategory: '',
    min_stock: '',
    current_stock: '',
    is_active: true,
    is_service: false
  })

  useEffect(() => {
    if (companyId) {
      fetchProducts()
    }
  }, [companyId])

  useEffect(() => {
    // Apply filters
    const filtered = products.filter(product => {
      return (
        (product.id.toString().includes(columnFilters.id) || !columnFilters.id) &&
        (product.name?.toLowerCase().includes(columnFilters.name.toLowerCase()) || !columnFilters.name) &&
        (product.code?.toLowerCase().includes(columnFilters.code.toLowerCase()) || !columnFilters.code) &&
        (product.sku?.toLowerCase().includes(columnFilters.sku.toLowerCase()) || !columnFilters.sku) &&
        (product.unit?.toLowerCase().includes(columnFilters.unit.toLowerCase()) || !columnFilters.unit) &&
        (product.currency?.includes(columnFilters.currency) || !columnFilters.currency) &&
        (product.category?.toLowerCase().includes(columnFilters.category.toLowerCase()) || !columnFilters.category)
      )
    })
    setFilteredProducts(filtered)
  }, [products, columnFilters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/company/${companyId}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        setError('Failed to load products')
      }
    } catch (error) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (column: keyof ColumnFilter, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Product name is required')
      return
    }

    try {
      const url = editingProduct
        ? `/api/company/${companyId}/products/${editingProduct.id}`
        : `/api/company/${companyId}/products`

      const method = editingProduct ? 'PUT' : 'POST'

      const cleanedData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        vat_rate: formData.vat_rate ? parseFloat(formData.vat_rate) : null,
        min_stock: formData.min_stock ? parseFloat(formData.min_stock) : null,
        current_stock: formData.current_stock ? parseFloat(formData.current_stock) : null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      if (response.ok) {
        fetchProducts()
        setShowForm(false)
        setEditingProduct(null)
        resetForm()
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save product')
      }
    } catch (error) {
      setError('Failed to save product')
    }
  }

  const handleCopy = async (product: Product) => {
    try {
      const baseName = product.name?.replace(/ Copy \d+$/, '') || product.name || ''
      const baseCode = product.code?.split('_copy')[0] || product.code || ''
      
      const copyProducts = products.filter(p =>
        p.name?.startsWith(baseName) && p.name?.includes('Copy')
      )

      const copyNumbers = copyProducts.map(p => {
        const match = p.name?.match(/Copy (\d+)$/)
        return match ? parseInt(match[1]) : 0
      }).filter(num => num > 0)

      const nextCopyNumber = copyNumbers.length > 0 ? Math.max(...copyNumbers) + 1 : 1

      const copiedData = {
        name: `${baseName} Copy ${nextCopyNumber}`,
        code: baseCode ? `${baseCode}_copy${nextCopyNumber}` : `copy${nextCopyNumber}`,
        sku: product.sku ? `${product.sku}_copy${nextCopyNumber}` : '',
        unit: product.unit,
        price: product.price,
        cost_price: product.cost_price,
        currency: product.currency,
        vat_rate: product.vat_rate,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        is_active: product.is_active,
        is_service: product.is_service
      }

      const response = await fetch(`/api/company/${companyId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copiedData)
      })

      if (response.ok) {
        fetchProducts()
      } else {
        setError('Failed to copy product')
      }
    } catch (error) {
      setError('Failed to copy product')
    }
  }

  const handleDelete = async (productId: number) => {
    try {
      const response = await fetch(`/api/company/${companyId}/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        setSelectedProducts(prev => prev.filter(id => id !== productId))
      } else if (response.status === 404) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        setSelectedProducts(prev => prev.filter(id => id !== productId))
      } else {
        setError('Failed to delete product')
      }
    } catch (error) {
      setError('Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      code: product.code || '',
      sku: product.sku || '',
      description: product.description || '',
      unit: product.unit || 'pcs',
      price: product.price?.toString() || '0',
      cost_price: product.cost_price?.toString() || '',
      currency: product.currency || 'EUR',
      vat_rate: product.vat_rate?.toString() || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      min_stock: product.min_stock?.toString() || '',
      current_stock: product.current_stock?.toString() || '',
      is_active: product.is_active ?? true,
      is_service: product.is_service ?? false
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      sku: '',
      description: '',
      unit: 'pcs',
      price: '0',
      cost_price: '',
      currency: 'EUR',
      vat_rate: '',
      category: '',
      subcategory: '',
      min_stock: '',
      current_stock: '',
      is_active: true,
      is_service: false
    })
  }

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">📦 Products</h1>
            <span className="bg-blue-600 px-2 py-1 rounded text-sm">
              {filteredProducts.length} of {products.length}
            </span>
            {/* Company ID Badge */}
            <span className="bg-blue-800 px-2 py-1 rounded text-xs font-mono">
              Company ID: {companyId}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-t border-blue-200 px-3 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors"
            >
              <Plus size={14} />
              <span>Add new product</span>
            </button>

            <button
              onClick={() => {
                if (selectedProducts.length === 1) {
                  const product = products.find(p => p.id === selectedProducts[0])
                  if (product) handleEdit(product)
                }
              }}
              disabled={selectedProducts.length !== 1}
              className={`px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors ${
                selectedProducts.length === 1
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Edit"
            >
              <Edit size={14} />
            </button>

            <button
              onClick={async () => {
                if (selectedProducts.length > 0) {
                  const confirmMsg = `Delete ${selectedProducts.length} product(s)?`
                  if (confirm(confirmMsg)) {
                    for (const productId of selectedProducts) {
                      try {
                        await handleDelete(productId)
                      } catch (error) {
                        console.error(`Failed to delete product ${productId}:`, error)
                      }
                    }
                    setSelectedProducts([])
                  }
                }
              }}
              disabled={selectedProducts.length === 0}
              className={`px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors ${
                selectedProducts.length > 0
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={() => {
                if (selectedProducts.length === 1) {
                  const product = products.find(p => p.id === selectedProducts[0])
                  if (product) handleCopy(product)
                }
              }}
              disabled={selectedProducts.length !== 1}
              className={`px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors ${
                selectedProducts.length === 1
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Copy"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-left">
              <th className="p-2 w-8">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              {/* ID Column - FIRST */}
              <th className="p-2 min-w-[60px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">ID</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={columnFilters.id}
                    onChange={(e) => handleFilterChange('id', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[200px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Name</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={columnFilters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[100px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Code</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={columnFilters.code}
                    onChange={(e) => handleFilterChange('code', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[100px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">SKU</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={columnFilters.sku}
                    onChange={(e) => handleFilterChange('sku', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[70px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Unit</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={columnFilters.unit}
                    onChange={(e) => handleFilterChange('unit', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[80px]">
                <span className="font-medium text-gray-700">Price</span>
              </th>
              <th className="p-2 min-w-[70px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Currency</span>
                  <select
                    value={columnFilters.currency}
                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="UAH">UAH</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </th>
              <th className="p-2 min-w-[80px]">
                <span className="font-medium text-gray-700">VAT %</span>
              </th>
              <th className="p-2 min-w-[100px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Category</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={columnFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="p-2 w-[60px]">
                <span className="font-medium text-gray-700">Status</span>
              </th>
              <th className="p-2 w-[100px]">
                <span className="font-medium text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredProducts.map((product, index) => (
              <tr
                key={product.id}
                className={`
                  border-b border-gray-100 hover:bg-gray-50 transition-colors
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                  ${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}
                `}
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                {/* ID Column - показываем ID первым */}
                <td className="p-2 font-mono text-gray-600 font-bold">{product.id}</td>
                <td className="p-2">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  {product.description && (
                    <div className="text-xs text-gray-500">{product.description}</div>
                  )}
                </td>
                <td className="p-2 text-gray-700">{product.code}</td>
                <td className="p-2 text-gray-700">{product.sku || '-'}</td>
                <td className="p-2 text-gray-700">{product.unit}</td>
                <td className="p-2 text-gray-700">{Number(product.price).toFixed(2)}</td>
                <td className="p-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {product.currency}
                  </span>
                </td>
                <td className="p-2 text-gray-700">{product.vat_rate || '-'}</td>
                <td className="p-2 text-gray-700">{product.category || '-'}</td>
                <td className="p-2">
                  <div className="flex space-x-1">
                    {product.is_active ? (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Active"></span>
                    ) : (
                      <span className="w-2 h-2 bg-red-500 rounded-full" title="Inactive"></span>
                    )}
                    {product.is_service && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full" title="Service"></span>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleCopy(product)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No products found
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white border-t p-2 text-xs text-gray-500 flex justify-between">
        <span>Showing {filteredProducts.length} of {products.length} products</span>
        {selectedProducts.length > 0 && (
          <span>Selected: {selectedProducts.length}</span>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingProduct ? `Edit Product (ID: ${editingProduct.id})` : 'Add Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                    resetForm()
                    setError(null)
                  }}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Show Product ID when editing */}
              {editingProduct && (
                <div className="bg-gray-50 p-3 rounded border">
                  <span className="text-sm font-medium text-gray-700">Product ID: </span>
                  <span className="text-sm font-mono text-blue-600 font-bold">{editingProduct.id}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Stock Keeping Unit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="l">Liters</option>
                    <option value="m">Meters</option>
                    <option value="m2">Square Meters</option>
                    <option value="m3">Cubic Meters</option>
                    <option value="t">Tonnes</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="UAH">UAH</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vat_rate}
                    onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product subcategory"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum stock level"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Current stock level"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Product description"
                />
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_service}
                    onChange={(e) => setFormData({ ...formData, is_service: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Service</span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                    resetForm()
                    setError(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editingProduct ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
