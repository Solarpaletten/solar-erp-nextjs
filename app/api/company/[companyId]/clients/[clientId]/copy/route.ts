// app/api/company/[companyId]/clients/[clientId]/copy/route.ts
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
// POST /api/company/[companyId]/clients/[clientId]/copy
// ============================================

export async function POST(
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

    const original = await prisma.clients.findFirst({
      where: { id: clientId, company_id: companyId },
    });

    if (!original) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const timestamp = Date.now().toString().slice(-4);
    const copySuffix = ` (kopija ${timestamp})`;

    const copy = await prisma.clients.create({
      data: {
        company_id: companyId,
        created_by: userId,
        name: original.name + copySuffix,
        email: original.email ? `copy_${timestamp}_${original.email}` : `copy_${timestamp}@temp.local`,
        code: original.code ? `${original.code}_${timestamp}` : null,
        vat_code: null,
        registration_number: null,
        abbreviation: original.abbreviation,
        phone: original.phone,
        fax: original.fax,
        website: original.website,
        contact_information: original.contact_information,
        role: original.role,
        is_juridical: original.is_juridical,
        is_active: original.is_active,
        is_foreigner: original.is_foreigner,
        country: original.country,
        legal_address: original.legal_address,
        actual_address: original.actual_address,
        business_license_code: original.business_license_code,
        vat_rate: original.vat_rate,
        eori_code: original.eori_code,
        foreign_taxpayer_code: original.foreign_taxpayer_code,
        credit_sum: original.credit_sum,
        pay_per: original.pay_per,
        currency: original.currency,
        payment_terms: original.payment_terms,
        automatic_debt_reminder: original.automatic_debt_reminder,
        registration_date: original.registration_date,
        date_of_birth: original.date_of_birth,
        sabis_customer_name: original.sabis_customer_name,
        sabis_customer_code: original.sabis_customer_code,
        additional_information: original.additional_information,
        notes: original.notes ? `${original.notes}\n\n[Copied from ID: ${clientId}]` : `[Copied from ID: ${clientId}]`,
      },
    });

    return NextResponse.json({ success: true, client: copy }, { status: 201 });
  } catch (error) {
    console.error('Error copying client:', error);
    return NextResponse.json({ success: false, error: 'Failed to copy client' }, { status: 500 });
  }
}
