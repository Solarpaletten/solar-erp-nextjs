// app/company/[companyId]/clients/page.tsx
// SolarNetJS Canon — Company-first, NO src/, NO route groups

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Plus, Settings2, Pencil, Trash2, Copy, Search,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Check, X, Loader2, Download, RefreshCw,
} from 'lucide-react';

const PAGE_SIZE = 20;

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
// HELPER COMPONENTS
// ============================================

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    CLIENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SUPPLIER: 'bg-blue-100 text-blue-700 border-blue-200',
    BOTH: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role] || 'bg-gray-100 text-gray-700'}`}>{role}</span>;
}

function StatusIndicator({ active }: { active: boolean }) {
  const c = active ? 'bg-green-500' : 'bg-red-400';
  return <div className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-full ${c}`} /><span className={`w-2.5 h-2.5 rounded-full ${c}`} /><span className={`w-2.5 h-2.5 rounded-full ${c}`} /></div>;
}

function BooleanIndicator({ value }: { value: boolean }) {
  return value ? <Check className="w-4 h-4 text-green-500" /> : <span className="text-gray-300">-</span>;
}

function renderCell(client: Client, column: ColumnConfig): React.ReactNode {
  const value = client[column.key];
  if (value === null || value === undefined) return <span className="text-gray-300">-</span>;
  switch (column.type) {
    case 'boolean': return column.key === 'is_active' ? <StatusIndicator active={!!value} /> : <BooleanIndicator value={!!value} />;
    case 'enum': return column.key === 'role' ? <RoleBadge role={String(value)} /> : <span>{String(value)}</span>;
    case 'date': try { return <span>{new Date(String(value)).toLocaleDateString('ru-RU')}</span>; } catch { return <span>{String(value)}</span>; }
    case 'number': return <span>{Number(value).toLocaleString()}</span>;
    case 'currency': return <span className="font-mono">{String(value)}</span>;
    default: const s = String(value); return s.length > 40 ? <span title={s}>{s.substring(0,37)}...</span> : <span>{s}</span>;
  }
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={`p-1.5 rounded ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`} title="Первая"><ChevronsLeft className="w-4 h-4" /></button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-1.5 rounded ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`} title="Предыдущая"><ChevronLeft className="w-4 h-4" /></button>
      <span className="px-3 py-1 text-sm font-medium text-gray-700">{currentPage} / {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-1.5 rounded ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`} title="Следующая"><ChevronRight className="w-4 h-4" /></button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={`p-1.5 rounded ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`} title="Последняя"><ChevronsRight className="w-4 h-4" /></button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ClientsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = params.companyId as string;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(getDefaultVisibleColumns);
  const [isGridConfigOpen, setIsGridConfigOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { setMounted(true); const s = loadGridConfig(companyId); if (s?.length) setVisibleColumns(s); }, [companyId]);

  const updateScroll = useCallback(() => {
    const c = scrollRef.current;
    if (c) { setCanScrollLeft(c.scrollLeft > 0); setCanScrollRight(c.scrollLeft < c.scrollWidth - c.clientWidth - 1); }
  }, []);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  useEffect(() => {
    const c = scrollRef.current; if (!c) return;
    c.addEventListener('scroll', updateScroll);
    setTimeout(updateScroll, 100);
    return () => c.removeEventListener('scroll', updateScroll);
  }, [updateScroll, clients, visibleColumns]);

  const fetchClients = useCallback(async () => {
    try { setLoading(true); setError(null);
      const res = await fetch(`/api/company/${companyId}/clients`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setClients(data.clients); else setError(data.error || 'Failed');
    } catch { setError('Network error'); } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleSave = (cols: string[]) => { setVisibleColumns(cols); saveGridConfig(companyId, cols); };
  const handleReset = () => { const d = getDefaultVisibleColumns(); setVisibleColumns(d); resetGridConfig(companyId); };

  const filteredClients = useMemo(() => clients.filter(client => {
    for (const [k, fv] of Object.entries(filters)) {
      if (!fv) continue; const col = getColumnByKey(k); if (!col) continue; const cv = client[k];
      if (col.type === 'boolean' && cv !== (fv === 'true')) return false;
      if (col.type === 'enum' && String(cv) !== fv) return false;
      if (cv && !String(cv).toLowerCase().includes(fv.toLowerCase())) return false;
    }
    return true;
  }), [clients, filters]);

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeColumns = useMemo(() => CLIENTS_COLUMNS.filter(c => visibleColumns.includes(c.key)), [visibleColumns]);

  const toggleAll = () => setSelectedIds(selectedIds.size === paginatedClients.length ? new Set() : new Set(paginatedClients.map(c => c.id)));
  const toggleRow = (id: number) => { const s = new Set(selectedIds); s.has(id) ? s.delete(id) : s.add(id); setSelectedIds(s); };

  // ============================================
  // CRUD HANDLERS
  // ============================================

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить клиента?')) return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/company/${companyId}/clients/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        fetchClients();
      } else {
        alert(data.error || 'Не удалось удалить');
      }
    } catch { alert('Ошибка сети'); }
    finally { setActionLoading(null); }
  };

  const handleCopy = async (id: number) => {
    if (!confirm('Создать копию клиента?')) return;
    setActionLoading(`copy-${id}`);
    try {
      const res = await fetch(`/api/company/${companyId}/clients/${id}/copy`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        fetchClients();
      } else {
        alert(data.error || 'Не удалось скопировать');
      }
    } catch { alert('Ошибка сети'); }
    finally { setActionLoading(null); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Удалить ${selectedIds.size} клиентов?`)) return;
    setActionLoading('bulk-delete');
    try {
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await fetch(`/api/company/${companyId}/clients/${id}`, { method: 'DELETE', credentials: 'include' });
      }
      setSelectedIds(new Set());
      fetchClients();
    } catch { alert('Ошибка при удалении'); }
    finally { setActionLoading(null); }
  };

  const handleEdit = (id: number) => {
    router.push(`/company/${companyId}/clients/${id}/edit`);
  };

  const handleToolbarEdit = () => {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    handleEdit(id);
  };

  const handleToolbarCopy = async () => {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    await handleCopy(id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(`?page=${page}`);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (!mounted) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-x-hidden">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-t-xl px-6 py-4 shadow-lg max-w-full">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Клиенты</h1>
          <span className="px-2.5 py-1 bg-white/20 rounded-full text-sm text-white">{paginatedClients.length} из {filteredClients.length}</span>
          <span className="px-3 py-1 bg-orange-500 rounded-full text-sm font-medium text-white">Company ID: {companyId}</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white border-x border-b border-gray-200 px-4 py-3 max-w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push(`/company/${companyId}/clients/new`)} 
              className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Добавить нового клиента</span>
              <span className="sm:hidden">+</span>
            </button>
            
            <button 
              onClick={handleToolbarEdit}
              disabled={selectedIds.size !== 1}
              className={`p-2 rounded-lg ${selectedIds.size === 1 ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
              title={selectedIds.size === 1 ? 'Редактировать' : 'Выберите 1 клиента'}
            >
              <Pencil className="w-4 h-4" />
            </button>
            
            <button 
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0 || actionLoading === 'bulk-delete'}
              className={`p-2 rounded-lg ${selectedIds.size > 0 ? 'text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
              title={selectedIds.size > 0 ? `Удалить (${selectedIds.size})` : 'Выберите клиентов'}
            >
              {actionLoading === 'bulk-delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={handleToolbarCopy}
              disabled={selectedIds.size !== 1 || actionLoading?.startsWith('copy')}
              className={`p-2 rounded-lg ${selectedIds.size === 1 ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-300 cursor-not-allowed'}`}
              title={selectedIds.size === 1 ? 'Копировать' : 'Выберите 1 клиента'}
            >
              <Copy className="w-4 h-4" />
            </button>
            
            {selectedIds.size > 0 && (
              <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                Выбрано: {selectedIds.size}
              </span>
            )}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

          <div className="flex items-center gap-1">
            <button onClick={scrollLeft} disabled={!canScrollLeft} className={`p-2 rounded-lg ${canScrollLeft ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-300'}`}><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={scrollRight} disabled={!canScrollRight} className={`p-2 rounded-lg ${canScrollRight ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-300'}`}><ChevronRight className="w-5 h-5" /></button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Скачать"><Download className="w-5 h-5" /></button>
            <button onClick={fetchClients} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Обновить"><RefreshCw className="w-5 h-5" /></button>
            <button onClick={() => setIsGridConfigOpen(true)} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg" title="Настройки"><Settings2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-sm overflow-hidden max-w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /><span className="ml-3 text-gray-500">Загрузка...</span></div>
        ) : error ? (
          <div className="text-center py-20 text-red-500"><X className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>{error}</p><button onClick={fetchClients} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg">Повторить</button></div>
        ) : (
          <div ref={scrollRef} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <table className="w-max min-w-max border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="sticky left-0 z-20 w-12 px-3 py-3 bg-gray-50 border-r border-gray-200">
                    <input type="checkbox" checked={selectedIds.size === paginatedClients.length && paginatedClients.length > 0} onChange={toggleAll} className="w-4 h-4 rounded" />
                  </th>
                  {activeColumns.map((col, i) => (
                    <th key={col.key} className={`px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap bg-gray-50 ${i === 0 ? 'sticky left-12 z-20' : ''}`} style={{ width: col.width, minWidth: col.width }}>{col.label}</th>
                  ))}
                  <th className="sticky right-0 z-20 px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase bg-gray-50 border-l border-gray-200">Действия</th>
                </tr>
                <tr className="bg-white border-b border-gray-100">
                  <th className="sticky left-0 z-20 px-3 py-2 bg-white border-r border-gray-200" />
                  {activeColumns.map((col, i) => (
                    <th key={`filter-${col.key}`} className={`px-2 py-2 bg-white ${i === 0 ? 'sticky left-12 z-20' : ''}`}>
                      {col.filterable && col.type === 'enum' && col.enumOptions ? (
                        <select value={filters[col.key] || ''} onChange={e => setFilters(p => ({ ...p, [col.key]: e.target.value }))} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white">
                          <option value="">Все</option>
                          {col.enumOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : col.filterable && col.type === 'boolean' ? (
                        <select value={filters[col.key] || ''} onChange={e => setFilters(p => ({ ...p, [col.key]: e.target.value }))} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white">
                          <option value="">Все</option>
                          <option value="true">Да</option>
                          <option value="false">Нет</option>
                        </select>
                      ) : col.filterable ? (
                        <input type="text" value={filters[col.key] || ''} onChange={e => setFilters(p => ({ ...p, [col.key]: e.target.value }))} placeholder="Поиск..." className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500" />
                      ) : null}
                    </th>
                  ))}
                  <th className="sticky right-0 z-20 px-3 py-2 bg-white border-l border-gray-200" />
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map(client => (
                  <tr key={client.id} className={`hover:bg-gray-50 ${selectedIds.has(client.id) ? 'bg-teal-50' : ''}`}>
                    <td className={`sticky left-0 z-10 px-3 py-3 border-r border-gray-100 ${selectedIds.has(client.id) ? 'bg-teal-50' : 'bg-white'}`}>
                      <input type="checkbox" checked={selectedIds.has(client.id)} onChange={() => toggleRow(client.id)} className="w-4 h-4 rounded" />
                    </td>
                    {activeColumns.map((col, i) => (
                      <td key={`${client.id}-${col.key}`} className={`px-3 py-3 text-sm text-gray-700 whitespace-nowrap ${i === 0 ? 'sticky left-12 z-10 font-medium' : ''} ${selectedIds.has(client.id) ? 'bg-teal-50' : i === 0 ? 'bg-white' : ''}`} style={{ width: col.width, minWidth: col.width }}>
                        {renderCell(client, col)}
                      </td>
                    ))}
                    <td className={`sticky right-0 z-10 px-3 py-3 border-l border-gray-100 ${selectedIds.has(client.id) ? 'bg-teal-50' : 'bg-white'}`}>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(client.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Редактировать"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(client.id)} disabled={actionLoading === `delete-${client.id}`} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50" title="Удалить">
                          {actionLoading === `delete-${client.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleCopy(client.id)} disabled={actionLoading === `copy-${client.id}`} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded disabled:opacity-50" title="Копировать">
                          {actionLoading === `copy-${client.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedClients.length === 0 && (
                  <tr><td colSpan={activeColumns.length + 2} className="px-3 py-12 text-center text-gray-500"><Search className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>Клиенты не найдены</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">Показано {paginatedClients.length} из {filteredClients.length} клиентов</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{activeColumns.length} колонок видимо</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Строк:</span>
              <select value={pageSize} onChange={e => handlePageSizeChange(Number(e.target.value))} className="px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-500">всего: {filteredClients.length}</span>
            </div>
          </div>
        </div>
      </div>

      <GridConfigModal isOpen={isGridConfigOpen} onClose={() => setIsGridConfigOpen(false)} visibleColumns={visibleColumns} onSave={handleSave} onReset={handleReset} />
    </div>
  );
}
