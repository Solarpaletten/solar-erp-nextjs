import CompanyLayout from './CompanyLayout'

export default async function Layout({ 
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  
  return (
    <CompanyLayout>
      {children}
    </CompanyLayout>
  )
}