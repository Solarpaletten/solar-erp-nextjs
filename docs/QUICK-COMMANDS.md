# 🚀 QUICK REFERENCE — Только команды

# ─────────────────────────────────────
# БЭКАП
# ─────────────────────────────────────
cp -r src/ src_backup/

# ─────────────────────────────────────
# СОЗДАТЬ СТРУКТУРУ
# ─────────────────────────────────────

# Auth
mkdir -p app/auth/{login,register,reset-password}

# Dashboard
mkdir -p app/dashboard/{companies/new,invoices,profile,settings}

# Company ERP
mkdir -p 'app/company/[companyId]'
mkdir -p 'app/company/[companyId]/clients/{new,[clientId]/edit}'
mkdir -p 'app/company/[companyId]/products/{new,[productId]/edit}'
mkdir -p 'app/company/[companyId]/warehouse/{stock,movements}'
mkdir -p 'app/company/[companyId]/purchases/new'
mkdir -p 'app/company/[companyId]/sales/new'
mkdir -p 'app/company/[companyId]/bank/{accounts,transactions}'
mkdir -p 'app/company/[companyId]/reports/{vat,profit}'
mkdir -p 'app/company/[companyId]/settings/users'

# API
mkdir -p app/api/auth/{login,register,logout,me}
mkdir -p app/api/dashboard/{companies,profile}
mkdir -p 'app/api/company/[companyId]/clients/[clientId]/copy'
mkdir -p 'app/api/company/[companyId]/products/[productId]'
mkdir -p 'app/api/company/[companyId]/{warehouse,purchases,sales}'
mkdir -p 'app/api/company/[companyId]/bank/{accounts,transactions}'
mkdir -p 'app/api/company/[companyId]/reports'

# Support
mkdir -p components/{ui,auth,dashboard,company/clients,company/products}
mkdir -p lib/api config/{clients,products} types hooks docs

# ─────────────────────────────────────
# КОПИРОВАТЬ ИЗ FULL STRUCTURE
# ─────────────────────────────────────

cp "Full structure/page.tsx" 'app/company/[companyId]/clients/page.tsx'
cp "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/new/page.tsx" 'app/company/[companyId]/clients/new/page.tsx'
cp "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/[clientId]/edit/page.tsx" 'app/company/[companyId]/clients/[clientId]/edit/page.tsx'
cp "Full structure/route.ts" 'app/api/company/[companyId]/clients/route.ts'
cp "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/route.ts" 'app/api/company/[companyId]/clients/[clientId]/route.ts'
cp "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/copy/route.ts" 'app/api/company/[companyId]/clients/[clientId]/copy/route.ts'
cp "Full structure/prisma.ts" lib/prisma.ts
cp "Full structure/ARCHITECTURE-v3.md" docs/ARCHITECTURE.md

# ─────────────────────────────────────
# ПЕРЕНЕСТИ ИЗ SRC
# ─────────────────────────────────────

cp src/app/layout.tsx app/layout.tsx
cp src/app/globals.css app/globals.css
cp src/app/page.tsx app/page.tsx
cp src/middleware.ts middleware.ts
cp src/lib/auth.ts lib/auth.ts
cp src/lib/db.ts lib/db.ts
cp src/lib/rate-limit.ts lib/rate-limit.ts
cp src/components/clients/GridConfigModal.tsx components/company/clients/GridConfigModal.tsx
cp src/config/clients/columnsConfig.ts config/clients/columnsConfig.ts

# Auth pages
cp "src/app/(products)/(auth)/login/page.tsx" app/auth/login/page.tsx
cp "src/app/(products)/(auth)/register/page.tsx" app/auth/register/page.tsx

# Auth API
cp src/app/api/auth/login/route.ts app/api/auth/login/route.ts
cp src/app/api/auth/logout/route.ts app/api/auth/logout/route.ts
cp src/app/api/auth/register/route.ts app/api/auth/register/route.ts

# Company layout
cp "src/app/(products)/(dashboard)/company/[companyId]/layout.tsx" 'app/company/[companyId]/layout.tsx'
cp "src/app/(products)/(dashboard)/company/[companyId]/page.tsx" 'app/company/[companyId]/page.tsx'
cp "src/app/(products)/(dashboard)/company/[companyId]/CompanySidebar.tsx" 'app/company/[companyId]/CompanySidebar.tsx'
cp "src/app/(products)/(dashboard)/company/[companyId]/CompanyHeader.tsx" 'app/company/[companyId]/CompanyHeader.tsx'

# Products
cp "src/app/(products)/(dashboard)/company/[companyId]/products/page.tsx" 'app/company/[companyId]/products/page.tsx'

# Company API
cp "src/app/api/company/[companyId]/products/route.ts" 'app/api/company/[companyId]/products/route.ts'
cp "src/app/api/company/[companyId]/warehouse/route.ts" 'app/api/company/[companyId]/warehouse/route.ts'
cp "src/app/api/company/[companyId]/purchases/route.ts" 'app/api/company/[companyId]/purchases/route.ts'
cp "src/app/api/company/[companyId]/sales/route.ts" 'app/api/company/[companyId]/sales/route.ts'

# ─────────────────────────────────────
# ОБНОВИТЬ ИМПОРТЫ
# ─────────────────────────────────────

find app -name "*.tsx" -exec sed -i '' 's|@/src/|@/|g' {} \;
find app -name "*.ts" -exec sed -i '' 's|@/src/|@/|g' {} \;
find lib -name "*.ts" -exec sed -i '' 's|@/src/|@/|g' {} \;
find components -name "*.tsx" -exec sed -i '' 's|@/src/|@/|g' {} \;

# ─────────────────────────────────────
# УДАЛИТЬ СТАРОЕ
# ─────────────────────────────────────

rm -rf src/
rm -rf "new structura"
rm -rf tmp/
rm -rf "Full structure"

# ─────────────────────────────────────
# СБОРКА
# ─────────────────────────────────────

rm -rf .next
pnpm install
pnpm build
pnpm dev

# ─────────────────────────────────────
# КОММИТ
# ─────────────────────────────────────

git add .
git commit -m "refactor: migrate to Canon structure (no src/, no route groups)"
git push origin main
