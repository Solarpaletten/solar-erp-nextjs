// src/app/(products)/(dashboard)/company/[companyId]/layout.tsx
// Responsive Layout - Sidebar hidden on narrow screens like Site.pro

import React from 'react'
import CompanySidebar from './CompanySidebar'
import CompanyHeader from './CompanyHeader'

export default async function Layout({ 
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* SIDEBAR - Hidden on screens < 1024px (lg:) */}
      {/* Like Site.pro: sidebar disappears when narrowed */}
      {/* ============================================ */}
      <div className="hidden lg:block">
        <CompanySidebar companyId={companyId} />
      </div>
      
      {/* ============================================ */}
      {/* MAIN CONTENT - Takes full width when sidebar hidden */}
      {/* ============================================ */}
      <div className="flex flex-col flex-1 min-w-0">
        <CompanyHeader />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
