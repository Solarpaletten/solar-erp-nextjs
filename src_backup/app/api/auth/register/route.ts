// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  // Rate limiting: 5 registrations per 10 minutes
  const rateLimitResponse = rateLimit(request, {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { email, password, username } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }
    
    const existing = await prisma.users.findUnique({
      where: { email }
    });
    
    if (existing) {
      return NextResponse.json({ 
        success: false,
        error: 'User already exists' 
      }, { status: 400 });
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
    return NextResponse.json({ 
      success: false,
      error: 'Registration failed' 
    }, { status: 500 });
  }
}