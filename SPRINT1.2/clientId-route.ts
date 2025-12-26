// src/app/api/company/[companyId]/clients/[clientId]/route.ts
// Sprint 1.2 — Single Client API (PUT/DELETE with all fields)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '7d5a2e3f4b1c9d8e0a6f5b2d1e4c3a9b8f7e6d5c4b3a2f1';

// ============================================
// Helper: Get authenticated user ID from JWT
// ============================================
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

// ============================================
// Helper: Verify user has access to company
// ============================================
async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const membership = await prisma.company_users.findFirst({
    where: { user_id: userId, company_id: companyId, is_active: true }
  });
  return !!membership;
}

// ============================================
// GET /api/company/[companyId]/clients/[clientId]
// Get single client with ALL fields
// ============================================
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string; clientId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const companyId = parseInt(params.companyId);
    const clientId = parseInt(params.clientId);

    if (isNaN(companyId) || isNaN(clientId)) {
      return NextResponse.json({ success: false, error: 'Invalid IDs' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const client = await prisma.clients.findFirst({
      where: {
        id: clientId,
        company_id: companyId
      },
      include: {
        addresses: true,
        bank_accounts: true,
      }
    });

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client });

  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch client' }, { status: 500 });
  }
}

// ============================================
// PUT /api/company/[companyId]/clients/[clientId]
// Update client with ALL fields
// ============================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; clientId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const companyId = parseInt(params.companyId);
    const clientId = parseInt(params.clientId);

    if (isNaN(companyId) || isNaN(clientId)) {
      return NextResponse.json({ success: false, error: 'Invalid IDs' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Verify client exists AND belongs to this company
    const existingClient = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    if (existingClient.company_id !== companyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client does not belong to this company'
      }, { status: 403 });
    }

    const body = await request.json();

    // Update with ALL fields - use nullish coalescing to preserve existing values
    const updatedClient = await prisma.clients.update({
      where: { id: clientId },
      data: {
        // Basic info
        name: body.name?.trim() ?? existingClient.name,
        abbreviation: body.abbreviation !== undefined ? (body.abbreviation?.trim() || null) : existingClient.abbreviation,
        code: body.code !== undefined ? (body.code?.trim() || null) : existingClient.code,
        email: body.email?.trim()?.toLowerCase() ?? existingClient.email,
        phone: body.phone !== undefined ? (body.phone?.trim() || null) : existingClient.phone,
        fax: body.fax !== undefined ? (body.fax?.trim() || null) : existingClient.fax,
        website: body.website !== undefined ? (body.website?.trim() || null) : existingClient.website,
        contact_information: body.contact_information !== undefined ? (body.contact_information?.trim() || null) : existingClient.contact_information,
        
        // Role & Type
        role: body.role ?? existingClient.role,
        is_juridical: body.is_juridical ?? existingClient.is_juridical,
        is_active: body.is_active ?? existingClient.is_active,
        is_foreigner: body.is_foreigner ?? existingClient.is_foreigner,
        country: body.country !== undefined ? (body.country?.trim() || null) : existingClient.country,
        
        // Addresses
        legal_address: body.legal_address !== undefined ? (body.legal_address?.trim() || null) : existingClient.legal_address,
        actual_address: body.actual_address !== undefined ? (body.actual_address?.trim() || null) : existingClient.actual_address,
        
        // Registration
        business_license_code: body.business_license_code !== undefined ? (body.business_license_code?.trim() || null) : existingClient.business_license_code,
        registration_number: body.registration_number !== undefined ? (body.registration_number?.trim() || null) : existingClient.registration_number,
        registration_date: body.registration_date !== undefined 
          ? (body.registration_date ? new Date(body.registration_date) : null) 
          : existingClient.registration_date,
        date_of_birth: body.date_of_birth !== undefined 
          ? (body.date_of_birth ? new Date(body.date_of_birth) : null) 
          : existingClient.date_of_birth,
        
        // Tax
        vat_code: body.vat_code !== undefined ? (body.vat_code?.trim()?.toUpperCase() || null) : existingClient.vat_code,
        vat_rate: body.vat_rate !== undefined 
          ? (body.vat_rate !== null && body.vat_rate !== '' ? parseFloat(body.vat_rate) : null) 
          : existingClient.vat_rate,
        eori_code: body.eori_code !== undefined ? (body.eori_code?.trim() || null) : existingClient.eori_code,
        foreign_taxpayer_code: body.foreign_taxpayer_code !== undefined ? (body.foreign_taxpayer_code?.trim() || null) : existingClient.foreign_taxpayer_code,
        
        // Finance
        credit_sum: body.credit_sum !== undefined 
          ? (body.credit_sum !== null && body.credit_sum !== '' ? parseFloat(body.credit_sum) : existingClient.credit_sum) 
          : existingClient.credit_sum,
        pay_per: body.pay_per !== undefined ? (body.pay_per?.trim() || null) : existingClient.pay_per,
        currency: body.currency ?? existingClient.currency,
        payment_terms: body.payment_terms !== undefined ? (body.payment_terms?.trim() || null) : existingClient.payment_terms,
        automatic_debt_reminder: body.automatic_debt_reminder ?? existingClient.automatic_debt_reminder,
        
        // SABIS / ERP
        sabis_customer_name: body.sabis_customer_name !== undefined ? (body.sabis_customer_name?.trim() || null) : existingClient.sabis_customer_name,
        sabis_customer_code: body.sabis_customer_code !== undefined ? (body.sabis_customer_code?.trim() || null) : existingClient.sabis_customer_code,
        
        // Notes
        additional_information: body.additional_information !== undefined ? (body.additional_information?.trim() || null) : existingClient.additional_information,
        notes: body.notes !== undefined ? (body.notes?.trim() || null) : existingClient.notes,
      }
    });

    return NextResponse.json({ success: true, client: updatedClient });

  } catch (error: any) {
    console.error('Error updating client:', error);
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[1] || error.meta?.target?.[0] || 'field';
      return NextResponse.json({ 
        success: false, 
        error: `A client with this ${field} already exists in this company`
      }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Failed to update client' }, { status: 500 });
  }
}

// ============================================
// DELETE /api/company/[companyId]/clients/[clientId]
// Delete client (with referential integrity check)
// ============================================
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string; clientId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const companyId = parseInt(params.companyId);
    const clientId = parseInt(params.clientId);

    if (isNaN(companyId) || isNaN(clientId)) {
      return NextResponse.json({ success: false, error: 'Invalid IDs' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const existingClient = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!existingClient || existingClient.company_id !== companyId) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    // Check referential integrity - cannot delete if referenced
    const [salesCount, purchasesCount, bankOpsCount, warehouseCount] = await Promise.all([
      prisma.sales.count({ where: { client_id: clientId } }),
      prisma.purchases.count({ where: { supplier_id: clientId } }),
      prisma.bank_operations.count({ where: { client_id: clientId } }),
      prisma.warehouses.count({ where: { clientsId: clientId } })
    ]);

    const totalRefs = salesCount + purchasesCount + bankOpsCount + warehouseCount;
    
    if (totalRefs > 0) {
      const details = [];
      if (salesCount > 0) details.push(`${salesCount} sales`);
      if (purchasesCount > 0) details.push(`${purchasesCount} purchases`);
      if (bankOpsCount > 0) details.push(`${bankOpsCount} bank operations`);
      if (warehouseCount > 0) details.push(`${warehouseCount} warehouses`);
      
      return NextResponse.json({
        success: false,
        error: `Cannot delete client: ${details.join(', ')} reference this client. Consider deactivating instead.`
      }, { status: 400 });
    }

    // Delete related records first (cascade should handle this, but being explicit)
    await prisma.$transaction([
      prisma.client_addresses.deleteMany({ where: { client_id: clientId } }),
      prisma.client_bank_accounts.deleteMany({ where: { client_id: clientId } }),
      prisma.clients.delete({ where: { id: clientId } })
    ]);

    return NextResponse.json({ success: true, message: 'Client deleted successfully' });

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete client' }, { status: 500 });
  }
}
