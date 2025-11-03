// src/lib/auth.ts
import { NextRequest } from 'next/server'

export async function validateAuth(request: NextRequest, companyId: string) {
  const token = request.headers.get('Authorization')
  const headerCompanyId = request.headers.get('x-company-id')

  if (!token || !token.startsWith('Bearer ')) {
    return { error: 'Authentication required', status: 401 }
  }

  if (!headerCompanyId || headerCompanyId !== companyId) {
    return { error: 'Company context required', status: 400 }
  }

  return { success: true }
}
