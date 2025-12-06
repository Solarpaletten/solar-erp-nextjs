// src/lib/auth.ts

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || '7d5a2e3f4b1c9d8e0a6f5b2d1e4c3a9b8f7e6d5c4b3a2f1';

/**
 * Extract and verify JWT token from cookies
 * @returns User ID if token is valid, null otherwise
 */
export async function getUserIdFromToken(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded.userId;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Create standardized unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({
    success: false,
    error: message,
    code: 'UNAUTHORIZED'
  }, { status: 401 });
}

/**
 * Create standardized forbidden response
 */
export function forbiddenResponse(message: string = 'Access denied') {
  return NextResponse.json({
    success: false,
    error: message,
    code: 'FORBIDDEN'
  }, { status: 403 });
}

/**
 * Create standardized validation error response
 */
export function validationErrorResponse(message: string, details?: any) {
  return NextResponse.json({
    success: false,
    error: message,
    code: 'VALIDATION_ERROR',
    details
  }, { status: 400 });
}

/**
 * Create standardized server error response
 */
export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json({
    success: false,
    error: message,
    code: 'SERVER_ERROR'
  }, { status: 500 });
}

/**
 * Create standardized not found response
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json({
    success: false,
    error: message,
    code: 'NOT_FOUND'
  }, { status: 404 });
}