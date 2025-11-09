import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/itsolar/account') || 
      request.nextUrl.pathname.startsWith('/itsolar/company')) {
    if (!token) {
      return NextResponse.redirect(new URL('/itsolar/login', request.url))
    }
  }

  // Redirect authenticated users from auth pages
  if ((request.nextUrl.pathname.startsWith('/itsolar/login') || 
       request.nextUrl.pathname.startsWith('/itsolar/register')) && token) {
    return NextResponse.redirect(new URL('/itsolar/account/companies', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}