// lib/auth.ts
// Authentication utilities for Solar ERP

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Получить userId из JWT токена в cookie
 */
export async function getUserIdFromToken(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Проверить доступ пользователя к компании
 */
export async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const access = await prisma.company_users.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
      is_active: true
    },
  });
  return !!access;
}

/**
 * Получить данные пользователя по токену
 */
export async function getUserFromToken() {
  const userId = await getUserIdFromToken();
  if (!userId) return null;

  return prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,  // ✅ Правильное поле
      role: true,
    },
  });
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

export function forbiddenResponse(message: string = 'Access denied') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}

export function badRequestResponse(message: string = 'Bad request') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 400 }
  );
}

export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  );
}

export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, ...data },
    { status }
  );
}
