// src/app/api/company/[companyId]/sales/route.ts
// SALES API - Реализация товара (списание со склада)
// Sprint 3: Warehouse via Purchases & Sales

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ============================================
// GET /api/company/[companyId]/sales
// Список всех продаж компании
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

    const sales = await prisma.sales.findMany({
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
        client: {
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

    console.log(`[SALES GET] Company ${companyIdNum}: Found ${sales.length} sales`);

    return NextResponse.json({
      success: true,
      sales,
      count: sales.length
    });

  } catch (error) {
    console.error('[SALES GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/company/[companyId]/sales
// Создание продажи + СПИСАНИЕ СО СКЛАДА
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
      client_id,
      items, // Array of { product_id, quantity, unit_price_base, discount_percent?, vat_rate? }
      warehouse_id,
      document_type = 'INVOICE',
      currency = 'EUR',
      delivery_date,
      due_date
    } = body;

    if (!document_number || !document_date || !client_id || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: document_number, document_date, client_id, items' },
        { status: 400 }
      );
    }

    console.log(`[SALES POST] Creating sale ${document_number} with ${items.length} items`);

    // Проверяем существование client
    const client = await prisma.clients.findFirst({
      where: {
        id: client_id,
        company_id: companyIdNum,
        role: { in: ['CLIENT', 'BOTH'] }
      }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found or not a client' },
        { status: 400 }
      );
    }

    // ========================================
    // КРИТИЧНО: Проверка наличия на складе
    // ========================================
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

    // Проверяем остатки для КАЖДОГО товара
    const insufficientStock: { product_id: number; name: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      const currentStock = product?.current_stock ? parseFloat(product.current_stock.toString()) : 0;
      const requestedQty = parseFloat(item.quantity);

      if (currentStock < requestedQty) {
        insufficientStock.push({
          product_id: item.product_id,
          name: product?.name || 'Unknown',
          requested: requestedQty,
          available: currentStock
        });
      }
    }

    // Если хоть один товар недостаточен - ABORT
    if (insufficientStock.length > 0) {
      console.log(`[SALES POST] ❌ Insufficient stock:`, insufficientStock);
      return NextResponse.json({
        success: false,
        error: 'Insufficient stock',
        details: insufficientStock.map(s => 
          `${s.name}: requested ${s.requested}, available ${s.available}`
        ),
        insufficientStock
      }, { status: 400 });
    }

    console.log(`[SALES POST] ✅ Stock check passed for all ${items.length} items`);

    // Расчёт сумм
    let subtotal = 0;
    let totalVat = 0;
    let totalDiscount = 0;

    const saleItems = items.map((item: any, index: number) => {
      const quantity = parseFloat(item.quantity);
      const unitPriceBase = parseFloat(item.unit_price_base);
      const discountPercent = item.discount_percent ? parseFloat(item.discount_percent) : 0;
      const vatRate = item.vat_rate ? parseFloat(item.vat_rate) : 0;
      
      const grossAmount = quantity * unitPriceBase;
      const discountAmount = grossAmount * (discountPercent / 100);
      const netAmount = grossAmount - discountAmount;
      const vatAmount = netAmount * (vatRate / 100);
      const lineTotal = netAmount + vatAmount;
      
      subtotal += netAmount;
      totalVat += vatAmount;
      totalDiscount += discountAmount;

      return {
        product_id: item.product_id,
        quantity: quantity,
        unit_price_base: unitPriceBase,
        discount_percent: discountPercent,
        total_discount: discountAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        line_total: lineTotal,
        line_number: index + 1,
        description: item.description || null
      };
    });

    const totalAmount = subtotal + totalVat;

    // ========================================
    // ТРАНЗАКЦИЯ: Создание продажи + СПИСАНИЕ
    // ========================================
    const result = await prisma.$transaction(async (tx) => {
      // 1. Создаём документ продажи
      const sale = await tx.sales.create({
        data: {
          company_id: companyIdNum,
          document_number,
          document_date: new Date(document_date),
          document_type: document_type as any,
          delivery_date: delivery_date ? new Date(delivery_date) : null,
          due_date: due_date ? new Date(due_date) : null,
          client_id,
          warehouse_id: warehouse_id || null,
          subtotal,
          vat_amount: totalVat,
          discount_amount: totalDiscount,
          total_amount: totalAmount,
          currency: currency as any,
          payment_status: 'PENDING',
          delivery_status: 'PENDING',
          document_status: 'DRAFT',
          created_by: userId
        }
      });

      console.log(`[SALES POST] Sale created: ID ${sale.id}`);

      // 2. Создаём позиции продажи
      await tx.sale_items.createMany({
        data: saleItems.map((item: any) => ({
          sale_id: sale.id,
          ...item
        }))
      });

      console.log(`[SALES POST] Created ${saleItems.length} sale items`);

      // 3. КРИТИЧНО: Уменьшаем остатки на складе
      for (const item of saleItems) {
        await tx.products.update({
          where: { id: item.product_id },
          data: {
            current_stock: {
              decrement: item.quantity
            }
          }
        });
        console.log(`[SALES POST] Stock DECREMENT: Product ${item.product_id} -${item.quantity}`);
      }

      return sale;
    });

    // Получаем полные данные созданной продажи
    const createdSale = await prisma.sales.findUnique({
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
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`[SALES POST] ✅ Sale ${document_number} completed. Stock decreased.`);

    return NextResponse.json({
      success: true,
      sale: createdSale,
      message: `Sale created. Stock decreased for ${items.length} products.`
    }, { status: 201 });

  } catch (error: any) {
    console.error('[SALES POST] Error:', error);

    // Обработка ошибки уникальности document_number
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Document number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create sale' },
      { status: 500 }
    );
  }
}
