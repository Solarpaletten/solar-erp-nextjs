// src/components/clients/GridConfigModal.tsx
// Sprint 1.3 — Grid Config Modal (Site.pro-style) - FIXED

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  CLIENTS_COLUMNS,
  getDefaultVisibleColumns,
} from '@/config/clients/columnsConfig';
import { X, Search, Settings2, RotateCcw, Check, CheckSquare, Square } from 'lucide-react';

interface GridConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: string[];
  onSave: (columns: string[]) => void;
  onReset: () => void;
}

export default function GridConfigModal({
  isOpen,
  onClose,
  visibleColumns,
  onSave,
  onReset,
}: GridConfigModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localVisible, setLocalVisible] = useState<string[]>(visibleColumns);

  useEffect(() => {
    if (isOpen) {
      setLocalVisible(visibleColumns);
      setSearchQuery('');
    }
  }, [isOpen, visibleColumns]);

  const filteredColumns = searchQuery.trim()
    ? CLIENTS_COLUMNS.filter(
        col =>
          col.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          col.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CLIENTS_COLUMNS;

  const toggleColumn = useCallback((key: string) => {
    setLocalVisible(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  const selectAll = useCallback(() => {
    const allKeys = filteredColumns.map(c => c.key);
    setLocalVisible(prev => [...new Set([...prev, ...allKeys])]);
  }, [filteredColumns]);

  const deselectAll = useCallback(() => {
    const allKeys = filteredColumns.map(c => c.key);
    setLocalVisible(prev => prev.filter(k => !allKeys.includes(k)));
  }, [filteredColumns]);

  const handleSave = () => {
    onSave(localVisible);
    onClose();
  };

  const handleReset = () => {
    const defaults = getDefaultVisibleColumns();
    setLocalVisible(defaults);
    onReset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-500">
          <div className="flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Grid config, columns, filters, pagination
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search + Actions */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search columns..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-teal-600 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Column visibility
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-500 rounded hover:bg-teal-600 transition-colors"
              >
                ✓ Select all
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                ✕ Deselect all
              </button>
            </div>
          </div>
        </div>

        {/* Columns Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-x-6 gap-y-2">
            {filteredColumns.map(col => (
              <label
                key={col.key}
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={localVisible.includes(col.key)}
                  onChange={() => toggleColumn(col.key)}
                  className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                  {col.label}
                </span>
              </label>
            ))}
          </div>

          {filteredColumns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No columns found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>

        {/* Selection of table rows section */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <div className="text-sm font-medium text-teal-600 mb-2 flex items-center gap-2">
            <Square className="w-4 h-4" />
            Selection of table rows
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
            />
            Preserve row selection when navigating between table pages
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset grid config
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}