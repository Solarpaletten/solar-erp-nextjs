# 🚀 Solar ERP Sprint 2 - Products Module + ID Visibility

## 📋 Quick Start (5 минут)

### 1. Скопируйте файлы в проект

```bash
# Backend API - Products
cp backend/products/route.ts src/app/api/company/[companyId]/products/route.ts
mkdir -p src/app/api/company/[companyId]/products/[productId]
cp "backend/products/[productId]/route.ts" "src/app/api/company/[companyId]/products/[productId]/route.ts"

# Auth helper (если не существует)
cp backend/auth.ts src/lib/auth.ts

# Frontend - Products
cp frontend/products/page.tsx src/app/\(products\)/\(dashboard\)/company/\[companyId\]/products/page.tsx

# Frontend - Companies (с ID visibility)
cp frontend/account/companies-page.tsx src/app/\(products\)/\(dashboard\)/account/companies/page.tsx

# Frontend - Company Header (с ID visibility)
cp frontend/company/CompanyHeader.tsx src/app/\(products\)/\(dashboard\)/company/\[companyId\]/CompanyHeader.tsx

# Frontend - Dashboard (с ID visibility)
cp frontend/company/dashboard-page.tsx src/app/\(products\)/\(dashboard\)/company/\[companyId\]/dashboard/page.tsx
```

### 2. Добавьте SKU в Prisma Schema (опционально)

Откройте `prisma/schema.prisma` и добавьте в модель `products`:
```prisma
model products {
  // ... existing fields ...
  sku            String?         @db.VarChar(100)  // ← ADD THIS LINE
  // ... rest of fields ...
}
```

Затем выполните миграцию:
```bash
npx prisma migrate dev --name add_sku_to_products
npx prisma generate
```

### 3. Build & Deploy

```bash
npm run build
git add .
git commit -m "feat: add products module and ID visibility system"
git push origin main
```

Vercel автоматически задеплоит изменения.

---

## 📁 Структура файлов Sprint 2

```
solar-erp-sprint2/
├── backend/
│   ├── auth.ts                          # Auth helper functions
│   └── products/
│       ├── route.ts                     # GET list, POST create
│       └── [productId]/
│           └── route.ts                 # GET, PUT, DELETE
├── frontend/
│   ├── products/
│   │   └── page.tsx                     # Products list page
│   ├── account/
│   │   └── companies-page.tsx           # Companies with ID visibility
│   └── company/
│       ├── CompanyHeader.tsx            # Header with ID visibility
│       └── dashboard-page.tsx           # Dashboard with ID visibility
└── README.md
```

---

## 🆔 ID Visibility System

Все сущности теперь показывают ID:

| Страница | Где показывается ID |
|----------|---------------------|
| Companies | Badge в карточке + inline под названием |
| Clients | Первый столбец таблицы (после checkbox) |
| Products | Первый столбец таблицы (после checkbox) |
| Dashboard | Info card + System Health section |
| Header | В avatar блоке + центральный badge |

---

## ✅ Checklist после деплоя

- [ ] `/company/16/products` загружается
- [ ] Можно создать продукт
- [ ] ID показывается первым столбцом
- [ ] `/account/companies` показывает Company IDs
- [ ] Company ID в header
- [ ] CRUD операции работают
- [ ] Copy функция работает
- [ ] Фильтры работают

---

## 🔧 API Endpoints

### Products Collection
```
GET  /api/company/{companyId}/products      - List all products
POST /api/company/{companyId}/products      - Create product
```

### Product Item
```
GET    /api/company/{companyId}/products/{productId}  - Get product
PUT    /api/company/{companyId}/products/{productId}  - Update product
DELETE /api/company/{companyId}/products/{productId}  - Delete product
```

---

## 🎯 Что нового в v2.1.0

1. **Products Module** - полный CRUD для продуктов
2. **ID Visibility** - ID показывается везде (Site.pro pattern)
3. **Auto-code generation** - автогенерация кода PRD-{companyId}-{nextId}
4. **Column filters** - фильтрация по всем столбцам
5. **Bulk operations** - массовое удаление
6. **Copy function** - копирование с инкрементом

---

## 🚀 Next Steps (Sprint 3)

- Warehouse & Stock Transactions
- Sales & Invoices
- Pagination & Advanced Filters
- Release Solar ERP 2.2.0

---

**Solar ERP Team** ☀️
- Leanid (Architect)
- Dashka (Senior Coordinator)
- Claude (AI Engineer)

*"Космический корабль с заправленными баками!"* 🚀

git commit -m "HOTFIX: useEffect return value"

git add . && git commit -m "FIX: Toolbar separated from table scroll" && git push