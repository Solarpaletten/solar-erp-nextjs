// src/app/api/company/[companyId]/warehouse/route.ts
// WAREHOUSE API - Витрина остатков (READ ONLY)
// Sprint 3: Warehouse via Purchases & Sales
//
// ❌ Никаких POST / PUT / DELETE
// ✅ Только чтение из products.current_stock

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ============================================
// GET /api/company/[companyId]/warehouse
// Витрина остатков - расчётные данные из products
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

    // Получаем URL параметры для фильтрации
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const statusFilter = searchParams.get('status'); // 'LOW', 'OK', 'ALL'
    const activeOnly = searchParams.get('active') !== 'false';

    // Базовый запрос
    const whereClause: any = {
      company_id: companyIdNum,
      is_service: false // Только товары, не услуги
    };

    if (activeOnly) {
      whereClause.is_active = true;
    }

    if (categoryFilter) {
      whereClause.category = categoryFilter;
    }

    const products = await prisma.products.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        category: true,
        subcategory: true,
        current_stock: true,
        min_stock: true,
        price: true,
        cost_price: true,
        currency: true,
        is_active: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Преобразуем данные и добавляем статус
    const warehouseItems = products.map(product => {
      const currentStock = product.current_stock ? parseFloat(product.current_stock.toString()) : 0;
      const minStock = product.min_stock ? parseFloat(product.min_stock.toString()) : 0;
      
      // Определяем статус
      let status: 'LOW' | 'OK' | 'OUT_OF_STOCK' | 'OVERSTOCKED';
      if (currentStock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (currentStock < minStock) {
        status = 'LOW';
      } else if (minStock > 0 && currentStock > minStock * 3) {
        status = 'OVERSTOCKED';
      } else {
        status = 'OK';
      }

      // Расчёт стоимости остатка
      const costPrice = product.cost_price ? parseFloat(product.cost_price.toString()) : 0;
      const stockValue = currentStock * costPrice;

      return {
        id: product.id,
        code: product.code,
        name: product.name,
        unit: product.unit,
        category: product.category,
        subcategory: product.subcategory,
        current_stock: currentStock,
        min_stock: minStock,
        status,
        stock_value: stockValue,
        cost_price: costPrice,
        price: product.price ? parseFloat(product.price.toString()) : 0,
        currency: product.currency,
        is_active: product.is_active
      };
    });

    // Фильтрация по статусу если указан
    let filteredItems = warehouseItems;
    if (statusFilter && statusFilter !== 'ALL') {
      filteredItems = warehouseItems.filter(item => item.status === statusFilter);
    }

    // Статистика
    const stats = {
      total_products: warehouseItems.length,
      in_stock: warehouseItems.filter(i => i.status === 'OK').length,
      low_stock: warehouseItems.filter(i => i.status === 'LOW').length,
      out_of_stock: warehouseItems.filter(i => i.status === 'OUT_OF_STOCK').length,
      overstocked: warehouseItems.filter(i => i.status === 'OVERSTOCKED').length,
      total_stock_value: warehouseItems.reduce((sum, i) => sum + i.stock_value, 0)
    };

    // Группировка по категориям
    const byCategory = warehouseItems.reduce((acc: any, item) => {
      const cat = item.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = {
          count: 0,
          total_stock: 0,
          stock_value: 0
        };
      }
      acc[cat].count++;
      acc[cat].total_stock += item.current_stock;
      acc[cat].stock_value += item.stock_value;
      return acc;
    }, {});

    console.log(`[WAREHOUSE GET] Company ${companyIdNum}: ${filteredItems.length} items (${stats.low_stock} low, ${stats.out_of_stock} out)`);

    return NextResponse.json({
      success: true,
      warehouse: filteredItems,
      stats,
      byCategory,
      count: filteredItems.length
    });

  } catch (error) {
    console.error('[WAREHOUSE GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch warehouse data' },
      { status: 500 }
    );
  }
}

// ============================================
// ❌ POST - ЗАПРЕЩЕНО
// Склад не редактируется напрямую
// ============================================
export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Direct warehouse modification is not allowed. Use Purchases or Sales.' 
    },
    { status: 405 }
  );
}

// ============================================
// ❌ PUT - ЗАПРЕЩЕНО
// ============================================
export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Direct warehouse modification is not allowed. Use Purchases or Sales.' 
    },
    { status: 405 }
  );
}

// ============================================
// ❌ DELETE - ЗАПРЕЩЕНО
// ============================================
export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Direct warehouse modification is not allowed. Use Purchases or Sales.' 
    },
    { status: 405 }
  );
}
