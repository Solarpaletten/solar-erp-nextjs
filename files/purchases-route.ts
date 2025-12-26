// src/app/api/company/[companyId]/purchases/route.ts
// PURCHASES API - Приход товара на склад
// Sprint 3: Warehouse via Purchases & Sales

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ============================================
// GET /api/company/[companyId]/purchases
// Список всех закупок компании
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const companyIdNum = parseInt(companyId);

    if (isNaN(companyIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const purchases = await prisma.purchases.findMany({
      where: { company_id: companyIdNum },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                current_stock: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            name: true,
            code: true,
            email: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { document_date: 'desc' }
    });

    console.log(`[PURCHASES GET] Company ${companyIdNum}: Found ${purchases.length} purchases`);

    return NextResponse.json({
      success: true,
      purchases,
      count: purchases.length
    });

  } catch (error) {
    console.error('[PURCHASES GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/company/[companyId]/purchases
// Создание закупки + ПРИХОД НА СКЛАД
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const companyIdNum = parseInt(companyId);
    const userId = 1; // TODO: из JWT token

    if (isNaN(companyIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Валидация обязательных полей
    const {
      document_number,
      document_date,
      supplier_id,
      items, // Array of { product_id, quantity, unit_price, vat_rate? }
      warehouse_id,
      operation_type = 'PURCHASE',
      currency = 'EUR',
      notes
    } = body;

    if (!document_number || !document_date || !supplier_id || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: document_number, document_date, supplier_id, items' },
        { status: 400 }
      );
    }

    console.log(`[PURCHASES POST] Creating purchase ${document_number} with ${items.length} items`);

    // Проверяем существование supplier
    const supplier = await prisma.clients.findFirst({
      where: {
        id: supplier_id,
        company_id: companyIdNum,
        role: { in: ['SUPPLIER', 'BOTH'] }
      }
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found or not a supplier' },
        { status: 400 }
      );
    }

    // Проверяем существование всех продуктов
    const productIds = items.map((item: any) => item.product_id);
    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds },
        company_id: companyIdNum
      }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some products not found' },
        { status: 400 }
      );
    }

    // Расчёт сумм
    let subtotal = 0;
    let totalVat = 0;

    const purchaseItems = items.map((item: any, index: number) => {
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unit_price);
      const vatRate = item.vat_rate ? parseFloat(item.vat_rate) : 0;
      
      const lineTotal = quantity * unitPrice;
      const vatAmount = lineTotal * (vatRate / 100);
      
      subtotal += lineTotal;
      totalVat += vatAmount;

      return {
        product_id: item.product_id,
        quantity: quantity,
        unit_price: unitPrice,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        line_total: lineTotal,
        line_number: index + 1,
        notes: item.notes || null
      };
    });

    const totalAmount = subtotal + totalVat;

    // ========================================
    // ТРАНЗАКЦИЯ: Создание закупки + ПРИХОД
    // ========================================
    const result = await prisma.$transaction(async (tx) => {
      // 1. Создаём документ закупки
      const purchase = await tx.purchases.create({
        data: {
          company_id: companyIdNum,
          document_number,
          document_date: new Date(document_date),
          operation_type: operation_type as any,
          supplier_id,
          warehouse_id: warehouse_id || null,
          subtotal,
          vat_amount: totalVat,
          total_amount: totalAmount,
          currency: currency as any,
          payment_status: 'PENDING',
          delivery_status: 'PENDING',
          document_status: 'DRAFT',
          created_by: userId
        }
      });

      console.log(`[PURCHASES POST] Purchase created: ID ${purchase.id}`);

      // 2. Создаём позиции закупки
      await tx.purchase_items.createMany({
        data: purchaseItems.map((item: any) => ({
          purchase_id: purchase.id,
          ...item
        }))
      });

      console.log(`[PURCHASES POST] Created ${purchaseItems.length} purchase items`);

      // 3. КРИТИЧНО: Увеличиваем остатки на складе
      for (const item of purchaseItems) {
        await tx.products.update({
          where: { id: item.product_id },
          data: {
            current_stock: {
              increment: item.quantity
            }
          }
        });
        console.log(`[PURCHASES POST] Stock INCREMENT: Product ${item.product_id} +${item.quantity}`);
      }

      return purchase;
    });

    // Получаем полные данные созданной закупки
    const createdPurchase = await prisma.purchases.findUnique({
      where: { id: result.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                current_stock: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`[PURCHASES POST] ✅ Purchase ${document_number} completed. Stock updated.`);

    return NextResponse.json({
      success: true,
      purchase: createdPurchase,
      message: `Purchase created. Stock increased for ${items.length} products.`
    }, { status: 201 });

  } catch (error: any) {
    console.error('[PURCHASES POST] Error:', error);

    // Обработка ошибки уникальности document_number
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Document number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create purchase' },
      { status: 500 }
    );
  }
}
