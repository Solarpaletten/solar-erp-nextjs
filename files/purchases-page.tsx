// src/app/(products)/(dashboard)/company/[companyId]/purchases/page.tsx
// PURCHASES PAGE - Закупки (приход на склад)
// Sprint 3.1: Frontend + Stock Integration

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, X, Trash2, Package, Calendar, FileText, User } from 'lucide-react'

// ============================================
// TYPES
// ============================================
interface PurchaseItem {
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
  unit_price: number
  vat_rate: number
  vat_amount?: number
  line_total: number
}

interface Purchase {
  id: number
  document_number: string
  document_date: string
  operation_type: string
  supplier_id: number
  supplier?: {
    id: number
    name: string
    code: string
  }
  subtotal: number
  vat_amount: number
  total_amount: number
  currency: string
  payment_status: string
  document_status: string
  items: PurchaseItem[]
  created_at: string
}

interface Supplier {
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
  cost_price: number
  current_stock: number
}

// ============================================
// COMPONENT
// ============================================
export default function PurchasesPage() {
  const params = useParams()
  const companyId = params?.companyId as string

  // State
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    document_number: '',
    document_date: new Date().toISOString().split('T')[0],
    supplier_id: 0,
    currency: 'EUR',
    notes: ''
  })

  // Dynamic items
  const [formItems, setFormItems] = useState<{
    product_id: number
    quantity: string
    unit_price: string
    vat_rate: string
  }[]>([
    { product_id: 0, quantity: '', unit_price: '', vat_rate: '19' }
  ])

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    if (companyId) {
      fetchPurchases()
      fetchSuppliers()
      fetchProducts()
    }
  }, [companyId])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/company/${companyId}/purchases`)
      if (response.ok) {
        const data = await response.json()
        setPurchases(data.purchases || [])
      } else {
        setError('Failed to load purchases')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`/api/company/${companyId}/clients`)
      if (response.ok) {
        const data = await response.json()
        // Фильтруем только SUPPLIER и BOTH
        const supplierList = (data.clients || []).filter(
          (c: Supplier) => c.role === 'SUPPLIER' || c.role === 'BOTH'
        )
        setSuppliers(supplierList)
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err)
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
      { product_id: 0, quantity: '', unit_price: '', vat_rate: '19' }
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
      if (product && product.cost_price) {
        updated[index].unit_price = product.cost_price.toString()
      }
    }

    setFormItems(updated)
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalVat = 0

    formItems.forEach(item => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unit_price) || 0
      const vatRate = parseFloat(item.vat_rate) || 0

      const lineTotal = qty * price
      const vatAmount = lineTotal * (vatRate / 100)

      subtotal += lineTotal
      totalVat += vatAmount
    })

    return {
      subtotal: subtotal.toFixed(2),
      vat: totalVat.toFixed(2),
      total: (subtotal + totalVat).toFixed(2)
    }
  }

  const generateDocNumber = () => {
    const date = new Date()
    const prefix = 'PUR'
    const timestamp = date.getTime().toString().slice(-6)
    return `${prefix}-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`
  }

  const openModal = () => {
    setFormData({
      document_number: generateDocNumber(),
      document_date: new Date().toISOString().split('T')[0],
      supplier_id: suppliers[0]?.id || 0,
      currency: 'EUR',
      notes: ''
    })
    setFormItems([{ product_id: 0, quantity: '', unit_price: '', vat_rate: '19' }])
    setError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setError(null)
  }

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Валидация
    if (!formData.supplier_id) {
      setError('Please select a supplier')
      setSubmitting(false)
      return
    }

    const validItems = formItems.filter(
      item => item.product_id && parseFloat(item.quantity) > 0 && parseFloat(item.unit_price) > 0
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
        supplier_id: formData.supplier_id,
        currency: formData.currency,
        notes: formData.notes,
        items: validItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          vat_rate: parseFloat(item.vat_rate) || 0
        }))
      }

      console.log('[PURCHASE] Submitting:', payload)

      const response = await fetch(`/api/company/${companyId}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage(`✅ Purchase ${formData.document_number} created! Stock updated.`)
        setTimeout(() => setSuccessMessage(null), 4000)
        closeModal()
        fetchPurchases()
      } else {
        setError(data.error || 'Failed to create purchase')
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Purchases</h1>
            <span className="bg-blue-500 px-2 py-1 rounded text-sm">
              {purchases.length} documents
            </span>
            <span className="bg-blue-800 px-2 py-1 rounded text-sm">
              Company ID: {companyId}
            </span>
          </div>
          <button
            onClick={openModal}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>New Purchase</span>
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
                <th className="p-3 text-left font-medium text-gray-700">Supplier</th>
                <th className="p-3 text-left font-medium text-gray-700">Items</th>
                <th className="p-3 text-right font-medium text-gray-700">Subtotal</th>
                <th className="p-3 text-right font-medium text-gray-700">VAT</th>
                <th className="p-3 text-right font-medium text-gray-700">Total</th>
                <th className="p-3 text-center font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{purchase.id}</td>
                  <td className="p-3 font-medium text-blue-600">{purchase.document_number}</td>
                  <td className="p-3 text-gray-700">
                    {new Date(purchase.document_date).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-gray-700">
                    {purchase.supplier?.name || '-'}
                  </td>
                  <td className="p-3 text-gray-600">
                    {purchase.items?.length || 0} items
                  </td>
                  <td className="p-3 text-right text-gray-700">
                    {parseFloat(purchase.subtotal?.toString() || '0').toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {parseFloat(purchase.vat_amount?.toString() || '0').toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-semibold text-gray-900">
                    {parseFloat(purchase.total_amount?.toString() || '0').toFixed(2)} {purchase.currency}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      purchase.document_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      purchase.document_status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      purchase.document_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {purchase.document_status}
                    </span>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No purchases yet. Click "New Purchase" to add stock.
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
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package size={24} />
                <h2 className="text-lg font-semibold">New Purchase (Stock Arrival)</h2>
              </div>
              <button onClick={closeModal} className="hover:bg-blue-700 p-1 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText size={14} className="inline mr-1" />
                    Document Number *
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User size={14} className="inline mr-1" />
                    Supplier *
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code || 'No code'})
                      </option>
                    ))}
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
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 px-2">
                    <div className="col-span-4">Product</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-1">VAT %</div>
                    <div className="col-span-2 text-right">Line Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Items Rows */}
                  {formItems.map((item, index) => {
                    const qty = parseFloat(item.quantity) || 0
                    const price = parseFloat(item.unit_price) || 0
                    const vat = parseFloat(item.vat_rate) || 0
                    const lineTotal = qty * price * (1 + vat / 100)

                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value={0}>Select product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.code}) - {p.unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
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
                    <div className="text-sm text-gray-600">VAT</div>
                    <div className="font-medium">{totals.vat} EUR</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-xl font-bold text-blue-600">{totals.total} EUR</div>
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-700">
                  📦 <strong>Stock Update:</strong> After creating this purchase, the stock for selected products will be automatically increased.
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
                      <span>Create Purchase</span>
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
