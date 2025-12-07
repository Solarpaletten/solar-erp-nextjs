'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Users, Plus, GripVertical } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  clientsCount?: number;
  salesCount?: number;
  productsCount?: number;
  priority?: number;
  avatar?: string;
  color?: string;
}

interface CreateCompanyData {
  name: string;
  code: string;
  description: string;
  industry: string;
  country: string;
}

export default function CompaniesPage() {
  const router = useRouter();

  // State variables
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', code: '', description: '' });
  const [showDeleteModal, setShowDeleteModal] = useState<Company | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateCompanyData>({
    name: '',
    code: '',
    description: '',
    industry: 'RENEWABLE_ENERGY',
    country: 'DE',
  });

  // Drag & drop state
  const [draggedItem, setDraggedItem] = useState<Company | null>(null);
  const [dragOverItem, setDragOverItem] = useState<Company | null>(null);

  // Color generation for companies
  const getCompanyColor = (name: string) => {
    const colors = [
      'bg-orange-500', 'bg-red-500', 'bg-purple-500',
      'bg-orange-600', 'bg-blue-600', 'bg-green-600',
      'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Save priorities
  const savePriorities = async (updatedCompanies: Company[]) => {
    try {
      const priorities: { [key: number]: number } = {};
      updatedCompanies.forEach(company => {
        priorities[company.id] = company.priority || 1;
      });

      localStorage.setItem('companyPriorities', JSON.stringify(priorities));

      // Try to save to backend
      try {
        await fetch('/api/account/companies/priorities', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priorities }),
        });
      } catch (backendError) {
        console.log('Backend priority save not available, using localStorage only');
      }
    } catch (error) {
      console.error('Error saving priorities:', error);
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      console.log('Loading companies for Account Dashboard...');
      setLoading(true);
      setError(null);

      const response = await fetch('/api/account/companies');

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);

        if (data.success && data.companies) {
          const savedPriorities = JSON.parse(localStorage.getItem('companyPriorities') || '{}');

          const enhancedCompanies = data.companies.map((company: Company, index: number) => ({
            ...company,
            priority: savedPriorities[company.id] || (index + 1),
            avatar: company.name.charAt(0).toUpperCase(),
            color: getCompanyColor(company.name)
          }));

          const sortedCompanies = enhancedCompanies.sort((a: Company, b: Company) =>
            (a.priority || 1) - (b.priority || 1)
          );

          setCompanies(sortedCompanies);
          setIsConnected(true);
          console.log(`Loaded ${enhancedCompanies.length} companies from API`);
        } else {
          throw new Error('Invalid API response format');
        }
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error loading companies:', error);
      setError(error.message || 'Failed to load companies');
      setIsConnected(false);

      // Fallback data
      setCompanies([
        {
          id: 1,
          name: 'SOLAR Energy Ltd',
          code: 'SOLAR',
          is_active: true,
          created_at: new Date().toISOString(),
          priority: 1,
          avatar: 'S',
          color: 'bg-orange-500'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Enter company
  const handleEnterCompany = async (companyId: number) => {
    try {
      console.log('Switching to company:', companyId);

      const response = await fetch('/api/account/switch-to-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });

      if (response.ok) {
        console.log('Backend context switched');
      }

      localStorage.setItem('currentCompanyId', companyId.toString());

      const selectedCompany = companies.find((c) => c.id === companyId);
      if (selectedCompany) {
        localStorage.setItem('currentCompanyName', selectedCompany.name);
      }

      router.push(`/company/${companyId}/dashboard`);
    } catch (error: any) {
      console.error('Failed to switch company:', error);

      localStorage.setItem('currentCompanyId', companyId.toString());
      const selectedCompany = companies.find((c) => c.id === companyId);
      if (selectedCompany) {
        localStorage.setItem('currentCompanyName', selectedCompany.name);
      }
      router.push(`/company/${companyId}/dashboard`);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, company: Company) => {
    setDraggedItem(company);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, company: Company) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(company);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetCompany: Company) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetCompany.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newCompanies = [...companies];
    const draggedIndex = newCompanies.findIndex(c => c.id === draggedItem.id);
    const targetIndex = newCompanies.findIndex(c => c.id === targetCompany.id);

    const [draggedCompany] = newCompanies.splice(draggedIndex, 1);
    newCompanies.splice(targetIndex, 0, draggedCompany);

    const updatedCompanies = newCompanies.map((company, index) => ({
      ...company,
      priority: index + 1
    }));

    setCompanies(updatedCompanies);
    setDraggedItem(null);
    setDragOverItem(null);

    await savePriorities(updatedCompanies);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Create company
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Creating new company:', createFormData);

      const response = await fetch('/api/account/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        console.log('Company created successfully');
        await fetchCompanies();
        setShowCreateForm(false);
        setCreateFormData({
          name: '',
          code: '',
          description: '',
          industry: 'RENEWABLE_ENERGY',
          country: 'DE',
        });
      } else {
        throw new Error('Failed to create company');
      }
    } catch (error: any) {
      console.error('Error creating company:', error);
      setError(error.message || 'Failed to create company');
    }
  };

  // Update
  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    const response = await fetch(`/api/account/companies/${editingCompany.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData),
    });

    if (response.ok) {
      setEditingCompany(null);
      await fetchCompanies();
    } else {
      alert('❌ Failed to update company');
    }
  };

  // Copy
  const handleCopyCompany = async (company: Company) => {
    const response = await fetch('/api/account/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: company.name + ' Copy',
        code: `${company.code}_COPY_${Math.floor(Math.random() * 1000)}`,
      }),
    });
    if (response.ok) {
      await fetchCompanies();
    } else {
      alert('❌ Failed to copy company');
    }
  };

  // Delete
  const handleDeleteCompany = async (company: Company) => {
    const response = await fetch(`/api/account/companies/${company.id}`, { method: 'DELETE' });
    if (response.ok) {
      setShowDeleteModal(null);
      await fetchCompanies();
    } else {
      alert('❌ Failed to delete company');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading companies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl mr-4">☀️</div>
            <h1 className="text-4xl font-bold text-gray-800">
              Solar ERP - Account Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">Two-Level Multi-Tenant Architecture</p>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '✅ Connected' : '❌ Connection Error'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">⚠️ API Issue:</p>
                <p className="text-sm">{error}</p>
                <p className="text-sm mt-1">Using fallback data for demonstration.</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-yellow-700 hover:text-yellow-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {companies.length}
            </div>
            <div className="text-gray-600">
              companies loaded {isConnected ? '(from API)' : '(fallback)'}
            </div>
          </div>
        </div>

        {/* Draggable Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {companies
            .sort((a, b) => (a.priority || 1) - (b.priority || 1))
            .map((company) => (
              <div
                key={company.id}
                draggable
                onDragStart={(e) => handleDragStart(e, company)}
                onDragOver={(e) => handleDragOver(e, company)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, company)}
                onDragEnd={handleDragEnd}
                className={`
                bg-white rounded-xl shadow-lg p-6 cursor-move transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                ${draggedItem?.id === company.id ? 'opacity-50 scale-95' : ''}
                ${dragOverItem?.id === company.id ? 'ring-4 ring-blue-400 scale-105' : ''}
              `}
              >
                {/* Priority Badge, ID Badge & Drag Handle */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm font-semibold">
                      #{company.priority || 1}
                    </div>
                    {/* 🆔 ID VISIBILITY - Company ID Badge */}
                    <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-mono">
                      ID: {company.id}
                    </div>
                    <GripVertical className="text-gray-400 w-5 h-5" />
                  </div>
                  <div className={`text-sm font-semibold ${company.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Company Avatar */}
                <div className="flex items-center mb-4">
                  <div className={`${company.color || 'bg-orange-500'} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4`}>
                    {company.avatar || company.code.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {company.name}
                    </h3>
                    <p className="text-gray-600">Code: {company.code}</p>
                    {/* 🆔 ID VISIBILITY - ID inline */}
                    <p className="text-xs text-gray-500 font-mono">ID: {company.id}</p>
                  </div>
                </div>

                {/* CRUD Action Buttons */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => {
                      setEditingCompany(company);
                      setEditFormData({
                        name: company.name,
                        code: company.code,
                        description: company.description || ''
                      });
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleCopyCompany(company)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    📄 Copy
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(company)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    🗑️ Delete
                  </button>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-semibold">{company.clientsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-semibold">{company.productsCount || 0}</span>
                  </div>
                </div>

                {/* Enter Company Button */}
                <button
                  onClick={() => handleEnterCompany(company.id)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Enter Company</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Real-time indicator */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Real-time data</span>
                  </div>
                  <div className="text-green-500 text-xs">● Live</div>
                </div>
              </div>
            ))}
        </div>

        {/* Create New Company Button */}
        <div className="text-center">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 flex items-center space-x-2 mx-auto shadow-lg"
          >
            <Plus className="w-6 h-6" />
            <span>Create New Company</span>
          </button>
        </div>

        {/* Edit Modal */}
        {editingCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Edit Company (ID: {editingCompany.id})</h3>
              <form onSubmit={handleEditCompany} className="space-y-4">
                <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Company Name" />
                <input type="text" value={editFormData.code} onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })} className="w-full border p-2 rounded" placeholder="Company Code" />
                <textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full border p-2 rounded" placeholder="Description" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingCompany(null)} className="px-3 py-1 border rounded">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Delete {showDeleteModal.name} (ID: {showDeleteModal.id})?</h3>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDeleteModal(null)} className="px-3 py-1 border rounded">Cancel</button>
                <button onClick={() => handleDeleteCompany(showDeleteModal)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        )}


        {/* iPhone Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
            🎯 SOLAR Next.js v2.1.0 with ID Visibility!
          </h3>
          <div className="text-gray-700 space-y-2">
            <p>🔌 <strong>Real API Data:</strong> Data loaded from Next.js API routes</p>
            <p>📱 <strong>iPhone Style:</strong> Drag & Drop with priority saving</p>
            <p>🆔 <strong>ID Visibility:</strong> Company IDs shown in cards (Site.pro pattern)</p>
            <p>🚀 <strong>Live Updates:</strong> Automatic API synchronization</p>
          </div>
        </div>

        {/* Create Company Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  🏢 Create New Company
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.name}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="My Company Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.code}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="MYCO"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createFormData.description}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brief company description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={createFormData.industry}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          industry: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="RENEWABLE_ENERGY">Renewable Energy</option>
                      <option value="TECHNOLOGY">Technology</option>
                      <option value="MANUFACTURING">Manufacturing</option>
                      <option value="TRADING">Trading</option>
                      <option value="SERVICES">Services</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={createFormData.country}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          country: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="DE">Germany</option>
                      <option value="PL">Poland</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AE">UAE</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                  >
                    Create Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="bg-white rounded-lg shadow-sm p-4 max-w-2xl mx-auto">
            <h4 className="font-medium text-gray-700 mb-2">
              🔧 Debug Information + ID Visibility
            </h4>
            <div className="space-y-1 text-left">
              <p>• Backend Connection: {isConnected ? 'Connected ✅' : 'Error ❌'}</p>
              <p>• Endpoint: <code>/api/account/companies</code></p>
              <p>• Companies loaded: <strong>{companies.length}</strong></p>
              <p>• Data source: {isConnected ? 'Real API' : 'Fallback mock'}</p>
              <p>• <strong>🆔 ID Visibility:</strong> Company IDs shown in cards ✅</p>
              <p>• <strong>📱 iPhone Features:</strong> Drag & Drop ✅, Priorities ✅</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
