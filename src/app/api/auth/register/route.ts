import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 [Frontend Proxy] Register →', body.email);

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ [Frontend Proxy] Register successful');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ [Frontend Proxy] Register error:', error);
    return NextResponse.json(
      { error: 'Backend connection failed' },
      { status: 500 }
    );
  }
}
