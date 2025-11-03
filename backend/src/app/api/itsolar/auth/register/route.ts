import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const { email, password, username } = await request.json()

        const existingUser = await prisma.users.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.users.create({
            data: {
                email,
                username,
                password_hash: hashedPassword,
                role: 'USER',                    // Добавлено
                status: 'active',               // Добавлено
                is_active: true,                // Добавлено
                email_verified: true,           // Добавлено
                onboarding_completed: false     // Добавлено
            }
        })

        return NextResponse.json({
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username
            }
        }, { status: 201 })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }
}