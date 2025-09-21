import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ 
  children
}: {
  children: React.ReactNode
  // Убрать params - на этом уровне их нет
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  
  if (!token) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Solar ERP</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Dashboard</span>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}