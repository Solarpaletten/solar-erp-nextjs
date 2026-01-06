import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '7d5a2e3f4b1c9d8e0a6f5b2d1e4c3a9b8f7e6d5c4b3a2f1';

/**
 * Extract user ID from JWT token in cookies
 */
export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify user has access to a specific company
 */
export async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  try {
    const membership = await prisma.company_users.findUnique({
      where: {
        company_id_user_id: {
          company_id: companyId,
          user_id: userId
        }
      }
    });

    return !!membership;
  } catch (error) {
    console.error('Error verifying company access:', error);
    return false;
  }
}

/**
 * Standard unauthorized response
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}

/**
 * Standard forbidden response
 */
export function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Forbidden - no access to this company' },
    { status: 403 }
  );
}

/**
 * Standard bad request response
 */
export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 400 }
  );
}

/**
 * Standard not found response
 */
export function notFoundResponse(entity: string = 'Resource'): NextResponse {
  return NextResponse.json(
    { success: false, error: `${entity} not found` },
    { status: 404 }
  );
}
