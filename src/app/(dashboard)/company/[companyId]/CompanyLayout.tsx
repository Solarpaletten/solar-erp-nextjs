'use client'

import React from 'react'
import CompanySidebar from './CompanySidebar'
import CompanyHeader from './CompanyHeader'

export default function CompanyLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar слева */}
      <CompanySidebar />
      
      {/* Основной контент справа */}
      <div className="flex flex-col flex-1">
        <CompanyHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}