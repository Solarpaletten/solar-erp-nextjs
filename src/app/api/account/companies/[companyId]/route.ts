import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const id = parseInt(companyId);
    
    const company = await prisma.companies.findUnique({
      where: { id }
    });
    
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const id = parseInt(companyId);
    const body = await request.json();
    
    const company = await prisma.companies.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
      }
    });
    
    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error('Error updating company:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const id = parseInt(companyId);
    
    await prisma.companies.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete company' }, { status: 500 });
  }
}