// src/app/api/company/[companyId]/clients/[clientId]/route.ts
// Sprint 1.4 — Clients API (PUT update, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// ============================================
// AUTH HELPER
// ============================================

async function getUserIdFromToken(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const access = await prisma.company_users.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
      is_active: true,
    },
  });
  return !!access;
}

// ============================================
// GET /api/company/[companyId]/clients/[clientId]
// Get single client
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
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const client = await prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
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
// Update client
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
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Check client exists
    const existingClient = await prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
    });

    if (!existingClient) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();

    // Update client
    const client = await prisma.clients.update({
      where: { id: clientId },
      data: {
        // Required (if provided)
        ...(body.name && { name: body.name.trim() }),
        ...(body.email && { email: body.email.trim().toLowerCase() }),
        
        // Optional strings
        abbreviation: body.abbreviation?.trim() ?? existingClient.abbreviation,
        code: body.code?.trim() ?? existingClient.code,
        phone: body.phone?.trim() ?? existingClient.phone,
        fax: body.fax?.trim() ?? existingClient.fax,
        website: body.website?.trim() ?? existingClient.website,
        contact_information: body.contact_information?.trim() ?? existingClient.contact_information,
        country: body.country?.trim() ?? existingClient.country,
        legal_address: body.legal_address?.trim() ?? existingClient.legal_address,
        actual_address: body.actual_address?.trim() ?? existingClient.actual_address,
        business_license_code: body.business_license_code?.trim() ?? existingClient.business_license_code,
        vat_code: body.vat_code?.trim()?.toUpperCase() ?? existingClient.vat_code,
        eori_code: body.eori_code?.trim() ?? existingClient.eori_code,
        foreign_taxpayer_code: body.foreign_taxpayer_code?.trim() ?? existingClient.foreign_taxpayer_code,
        registration_number: body.registration_number?.trim() ?? existingClient.registration_number,
        pay_per: body.pay_per?.trim() ?? existingClient.pay_per,
        payment_terms: body.payment_terms?.trim() ?? existingClient.payment_terms,
        sabis_customer_name: body.sabis_customer_name?.trim() ?? existingClient.sabis_customer_name,
        sabis_customer_code: body.sabis_customer_code?.trim() ?? existingClient.sabis_customer_code,
        additional_information: body.additional_information?.trim() ?? existingClient.additional_information,
        notes: body.notes?.trim() ?? existingClient.notes,
        
        // Role & Type
        ...(body.role && { role: body.role }),
        ...(body.is_juridical !== undefined && { is_juridical: body.is_juridical }),
        ...(body.is_active !== undefined && { is_active: body.is_active }),
        ...(body.is_foreigner !== undefined && { is_foreigner: body.is_foreigner }),
        ...(body.automatic_debt_reminder !== undefined && { automatic_debt_reminder: body.automatic_debt_reminder }),
        
        // Numbers
        ...(body.vat_rate !== undefined && { vat_rate: body.vat_rate != null ? parseFloat(body.vat_rate) : null }),
        ...(body.credit_sum !== undefined && { credit_sum: body.credit_sum != null ? parseFloat(body.credit_sum) : null }),
        
        // Dates
        ...(body.registration_date !== undefined && { registration_date: body.registration_date ? new Date(body.registration_date) : null }),
        ...(body.date_of_birth !== undefined && { date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : null }),
        
        // Currency
        ...(body.currency && { currency: body.currency }),
      },
    });

    return NextResponse.json({ success: true, client });

  } catch (error) {
    console.error('Error updating client:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ success: false, error: 'Client with this code or VAT already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ success: false, error: 'Failed to update client' }, { status: 500 });
  }
}

// ============================================
// DELETE /api/company/[companyId]/clients/[clientId]
// Delete client
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
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Check client exists
    const existingClient = await prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
    });

    if (!existingClient) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    // Delete client
    await prisma.clients.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting client:', error);
    
    // Handle foreign key constraints
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete client with related records (sales, purchases, etc.)' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ success: false, error: 'Failed to delete client' }, { status: 500 });
  }
}
