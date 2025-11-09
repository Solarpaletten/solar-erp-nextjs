import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userId = 1; // TODO: из JWT token
    
    const companies = await prisma.companies.findMany({
      where: {
        users_companies: {
          some: { user_id: userId }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 1; // TODO: из JWT token
    
    const company = await prisma.companies.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
        industry: body.industry,
        country: body.country,
        status: 'active',
        users_companies: {
          create: {
            user_id: userId,
            role: 'owner'
          }
        }
      }
    });
    
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
