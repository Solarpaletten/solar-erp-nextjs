import CompanyLayout from './CompanyLayout'

// Этот файл должен иметь companyId params
export default async function CompanyLayout({ 
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ companyId: string }> // Здесь правильно
}) {
  const { companyId } = await params
  // логика для конкретной компании
}
