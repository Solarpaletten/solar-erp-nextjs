import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message') || 'Hello from Echo API';
  
  return NextResponse.json({ 
    echo: message,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({ 
    echo: body,
    timestamp: new Date().toISOString()
  });
}
