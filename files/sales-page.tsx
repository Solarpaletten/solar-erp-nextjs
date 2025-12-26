// src/app/(products)/(dashboard)/company/[companyId]/sales/page.tsx
// SALES PAGE - Продажи (списание со склада)
// Sprint 3.1: Frontend + Stock Integration

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, X, Trash2, ShoppingCart, Calendar, FileText, User, AlertTriangle } from 'lucide-react'

// ============================================
// TYPES
// ============================================
interface SaleItem {
  id?: number
  product_id: number
  product?: {
    id: number
    name: string
    code: string
    unit: string
    current_stock: number
  }
  quantity: number
  unit_price_base: number
  discount_percent: number
  vat_rate: number
  line_total: number
}

interface Sale {
  id: number
  document_number: string
  document_date: string
  document_type: string
  client_id: number
  client?: {
    id: number
    name: string
    code: string
  }
  subtotal: number
  vat_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  payment_status: string
  document_status: string
  items: SaleItem[]
  created_at: string
}

interface Client {
  id: number
  name: string
  code: string
  role: string
}

interface Product {
  id: number
  name: string
  code: string
  unit: string
  price: number
  current_stock: number
}

interface InsufficientStockItem {
  product_id: number
  name: string
  requested: number
  available: number
}

// ============================================
// COMPONENT
// ============================================
export default function SalesPage() {
  const params = useParams()
  const companyId = params?.companyId as string

  // State
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Stock error state
  const [insufficientStock, setInsufficientStock] = useState<InsufficientStockItem[]>([])

  // Form state
  const [formData, setFormData] = useState({
    document_number: '',
    document_date: new Date().toISOString().split('T')[0],
    client_id: 0,
    document_type: 'INVOICE',
    currency: 'EUR',
    notes: ''
  })

  // Dynamic items
  const [formItems, setFormItems] = useState<{
    product_id: number
    quantity: string
    unit_price_base: string
    discount_percent: string
    vat_rate: string
  }[]>([
    { product_id: 0, quantity: '', unit_price_base: '', discount_percent: '0', vat_rate: '19' }
  ])

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    if (companyId) {
      fetchSales()
      fetchClients()
      fetchProducts()
    }
  }, [companyId])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/company/${companyId}/sales`)
      if (response.ok) {
        const data = await response.json()
        setSales(data.sales || [])
      } else {
        setError('Failed to load sales')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch(`/api/company/${companyId}/clients`)
      if (response.ok) {
        const data = await response.json()
        // Фильтруем только CLIENT и BOTH
        const clientList = (data.clients || []).filter(
          (c: Client) => c.role === 'CLIENT' || c.role === 'BOTH'
        )
        setClients(clientList)
      }
    } catch (err) {
      console.error('Failed to load clients:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/company/${companyId}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Failed to load products:', err)
    }
  }

  // ============================================
  // FORM HANDLERS
  // ============================================
  const addItem = () => {
    setFormItems([
      ...formItems,
      { product_id: 0, quantity: '', unit_price_base: '', discount_percent: '0', vat_rate: '19' }
    ])
  }

  const removeItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...formItems]
    updated[index] = { ...updated[index], [field]: value }

    // Автозаполнение цены при выборе продукта
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === Number(value))
      if (product && product.price) {
        updated[index].unit_price_base = product.price.toString()
      }
    }

    setFormItems(updated)

    // Очищаем ошибки недостатка при изменении
    setInsufficientStock([])
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalVat = 0
    let totalDiscount = 0

    formItems.forEach(item => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unit_price_base) || 0
      const discountPct = parseFloat(item.discount_percent) || 0
      const vatRate = parseFloat(item.vat_rate) || 0

      const gross = qty * price
      const discount = gross * (discountPct / 100)
      const net = gross - discount
      const vat = net * (vatRate / 100)

      subtotal += net
      totalVat += vat
      totalDiscount += discount
    })

    return {
      subtotal: subtotal.toFixed(2),
      discount: totalDiscount.toFixed(2),
      vat: totalVat.toFixed(2),
      total: (subtotal + totalVat).toFixed(2)
    }
  }

  const generateDocNumber = () => {
    const date = new Date()
    const prefix = 'INV'
    const timestamp = date.getTime().toString().slice(-6)
    return `${prefix}-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`
  }

  const openModal = () => {
    setFormData({
      document_number: generateDocNumber(),
      document_date: new Date().toISOString().split('T')[0],
      client_id: clients[0]?.id || 0,
      document_type: 'INVOICE',
      currency: 'EUR',
      notes: ''
    })
    setFormItems([{ product_id: 0, quantity: '', unit_price_base: '', discount_percent: '0', vat_rate: '19' }])
    setError(null)
    setInsufficientStock([])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setError(null)
    setInsufficientStock([])
  }

  // Проверка доступного остатка
  const getProductStock = (productId: number): number => {
    const product = products.find(p => p.id === productId)
    return product?.current_stock ? parseFloat(product.current_stock.toString()) : 0
  }

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInsufficientStock([])
    setSubmitting(true)

    // Валидация
    if (!formData.client_id) {
      setError('Please select a client')
      setSubmitting(false)
      return
    }

    const validItems = formItems.filter(
      item => item.product_id && parseFloat(item.quantity) > 0 && parseFloat(item.unit_price_base) > 0
    )

    if (validItems.length === 0) {
      setError('Please add at least one valid item')
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        document_number: formData.document_number,
        document_date: formData.document_date,
        client_id: formData.client_id,
        document_type: formData.document_type,
        currency: formData.currency,
        notes: formData.notes,
        items: validItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: parseFloat(item.quantity),
          unit_price_base: parseFloat(item.unit_price_base),
          discount_percent: parseFloat(item.discount_percent) || 0,
          vat_rate: parseFloat(item.vat_rate) || 0
        }))
      }

      console.log('[SALE] Submitting:', payload)

      const response = await fetch(`/api/company/${companyId}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage(`✅ Sale ${formData.document_number} created! Stock updated.`)
        setTimeout(() => setSuccessMessage(null), 4000)
        closeModal()
        fetchSales()
        fetchProducts() // Обновляем products для актуальных остатков
      } else {
        // Обработка ошибки недостатка товара
        if (data.insufficientStock) {
          setInsufficientStock(data.insufficientStock)
          setError('Insufficient stock for some products')
        } else {
          setError(data.error || 'Failed to create sale')
        }
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================
  const totals = calculateTotals()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Sales</h1>
            <span className="bg-purple-500 px-2 py-1 rounded text-sm">
              {sales.length} documents
            </span>
            <span className="bg-purple-800 px-2 py-1 rounded text-sm">
              Company ID: {companyId}
            </span>
          </div>
          <button
            onClick={openModal}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>New Sale</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="mx-4 mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Toast */}
      {error && !showModal && (
        <div className="mx-4 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-medium text-gray-700">ID</th>
                <th className="p-3 text-left font-medium text-gray-700">Document #</th>
                <th className="p-3 text-left font-medium text-gray-700">Date</th>
                <th className="p-3 text-left font-medium text-gray-700">Client</th>
                <th className="p-3 text-left font-medium text-gray-700">Type</th>
                <th className="p-3 text-left font-medium text-gray-700">Items</th>
                <th className="p-3 text-right font-medium text-gray-700">Subtotal</th>
                <th className="p-3 text-right font-medium text-gray-700">Total</th>
                <th className="p-3 text-center font-medium text-gray-700">Payment</th>
                <th className="p-3 text-center font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{sale.id}</td>
                  <td className="p-3 font-medium text-purple-600">{sale.document_number}</td>
                  <td className="p-3 text-gray-700">
                    {new Date(sale.document_date).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-gray-700">
                    {sale.client?.name || '-'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {sale.document_type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {sale.items?.length || 0} items
                  </td>
                  <td className="p-3 text-right text-gray-700">
                    {parseFloat(sale.subtotal?.toString() || '0').toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-semibold text-gray-900">
                    {parseFloat(sale.total_amount?.toString() || '0').toFixed(2)} {sale.currency}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.payment_status === 'PAID' ? 'bg-green-100 text-green-800' :
                      sale.payment_status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                      sale.payment_status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.payment_status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.document_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      sale.document_status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.document_status}
                    </span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    No sales yet. Click "New Sale" to create an invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart size={24} />
                <h2 className="text-lg font-semibold">New Sale (Stock Decrease)</h2>
              </div>
              <button onClick={closeModal} className="hover:bg-purple-700 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Error Alert */}
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2" size={20} />
                    {error}
                  </div>
                </div>
              )}

              {/* Insufficient Stock Alert */}
              {insufficientStock.length > 0 && (
                <div className="mb-4 bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-2 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold">Insufficient Stock:</p>
                      <ul className="mt-2 text-sm space-y-1">
                        {insufficientStock.map((item, idx) => (
                          <li key={idx}>
                            • <strong>{item.name}</strong>: requested {item.requested}, available only {item.available}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText size={14} className="inline mr-1" />
                    Document Number *
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={14} className="inline mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.document_date}
                    onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User size={14} className="inline mr-1" />
                    Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value={0}>Select client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code || 'No code'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="INVOICE">Invoice</option>
                    <option value="QUOTE">Quote</option>
                    <option value="ORDER">Order</option>
                    <option value="DELIVERY_NOTE">Delivery Note</option>
                    <option value="RECEIPT">Receipt</option>
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 px-2">
                    <div className="col-span-3">Product (Stock)</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-1">Disc %</div>
                    <div className="col-span-1">VAT %</div>
                    <div className="col-span-2 text-right">Line Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Items Rows */}
                  {formItems.map((item, index) => {
                    const qty = parseFloat(item.quantity) || 0
                    const price = parseFloat(item.unit_price_base) || 0
                    const discountPct = parseFloat(item.discount_percent) || 0
                    const vatPct = parseFloat(item.vat_rate) || 0

                    const gross = qty * price
                    const discount = gross * (discountPct / 100)
                    const net = gross - discount
                    const lineTotal = net * (1 + vatPct / 100)

                    const stock = getProductStock(Number(item.product_id))
                    const isOverStock = item.product_id && qty > stock

                    // Проверяем, есть ли этот товар в списке недостаточных
                    const insufficientItem = insufficientStock.find(i => i.product_id === Number(item.product_id))

                    return (
                      <div key={index} className={`grid grid-cols-12 gap-2 items-center ${isOverStock || insufficientItem ? 'bg-red-50 rounded p-2 -mx-2' : ''}`}>
                        <div className="col-span-3">
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                            className={`w-full px-2 py-2 border rounded text-sm ${isOverStock || insufficientItem ? 'border-red-400' : 'border-gray-300'}`}
                          >
                            <option value={0}>Select product...</option>
                            {products.map(p => {
                              const pStock = p.current_stock ? parseFloat(p.current_stock.toString()) : 0
                              return (
                                <option key={p.id} value={p.id}>
                                  {p.name} [{pStock} {p.unit}]
                                </option>
                              )
                            })}
                          </select>
                          {(isOverStock || insufficientItem) && (
                            <div className="text-xs text-red-600 mt-1">
                              ⚠️ Only {stock} available
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            max={stock || 999999}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className={`w-full px-2 py-2 border rounded text-sm ${isOverStock || insufficientItem ? 'border-red-400' : 'border-gray-300'}`}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price_base}
                            onChange={(e) => updateItem(index, 'unit_price_base', e.target.value)}
                            placeholder="Price"
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={item.discount_percent}
                            onChange={(e) => updateItem(index, 'discount_percent', e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={item.vat_rate}
                            onChange={(e) => updateItem(index, 'vat_rate', e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="col-span-2 text-right font-medium text-gray-700">
                          {lineTotal.toFixed(2)}
                        </div>
                        <div className="col-span-1 text-center">
                          {formItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <div className="flex justify-end space-x-8">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Subtotal</div>
                    <div className="font-medium">{totals.subtotal} EUR</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Discount</div>
                    <div className="font-medium text-red-600">-{totals.discount} EUR</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">VAT</div>
                    <div className="font-medium">{totals.vat} EUR</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-xl font-bold text-purple-600">{totals.total} EUR</div>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-purple-700">
                  📤 <strong>Stock Update:</strong> After creating this sale, the stock for selected products will be automatically decreased.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Create Sale</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
