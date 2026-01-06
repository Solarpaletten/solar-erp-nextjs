#!/bin/bash
# ============================================
# SOLAR ERP — MIGRATION SCRIPT
# Выполнять пошагово, не всё сразу!
# ============================================

echo "🚀 SOLAR ERP MIGRATION — Canon Structure"
echo "========================================="
echo ""

# Проверяем что мы в правильной папке
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: запустите скрипт из корня проекта solar-erp-nextjs"
    exit 1
fi

echo "📍 Текущая папка: $(pwd)"
echo ""

# ============================================
# РАЗДЕЛ 1: БЭКАП
# ============================================
echo "═══════════════════════════════════════"
echo "ШАГ 1: БЭКАП"
echo "═══════════════════════════════════════"
read -p "Создать бэкап src/? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cp -r src/ src_backup/
    echo "✅ Бэкап создан: src_backup/"
fi

# ============================================
# РАЗДЕЛ 2: СОЗДАНИЕ СТРУКТУРЫ
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "ШАГ 2: СОЗДАНИЕ НОВОЙ СТРУКТУРЫ"
echo "═══════════════════════════════════════"
read -p "Создать новую структуру папок? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    echo "📁 Создаю app/ структуру..."
    
    # Auth (Уровень 0)
    mkdir -p app/auth/login
    mkdir -p app/auth/register
    mkdir -p app/auth/reset-password
    
    # Dashboard (Уровень 1)
    mkdir -p app/dashboard
    mkdir -p app/dashboard/companies/new
    mkdir -p app/dashboard/invoices
    mkdir -p app/dashboard/profile
    mkdir -p app/dashboard/settings
    
    # Company (Уровень 2)
    mkdir -p 'app/company/[companyId]'
    mkdir -p 'app/company/[companyId]/clients/new'
    mkdir -p 'app/company/[companyId]/clients/[clientId]/edit'
    mkdir -p 'app/company/[companyId]/products/new'
    mkdir -p 'app/company/[companyId]/products/[productId]/edit'
    mkdir -p 'app/company/[companyId]/warehouse/stock'
    mkdir -p 'app/company/[companyId]/warehouse/movements'
    mkdir -p 'app/company/[companyId]/purchases/new'
    mkdir -p 'app/company/[companyId]/sales/new'
    mkdir -p 'app/company/[companyId]/bank/accounts'
    mkdir -p 'app/company/[companyId]/bank/transactions'
    mkdir -p 'app/company/[companyId]/reports/vat'
    mkdir -p 'app/company/[companyId]/reports/profit'
    mkdir -p 'app/company/[companyId]/settings/users'
    
    # API
    mkdir -p app/api/auth/login
    mkdir -p app/api/auth/register
    mkdir -p app/api/auth/logout
    mkdir -p app/api/auth/me
    mkdir -p app/api/dashboard/companies
    mkdir -p app/api/dashboard/profile
    mkdir -p 'app/api/company/[companyId]/clients/[clientId]/copy'
    mkdir -p 'app/api/company/[companyId]/products/[productId]'
    mkdir -p 'app/api/company/[companyId]/warehouse'
    mkdir -p 'app/api/company/[companyId]/purchases'
    mkdir -p 'app/api/company/[companyId]/sales'
    mkdir -p 'app/api/company/[companyId]/bank/accounts'
    mkdir -p 'app/api/company/[companyId]/bank/transactions'
    mkdir -p 'app/api/company/[companyId]/reports'
    
    # Support folders
    mkdir -p components/ui
    mkdir -p components/auth
    mkdir -p components/dashboard
    mkdir -p components/company/clients
    mkdir -p components/company/products
    mkdir -p lib/api
    mkdir -p config/clients
    mkdir -p config/products
    mkdir -p types
    mkdir -p hooks
    mkdir -p docs
    
    echo "✅ Структура создана!"
fi

# ============================================
# РАЗДЕЛ 3: КОПИРОВАНИЕ ФАЙЛОВ ИЗ FULL STRUCTURE
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "ШАГ 3: КОПИРОВАНИЕ ИЗ FULL STRUCTURE"
echo "═══════════════════════════════════════"

if [ -d "Full structure" ]; then
    read -p "Копировать файлы из 'Full structure'? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        
        # Main clients page
        if [ -f "Full structure/page.tsx" ]; then
            cp "Full structure/page.tsx" 'app/company/[companyId]/clients/page.tsx'
            echo "✅ Скопирован: clients/page.tsx"
        fi
        
        # New client page
        if [ -f "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/new/page.tsx" ]; then
            cp "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/new/page.tsx" \
               'app/company/[companyId]/clients/new/page.tsx'
            echo "✅ Скопирован: clients/new/page.tsx"
        fi
        
        # Edit client page
        if [ -f "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/[clientId]/edit/page.tsx" ]; then
            cp "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/[clientId]/edit/page.tsx" \
               'app/company/[companyId]/clients/[clientId]/edit/page.tsx'
            echo "✅ Скопирован: clients/[clientId]/edit/page.tsx"
        fi
        
        # API routes
        if [ -f "Full structure/route.ts" ]; then
            cp "Full structure/route.ts" 'app/api/company/[companyId]/clients/route.ts'
            echo "✅ Скопирован: api/clients/route.ts"
        fi
        
        if [ -f "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/route.ts" ]; then
            cp "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/route.ts" \
               'app/api/company/[companyId]/clients/[clientId]/route.ts'
            echo "✅ Скопирован: api/clients/[clientId]/route.ts"
        fi
        
        if [ -f "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/copy/route.ts" ]; then
            cp "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/copy/route.ts" \
               'app/api/company/[companyId]/clients/[clientId]/copy/route.ts'
            echo "✅ Скопирован: api/clients/[clientId]/copy/route.ts"
        fi
        
        # Prisma
        if [ -f "Full structure/prisma.ts" ]; then
            cp "Full structure/prisma.ts" lib/prisma.ts
            echo "✅ Скопирован: lib/prisma.ts"
        fi
        
        # Docs
        if [ -f "Full structure/ARCHITECTURE-v3.md" ]; then
            cp "Full structure/ARCHITECTURE-v3.md" docs/ARCHITECTURE.md
            echo "✅ Скопирован: docs/ARCHITECTURE.md"
        fi
        
        if [ -f "Full structure/FULL-STRUCTURE.md" ]; then
            cp "Full structure/FULL-STRUCTURE.md" docs/FULL-STRUCTURE.md
            echo "✅ Скопирован: docs/FULL-STRUCTURE.md"
        fi
    fi
else
    echo "⚠️  Папка 'Full structure' не найдена"
fi

# ============================================
# РАЗДЕЛ 4: ПЕРЕНОС ИЗ SRC
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "ШАГ 4: ПЕРЕНОС ФАЙЛОВ ИЗ SRC"
echo "═══════════════════════════════════════"

if [ -d "src" ]; then
    read -p "Перенести файлы из src/? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        
        # Root files
        [ -f "src/app/layout.tsx" ] && cp src/app/layout.tsx app/layout.tsx && echo "✅ layout.tsx"
        [ -f "src/app/globals.css" ] && cp src/app/globals.css app/globals.css && echo "✅ globals.css"
        [ -f "src/app/page.tsx" ] && cp src/app/page.tsx app/page.tsx && echo "✅ page.tsx"
        [ -f "src/middleware.ts" ] && cp src/middleware.ts middleware.ts && echo "✅ middleware.ts"
        
        # Lib
        [ -f "src/lib/auth.ts" ] && cp src/lib/auth.ts lib/auth.ts && echo "✅ lib/auth.ts"
        [ -f "src/lib/db.ts" ] && cp src/lib/db.ts lib/db.ts && echo "✅ lib/db.ts"
        [ -f "src/lib/rate-limit.ts" ] && cp src/lib/rate-limit.ts lib/rate-limit.ts && echo "✅ lib/rate-limit.ts"
        
        # Components
        if [ -f "src/components/clients/GridConfigModal.tsx" ]; then
            cp src/components/clients/GridConfigModal.tsx components/company/clients/GridConfigModal.tsx
            echo "✅ GridConfigModal.tsx"
        fi
        
        # Config
        if [ -f "src/config/clients/columnsConfig.ts" ]; then
            cp src/config/clients/columnsConfig.ts config/clients/columnsConfig.ts
            echo "✅ columnsConfig.ts"
        fi
        
        # Auth pages
        if [ -f "src/app/(products)/(auth)/login/page.tsx" ]; then
            cp "src/app/(products)/(auth)/login/page.tsx" app/auth/login/page.tsx
            echo "✅ auth/login/page.tsx"
        fi
        
        if [ -f "src/app/(products)/(auth)/register/page.tsx" ]; then
            cp "src/app/(products)/(auth)/register/page.tsx" app/auth/register/page.tsx
            echo "✅ auth/register/page.tsx"
        fi
        
        # Auth API
        [ -f "src/app/api/auth/login/route.ts" ] && cp src/app/api/auth/login/route.ts app/api/auth/login/route.ts && echo "✅ api/auth/login"
        [ -f "src/app/api/auth/logout/route.ts" ] && cp src/app/api/auth/logout/route.ts app/api/auth/logout/route.ts && echo "✅ api/auth/logout"
        [ -f "src/app/api/auth/register/route.ts" ] && cp src/app/api/auth/register/route.ts app/api/auth/register/route.ts && echo "✅ api/auth/register"
        
        # Company layout
        if [ -d "src/app/(products)/(dashboard)/company/[companyId]" ]; then
            [ -f "src/app/(products)/(dashboard)/company/[companyId]/layout.tsx" ] && \
                cp "src/app/(products)/(dashboard)/company/[companyId]/layout.tsx" 'app/company/[companyId]/layout.tsx' && echo "✅ company/layout.tsx"
            [ -f "src/app/(products)/(dashboard)/company/[companyId]/page.tsx" ] && \
                cp "src/app/(products)/(dashboard)/company/[companyId]/page.tsx" 'app/company/[companyId]/page.tsx' && echo "✅ company/page.tsx"
            [ -f "src/app/(products)/(dashboard)/company/[companyId]/CompanySidebar.tsx" ] && \
                cp "src/app/(products)/(dashboard)/company/[companyId]/CompanySidebar.tsx" 'app/company/[companyId]/CompanySidebar.tsx' && echo "✅ CompanySidebar.tsx"
            [ -f "src/app/(products)/(dashboard)/company/[companyId]/CompanyHeader.tsx" ] && \
                cp "src/app/(products)/(dashboard)/company/[companyId]/CompanyHeader.tsx" 'app/company/[companyId]/CompanyHeader.tsx' && echo "✅ CompanyHeader.tsx"
        fi
        
        # Products
        if [ -f "src/app/(products)/(dashboard)/company/[companyId]/products/page.tsx" ]; then
            cp "src/app/(products)/(dashboard)/company/[companyId]/products/page.tsx" 'app/company/[companyId]/products/page.tsx'
            echo "✅ products/page.tsx"
        fi
        
        # Products API
        [ -f "src/app/api/company/[companyId]/products/route.ts" ] && \
            cp "src/app/api/company/[companyId]/products/route.ts" 'app/api/company/[companyId]/products/route.ts' && echo "✅ api/products"
        
        # Warehouse API
        [ -f "src/app/api/company/[companyId]/warehouse/route.ts" ] && \
            cp "src/app/api/company/[companyId]/warehouse/route.ts" 'app/api/company/[companyId]/warehouse/route.ts' && echo "✅ api/warehouse"
        
        # Purchases API
        [ -f "src/app/api/company/[companyId]/purchases/route.ts" ] && \
            cp "src/app/api/company/[companyId]/purchases/route.ts" 'app/api/company/[companyId]/purchases/route.ts' && echo "✅ api/purchases"
        
        # Sales API
        [ -f "src/app/api/company/[companyId]/sales/route.ts" ] && \
            cp "src/app/api/company/[companyId]/sales/route.ts" 'app/api/company/[companyId]/sales/route.ts' && echo "✅ api/sales"
        
        echo ""
        echo "✅ Перенос из src/ завершён!"
    fi
else
    echo "⚠️  Папка src/ не найдена"
fi

# ============================================
# РАЗДЕЛ 5: ОБНОВЛЕНИЕ ИМПОРТОВ
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "ШАГ 5: ОБНОВЛЕНИЕ ИМПОРТОВ"
echo "═══════════════════════════════════════"
read -p "Обновить импорты (заменить @/src/ на @/)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # macOS compatible sed
    find app -name "*.tsx" -exec sed -i '' 's|@/src/|@/|g' {} \; 2>/dev/null
    find app -name "*.ts" -exec sed -i '' 's|@/src/|@/|g' {} \; 2>/dev/null
    find lib -name "*.ts" -exec sed -i '' 's|@/src/|@/|g' {} \; 2>/dev/null
    find components -name "*.tsx" -exec sed -i '' 's|@/src/|@/|g' {} \; 2>/dev/null
    echo "✅ Импорты обновлены"
fi

# ============================================
# РАЗДЕЛ 6: УДАЛЕНИЕ СТАРОГО
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "ШАГ 6: УДАЛЕНИЕ СТАРОГО (ОПЦИОНАЛЬНО)"
echo "═══════════════════════════════════════"
read -p "Удалить src/ и временные папки? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf src/
    rm -rf "new structura"
    rm -rf tmp/
    rm -rf "Full structure"
    echo "✅ Старые папки удалены"
fi

# ============================================
# РАЗДЕЛ 7: СБОРКА
# ============================================
echo ""
echo "═══════════════════════════════════════"
echo "ШАГ 7: СБОРКА"
echo "═══════════════════════════════════════"
read -p "Запустить сборку (pnpm build)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf .next
    pnpm install
    pnpm build
fi

echo ""
echo "═══════════════════════════════════════"
echo "✅ МИГРАЦИЯ ЗАВЕРШЕНА!"
echo "═══════════════════════════════════════"
echo ""
echo "Следующие шаги:"
echo "1. Проверь tsconfig.json (paths должны указывать на ./)"
echo "2. Запусти: pnpm dev"
echo "3. Проверь: http://localhost:3000/company/17/clients"
echo "4. Закоммить: git add . && git commit -m 'refactor: Canon structure'"
echo ""
