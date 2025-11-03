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
      <main>{children}</main>  // Только children без лишней навигации
    </div>
  )
}