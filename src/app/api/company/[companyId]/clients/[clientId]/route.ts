// src/app/api/company/[companyId]/clients/[clientId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '7d5a2e3f4b1c9d8e0a6f5b2d1e4c3a9b8f7e6d5c4b3a2f1';

// Helper: Get authenticated user ID from JWT token
async function getUserIdFromToken(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

// Helper: Verify user has access to company
async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const membership = await prisma.company_users.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
      is_active: true
    }
  });
  
  return !!membership;
}

// PUT /api/company/[companyId]/clients/[clientId] - Update client
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; clientId: string }> }
) {
  try {
    // Get authenticated user
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Get params
    const params = await context.params;
    const companyId = parseInt(params.companyId);
    const clientId = parseInt(params.clientId);

    if (isNaN(companyId) || isNaN(clientId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid company or client ID'
      }, { status: 400 });
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Access denied to this company'
      }, { status: 403 });
    }

    // Verify client belongs to company
    const existingClient = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 });
    }

    if (existingClient.company_id !== companyId) {
      return NextResponse.json({
        success: false,
        error: 'Client does not belong to this company'
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Update client
    const updatedClient = await prisma.clients.update({
      where: { id: clientId },
      data: {
        name: body.name ?? existingClient.name,
        abbreviation: body.abbreviation ?? existingClient.abbreviation,
        code: body.code ?? existingClient.code,
        email: body.email ?? existingClient.email,
        phone: body.phone ?? existingClient.phone,
        fax: body.fax ?? existingClient.fax,
        website: body.website ?? existingClient.website,
        contact_information: body.contact_information ?? existingClient.contact_information,
        role: body.role ?? existingClient.role,
        is_juridical: body.is_juridical ?? existingClient.is_juridical,
        is_active: body.is_active ?? existingClient.is_active,
        is_foreigner: body.is_foreigner ?? existingClient.is_foreigner,
        country: body.country ?? existingClient.country,
        legal_address: body.legal_address ?? existingClient.legal_address,
        actual_address: body.actual_address ?? existingClient.actual_address,
        business_license_code: body.business_license_code ?? existingClient.business_license_code,
        vat_code: body.vat_code ?? existingClient.vat_code,
        vat_rate: body.vat_rate !== undefined ? (body.vat_rate ? parseFloat(body.vat_rate) : null) : existingClient.vat_rate,
        eori_code: body.eori_code ?? existingClient.eori_code,
        foreign_taxpayer_code: body.foreign_taxpayer_code ?? existingClient.foreign_taxpayer_code,
        registration_number: body.registration_number ?? existingClient.registration_number,
        credit_sum: body.credit_sum !== undefined ? parseFloat(body.credit_sum) : existingClient.credit_sum,
        pay_per: body.pay_per ?? existingClient.pay_per,
        currency: body.currency ?? existingClient.currency,
        payment_terms: body.payment_terms ?? existingClient.payment_terms,
        automatic_debt_reminder: body.automatic_debt_reminder ?? existingClient.automatic_debt_reminder,
        registration_date: body.registration_date ? new Date(body.registration_date) : existingClient.registration_date,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : existingClient.date_of_birth,
        sabis_customer_name: body.sabis_customer_name ?? existingClient.sabis_customer_name,
        sabis_customer_code: body.sabis_customer_code ?? existingClient.sabis_customer_code,
        additional_information: body.additional_information ?? existingClient.additional_information,
        notes: body.notes ?? existingClient.notes,
      }
    });

    return NextResponse.json({
      success: true,
      client: updatedClient
    });

  } catch (error: any) {
    console.error('Error updating client:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json({
        success: false,
        error: `A client with this ${field} already exists`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update client'
    }, { status: 500 });
  }
}

// DELETE /api/company/[companyId]/clients/[clientId] - Delete client
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string; clientId: string }> }
) {
  try {
    // Get authenticated user
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Get params
    const params = await context.params;
    const companyId = parseInt(params.companyId);
    const clientId = parseInt(params.clientId);

    if (isNaN(companyId) || isNaN(clientId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid company or client ID'
      }, { status: 400 });
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Access denied to this company'
      }, { status: 403 });
    }

    // Verify client belongs to company
    const existingClient = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 });
    }

    if (existingClient.company_id !== companyId) {
      return NextResponse.json({
        success: false,
        error: 'Client does not belong to this company'
      }, { status: 403 });
    }

    // Check if client is referenced in other tables
    const [salesCount, purchasesCount, bankOpsCount] = await Promise.all([
      prisma.sales.count({ where: { client_id: clientId } }),
      prisma.purchases.count({ where: { supplier_id: clientId } }),
      prisma.bank_operations.count({ where: { client_id: clientId } })
    ]);

    if (salesCount > 0 || purchasesCount > 0 || bankOpsCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete client: ${salesCount} sales, ${purchasesCount} purchases, and ${bankOpsCount} bank operations reference this client. Consider deactivating instead.`
      }, { status: 400 });
    }

    // Delete client
    await prisma.clients.delete({
      where: { id: clientId }
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting client:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete client'
    }, { status: 500 });
  }
}