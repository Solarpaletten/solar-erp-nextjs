import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  getUserIdFromToken, 
  verifyCompanyAccess,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse
} from '@/lib/auth';

/**
 * GET /api/company/[companyId]/products
 * Returns list of products for a company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const companyIdNum = parseInt(companyId);

    // Auth check
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(userId, companyIdNum);
    if (!hasAccess) {
      return forbiddenResponse();
    }

    // Fetch products
    const products = await prisma.products.findMany({
      where: {
        company_id: companyIdNum
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        company_id: true,
        name: true,
        code: true,
        description: true,
        unit: true,
        price: true,
        cost_price: true,
        currency: true,
        vat_rate: true,
        category: true,
        subcategory: true,
        min_stock: true,
        current_stock: true,
        is_active: true,
        is_service: true,
        created_at: true,
        updated_at: true
      }
    });

    return NextResponse.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company/[companyId]/products
 * Creates a new product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const companyIdNum = parseInt(companyId);

    // Auth check
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(userId, companyIdNum);
    if (!hasAccess) {
      return forbiddenResponse();
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      code,
      description,
      unit,
      price,
      cost_price,
      currency,
      vat_rate,
      category,
      subcategory,
      min_stock,
      current_stock,
      is_active,
      is_service
    } = body;

    // Validate required fields
    if (!name) {
      return badRequestResponse('Product name is required');
    }

    // Generate code if not provided
    let productCode = code;
    if (!productCode) {
      // Get next sequence number for this company
      const lastProduct = await prisma.products.findFirst({
        where: { company_id: companyIdNum },
        orderBy: { id: 'desc' },
        select: { id: true }
      });
      const nextId = (lastProduct?.id || 0) + 1;
      productCode = `PRD-${companyIdNum}-${nextId}`;
    }

    // Create product
    const product = await prisma.products.create({
      data: {
        company_id: companyIdNum,
        name,
        code: productCode,
        description: description || null,
        unit: unit || 'pcs',
        price: price ? parseFloat(price) : 0,
        cost_price: cost_price ? parseFloat(cost_price) : null,
        currency: currency || 'EUR',
        vat_rate: vat_rate ? parseFloat(vat_rate) : null,
        category: category || null,
        subcategory: subcategory || null,
        min_stock: min_stock ? parseFloat(min_stock) : null,
        current_stock: current_stock ? parseFloat(current_stock) : null,
        is_active: is_active !== undefined ? is_active : true,
        is_service: is_service !== undefined ? is_service : false,
        created_by: userId
      }
    });

    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return badRequestResponse('Product code already exists in this company');
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
