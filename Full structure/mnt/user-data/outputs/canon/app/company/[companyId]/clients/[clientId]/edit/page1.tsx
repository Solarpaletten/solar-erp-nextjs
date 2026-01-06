// app/company/[companyId]/clients/[clientId]/edit/page.tsx
// SolarNetJS Canon — Company-first, NO src/, NO route groups

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ClientData {
  name: string;
  email: string;
  phone: string;
  abbreviation: string;
  code: string;
  vat_code: string;
  role: 'CLIENT' | 'SUPPLIER' | 'BOTH';
  is_juridical: boolean;
  is_active: boolean;
  is_foreigner: boolean;
  country: string;
  legal_address: string;
  actual_address: string;
  registration_number: string;
  notes: string;
}

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;
  const clientId = params.clientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClientData>({
    name: '',
    email: '',
    phone: '',
    abbreviation: '',
    code: '',
    vat_code: '',
    role: 'CLIENT',
    is_juridical: true,
    is_active: true,
    is_foreigner: false,
    country: '',
    legal_address: '',
    actual_address: '',
    registration_number: '',
    notes: '',
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/company/${companyId}/clients/${clientId}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.client) {
          const c = data.client;
          setFormData({
            name: c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            abbreviation: c.abbreviation || '',
            code: c.code || '',
            vat_code: c.vat_code || '',
            role: c.role || 'CLIENT',
            is_juridical: c.is_juridical ?? true,
            is_active: c.is_active ?? true,
            is_foreigner: c.is_foreigner ?? false,
            country: c.country || '',
            legal_address: c.legal_address || '',
            actual_address: c.actual_address || '',
            registration_number: c.registration_number || '',
            notes: c.notes || '',
          });
        } else {
          setError(data.error || 'Клиент не найден');
        }
      } catch {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [companyId, clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/${companyId}/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/company/${companyId}/clients`);
      } else {
        setError(data.error || 'Не удалось обновить');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500">Загрузка клиента...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-xl px-6 py-4 shadow-lg">
        <div className="flex items-center gap-4">
          <Link href={`/company/${companyId}/clients`} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">Редактировать клиента</h1>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">ID: {clientId}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-sm">
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Основная информация</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сокращение</label>
            <input type="text" name="abbreviation" value={formData.abbreviation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Код</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PVM код</label>
            <input type="text" name="vat_code" value={formData.vat_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Рег. номер</label>
            <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {/* Тип и роль */}
          <div className="lg:col-span-3 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Тип и роль</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="CLIENT">Клиент</option>
              <option value="SUPPLIER">Поставщик</option>
              <option value="BOTH">Оба</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Страна</label>
            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_juridical" checked={formData.is_juridical} onChange={handleChange} className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Юр. лицо</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Активен</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_foreigner" checked={formData.is_foreigner} onChange={handleChange} className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Иностранец</span>
            </label>
          </div>

          {/* Адреса */}
          <div className="lg:col-span-3 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Адреса</h2>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Юр. адрес</label>
            <input type="text" name="legal_address" value={formData.legal_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Факт. адрес</label>
            <input type="text" name="actual_address" value={formData.actual_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {/* Примечания */}
          <div className="lg:col-span-3 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Примечания</h2>
          </div>

          <div className="lg:col-span-3">
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Заметки..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <Link href={`/company/${companyId}/clients`} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-4 h-4" />Отмена
          </Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Сохранение...</> : <><Save className="w-4 h-4" />Сохранить</>}
          </button>
        </div>
      </form>
    </div>
  );
}
