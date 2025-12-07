// src/app/api/account/companies/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromToken, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    const companiesCount = await prisma.companies.count({
      where: {
        employees: {
          some: { user_id: userId }
        }
      }
    });
    
    const activeCompaniesCount = await prisma.companies.count({
      where: {
        employees: {
          some: { user_id: userId }
        },
        is_active: true
      }
    });
    
    return NextResponse.json({
      success: true,
      totalCompanies: companiesCount,
      activeCompanies: activeCompaniesCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch stats' 
    }, { status: 500 });
  }
}