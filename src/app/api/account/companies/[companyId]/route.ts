// src/app/api/account/companies/[companyId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  getUserIdFromToken, 
  verifyCompanyAccess,
  unauthorizedResponse, 
  forbiddenResponse,
  badRequestResponse 
} from '@/lib/auth';

// GET /api/account/companies/[companyId] - Get single company
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    const params = await context.params;
    const companyId = parseInt(params.companyId);
    
    if (isNaN(companyId)) {
      return badRequestResponse('Invalid company ID');
    }
    
    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return forbiddenResponse('Access denied to this company');
    }
    
    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      include: {
        employees: {
          where: { is_active: true },
          select: {
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                username: true
              }
            }
          }
        }
      }
    });
    
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch company'
    }, { status: 500 });
  }
}

// PUT /api/account/companies/[companyId] - Update company
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    const params = await context.params;
    const companyId = parseInt(params.companyId);
    
    if (isNaN(companyId)) {
      return badRequestResponse('Invalid company ID');
    }
    
    // Check if user is owner or admin
    const membership = await prisma.company_users.findFirst({
      where: {
        user_id: userId,
        company_id: companyId,
        is_active: true,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });
    
    if (!membership) {
      return forbiddenResponse('Only owners and admins can update company');
    }
    
    const body = await request.json();
    
    const company = await prisma.companies.update({
      where: { id: companyId },
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
        short_name: body.short_name,
        email: body.email,
        phone: body.phone,
        website: body.website
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      company 
    });
  } catch (error: any) {
    console.error('Error updating company:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Company code already exists'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update company' 
    }, { status: 500 });
  }
}

// DELETE /api/account/companies/[companyId] - Delete company
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    const params = await context.params;
    const companyId = parseInt(params.companyId);
    
    if (isNaN(companyId)) {
      return badRequestResponse('Invalid company ID');
    }
    
    // Check if user is owner
    const company = await prisma.companies.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }
    
    if (company.owner_id !== userId) {
      return forbiddenResponse('Only the owner can delete the company');
    }
    
    // Check for dependencies
    const [clientsCount, productsCount, salesCount] = await Promise.all([
      prisma.clients.count({ where: { company_id: companyId } }),
      prisma.products.count({ where: { company_id: companyId } }),
      prisma.sales.count({ where: { company_id: companyId } })
    ]);
    
    if (clientsCount > 0 || productsCount > 0 || salesCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete company: ${clientsCount} clients, ${productsCount} products, and ${salesCount} sales exist. Delete data first or deactivate instead.`
      }, { status: 400 });
    }
    
    await prisma.companies.delete({
      where: { id: companyId }
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