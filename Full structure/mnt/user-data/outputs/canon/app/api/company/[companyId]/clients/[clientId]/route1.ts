// app/api/company/[companyId]/clients/[clientId]/route.ts
// SolarNetJS Canon — Company-first, NO src/

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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

async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const access = await prisma.company_users.findFirst({
    where: { user_id: userId, company_id: companyId, is_active: true },
  });
  return !!access;
}

// ============================================
// GET /api/company/[companyId]/clients/[clientId]
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

    const existingClient = await prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
    });

    if (!existingClient) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();

    const client = await prisma.clients.update({
      where: { id: clientId },
      data: {
        name: body.name?.trim() ?? existingClient.name,
        email: body.email?.trim()?.toLowerCase() ?? existingClient.email,
        abbreviation: body.abbreviation?.trim() ?? existingClient.abbreviation,
        code: body.code?.trim() ?? existingClient.code,
        phone: body.phone?.trim() ?? existingClient.phone,
        fax: body.fax?.trim() ?? existingClient.fax,
        website: body.website?.trim() ?? existingClient.website,
        contact_information: body.contact_information?.trim() ?? existingClient.contact_information,
        role: body.role ?? existingClient.role,
        is_juridical: body.is_juridical ?? existingClient.is_juridical,
        is_active: body.is_active ?? existingClient.is_active,
        is_foreigner: body.is_foreigner ?? existingClient.is_foreigner,
        country: body.country?.trim() ?? existingClient.country,
        legal_address: body.legal_address?.trim() ?? existingClient.legal_address,
        actual_address: body.actual_address?.trim() ?? existingClient.actual_address,
        business_license_code: body.business_license_code?.trim() ?? existingClient.business_license_code,
        vat_code: body.vat_code?.trim()?.toUpperCase() ?? existingClient.vat_code,
        vat_rate: body.vat_rate !== undefined ? parseFloat(body.vat_rate) : existingClient.vat_rate,
        eori_code: body.eori_code?.trim() ?? existingClient.eori_code,
        foreign_taxpayer_code: body.foreign_taxpayer_code?.trim() ?? existingClient.foreign_taxpayer_code,
        registration_number: body.registration_number?.trim() ?? existingClient.registration_number,
        credit_sum: body.credit_sum !== undefined ? parseFloat(body.credit_sum) : existingClient.credit_sum,
        pay_per: body.pay_per?.trim() ?? existingClient.pay_per,
        currency: body.currency ?? existingClient.currency,
        payment_terms: body.payment_terms?.trim() ?? existingClient.payment_terms,
        automatic_debt_reminder: body.automatic_debt_reminder ?? existingClient.automatic_debt_reminder,
        registration_date: body.registration_date ? new Date(body.registration_date) : existingClient.registration_date,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : existingClient.date_of_birth,
        sabis_customer_name: body.sabis_customer_name?.trim() ?? existingClient.sabis_customer_name,
        sabis_customer_code: body.sabis_customer_code?.trim() ?? existingClient.sabis_customer_code,
        additional_information: body.additional_information?.trim() ?? existingClient.additional_information,
        notes: body.notes?.trim() ?? existingClient.notes,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error: unknown) {
    console.error('Error updating client:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Duplicate code/VAT' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update client' }, { status: 500 });
  }
}

// ============================================
// DELETE /api/company/[companyId]/clients/[clientId]
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

    const client = await prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    await prisma.clients.delete({ where: { id: clientId } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting client:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return NextResponse.json({ success: false, error: 'Cannot delete: related records exist' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete client' }, { status: 500 });
  }
}
