import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userId = 1; // TODO: из JWT token
    
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
    const userId = 1; // TODO: из JWT token
    
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
    
    return NextResponse.json({ 
      success: true, 
      company 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    
    // Обработка ошибки уникальности кода
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: 'Company code already exists. Please use a different code.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create company' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'Company ID is required' 
      }, { status: 400 });
    }
    
    const body = await request.json();
    
    const company = await prisma.companies.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      company 
    });
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update company' 
    }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'Company ID is required' 
      }, { status: 400 });
    }
    
    await prisma.companies.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ 
      success: true 
    });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete company' 
    }, { status: 500 });
  }
}
