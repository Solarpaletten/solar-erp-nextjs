'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

interface CompanySidebarProps {
  companyId: string;
}

type MenuItem = {
  id: string;
  type: 'item';
  title: string;
  route: string;
  icon: string;
  badge?: string;
};

type MenuGroup = {
  id: string;
  type: 'group';
  title: string;
  items: MenuItem[];
};

type Section = MenuItem | MenuGroup;

export default function CompanySidebar({ companyId }: CompanySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState('');

  const [sections, setSections] = useState<Section[]>([
    { id: 'dashboard', type: 'item', title: 'Dashboard', route: `/company/${companyId}/dashboard`, icon: '📊' },
    { id: 'clients', type: 'item', title: 'Clients', route: `/company/${companyId}/clients`, icon: '👥' },
    {
      id: 'warehouseGroup',
      type: 'group',
      title: 'Склад',
      items: [
        { id: 'products', type: 'item', title: 'Products', route: `/company/${companyId}/products`, icon: '📦' },
        { id: 'warehouse', type: 'item', title: 'Warehouse', route: `/company/${companyId}/warehouse`, icon: '🏭' },
      ],
    },
    {
      id: 'salesGroup',
      type: 'group',
      title: 'Продажи и покупки',
      items: [
        { id: 'sales', type: 'item', title: 'Sales', route: `/company/${companyId}/sales`, icon: '💰' },
        { id: 'purchases', type: 'item', title: 'Purchases', route: `/company/${companyId}/purchases`, icon: '🛒' },
      ],
    },
    {
      id: 'financeGroup',
      type: 'group',
      title: 'Финансы',
      items: [
        { id: 'accounts', type: 'item', title: 'Chart of Accounts', route: `/company/${companyId}/chart-of-accounts`, icon: '📋' },
        { id: 'banking', type: 'item', title: 'Banking', route: `/company/${companyId}/banking`, icon: '🏦' },
      ],
    },
    { id: 'settings', type: 'item', title: 'Settings', route: `/company/${companyId}/settings`, icon: '⚙️' },
  ]);

  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const [dragOverSection, setDragOverSection] = useState<Section | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    warehouseGroup: true,
    salesGroup: true,
    financeGroup: true,
  });

  useEffect(() => {
    const name = localStorage.getItem('currentCompanyName');
    if (name) setCompanyName(name);
  }, []);

  const handleDragStart = (e: React.DragEvent, section: Section) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, section: Section) => {
    e.preventDefault();
    setDragOverSection(section);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault();
    if (!draggedSection || draggedSection.id === targetSection.id) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }
    const newSections = [...sections];
    const fromIndex = newSections.findIndex((s) => s.id === draggedSection.id);
    const toIndex = newSections.findIndex((s) => s.id === targetSection.id);
    newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, draggedSection);
    setSections(newSections);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isActive = (route: string) => pathname === route;

  return (
    <div className="flex flex-col h-full bg-slate-800 text-white">
      <div className="flex items-center justify-center h-16 border-b border-slate-700 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-2xl">
            ☀️
          </div>
          <div>
            <h2 className="text-sm font-semibold truncate max-w-[150px]">
              {companyName || 'Company'}
            </h2>
            <p className="text-xs text-slate-400">Solar ERP</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`${dragOverSection?.id === section.id ? 'border-t-2 border-orange-500' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={(e) => handleDragOver(e, section)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section)}
          >
            <div className="flex items-center">
              <div className="p-2 cursor-grab hover:bg-slate-700 rounded">
                <GripVertical className="w-4 h-4 text-slate-400" />
              </div>

              {section.type === 'item' ? (
                <Link
                  href={section.route}
                  className={`flex-1 flex items-center p-3 rounded-lg hover:bg-slate-700 transition-colors ${
                    isActive(section.route) ? 'bg-slate-700 border-r-2 border-orange-500' : ''
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  <span className="text-sm">{section.title}</span>
                  {section.badge && (
                    <span className="ml-auto px-2 py-1 text-xs bg-orange-500 rounded-full">
                      {section.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => toggleGroup(section.id)}
                  className="flex-1 flex items-center p-3 text-left hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium">{section.title}</span>
                  <span className="ml-auto">
                    {expandedGroups[section.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>
              )}
            </div>

            {section.type === 'group' && expandedGroups[section.id] && (
              <div className="ml-8 space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.route}
                    className={`flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors ${
                      isActive(item.route) ? 'bg-slate-700 border-r-2 border-orange-500' : ''
                    }`}
                  >
                    <span className="mr-2 text-sm">{item.icon}</span>
                    <span className="text-sm">{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4 space-y-2">
        <button
          onClick={() => {
            localStorage.removeItem('currentCompanyId');
            localStorage.removeItem('currentCompanyName');
            router.push('/account/companies');
          }}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
        >
          <span className="mr-3">🔙</span>
          <span>Back to Companies</span>
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('currentCompanyId');
            localStorage.removeItem('currentCompanyName');
            fetch('/api/auth/logout', { method: 'POST' }).then(() => {
              router.push('/login');
            });
          }}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-all"
        >
          <span className="mr-3">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}