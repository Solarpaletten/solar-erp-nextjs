import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] ${pathname}`);

  // Проверка аутентификации для защищённых маршрутов ITSolar
  const protectedPaths = [
    '/itsolar/account',
    '/itsolar/company',
  ];

  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // ИСПРАВЛЕНО: Ищем правильное имя cookie
    const token = request.cookies.get('token'); // Было: 'auth-token'
    
    if (!token) {
      // Редирект на страницу логина с указанием откуда пришёл
      const loginUrl = new URL('/itsolar/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Редирект с корня на дашборд (опционально)
  if (pathname === '/') {
    // Если есть токен - на дашборд, иначе на логин
    const token = request.cookies.get('token'); // Было: 'auth-token'
    const redirectUrl = token 
      ? new URL('/itsolar/account/companies', request.url)
      : new URL('/itsolar/login', request.url);
    
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Конфигурация matcher для оптимизации
export const config = {
  matcher: [
    /*
     * Применяем middleware ко всем путям кроме:
     * - api routes (начинаются с /api/)
     * - статические файлы (_next/static)
     * - картинки (_next/image)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};