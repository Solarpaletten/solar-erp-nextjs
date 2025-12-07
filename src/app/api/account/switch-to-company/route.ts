import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    
    return NextResponse.json({
      success: true,
      companyId: companyId
    });
  } catch (error) {
    console.error('Error switching company:', error);
    return NextResponse.json({ error: 'Failed to switch company' }, { status: 500 });
  }
}