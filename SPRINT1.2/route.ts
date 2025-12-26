// src/app/api/company/[companyId]/clients/route.ts
// Sprint 1.2 — Clients API (Full fields from Prisma)

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
    where: {
      user_id: userId,
      company_id: companyId,
      is_active: true
    }
  });
  
  return !!membership;
}

// ============================================
// GET /api/company/[companyId]/clients
// List all clients with ALL fields
// ============================================
export async function GET(
  _request: NextRequest,
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

    // Fetch clients for this company with ALL fields
    const clients = await prisma.clients.findMany({
      where: {
        company_id: companyId
      },
      select: {
        // Primary
        id: true,
        company_id: true,
        
        // Basic info
        name: true,
        abbreviation: true,
        code: true,
        email: true,
        phone: true,
        fax: true,
        website: true,
        contact_information: true,
        
        // Role & Type
        role: true,
        is_juridical: true,
        is_active: true,
        is_foreigner: true,
        country: true,
        
        // Addresses
        legal_address: true,
        actual_address: true,
        
        // Registration
        business_license_code: true,
        registration_number: true,
        registration_date: true,
        date_of_birth: true,
        
        // Tax
        vat_code: true,
        vat_rate: true,
        eori_code: true,
        foreign_taxpayer_code: true,
        
        // Finance
        credit_sum: true,
        pay_per: true,
        currency: true,
        payment_terms: true,
        automatic_debt_reminder: true,
        
        // SABIS / ERP
        sabis_customer_name: true,
        sabis_customer_code: true,
        
        // Notes
        additional_information: true,
        notes: true,
        
        // System
        created_by: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      clients: clients,
      count: clients.length
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch clients'
    }, { status: 500 });
  }
}

// ============================================
// POST /api/company/[companyId]/clients
// Create new client with ALL fields
// ============================================
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

    // Create client with ALL fields from Prisma schema
    const client = await prisma.clients.create({
      data: {
        // Required
        company_id: companyId,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        created_by: userId,
        
        // Basic info (optional)
        abbreviation: body.abbreviation?.trim() || null,
        code: body.code?.trim() || null,
        phone: body.phone?.trim() || null,
        fax: body.fax?.trim() || null,
        website: body.website?.trim() || null,
        contact_information: body.contact_information?.trim() || null,
        
        // Role & Type
        role: body.role || 'CLIENT',
        is_juridical: body.is_juridical ?? true,
        is_active: body.is_active ?? true,
        is_foreigner: body.is_foreigner ?? false,
        country: body.country?.trim() || null,
        
        // Addresses
        legal_address: body.legal_address?.trim() || null,
        actual_address: body.actual_address?.trim() || null,
        
        // Registration
        business_license_code: body.business_license_code?.trim() || null,
        registration_number: body.registration_number?.trim() || null,
        registration_date: body.registration_date ? new Date(body.registration_date) : null,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : null,
        
        // Tax
        vat_code: body.vat_code?.trim()?.toUpperCase() || null,
        vat_rate: body.vat_rate !== undefined && body.vat_rate !== null && body.vat_rate !== '' 
          ? parseFloat(body.vat_rate) 
          : null,
        eori_code: body.eori_code?.trim() || null,
        foreign_taxpayer_code: body.foreign_taxpayer_code?.trim() || null,
        
        // Finance
        credit_sum: body.credit_sum !== undefined && body.credit_sum !== null && body.credit_sum !== ''
          ? parseFloat(body.credit_sum) 
          : 0,
        pay_per: body.pay_per?.trim() || null,
        currency: body.currency || 'EUR',
        payment_terms: body.payment_terms?.trim() || null,
        automatic_debt_reminder: body.automatic_debt_reminder ?? false,
        
        // SABIS / ERP
        sabis_customer_name: body.sabis_customer_name?.trim() || null,
        sabis_customer_code: body.sabis_customer_code?.trim() || null,
        
        // Notes
        additional_information: body.additional_information?.trim() || null,
        notes: body.notes?.trim() || null,
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
      const field = error.meta?.target?.[1] || error.meta?.target?.[0] || 'field';
      return NextResponse.json({
        success: false,
        error: `A client with this ${field} already exists in this company`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create client'
    }, { status: 500 });
  }
}
