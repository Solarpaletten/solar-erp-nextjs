import { redirect } from 'next/navigation';

interface CompanyPageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companyId } = await params;
  redirect(`/company/${companyId}/dashboard`);
}