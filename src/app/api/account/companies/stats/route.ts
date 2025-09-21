import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
    const prisma = new PrismaClient()
    
    try {
        console.log('API: Testing Prisma connection...')
        
        // Простой тест подключения
        await prisma.$connect()
        console.log('API: Prisma connected')
        
        const companies = await prisma.companies.findMany({
            where: { is_active: true }
        })

        console.log(`API: Found ${companies.length} companies`)

        return NextResponse.json({
            success: true,
            companies: companies
        })

    } catch (error) {
        console.error('=== STATS API ERROR ===')
        
        // Safe error handling for TypeScript
        if (error instanceof Error) {
          console.error('Error type:', error.constructor.name)
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
        } else {
          console.error('Unknown error:', error)
        }
      
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch company stats',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      } finally {
        await prisma.$disconnect()
    }
}
