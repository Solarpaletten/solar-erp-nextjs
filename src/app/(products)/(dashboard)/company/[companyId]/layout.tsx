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