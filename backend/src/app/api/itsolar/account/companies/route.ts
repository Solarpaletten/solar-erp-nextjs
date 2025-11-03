import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        
        // В реальном проекте получайте owner_id из JWT токена
        const currentUserId = 3 // Ваш тестовый пользователь

        const newCompany = await prisma.companies.create({
            data: {
                name: data.name,
                code: data.code,
                short_name: data.name.substring(0, 10),
                description: data.description,
                director_name: 'Director Name',
                owner_id: currentUserId,
                legal_entity_type: 'LLC',
                is_active: true,
                setup_completed: true
            }
        })

        return NextResponse.json({
            success: true,
            company: newCompany
        })

    } catch (error) {
        console.error('Error creating company:', error)
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }
}