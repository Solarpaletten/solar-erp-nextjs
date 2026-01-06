#!/bin/bash
# ============================================
# SOLAR ERP — FIX SCRIPT (Task 2)
# Исправление ошибок после миграции
# ============================================

echo "🔧 SOLAR ERP FIX — Task 2"
echo "========================="
echo ""

cd /Users/leanid/Documents/ITproject/solar-erp-nextjs

# ============================================
# FIX 1: ПРОВЕРЯЕМ tsconfig.json
# ============================================
echo "═══════════════════════════════════════"
echo "FIX 1: ПРОВЕРКА tsconfig.json"
echo "═══════════════════════════════════════"

if grep -q '"@/\*": \["./src/\*"\]' tsconfig.json; then
    echo "❌ tsconfig.json указывает на ./src/*"
    echo "   Нужно изменить на ./*"
    echo ""
    echo "   Выполни вручную:"
    echo '   sed -i "" '\''s|"@/\*": \["./src/\*"\]|"@/*": ["./*"]|g'\'' tsconfig.json'
else
    echo "✅ tsconfig.json OK"
fi

# ============================================
# FIX 2: СОЗДАЁМ НЕДОСТАЮЩИЕ ФАЙЛЫ
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "FIX 2: СОЗДАНИЕ НЕДОСТАЮЩИХ ФАЙЛОВ"
echo "═══════════════════════════════════════"

# Создаём lib/db.ts (alias для prisma)
echo "📁 Создаю lib/db.ts..."
cat > lib/db.ts << 'EOF'
// lib/db.ts
// Alias for prisma - для совместимости с существующими импортами
export { prisma } from './prisma';
EOF
echo "✅ lib/db.ts создан"

# Создаём styles папку и CSS
echo "📁 Создаю styles/clients-table.css..."
mkdir -p styles
cat > styles/clients-table.css << 'EOF'
/* styles/clients-table.css */
/* Стили для таблицы клиентов */

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table th,
.clients-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.clients-table th {
  background-color: #f9fafb;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
}

.clients-table tr:hover {
  background-color: #f3f4f6;
}

.clients-table .sticky-col {
  position: sticky;
  background-color: white;
}

.clients-table .sticky-left {
  left: 0;
}

.clients-table .sticky-right {
  right: 0;
}
EOF
echo "✅ styles/clients-table.css создан"

# Проверяем lib/rate-limit.ts
if [ ! -f "lib/rate-limit.ts" ]; then
    echo "📁 Создаю lib/rate-limit.ts..."
    cat > lib/rate-limit.ts << 'EOF'
// lib/rate-limit.ts
// Rate limiting utility

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);
EOF
    echo "✅ lib/rate-limit.ts создан"
else
    echo "✅ lib/rate-limit.ts существует"
fi

# Проверяем lib/auth.ts
if [ ! -f "lib/auth.ts" ]; then
    echo "📁 Создаю lib/auth.ts..."
    cat > lib/auth.ts << 'EOF'
// lib/auth.ts
// Authentication utilities

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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

export async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const access = await prisma.company_users.findFirst({
    where: { user_id: userId, company_id: companyId, is_active: true },
  });
  return !!access;
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = 'Access denied') {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function badRequestResponse(message: string = 'Bad request') {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
EOF
    echo "✅ lib/auth.ts создан"
else
    echo "✅ lib/auth.ts существует"
fi

# ============================================
# FIX 3: ИСПРАВЛЯЕМ ИМПОРТ В layout.tsx
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "FIX 3: ИСПРАВЛЕНИЕ ИМПОРТА В layout.tsx"
echo "═══════════════════════════════════════"

if [ -f "app/layout.tsx" ]; then
    # Проверяем есть ли импорт styles
    if grep -q "@/styles/clients-table.css" app/layout.tsx; then
        # Меняем на правильный путь
        sed -i '' "s|@/styles/clients-table.css|@/styles/clients-table.css|g" app/layout.tsx
        echo "✅ Импорт styles в layout.tsx OK"
    else
        echo "ℹ️  Нет импорта styles в layout.tsx"
    fi
fi

# ============================================
# FIX 4: ПРОВЕРЯЕМ config/clients/columnsConfig.ts
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "FIX 4: ПРОВЕРКА columnsConfig"
echo "═══════════════════════════════════════"

if [ ! -f "config/clients/columnsConfig.ts" ]; then
    echo "❌ config/clients/columnsConfig.ts не найден"
    
    # Пробуем скопировать из бэкапа
    if [ -f "src_backup/config/clients/columnsConfig.ts" ]; then
        cp src_backup/config/clients/columnsConfig.ts config/clients/columnsConfig.ts
        echo "✅ Скопирован из src_backup"
    else
        echo "⚠️  Нужно создать вручную"
    fi
else
    echo "✅ config/clients/columnsConfig.ts существует"
fi

# ============================================
# FIX 5: ПРОВЕРЯЕМ components/clients/GridConfigModal.tsx
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "FIX 5: ПРОВЕРКА GridConfigModal"
echo "═══════════════════════════════════════"

# Создаём правильную структуру компонентов
mkdir -p components/clients

if [ ! -f "components/clients/GridConfigModal.tsx" ]; then
    # Пробуем из company/clients
    if [ -f "components/company/clients/GridConfigModal.tsx" ]; then
        cp components/company/clients/GridConfigModal.tsx components/clients/GridConfigModal.tsx
        echo "✅ Скопирован из components/company/clients"
    elif [ -f "src_backup/components/clients/GridConfigModal.tsx" ]; then
        cp src_backup/components/clients/GridConfigModal.tsx components/clients/GridConfigModal.tsx
        echo "✅ Скопирован из src_backup"
    else
        echo "⚠️  GridConfigModal.tsx не найден, нужно создать"
    fi
else
    echo "✅ components/clients/GridConfigModal.tsx существует"
fi

# ============================================
# FIX 6: ОБНОВЛЯЕМ ИМПОРТЫ В ФАЙЛАХ
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "FIX 6: ОБНОВЛЕНИЕ ИМПОРТОВ"
echo "═══════════════════════════════════════"

# Заменяем импорты, указывающие на src
echo "🔄 Исправляю импорты..."

# Находим и исправляем файлы с импортами
find app -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "@/src/" "$file" 2>/dev/null; then
        sed -i '' 's|@/src/|@/|g' "$file"
        echo "   ✅ $file"
    fi
done

find lib -name "*.ts" | while read file; do
    if grep -q "@/src/" "$file" 2>/dev/null; then
        sed -i '' 's|@/src/|@/|g' "$file"
        echo "   ✅ $file"
    fi
done

find components -name "*.tsx" | while read file; do
    if grep -q "@/src/" "$file" 2>/dev/null; then
        sed -i '' 's|@/src/|@/|g' "$file"
        echo "   ✅ $file"
    fi
done

find config -name "*.ts" | while read file; do
    if grep -q "@/src/" "$file" 2>/dev/null; then
        sed -i '' 's|@/src/|@/|g' "$file"
        echo "   ✅ $file"
    fi
done

echo "✅ Импорты обновлены"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "📋 SUMMARY"
echo "═══════════════════════════════════════"
echo ""
echo "Созданы файлы:"
echo "  ✅ lib/db.ts"
echo "  ✅ lib/auth.ts"
echo "  ✅ lib/rate-limit.ts"
echo "  ✅ styles/clients-table.css"
echo ""
echo "Следующие шаги:"
echo "  1. Проверь tsconfig.json:"
echo '     "@/*": ["./*"]  (НЕ "./src/*")'
echo ""
echo "  2. Запусти сборку:"
echo "     rm -rf .next && pnpm build"
echo ""
echo "  3. Если есть ещё ошибки — покажи их мне"
echo ""
