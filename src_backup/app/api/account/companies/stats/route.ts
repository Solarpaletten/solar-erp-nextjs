import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userId = 1;
    
    const companiesCount = await prisma.companies.count({
      where: {
        employees: {
          some: { user_id: userId }
        }
      }
    });
    
    return NextResponse.json({
      totalCompanies: companiesCount,
      activeCompanies: companiesCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}