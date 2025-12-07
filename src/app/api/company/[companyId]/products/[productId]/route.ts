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
 * GET /api/company/[companyId]/products/[productId]
 * Returns a single product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const companyIdNum = parseInt(companyId);
    const productIdNum = parseInt(productId);

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

    // Fetch product
    const product = await prisma.products.findUnique({
      where: {
        id: productIdNum
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Verify product belongs to this company
    if (product.company_id !== companyIdNum) {
      return forbiddenResponse();
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/company/[companyId]/products/[productId]
 * Updates a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const companyIdNum = parseInt(companyId);
    const productIdNum = parseInt(productId);

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

    // Check if product exists and belongs to this company
    const existingProduct = await prisma.products.findUnique({
      where: { id: productIdNum }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.company_id !== companyIdNum) {
      return forbiddenResponse();
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      code,
      sku,
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

    // Update product
    const product = await prisma.products.update({
      where: {
        id: productIdNum
      },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(sku !== undefined && { sku: sku || null }),
        ...(description !== undefined && { description: description || null }),
        ...(unit !== undefined && { unit }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(cost_price !== undefined && { cost_price: cost_price ? parseFloat(cost_price) : null }),
        ...(currency !== undefined && { currency }),
        ...(vat_rate !== undefined && { vat_rate: vat_rate ? parseFloat(vat_rate) : null }),
        ...(category !== undefined && { category: category || null }),
        ...(subcategory !== undefined && { subcategory: subcategory || null }),
        ...(min_stock !== undefined && { min_stock: min_stock ? parseFloat(min_stock) : null }),
        ...(current_stock !== undefined && { current_stock: current_stock ? parseFloat(current_stock) : null }),
        ...(is_active !== undefined && { is_active }),
        ...(is_service !== undefined && { is_service })
      }
    });

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error: any) {
    console.error('Error updating product:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return badRequestResponse('Product code already exists in this company');
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/company/[companyId]/products/[productId]
 * Deletes a product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const companyIdNum = parseInt(companyId);
    const productIdNum = parseInt(productId);

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

    // Check if product exists and belongs to this company
    const existingProduct = await prisma.products.findUnique({
      where: { id: productIdNum }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.company_id !== companyIdNum) {
      return forbiddenResponse();
    }

    // Delete product
    await prisma.products.delete({
      where: {
        id: productIdNum
      }
    });

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {
    console.error('Error deleting product:', error);

    // Handle foreign key constraint violations
    if (error.code === 'P2003' || error.code === 'P2014') {
      return badRequestResponse('Cannot delete product - it is referenced by other records');
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
