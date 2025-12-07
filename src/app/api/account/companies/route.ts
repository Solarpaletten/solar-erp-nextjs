import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userId = 1;
    
    const companies = await prisma.companies.findMany({
      where: {
        employees: {
          some: { user_id: userId }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      companies: companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch companies' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 1;
    
    const company = await prisma.companies.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
        legal_entity_type: body.industry || 'LLC',
        tax_country: body.country || 'UAE',
        director_name: 'Director',
        owner_id: userId,
        is_active: true,
        employees: {
          create: {
            user_id: userId,
            role: 'OWNER'
          }
        }
      }
    });
    
    return NextResponse.json({ success: true, company }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: 'Company code already exists' 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create company' 
    }, { status: 500 });
  }
}