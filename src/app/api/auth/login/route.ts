// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute
  const rateLimitResponse = rateLimit(request, {
    maxRequests: 10,
    windowMs: 60 * 1000
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }
    
    const user = await prisma.users.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });
    
    const token = generateToken(user.id, user.email);
    
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Login failed' 
    }, { status: 500 });
  }
}