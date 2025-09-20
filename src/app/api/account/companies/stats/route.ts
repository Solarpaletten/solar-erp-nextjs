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
        console.error('API Error:', error.message)
        console.error('Error details:', error)
        
        return NextResponse.json({ 
            error: error.message,
            type: error.constructor.name
        }, { status: 500 })
        
    } finally {
        await prisma.$disconnect()
    }
}
