// src/app/(products)/(dashboard)/company/[companyId]/warehouse/page.tsx
// WAREHOUSE PAGE - Витрина остатков (READ ONLY)
// Sprint 3.1: Frontend + Stock Integration
//
// ❌ Никаких edit / add / delete кнопок
// ✅ Только чтение и фильтрация

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Warehouse, Package, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

// ============================================
// TYPES
// ============================================
interface WarehouseItem {
  id: number
  code: string
  name: string
  unit: string
  category: string | null
  subcategory: string | null
  current_stock: number
  min_stock: number
  status: 'OK' | 'LOW' | 'OUT_OF_STOCK' | 'OVERSTOCKED'
  stock_value: number
  cost_price: number
  price: number
  currency: string
  is_active: boolean
}

interface WarehouseStats {
  total_products: number
  in_stock: number
  low_stock: number
  out_of_stock: number
  overstocked: number
  total_stock_value: number
}

// ============================================
// COMPONENT
// ============================================
export default function WarehousePage() {
  const params = useParams()
  const companyId = params?.companyId as string

  // State
  const [items, setItems] = useState<WarehouseItem[]>([])
  const [stats, setStats] = useState<WarehouseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Get unique categories
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))] as string[]

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    if (companyId) {
      fetchWarehouse()
    }
  }, [companyId])

  const fetchWarehouse = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)

      const url = `/api/company/${companyId}/warehouse${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setItems(data.warehouse || [])
        setStats(data.stats || null)
        setLastUpdated(new Date())
      } else {
        setError('Failed to load warehouse data')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const handleRefresh = () => {
    fetchWarehouse()
  }

  // Apply filters
  useEffect(() => {
    fetchWarehouse()
  }, [statusFilter, categoryFilter])

  // ============================================
  // HELPERS
  // ============================================
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            OK
          </span>
        )
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <TrendingDown size={12} className="mr-1" />
            LOW
          </span>
        )
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            OUT
          </span>
        )
      case 'OVERSTOCKED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <TrendingUp size={12} className="mr-1" />
            OVER
          </span>
        )
      default:
        return <span className="text-gray-500">-</span>
    }
  }

  const getStockProgressBar = (current: number, min: number) => {
    if (min <= 0) return null
    
    const percentage = Math.min((current / min) * 100, 200)
    let bgColor = 'bg-green-500'
    
    if (current === 0) {
      bgColor = 'bg-red-500'
    } else if (current < min) {
      bgColor = 'bg-orange-500'
    } else if (current > min * 3) {
      bgColor = 'bg-blue-500'
    }

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${bgColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    )
  }

  // Filter items by search
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query))
    )
  })

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Warehouse className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Warehouse</h1>
            <span className="bg-teal-500 px-2 py-1 rounded text-sm">
              {filteredItems.length} products
            </span>
            <span className="bg-teal-800 px-2 py-1 rounded text-sm">
              Company ID: {companyId}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-sm text-teal-200">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="bg-teal-500 hover:bg-teal-400 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.in_stock}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.low_stock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.out_of_stock}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stock Value</p>
                <p className="text-2xl font-bold text-teal-600">
                  €{stats.total_stock_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-teal-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, code, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All</option>
              <option value="OK">✅ OK</option>
              <option value="LOW">⚠️ Low</option>
              <option value="OUT_OF_STOCK">❌ Out of Stock</option>
              <option value="OVERSTOCKED">📦 Overstocked</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Read-Only Notice */}
      <div className="mx-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-700">
          🔒 <strong>Read Only:</strong> Warehouse stock is automatically updated through Purchases (+) and Sales (-). 
          Direct editing is not available.
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-3 text-left font-medium text-gray-700">ID</th>
                <th className="p-3 text-left font-medium text-gray-700">Code</th>
                <th className="p-3 text-left font-medium text-gray-700">Product</th>
                <th className="p-3 text-left font-medium text-gray-700">Category</th>
                <th className="p-3 text-center font-medium text-gray-700">Unit</th>
                <th className="p-3 text-right font-medium text-gray-700">Current Stock</th>
                <th className="p-3 text-right font-medium text-gray-700">Min Stock</th>
                <th className="p-3 text-center font-medium text-gray-700">Level</th>
                <th className="p-3 text-center font-medium text-gray-700">Status</th>
                <th className="p-3 text-right font-medium text-gray-700">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-t hover:bg-gray-50 ${
                    item.status === 'OUT_OF_STOCK' ? 'bg-red-50' :
                    item.status === 'LOW' ? 'bg-orange-50' :
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  <td className="p-3 text-gray-500">{item.id}</td>
                  <td className="p-3 font-mono text-gray-700">{item.code}</td>
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {!item.is_active && (
                      <span className="text-xs text-gray-500">(inactive)</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">{item.category || '-'}</td>
                  <td className="p-3 text-center text-gray-600">{item.unit}</td>
                  <td className="p-3 text-right">
                    <span className={`font-semibold ${
                      item.current_stock === 0 ? 'text-red-600' :
                      item.current_stock < item.min_stock ? 'text-orange-600' :
                      'text-gray-900'
                    }`}>
                      {item.current_stock.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {item.min_stock > 0 ? item.min_stock.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="p-3 px-6">
                    {item.min_stock > 0 ? getStockProgressBar(item.current_stock, item.min_stock) : '-'}
                  </td>
                  <td className="p-3 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-900">
                    €{item.stock_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    {items.length === 0 
                      ? 'No products in warehouse. Create Purchases to add stock.'
                      : 'No products match your filters.'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white border-t p-3 px-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {filteredItems.length} of {items.length} products
          </span>
          <span>
            Total Stock Value: <strong className="text-teal-600">
              €{filteredItems.reduce((sum, i) => sum + i.stock_value, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </div>
      </div>
    </div>
  )
}
