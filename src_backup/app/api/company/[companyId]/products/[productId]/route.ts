import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const companyIdNum = parseInt(companyId);
    const productIdNum = parseInt(productId);

    const product = await prisma.products.findFirst({
      where: {
        id: productIdNum,
        company_id: companyIdNum
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const companyIdNum = parseInt(companyId);
    const productIdNum = parseInt(productId);

    const existingProduct = await prisma.products.findFirst({
      where: { id: productIdNum, company_id: companyIdNum }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.cost_price !== undefined) updateData.cost_price = body.cost_price ? parseFloat(body.cost_price) : null;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.vat_rate !== undefined) updateData.vat_rate = body.vat_rate ? parseFloat(body.vat_rate) : null;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory || null;
    if (body.min_stock !== undefined) updateData.min_stock = body.min_stock ? parseFloat(body.min_stock) : null;
    if (body.current_stock !== undefined) updateData.current_stock = body.current_stock ? parseFloat(body.current_stock) : null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_service !== undefined) updateData.is_service = body.is_service;

    const product = await prisma.products.update({
      where: { id: productIdNum },
      data: updateData
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Product code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const companyIdNum = parseInt(companyId);
    const productIdNum = parseInt(productId);

    const existingProduct = await prisma.products.findFirst({
      where: { id: productIdNum, company_id: companyIdNum }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.products.delete({
      where: { id: productIdNum }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2003' || error.code === 'P2014') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete - product is referenced by other records' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}