// src/lib/auth.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}

const JWT_SECRET = process.env.JWT_SECRET;

interface JWTPayload {
  userId: number;
  email: string;
}

/**
 * Get authenticated user ID from JWT token in cookies
 * @returns userId or null if not authenticated
 */
export async function getUserIdFromToken(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded.userId;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify user has access to a specific company
 * @param userId - User ID to check
 * @param companyId - Company ID to verify access to
 * @returns true if user has active membership in company
 */
export async function verifyCompanyAccess(
  userId: number, 
  companyId: number
): Promise<boolean> {
  try {
    const membership = await prisma.company_users.findFirst({
      where: {
        user_id: userId,
        company_id: companyId,
        is_active: true
      }
    });
    
    return !!membership;
  } catch (error) {
    console.error('Company access verification failed:', error);
    return false;
  }
}

/**
 * Standard unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json({
    success: false,
    error: 'Unauthorized'
  }, { status: 401 });
}

/**
 * Standard forbidden response
 */
export function forbiddenResponse(message = 'Access denied') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 403 });
}

/**
 * Standard bad request response
 */
export function badRequestResponse(message: string) {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 400 });
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}