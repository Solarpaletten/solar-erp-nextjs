// src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx
// Sprint 1.2 — Professional Clients Page with Grid Config (Site.pro-level)

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CLIENTS_COLUMNS,
  getDefaultVisibleColumns,
  loadGridConfig,
  saveGridConfig,
  resetGridConfig,
  getColumnByKey,
  ColumnConfig,
} from '@/config/clients/columnsConfig';
import GridConfigModal from '@/components/clients/GridConfigModal';
import {
  Plus,
  Settings2,
  Pencil,
  Trash2,
  Copy,
  Search,
  ChevronDown,
  Check,
  X,
  Loader2,
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Client {
  id: number;
  name: string;
  abbreviation?: string | null;
  code?: string | null;
  email: string;
  phone?: string | null;
  fax?: string | null;
  website?: string | null;
  contact_information?: string | null;
  role: 'CLIENT' | 'SUPPLIER' | 'BOTH';
  is_juridical: boolean;
  is_active: boolean;
  is_foreigner: boolean;
  country?: string | null;
  legal_address?: string | null;
  actual_address?: string | null;
  business_license_code?: string | null;
  vat_code?: string | null;
  vat_rate?: number | null;
  eori_code?: string | null;
  foreign_taxpayer_code?: string | null;
  registration_number?: string | null;
  credit_sum?: number | null;
  pay_per?: string | null;
  currency: string;
  payment_terms?: string | null;
  automatic_debt_reminder?: boolean | null;
  registration_date?: string | null;
  date_of_birth?: string | null;
  sabis_customer_name?: string | null;
  sabis_customer_code?: string | null;
  additional_information?: string | null;
  notes?: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// ============================================
// ROLE BADGE COMPONENT
// ============================================

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    CLIENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SUPPLIER: 'bg-blue-100 text-blue-700 border-blue-200',
    BOTH: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || 'bg-gray-100 text-gray-700'}`}
    >
      {role}
    </span>
  );
}

// ============================================
// STATUS INDICATOR COMPONENT
// ============================================

function StatusIndicator({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-red-400'}`}
      />
      <span
        className={`text-xs ${active ? 'text-green-600' : 'text-red-500'}`}
      >
        {active ? '●●' : '●●'}
      </span>
    </div>
  );
}

// ============================================
// CELL RENDERER
// ============================================

function renderCell(client: Client, column: ColumnConfig): React.ReactNode {
  const value = client[column.key];

  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-gray-300">-</span>;
  }

  // Render by type
  switch (column.type) {
    case 'boolean':
      return column.key === 'is_active' ? (
        <StatusIndicator active={!!value} />
      ) : (
        <span>{value ? '✓' : '✗'}</span>
      );

    case 'enum':
      if (column.key === 'role') {
        return <RoleBadge role={String(value)} />;
      }
      return <span>{String(value)}</span>;

    case 'date':
      if (!value) return <span className="text-gray-300">-</span>;
      try {
        const date = new Date(String(value));
        return (
          <span>
            {date.toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        );
      } catch {
        return <span>{String(value)}</span>;
      }

    case 'number':
      if (column.key === 'vat_rate' || column.key === 'credit_sum') {
        return <span>{Number(value).toLocaleString()}</span>;
      }
      return <span>{value}</span>;

    case 'currency':
      return <span className="font-mono">{String(value)}</span>;

    default:
      // Truncate long strings
      const strValue = String(value);
      if (strValue.length > 50) {
        return (
          <span title={strValue}>{strValue.substring(0, 47)}...</span>
        );
      }
      return <span>{strValue}</span>;
  }
}

// ============================================
// FILTER INPUT COMPONENT
// ============================================

function FilterInput({
  column,
  value,
  onChange,
}: {
  column: ColumnConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  if (column.type === 'enum' && column.enumOptions) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
      >
        <option value="">Все</option>
        {column.enumOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === 'boolean') {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
      >
        <option value="">Все</option>
        <option value="true">Да</option>
        <option value="false">Нет</option>
      </select>
    );
  }

  return (
    <input
      type="text"
      placeholder="Поиск..."
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
    />
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ClientsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grid config state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    // Try to load from localStorage, fallback to defaults
    const saved = loadGridConfig(companyId);
    return saved || getDefaultVisibleColumns();
  });
  const [isGridConfigOpen, setIsGridConfigOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/company/${companyId}/clients`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setClients(data.clients);
      } else {
        setError(data.error || 'Failed to fetch clients');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ============================================
  // GRID CONFIG HANDLERS
  // ============================================

  const handleSaveGridConfig = (columns: string[]) => {
    setVisibleColumns(columns);
    saveGridConfig(companyId, columns);
  };

  const handleResetGridConfig = () => {
    const defaults = getDefaultVisibleColumns();
    setVisibleColumns(defaults);
    resetGridConfig(companyId);
  };

  // ============================================
  // FILTER LOGIC
  // ============================================

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      for (const [key, filterValue] of Object.entries(filters)) {
        if (!filterValue) continue;

        const column = getColumnByKey(key);
        if (!column) continue;

        const cellValue = client[key];

        if (column.type === 'boolean') {
          const boolFilter = filterValue === 'true';
          if (cellValue !== boolFilter) return false;
        } else if (column.type === 'enum') {
          if (String(cellValue) !== filterValue) return false;
        } else {
          // String search
          if (
            cellValue &&
            !String(cellValue).toLowerCase().includes(filterValue.toLowerCase())
          ) {
            return false;
          }
        }
      }
      return true;
    });
  }, [clients, filters]);

  // ============================================
  // VISIBLE COLUMNS CONFIG
  // ============================================

  const activeColumns = useMemo(() => {
    return CLIENTS_COLUMNS.filter(col => visibleColumns.includes(col.key));
  }, [visibleColumns]);

  // ============================================
  // SELECTION HANDLERS
  // ============================================

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredClients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClients.map(c => c.id)));
    }
  };

  const toggleSelectRow = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // ============================================
  // CRUD HANDLERS
  // ============================================

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить клиента?')) return;
    try {
      const res = await fetch(`/api/company/${companyId}/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchClients();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-t-xl px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Клиенты</h1>
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-sm text-white">
              {filteredClients.length} из {clients.length}
            </span>
            <span className="px-3 py-1 bg-orange-500 rounded-full text-sm font-medium text-white">
              Company ID: {companyId}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-x border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/company/${companyId}/clients/new`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Добавить нового клиента
          </button>

          {/* Bulk actions */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid Config Button */}
          <button
            onClick={() => setIsGridConfigOpen(true)}
            className="flex items-center gap-2 p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Grid config"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            <span className="ml-3 text-gray-500">Загрузка...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            <X className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
            <button
              onClick={fetchClients}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg"
            >
              Повторить
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                {/* Column Headers */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredClients.length && filteredClients.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </th>
                  {activeColumns.map(col => (
                    <th
                      key={col.key}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                      style={{ minWidth: col.width }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>

                {/* Filter Row */}
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-3 py-2"></th>
                  {activeColumns.map(col => (
                    <th key={`filter-${col.key}`} className="px-3 py-2">
                      {col.filterable && (
                        <FilterInput
                          column={col}
                          value={filters[col.key] || ''}
                          onChange={value =>
                            setFilters(prev => ({ ...prev, [col.key]: value }))
                          }
                        />
                      )}
                    </th>
                  ))}
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map(client => (
                  <tr
                    key={client.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.has(client.id) ? 'bg-teal-50' : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(client.id)}
                        onChange={() => toggleSelectRow(client.id)}
                        className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                      />
                    </td>
                    {activeColumns.map(col => (
                      <td
                        key={`${client.id}-${col.key}`}
                        className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap"
                      >
                        {renderCell(client, col)}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            router.push(`/company/${companyId}/clients/${client.id}/edit`)
                          }
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Редактировать"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredClients.length === 0 && (
                  <tr>
                    <td
                      colSpan={activeColumns.length + 2}
                      className="px-3 py-12 text-center text-gray-500"
                    >
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Клиенты не найдены</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Показано {filteredClients.length} из {clients.length} клиентов
        </div>
      </div>

      {/* Grid Config Modal */}
      <GridConfigModal
        isOpen={isGridConfigOpen}
        onClose={() => setIsGridConfigOpen(false)}
        visibleColumns={visibleColumns}
        onSave={handleSaveGridConfig}
        onReset={handleResetGridConfig}
      />
    </div>
  );
}
