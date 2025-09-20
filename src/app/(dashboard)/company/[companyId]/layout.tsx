import CompanyLayout from './CompanyLayout'

export default function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <CompanyLayout>{children}</CompanyLayout>
}