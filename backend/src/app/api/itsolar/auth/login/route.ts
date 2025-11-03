import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        console.log('Login attempt received');
        const { email, password } = await request.json()
        console.log('Login attempt for:', email);

        const user = await prisma.users.findUnique({
            where: { email }
        })

        if (!user) {
            console.log('User not found:', email);
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash)
        
        if (!isPasswordValid) {
            console.log('Invalid password for:', email);
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        )

        console.log('Login successful for:', email);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        })

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Login failed' }, { status: 500 })
    }
}