import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();
    
    const existing = await prisma.users.findUnique({
      where: { email }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.users.create({
      data: {
        email,
        username: username || email.split('@')[0],
        password_hash: hashedPassword
      }
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
