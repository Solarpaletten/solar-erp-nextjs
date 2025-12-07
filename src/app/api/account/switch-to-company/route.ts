// src/app/api/account/switch-to-company/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  getUserIdFromToken, 
  verifyCompanyAccess,
  unauthorizedResponse, 
  forbiddenResponse,
  badRequestResponse 
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return unauthorizedResponse();
    }
    
    const { companyId } = await request.json();
    
    if (!companyId || isNaN(parseInt(companyId))) {
      return badRequestResponse('Valid company ID is required');
    }
    
    const companyIdNum = parseInt(companyId);
    
    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(userId, companyIdNum);
    if (!hasAccess) {
      return forbiddenResponse('You do not have access to this company');
    }
    
    // Update user's current_company_id in database
    await prisma.users.update({
      where: { id: userId },
      data: { current_company_id: companyIdNum }
    });
    
    return NextResponse.json({
      success: true,
      companyId: companyIdNum
    });

  } catch (error) {
    console.error('Error switching company:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to switch company' 
    }, { status: 500 });
  }
}