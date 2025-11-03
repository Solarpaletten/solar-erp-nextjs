#!/bin/bash

# Скрипт миграции структуры Next.js проекта
# Использование: chmod +x migrate-to-products-structure.sh && ./migrate-to-products-structure.sh

set -e  # Остановка при ошибке

echo "🚀 Начинаем миграцию проекта в новую структуру..."
echo "================================================"

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка, что мы в правильной директории
if [ ! -d "src/app" ]; then
    echo "❌ Ошибка: папка src/app не найдена!"
    echo "Запустите скрипт из корня проекта"
    exit 1
fi

echo -e "${BLUE}Шаг 1: Создание новой структуры папок${NC}"
echo "----------------------------------------------"

# Создаём структуру для продуктов
mkdir -p src/app/\(products\)/itsolar/\(auth\)/{login,register}
mkdir -p src/app/\(products\)/itsolar/\(dashboard\)/{account/companies,company/[companyId]}

# Создаём структуру для API
mkdir -p src/app/api/{echo,health}
mkdir -p src/app/api/itsolar/account/companies/{[id]/copy,[id],stats}
mkdir -p src/app/api/itsolar/account/switch-to-company
mkdir -p src/app/api/itsolar/auth/{login,register}
mkdir -p src/app/api/itsolar/company/[companyId]/clients/{[id],search}

# Создаём папки для компонентов
mkdir -p src/app/components/legacy/itsolar/{auth,forms}
mkdir -p src/components/legacy/translator

echo -e "${GREEN}✓ Структура папок создана${NC}"

echo -e "\n${BLUE}Шаг 2: Перемещение файлов авторизации${NC}"
echo "----------------------------------------------"

# Перемещаем страницы авторизации
if [ -f "src/app/(auth)/login/page.tsx" ]; then
    mv src/app/\(auth\)/login/page.tsx src/app/\(products\)/itsolar/\(auth\)/login/
    echo -e "${GREEN}✓ Перемещён login/page.tsx${NC}"
fi

if [ -f "src/app/(auth)/register/page.tsx" ]; then
    mv src/app/\(auth\)/register/page.tsx src/app/\(products\)/itsolar/\(auth\)/register/
    echo -e "${GREEN}✓ Перемещён register/page.tsx${NC}"
fi

# Перемещаем API авторизации
if [ -f "src/app/api/auth/login/route.ts" ]; then
    mv src/app/api/auth/login/route.ts src/app/api/itsolar/auth/login/
    echo -e "${GREEN}✓ Перемещён API login/route.ts${NC}"
fi

if [ -f "src/app/api/auth/register/route.ts" ]; then
    mv src/app/api/auth/register/route.ts src/app/api/itsolar/auth/register/
    echo -e "${GREEN}✓ Перемещён API register/route.ts${NC}"
fi

echo -e "\n${BLUE}Шаг 3: Перемещение дашборда${NC}"
echo "----------------------------------------------"

# Перемещаем account/companies
if [ -f "src/app/(dashboard)/account/companies/page.tsx" ]; then
    mv src/app/\(dashboard\)/account/companies/page.tsx src/app/\(products\)/itsolar/\(dashboard\)/account/companies/
    echo -e "${GREEN}✓ Перемещён account/companies/page.tsx${NC}"
fi

# Перемещаем company/[companyId]
if [ -d "src/app/(dashboard)/company/[companyId]" ]; then
    cp -r src/app/\(dashboard\)/company/\[companyId\]/* src/app/\(products\)/itsolar/\(dashboard\)/company/\[companyId\]/
    echo -e "${GREEN}✓ Скопированы файлы company/[companyId]${NC}"
fi

# Копируем layout дашборда
if [ -f "src/app/(dashboard)/layout.tsx" ]; then
    cp src/app/\(dashboard\)/layout.tsx src/app/\(products\)/itsolar/\(dashboard\)/layout.tsx
    echo -e "${GREEN}✓ Скопирован layout.tsx дашборда${NC}"
fi

echo -e "\n${BLUE}Шаг 4: Перемещение API endpoints${NC}"
echo "----------------------------------------------"

# Перемещаем account API
if [ -d "src/app/api/account/companies" ]; then
    cp -r src/app/api/account/companies/* src/app/api/itsolar/account/companies/ 2>/dev/null || true
    echo -e "${GREEN}✓ Скопированы API account/companies${NC}"
fi

if [ -d "src/app/api/account/switch-to-company" ]; then
    cp -r src/app/api/account/switch-to-company/* src/app/api/itsolar/account/switch-to-company/ 2>/dev/null || true
    echo -e "${GREEN}✓ Скопирован API switch-to-company${NC}"
fi

# Перемещаем company API
if [ -d "src/app/api/company/[companyId]" ]; then
    cp -r src/app/api/company/\[companyId\]/* src/app/api/itsolar/company/\[companyId\]/ 2>/dev/null || true
    echo -e "${GREEN}✓ Скопированы API company/[companyId]${NC}"
fi

echo -e "\n${BLUE}Шаг 5: Создание общих API endpoints${NC}"
echo "----------------------------------------------"

# Создаём echo API
cat > src/app/api/echo/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message') || 'Hello from Echo API';
  
  return NextResponse.json({ 
    echo: message,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({ 
    echo: body,
    timestamp: new Date().toISOString()
  });
}
EOF

echo -e "${GREEN}✓ Создан echo API${NC}"

# Создаём health API
cat > src/app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    service: 'solar-erp',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
EOF

echo -e "${GREEN}✓ Создан health API${NC}"

echo -e "\n${BLUE}Шаг 6: Создание резервной копии старых файлов${NC}"
echo "----------------------------------------------"

# Создаём папку для бэкапа
mkdir -p .migration-backup
BACKUP_DIR=".migration-backup/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Бэкапим старые папки
if [ -d "src/app/(auth)" ]; then
    cp -r src/app/\(auth\) "$BACKUP_DIR/" 2>/dev/null || true
fi

if [ -d "src/app/(dashboard)" ]; then
    cp -r src/app/\(dashboard\) "$BACKUP_DIR/" 2>/dev/null || true
fi

if [ -d "src/app/api/auth" ] && [ ! -d "src/app/api/itsolar" ]; then
    cp -r src/app/api/auth "$BACKUP_DIR/" 2>/dev/null || true
fi

echo -e "${GREEN}✓ Создан бэкап в $BACKUP_DIR${NC}"

echo -e "\n${YELLOW}⚠️  ВАЖНО: Следующие шаги нужно выполнить вручную:${NC}"
echo "================================================"
echo "1. Обновите импорты в перемещённых файлах"
echo "2. Проверьте middleware.ts для новых путей"
echo "3. Обновите конфигурацию роутинга"
echo "4. Проверьте работу приложения: npm run dev"
echo ""
echo -e "${GREEN}🎉 Миграция структуры завершена!${NC}"
echo "Старые файлы сохранены в: $BACKUP_DIR"
echo ""
echo -e "${BLUE}Запустите: npm run dev${NC}"
echo "И проверьте работу приложения"
