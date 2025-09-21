'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Edit, Copy, Trash2, Save, X, Search, Filter } from 'lucide-react'

interface Client {
  id: number
  company_id: number
  name: string
  abbreviation?: string
  code?: string
  email: string
  phone?: string
  fax?: string
  website?: string
  contact_information?: string
  role: 'CLIENT' | 'SUPPLIER' | 'BOTH'
  is_juridical: boolean
  is_active: boolean
  is_foreigner: boolean
  country?: string
  legal_address?: string
  actual_address?: string
  business_license_code?: string
  vat_code?: string
  vat_rate?: number
  eori_code?: string
  foreign_taxpayer_code?: string
  registration_number?: string
  credit_sum?: number
  pay_per?: string
  currency: 'EUR' | 'USD' | 'AED' | 'UAH' | 'GBP'
  payment_terms?: string
  automatic_debt_reminder?: boolean
  registration_date?: string
  date_of_birth?: string
  sabis_customer_name?: string
  sabis_customer_code?: string
  additional_information?: string
  notes?: string
  created_by: number
  created_at: string
  updated_at: string
}

interface ColumnFilter {
  name: string
  abbreviation: string
  code: string
  email: string
  phone: string
  vat_code: string
  country: string
  role: string
  currency: string
}

export default function CompactClientsTable() {
  const params = useParams()
  const companyId = params?.companyId as string

  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClients, setSelectedClients] = useState<number[]>([])

  // Фильтры для каждого столбца
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({
    name: '',
    abbreviation: '',
    code: '',
    email: '',
    phone: '',
    vat_code: '',
    country: '',
    role: '',
    currency: ''
  })

  // Форма для нового/редактируемого клиента
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    code: '',
    email: '',
    phone: '',
    fax: '',
    website: '',
    contact_information: '',
    role: 'CLIENT' as 'CLIENT' | 'SUPPLIER' | 'BOTH',
    is_juridical: true,
    is_active: true,
    is_foreigner: false,
    country: '',
    legal_address: '',
    actual_address: '',
    business_license_code: '',
    vat_code: '',
    vat_rate: '',
    eori_code: '',
    foreign_taxpayer_code: '',
    registration_number: '',
    credit_sum: '0',
    pay_per: '',
    currency: 'EUR' as 'EUR' | 'USD' | 'AED' | 'UAH' | 'GBP',
    payment_terms: '',
    automatic_debt_reminder: false,
    registration_date: '',
    date_of_birth: '',
    sabis_customer_name: '',
    sabis_customer_code: '',
    additional_information: '',
    notes: ''
  })

  useEffect(() => {
    if (companyId) {
      fetchClients()
    }
  }, [companyId])

  useEffect(() => {
    // Применяем фильтры к клиентам
    const filtered = clients.filter(client => {
      return (
        (client.name?.toLowerCase().includes(columnFilters.name.toLowerCase()) || '') &&
        (client.abbreviation?.toLowerCase().includes(columnFilters.abbreviation.toLowerCase()) || !columnFilters.abbreviation) &&
        (client.code?.toLowerCase().includes(columnFilters.code.toLowerCase()) || !columnFilters.code) &&
        (client.email?.toLowerCase().includes(columnFilters.email.toLowerCase()) || '') &&
        (client.phone?.includes(columnFilters.phone) || !columnFilters.phone) &&
        (client.vat_code?.includes(columnFilters.vat_code) || !columnFilters.vat_code) &&
        (client.country?.toLowerCase().includes(columnFilters.country.toLowerCase()) || !columnFilters.country) &&
        (client.role?.toLowerCase().includes(columnFilters.role.toLowerCase()) || !columnFilters.role) &&
        (client.currency?.includes(columnFilters.currency) || !columnFilters.currency)
      )
    })
    setFilteredClients(filtered)
  }, [clients, columnFilters])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/company/${companyId}/clients`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      } else {
        setError('Не удалось загрузить клиентов')
      }
    } catch (error) {
      setError('Ошибка подключения к серверу')
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
    if (!formData.name || !formData.email) {
      setError('Название и email обязательны')
      return
    }

    try {
      const url = editingClient
        ? `/api/company/${companyId}/clients/${editingClient.id}`
        : `/api/company/${companyId}/clients`

      const method = editingClient ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          company_id: parseInt(companyId)
        })
      })

      if (response.ok) {
        fetchClients()
        setShowForm(false)
        setEditingClient(null)
        resetForm()
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Не удалось сохранить клиента')
      }
    } catch (error) {
      setError('Ошибка сохранения клиента')
    }
  }

  const handleCopy = async (client: Client) => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const baseCode = client.code?.split('_COPY_')[0] || ''
    const baseName = client.name?.replace(/ Copy( \d+)?$/, '') || ''

    const copiedData = {
      ...formData,
      name: `${baseName} Copy ${random}`,
      code: baseCode ? `${baseCode}_COPY_${random}` : '',
      email: `copy_${timestamp}_${random}_${client.email}`,
      abbreviation: client.abbreviation ? `${client.abbreviation} Copy` : '',
      phone: client.phone,
      fax: client.fax,
      website: client.website,
      vat_code: client.vat_code ? `${client.vat_code}_COPY_${random}` : '',
      role: client.role,
      currency: client.currency,
      country: client.country,
      is_active: client.is_active,
      is_juridical: client.is_juridical,
      is_foreigner: client.is_foreigner
    }

    try {
      const response = await fetch(`/api/company/${companyId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...copiedData,
          company_id: parseInt(companyId)
        })
      })

      if (response.ok) {
        fetchClients()
      } else {
        setError('Не удалось скопировать клиента')
      }
    } catch (error) {
      setError('Ошибка копирования клиента')
    }
  }

  const handleDelete = async (clientId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return

    try {
      const response = await fetch(`/api/company/${companyId}/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchClients()
      } else {
        setError('Не удалось удалить клиента')
      }
    } catch (error) {
      setError('Ошибка удаления клиента')
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name || '',
      abbreviation: client.abbreviation || '',
      code: client.code || '',
      email: client.email || '',
      phone: client.phone || '',
      fax: client.fax || '',
      website: client.website || '',
      contact_information: client.contact_information || '',
      role: client.role || 'CLIENT',
      is_juridical: client.is_juridical ?? true,
      is_active: client.is_active ?? true,
      is_foreigner: client.is_foreigner ?? false,
      country: client.country || '',
      legal_address: client.legal_address || '',
      actual_address: client.actual_address || '',
      business_license_code: client.business_license_code || '',
      vat_code: client.vat_code || '',
      vat_rate: client.vat_rate?.toString() || '',
      eori_code: client.eori_code || '',
      foreign_taxpayer_code: client.foreign_taxpayer_code || '',
      registration_number: client.registration_number || '',
      credit_sum: client.credit_sum?.toString() || '0',
      pay_per: client.pay_per || '',
      currency: client.currency || 'EUR',
      payment_terms: client.payment_terms || '',
      automatic_debt_reminder: client.automatic_debt_reminder ?? false,
      registration_date: client.registration_date?.split('T')[0] || '',
      date_of_birth: client.date_of_birth?.split('T')[0] || '',
      sabis_customer_name: client.sabis_customer_name || '',
      sabis_customer_code: client.sabis_customer_code || '',
      additional_information: client.additional_information || '',
      notes: client.notes || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      abbreviation: '',
      code: '',
      email: '',
      phone: '',
      fax: '',
      website: '',
      contact_information: '',
      role: 'CLIENT',
      is_juridical: true,
      is_active: true,
      is_foreigner: false,
      country: '',
      legal_address: '',
      actual_address: '',
      business_license_code: '',
      vat_code: '',
      vat_rate: '',
      eori_code: '',
      foreign_taxpayer_code: '',
      registration_number: '',
      credit_sum: '0',
      pay_per: '',
      currency: 'EUR',
      payment_terms: '',
      automatic_debt_reminder: false,
      registration_date: '',
      date_of_birth: '',
      sabis_customer_name: '',
      sabis_customer_code: '',
      additional_information: '',
      notes: ''
    })
  }

  const handleSelectClient = (clientId: number) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map(client => client.id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Светло-оранжевый заголовок */}
      <div className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-md">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">Клиенты</h1>
            <span className="bg-orange-600 px-2 py-1 rounded text-sm">
              {filteredClients.length} из {clients.length}
            </span>
          </div>
        </div>

        {/* Панель инструментов */}
        <div className="bg-white border-t border-orange-200 px-3 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors"
            >
              <Plus size={14} />
              <span>Добавить нового клиента</span>
            </button>

            <button
              onClick={() => {
                if (selectedClients.length === 1) {
                  const client = clients.find(c => c.id === selectedClients[0])
                  if (client) handleEdit(client)
                }
              }}
              disabled={selectedClients.length !== 1}
              className={`px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors ${selectedClients.length === 1
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              title="Редактировать"
            >
              <Edit size={14} />
            </button>

            <button
              onClick={() => {
                if (selectedClients.length > 0) {
                  const confirmMsg = `Удалить ${selectedClients.length} клиент(ов)?`
                  if (confirm(confirmMsg)) {
                    selectedClients.forEach(id => handleDelete(id))
                  }
                }
              }}
              disabled={selectedClients.length === 0}
              className={`px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors ${selectedClients.length > 0
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              title="Удалить"
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={() => {
                selectedClients.forEach(id => {
                  const client = clients.find(c => c.id === id)
                  if (client) handleCopy(client)
                })
              }}
              disabled={selectedClients.length === 0}
              className={`px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors ${selectedClients.length > 0
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              title="Копировать"
            >
              <Copy size={14} />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors"
              title="Список"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>

            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors"
              title="Таблица"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="15" x2="21" y2="15"></line>
                <line x1="3" y1="9" x2="9" y2="9"></line>
                <line x1="3" y1="15" x2="9" y2="15"></line>
              </svg>
            </button>

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors"
              title="Печать"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6,9 6,2 18,2 18,9"></polyline>
                <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </button>

            <button
              className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-1 transition-colors"
              title="Настройки"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4,15a1.65,1.65,0,0,0,.33,1.82l.06.06a2,2,0,0,1,0,2.83,2,2,0,0,1-2.83,0l-.06-.06a1.65,1.65,0,0,0-1.82-.33,1.65,1.65,0,0,0-1,1.51V21a2,2,0,0,1-2,2,2,2,0,0,1-2-2V20.51a1.65,1.65,0,0,0-1.51-1,1.65,1.65,0,0,0-1.82.33l-.06.06a2,2,0,0,1-2.83,0,2,2,0,0,1,0-2.83l.06-.06a1.65,1.65,0,0,0,.33-1.82,1.65,1.65,0,0,0-1.51-1H3a2,2,0,0,1-2-2,2,2,0,0,1,2-2H4.49a1.65,1.65,0,0,0,1-1.51,1.65,1.65,0,0,0-.33-1.82L5.1,8.93a2,2,0,0,1,0-2.83,2,2,0,0,1,2.83,0l.06.06a1.65,1.65,0,0,0,1.82.33H10a1.65,1.65,0,0,0,1-1.51V3a2,2,0,0,1,2-2,2,2,0,0,1,2,2V4.49a1.65,1.65,0,0,0,1.51,1,1.65,1.65,0,0,0,1.82-.33l.06-.06a2,2,0,0,1,2.83,0,2,2,0,0,1,0,2.83l-.06.06a1.65,1.65,0,0,0-.33,1.82V10a1.65,1.65,0,0,0,1.51,1H21a2,2,0,0,1,2,2,2,2,0,0,1-2,2H20.51A1.65,1.65,0,0,0,19.4,15Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Таблица с компактными строками */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-left">
              <th className="p-2 w-8">
                <input
                  type="checkbox"
                  checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="p-2 min-w-[200px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Название</span>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={columnFilters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[100px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Сокращение</span>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={columnFilters.abbreviation}
                    onChange={(e) => handleFilterChange('abbreviation', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[80px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Код</span>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={columnFilters.code}
                    onChange={(e) => handleFilterChange('code', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[180px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Email</span>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={columnFilters.email}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[110px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Телефон</span>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={columnFilters.phone}
                    onChange={(e) => handleFilterChange('phone', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[100px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">НДС код</span>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={columnFilters.vat_code}
                    onChange={(e) => handleFilterChange('vat_code', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[80px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Страна</span>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={columnFilters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </th>
              <th className="p-2 min-w-[80px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Роль</span>
                  <select
                    value={columnFilters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Все</option>
                    <option value="CLIENT">CLIENT</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="BOTH">BOTH</option>
                  </select>
                </div>
              </th>
              <th className="p-2 min-w-[70px]">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-700">Валюта</span>
                  <select
                    value={columnFilters.currency}
                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Все</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="UAH">UAH</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </th>
              <th className="p-2 w-[60px]">
                <span className="font-medium text-gray-700">Статус</span>
              </th>
              <th className="p-2 w-[100px]">
                <span className="font-medium text-gray-700">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredClients.map((client, index) => (
              <tr
                key={client.id}
                className={`
                  border-b border-gray-100 hover:bg-gray-50 transition-colors
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                  ${selectedClients.includes(client.id) ? 'bg-orange-50' : ''}
                `}
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => handleSelectClient(client.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="p-2">
                  <div className="font-medium text-gray-900">{client.name}</div>
                  {client.contact_information && (
                    <div className="text-xs text-gray-500">{client.contact_information}</div>
                  )}
                </td>
                <td className="p-2 text-gray-700">{client.abbreviation || '-'}</td>
                <td className="p-2 text-gray-700">{client.code || '-'}</td>
                <td className="p-2 text-gray-700">{client.email}</td>
                <td className="p-2 text-gray-700">{client.phone || '-'}</td>
                <td className="p-2 text-gray-700">{client.vat_code || '-'}</td>
                <td className="p-2 text-gray-700">{client.country || '-'}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${client.role === 'CLIENT' ? 'bg-blue-100 text-blue-800' :
                    client.role === 'SUPPLIER' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                    {client.role}
                  </span>
                </td>
                <td className="p-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {client.currency}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex space-x-1">
                    {client.is_active ? (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Активен"></span>
                    ) : (
                      <span className="w-2 h-2 bg-red-500 rounded-full" title="Неактивен"></span>
                    )}
                    {client.is_juridical && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" title="Юридическое лицо"></span>
                    )}
                    {client.is_foreigner && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full" title="Иностранец"></span>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Редактировать"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleCopy(client)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Копировать"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Клиенты не найдены
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="bg-white border-t p-2 text-xs text-gray-500 flex justify-between">
        <span>Показано {filteredClients.length} из {clients.length} клиентов</span>
        {selectedClients.length > 0 && (
          <span>Выбрано: {selectedClients.length}</span>
        )}
      </div>

      {/* Модальная форма */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingClient ? 'Редактировать клиента' : 'Добавить клиента'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingClient(null)
                    resetForm()
                    setError(null)
                  }}
                  className="text-white hover:bg-orange-700 p-1 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Введите название клиента"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сокращение
                  </label>
                  <input
                    type="text"
                    value={formData.abbreviation}
                    onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Краткое название"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Код
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Код клиента"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Факс
                  </label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+1 234 567 8901"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Веб-сайт
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    НДС код
                  </label>
                  <input
                    type="text"
                    value={formData.vat_code}
                    onChange={(e) => setFormData({ ...formData, vat_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="VAT123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ставка НДС (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vat_rate}
                    onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="20.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Страна
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Страна клиента"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Роль
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CLIENT' | 'SUPPLIER' | 'BOTH' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="BOTH">BOTH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Валюта
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'EUR' | 'USD' | 'AED' | 'UAH' | 'GBP' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    Кредитный лимит
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.credit_sum}
                    onChange={(e) => setFormData({ ...formData, credit_sum: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Условия оплаты
                  </label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="30 дней"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Номер регистрации
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Регистрационный номер"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата регистрации
                  </label>
                  <input
                    type="date"
                    value={formData.registration_date}
                    onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Юридический адрес
                  </label>
                  <textarea
                    value={formData.legal_address}
                    onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Введите юридический адрес"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фактический адрес
                  </label>
                  <textarea
                    value={formData.actual_address}
                    onChange={(e) => setFormData({ ...formData, actual_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Введите фактический адрес"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Примечания
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="Дополнительные примечания"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Активен</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_juridical}
                    onChange={(e) => setFormData({ ...formData, is_juridical: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Юридическое лицо</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_foreigner}
                    onChange={(e) => setFormData({ ...formData, is_foreigner: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Иностранец</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.automatic_debt_reminder}
                    onChange={(e) => setFormData({ ...formData, automatic_debt_reminder: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Автонапоминание о долге</span>
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
                    setEditingClient(null)
                    resetForm()
                    setError(null)
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editingClient ? 'Обновить' : 'Создать'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}