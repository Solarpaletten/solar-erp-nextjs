// src/app/api/company/[companyId]/clients/route.ts

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

// GET /api/company/[companyId]/clients - List all clients
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
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

    // Get company ID from params
    const params = await context.params;
    const companyId = parseInt(params.companyId);

    if (isNaN(companyId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid company ID'
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

    // Fetch clients for this company
    const clients = await prisma.clients.findMany({
      where: {
        company_id: companyId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      clients: clients
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch clients'
    }, { status: 500 });
  }
}

// POST /api/company/[companyId]/clients - Create new client
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
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

    // Get company ID from params
    const params = await context.params;
    const companyId = parseInt(params.companyId);

    if (isNaN(companyId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid company ID'
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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required'
      }, { status: 400 });
    }

    // Create client
    const client = await prisma.clients.create({
      data: {
        company_id: companyId,
        name: body.name,
        abbreviation: body.abbreviation || null,
        code: body.code || null,
        email: body.email,
        phone: body.phone || null,
        fax: body.fax || null,
        website: body.website || null,
        contact_information: body.contact_information || null,
        role: body.role || 'CLIENT',
        is_juridical: body.is_juridical ?? true,
        is_active: body.is_active ?? true,
        is_foreigner: body.is_foreigner ?? false,
        country: body.country || null,
        legal_address: body.legal_address || null,
        actual_address: body.actual_address || null,
        business_license_code: body.business_license_code || null,
        vat_code: body.vat_code || null,
        vat_rate: body.vat_rate ? parseFloat(body.vat_rate) : null,
        eori_code: body.eori_code || null,
        foreign_taxpayer_code: body.foreign_taxpayer_code || null,
        registration_number: body.registration_number || null,
        credit_sum: body.credit_sum ? parseFloat(body.credit_sum) : 0,
        pay_per: body.pay_per || null,
        currency: body.currency || 'EUR',
        payment_terms: body.payment_terms || null,
        automatic_debt_reminder: body.automatic_debt_reminder ?? false,
        registration_date: body.registration_date ? new Date(body.registration_date) : null,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : null,
        sabis_customer_name: body.sabis_customer_name || null,
        sabis_customer_code: body.sabis_customer_code || null,
        additional_information: body.additional_information || null,
        notes: body.notes || null,
        created_by: userId
      }
    });

    return NextResponse.json({
      success: true,
      client: client
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating client:', error);
    
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
      error: 'Failed to create client'
    }, { status: 500 });
  }
}