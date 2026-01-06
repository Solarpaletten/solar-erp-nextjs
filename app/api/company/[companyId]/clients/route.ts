// app/api/company/[companyId]/clients/route.ts
// SolarNetJS Canon — Company-first, NO src/

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// ============================================
// AUTH HELPERS
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

async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const access = await prisma.company_users.findFirst({
    where: { user_id: userId, company_id: companyId, is_active: true },
  });
  return !!access;
}

// ============================================
// GET /api/company/[companyId]/clients
// ============================================

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const companyId = parseInt(params.companyId);
    if (isNaN(companyId)) {
      return NextResponse.json({ success: false, error: 'Invalid company ID' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const clients = await prisma.clients.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// ============================================
// POST /api/company/[companyId]/clients
// ============================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const companyId = parseInt(params.companyId);
    if (isNaN(companyId)) {
      return NextResponse.json({ success: false, error: 'Invalid company ID' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ success: false, error: 'Name and email required' }, { status: 400 });
    }

    const client = await prisma.clients.create({
      data: {
        company_id: companyId,
        created_by: userId,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        abbreviation: body.abbreviation?.trim() || null,
        code: body.code?.trim() || null,
        phone: body.phone?.trim() || null,
        fax: body.fax?.trim() || null,
        website: body.website?.trim() || null,
        contact_information: body.contact_information?.trim() || null,
        role: body.role || 'CLIENT',
        is_juridical: body.is_juridical ?? true,
        is_active: body.is_active ?? true,
        is_foreigner: body.is_foreigner ?? false,
        country: body.country?.trim() || null,
        legal_address: body.legal_address?.trim() || null,
        actual_address: body.actual_address?.trim() || null,
        business_license_code: body.business_license_code?.trim() || null,
        vat_code: body.vat_code?.trim()?.toUpperCase() || null,
        vat_rate: body.vat_rate ? parseFloat(body.vat_rate) : null,
        eori_code: body.eori_code?.trim() || null,
        foreign_taxpayer_code: body.foreign_taxpayer_code?.trim() || null,
        registration_number: body.registration_number?.trim() || null,
        credit_sum: body.credit_sum ? parseFloat(body.credit_sum) : null,
        pay_per: body.pay_per?.trim() || null,
        currency: body.currency || 'EUR',
        payment_terms: body.payment_terms?.trim() || null,
        automatic_debt_reminder: body.automatic_debt_reminder ?? null,
        registration_date: body.registration_date ? new Date(body.registration_date) : null,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : null,
        sabis_customer_name: body.sabis_customer_name?.trim() || null,
        sabis_customer_code: body.sabis_customer_code?.trim() || null,
        additional_information: body.additional_information?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, client }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating client:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Client with this code/VAT already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create client' }, { status: 500 });
  }
}
