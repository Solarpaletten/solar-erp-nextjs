# 🚀 SOLAR ERP — МИГРАЦИЯ НА CANON СТРУКТУРУ

## Пошаговая инструкция для Leanid (Task 1)

**Дата:** 06.01.2026  
**Статус:** Миграция с `src/` на корневую структуру

---

## 📍 ГДЕ МЫ СЕЙЧАС

```
solar-erp-nextjs/
├── src/                    ← ❌ УДАЛЯЕМ (переносим в корень)
│   └── app/
│       ├── (products)/     ← ❌ УДАЛЯЕМ route group
│       └── ...
├── Full structure/         ← ✅ Новые файлы от Claude
└── ...
```

---

## 📍 КУДА ИДЁМ

```
solar-erp-nextjs/
├── app/                    ← ✅ В КОРНЕ (не в src/)
│   ├── auth/               ← Уровень 0
│   ├── dashboard/          ← Уровень 1
│   ├── company/[id]/       ← Уровень 2 (ERP)
│   └── api/                ← Backend
├── components/
├── lib/
├── config/
└── ...
```

---

# 🔧 ПОШАГОВАЯ МИГРАЦИЯ

## ШАГ 0: ПОДГОТОВКА

```bash
# Переходим в проект
cd ~/path/to/solar-erp-nextjs

# Проверяем где мы
pwd
# Должно показать: .../solar-erp-nextjs

# Смотрим текущую структуру
ls -la
```

---

## ШАГ 1: БЭКАП (на всякий случай)

```bash
# Создаём бэкап src/
cp -r src/ src_backup/

# Проверяем что бэкап создан
ls -la | grep src
# Должно показать: src/ и src_backup/
```

---

## ШАГ 2: СОЗДАЁМ НОВУЮ СТРУКТУРУ В КОРНЕ

### 2.1 Создаём папку app/ в корне

```bash
# Создаём app/ в корне (если нет)
mkdir -p app
```

### 2.2 Создаём структуру AUTH (Уровень 0)

```bash
# Auth - вход в систему
mkdir -p app/auth/login
mkdir -p app/auth/register
mkdir -p app/auth/reset-password
```

### 2.3 Создаём структуру DASHBOARD (Уровень 1)

```bash
# Dashboard - личный кабинет
mkdir -p app/dashboard
mkdir -p app/dashboard/companies/new
mkdir -p app/dashboard/invoices
mkdir -p app/dashboard/profile
mkdir -p app/dashboard/settings
```

### 2.4 Создаём структуру COMPANY (Уровень 2 - ERP)

```bash
# Company - ERP ядро
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
```

### 2.5 Создаём структуру API

```bash
# API Auth
mkdir -p app/api/auth/login
mkdir -p app/api/auth/register
mkdir -p app/api/auth/logout
mkdir -p app/api/auth/me

# API Dashboard
mkdir -p app/api/dashboard/companies
mkdir -p app/api/dashboard/profile

# API Company
mkdir -p 'app/api/company/[companyId]/clients/[clientId]/copy'
mkdir -p 'app/api/company/[companyId]/products/[productId]'
mkdir -p 'app/api/company/[companyId]/warehouse'
mkdir -p 'app/api/company/[companyId]/purchases'
mkdir -p 'app/api/company/[companyId]/sales'
mkdir -p 'app/api/company/[companyId]/bank/accounts'
mkdir -p 'app/api/company/[companyId]/bank/transactions'
mkdir -p 'app/api/company/[companyId]/reports'
```

### 2.6 Создаём support папки

```bash
# Components
mkdir -p components/ui
mkdir -p components/auth
mkdir -p components/dashboard
mkdir -p components/company/clients
mkdir -p components/company/products

# Lib, Config, Types, Hooks
mkdir -p lib/api
mkdir -p config/clients
mkdir -p config/products
mkdir -p types
mkdir -p hooks
mkdir -p docs
```

### ✅ ПРОВЕРКА ШАГ 2

```bash
# Смотрим что создали
tree app -L 3
# Или если нет tree:
find app -type d | head -30
```

---

## ШАГ 3: КОПИРУЕМ ФАЙЛЫ ИЗ FULL STRUCTURE

### 3.1 Копируем page.tsx для clients

```bash
# Главная страница списка клиентов
cp "Full structure/page.tsx" 'app/company/[companyId]/clients/page.tsx'
```

### 3.2 Копируем новые страницы из mnt/

```bash
# Страница создания клиента
cp "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/new/page.tsx" \
   'app/company/[companyId]/clients/new/page.tsx'

# Страница редактирования клиента
cp "Full structure/mnt/user-data/outputs/canon/app/company/[companyId]/clients/[clientId]/edit/page.tsx" \
   'app/company/[companyId]/clients/[clientId]/edit/page.tsx'
```

### 3.3 Копируем API routes

```bash
# API для списка клиентов (GET/POST)
cp "Full structure/route.ts" 'app/api/company/[companyId]/clients/route.ts'

# API для одного клиента (GET/PUT/DELETE)
cp "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/route.ts" \
   'app/api/company/[companyId]/clients/[clientId]/route.ts'

# API для копирования клиента
cp "Full structure/mnt/user-data/outputs/canon/app/api/company/[companyId]/clients/[clientId]/copy/route.ts" \
   'app/api/company/[companyId]/clients/[clientId]/copy/route.ts'
```

### 3.4 Копируем prisma.ts

```bash
# Prisma singleton
cp "Full structure/prisma.ts" lib/prisma.ts
```

### 3.5 Копируем документацию

```bash
# Architecture docs
cp "Full structure/ARCHITECTURE-v3.md" docs/ARCHITECTURE.md
cp "Full structure/FULL-STRUCTURE.md" docs/FULL-STRUCTURE.md
cp "Full structure/INSTALL.md" docs/INSTALL.md
```

### ✅ ПРОВЕРКА ШАГ 3

```bash
# Проверяем что файлы на месте
ls -la 'app/company/[companyId]/clients/'
ls -la 'app/api/company/[companyId]/clients/'
ls -la lib/
ls -la docs/
```

---

## ШАГ 4: ПЕРЕНОСИМ СУЩЕСТВУЮЩИЕ ФАЙЛЫ ИЗ SRC

### 4.1 Переносим layout и globals

```bash
# Root layout
cp src/app/layout.tsx app/layout.tsx

# Global styles
cp src/app/globals.css app/globals.css

# Landing page
cp src/app/page.tsx app/page.tsx
```

### 4.2 Переносим компоненты

```bash
# GridConfigModal
cp src/components/clients/GridConfigModal.tsx components/company/clients/GridConfigModal.tsx
```

### 4.3 Переносим config

```bash
# Columns config
cp src/config/clients/columnsConfig.ts config/clients/columnsConfig.ts
```

### 4.4 Переносим lib

```bash
# Auth и другие утилиты
cp src/lib/auth.ts lib/auth.ts
cp src/lib/db.ts lib/db.ts
cp src/lib/rate-limit.ts lib/rate-limit.ts
```

### 4.5 Переносим middleware

```bash
# Middleware
cp src/middleware.ts middleware.ts
```

### 4.6 Переносим auth pages

```bash
# Login
cp 'src/app/(products)/(auth)/login/page.tsx' app/auth/login/page.tsx

# Register
cp 'src/app/(products)/(auth)/register/page.tsx' app/auth/register/page.tsx
```

### 4.7 Переносим существующие API

```bash
# Auth API
cp src/app/api/auth/login/route.ts app/api/auth/login/route.ts
cp src/app/api/auth/logout/route.ts app/api/auth/logout/route.ts
cp src/app/api/auth/register/route.ts app/api/auth/register/route.ts

# Products API
cp src/app/api/company/\[companyId\]/products/route.ts 'app/api/company/[companyId]/products/route.ts'
cp src/app/api/company/\[companyId\]/products/\[productId\]/route.ts 'app/api/company/[companyId]/products/[productId]/route.ts'

# Warehouse, Purchases, Sales API
cp src/app/api/company/\[companyId\]/warehouse/route.ts 'app/api/company/[companyId]/warehouse/route.ts'
cp src/app/api/company/\[companyId\]/purchases/route.ts 'app/api/company/[companyId]/purchases/route.ts'
cp src/app/api/company/\[companyId\]/sales/route.ts 'app/api/company/[companyId]/sales/route.ts'
```

### 4.8 Переносим Company layout и sidebar

```bash
# Company layout components
cp 'src/app/(products)/(dashboard)/company/[companyId]/layout.tsx' 'app/company/[companyId]/layout.tsx'
cp 'src/app/(products)/(dashboard)/company/[companyId]/CompanySidebar.tsx' 'app/company/[companyId]/CompanySidebar.tsx'
cp 'src/app/(products)/(dashboard)/company/[companyId]/CompanyHeader.tsx' 'app/company/[companyId]/CompanyHeader.tsx'
cp 'src/app/(products)/(dashboard)/company/[companyId]/page.tsx' 'app/company/[companyId]/page.tsx'
```

### 4.9 Переносим products page

```bash
# Products page
cp 'src/app/(products)/(dashboard)/company/[companyId]/products/page.tsx' 'app/company/[companyId]/products/page.tsx'
```

### ✅ ПРОВЕРКА ШАГ 4

```bash
# Проверяем структуру
tree app -L 4 2>/dev/null || find app -type f | head -40
```

---

## ШАГ 5: ОБНОВЛЯЕМ TSCONFIG.JSON

```bash
# Открываем файл
nano tsconfig.json
# или
code tsconfig.json
```

**Меняем paths с `src/*` на `*`:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**⚠️ ВАЖНО:** Убираем `src/` из путей!

---

## ШАГ 6: ЧИСТИМ СТАРОЕ

```bash
# Удаляем src/ (у нас есть бэкап!)
rm -rf src/

# Удаляем временные папки
rm -rf "new structura"
rm -rf tmp/

# Удаляем Full structure (уже скопировали всё нужное)
rm -rf "Full structure"
```

---

## ШАГ 7: ПРОВЕРЯЕМ СБОРКУ

```bash
# Чистим кэш Next.js
rm -rf .next

# Устанавливаем зависимости
pnpm install

# Пробуем собрать
pnpm build
```

### Если есть ошибки:

```bash
# Смотрим какие файлы импортируют src/
grep -r "from '@/src" app/
grep -r "from '../src" app/

# Исправляем импорты вручную или:
find app -name "*.tsx" -exec sed -i '' 's|@/src/|@/|g' {} \;
find app -name "*.ts" -exec sed -i '' 's|@/src/|@/|g' {} \;
```

---

## ШАГ 8: ЗАПУСКАЕМ И ТЕСТИРУЕМ

```bash
# Запускаем dev сервер
pnpm dev

# Открываем в браузере:
# http://localhost:3000                    ← Landing
# http://localhost:3000/auth/login         ← Login
# http://localhost:3000/company/17/clients ← Clients
```

---

## ШАГ 9: КОММИТИМ

```bash
# Добавляем все изменения
git add .

# Коммит
git commit -m "refactor: migrate to Canon structure (no src/, no route groups)"

# Пушим
git push origin main
```

---

# ✅ ЧЕКЛИСТ ГОТОВНОСТИ

| Пункт | Проверка | Статус |
|-------|----------|--------|
| Папка `src/` удалена | `ls src/` должен дать ошибку | ☐ |
| Папка `app/` в корне | `ls app/` показывает файлы | ☐ |
| `tsconfig.json` обновлён | paths указывают на `./` | ☐ |
| `pnpm build` проходит | Нет ошибок | ☐ |
| `/auth/login` работает | Страница открывается | ☐ |
| `/company/17/clients` работает | Список клиентов | ☐ |
| API работает | GET /api/company/17/clients | ☐ |

---

# 🆘 ЕСЛИ ЧТО-ТО СЛОМАЛОСЬ

```bash
# Восстанавливаем из бэкапа
rm -rf app/
rm -rf components/
rm -rf lib/
rm -rf config/

# Возвращаем src/
mv src_backup/ src/

# Возвращаем tsconfig.json
git checkout tsconfig.json

# Пробуем заново
pnpm install
pnpm dev
```

---

# 📁 ФИНАЛЬНАЯ СТРУКТУРА

```
solar-erp-nextjs/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── companies/page.tsx
│   ├── company/
│   │   └── [companyId]/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── CompanySidebar.tsx
│   │       ├── CompanyHeader.tsx
│   │       ├── clients/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [clientId]/edit/page.tsx
│   │       ├── products/
│   │       │   └── page.tsx
│   │       └── ...
│   ├── api/
│   │   ├── auth/
│   │   └── company/[companyId]/
│   │       ├── clients/
│   │       ├── products/
│   │       └── ...
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
├── lib/
├── config/
├── hooks/
├── types/
├── docs/
├── prisma/
├── middleware.ts
├── tsconfig.json
└── package.json
```

---

**Готово!** ☀️🚀

---

**Solar ERP Team**  
*Leanid (Architect) • Dashka (Senior) • Claude (Engineer)*
