// src/app/api/company/[companyId]/clients/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    // Исправлено: берем companyId, а не id
    const { companyId } = await context.params
    const company_id = parseInt(companyId, 10)

    if (isNaN(company_id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid company ID' 
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    console.log(`API: Searching clients for company ${company_id}, query: "${query}"`)

    await prisma.$connect()

    const results = await prisma.clients.findMany({
      where: {
        company_id,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 20,
      orderBy: { id: 'desc' }
    })

    console.log(`API: Found ${results.length} clients matching "${query}"`)

    return NextResponse.json({ 
      success: true, 
      clients: results 
    })

  } catch (error) {
    console.error('Error in search route:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}