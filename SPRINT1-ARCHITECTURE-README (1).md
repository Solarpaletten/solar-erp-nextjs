# 🏗️ SPRINT 1 — CLIENTS: ФУНДАМЕНТ SOLAR ERP

## Архитектурная документация первого спринта

---

# 📐 ADR-000: ПОЧЕМУ CLIENTS — ФУНДАМЕНТ ERP

## Architecture Decision Record

| Поле | Значение |
|------|----------|
| **Статус** | ✅ Принято как ОСНОВА |
| **Дата** | Декабрь 2024 |
| **Приоритет** | 🔴 КРИТИЧЕСКИЙ |
| **Авторы** | Leanid (Architect), Dashka (Senior), Claude (Engineer) |

---

## Философское утверждение

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   CLIENTS — ПЕРВИЧНАЯ СУЩНОСТЬ ERP.                        │
│   ВСЁ НАЧИНАЕТСЯ С КЛИЕНТОВ.                               │
│                                                             │
│   Без Clients невозможны:                                   │
│   • Sales (кому продаём?)                                   │
│   • Purchases (у кого покупаем?)                            │
│   • Invoices (кому выставляем?)                             │
│   • Payments (от кого получаем?)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Почему Clients, а не Products?

### ❌ Неправильный подход (Products First):

```
Products → ??? → Sales → ???
   │
   └── Кому продавать? Неизвестно!
   └── У кого покупать? Неизвестно!
   └── Warehouse без контрагентов бессмысленен
```

### ✅ Правильный подход (Clients First):

```
Clients (Sprint 1)
    │
    ├── CLIENT role → Sales (Sprint 3) → кому продаём
    │
    ├── SUPPLIER role → Purchases (Sprint 3) → у кого покупаем
    │
    └── BOTH role → партнёры (продаём и покупаем)
    
Products (Sprint 2)
    │
    └── ЧТО продаём/покупаем (но уже есть КОМУ/У КОГО)
    
Warehouse (Sprint 3)
    │
    └── Движение товаров МЕЖДУ контрагентами
```

---

## Clients = Foundation Layer

```
┌─────────────────────────────────────────────────────────────┐
│  УРОВЕНЬ 4: REPORTS & ANALYTICS                            │
│  (отчёты, дашборды, BI)                                    │
├─────────────────────────────────────────────────────────────┤
│  УРОВЕНЬ 3: WAREHOUSE & FINANCE                            │
│  (склад, платежи, бухгалтерия)                             │
├─────────────────────────────────────────────────────────────┤
│  УРОВЕНЬ 2: TRANSACTIONS                                   │
│  (Sales, Purchases, Invoices)                              │
├─────────────────────────────────────────────────────────────┤
│  УРОВЕНЬ 1: MASTER DATA                                    │
│  Products, Warehouses, Employees                           │
├─────────────────────────────────────────────────────────────┤
│  🏗️ ФУНДАМЕНТ: CLIENTS + COMPANIES                         │
│  (контрагенты + организации)                               │
│                                                             │
│  ▶ Sprint 1 строит ЭТОТ УРОВЕНЬ                            │
└─────────────────────────────────────────────────────────────┘
```

**Без фундамента здание не построить.**

---

# 📦 ЧАСТЬ 1: BACKEND — CLIENTS API

## 1.1 Расположение файла

```
src/app/api/company/[companyId]/clients/route.ts
```

### Почему такой путь?

| Сегмент | Значение | Зачем нужен |
|---------|----------|-------------|
| `src/app/api/` | API Routes root | Next.js convention |
| `company/` | Namespace компаний | Multi-tenant изоляция |
| `[companyId]/` | Dynamic segment | Определяет КАКАЯ компания |
| `clients/` | Resource name | REST convention |
| `route.ts` | Handler file | Next.js App Router |

### ⚠️ КРИТИЧНО: companyId ВСЕГДА в URL

```
✅ /api/company/16/clients     — клиенты компании 16
✅ /api/company/42/clients     — клиенты компании 42
❌ /api/clients                 — ЧЬИ клиенты? Неизвестно!
```

**Причина:** Multi-tenant архитектура. Каждая компания видит ТОЛЬКО своих клиентов.

---

## 1.2 Структура файлов Clients API

### Файловая структура:

```
src/app/api/company/[companyId]/clients/
├── route.ts              ← Collection: GET (list), POST (create)
└── [clientId]/
    └── route.ts          ← Item: PUT (update), DELETE
```

---

### 📄 Файл 1: `route.ts` (Collection — GET/POST)

**Путь:** `src/app/api/company/[companyId]/clients/route.ts`

```typescript
// src/app/api/company/[companyId]/clients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '7d5a2e3f4b1c9d8e0a6f5b2d1e4c3a9b8f7e6d5c4b3a2f1';

// ============================================
// Helper: Get authenticated user ID from JWT
// ============================================
async function getUserIdFromToken(): Promise<number | null> {
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

// ============================================
// Helper: Verify user has access to company
// ============================================
async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const membership = await prisma.company_users.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
      is_active: true
    }
  });
  
  return !!membership;
}

// ============================================
// GET /api/company/[companyId]/clients
// List all clients for company
// ============================================
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    // Get authenticated user
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Get company ID from params
    const params = await context.params;
    const companyId = parseInt(params.companyId);

    if (isNaN(companyId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid company ID'
      }, { status: 400 });
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Access denied to this company'
      }, { status: 403 });
    }

    // Fetch clients for this company (MULTI-TENANT FILTER)
    const clients = await prisma.clients.findMany({
      where: {
        company_id: companyId  // ← Ключевой фильтр multi-tenant
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      clients: clients
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch clients'
    }, { status: 500 });
  }
}

// ============================================
// POST /api/company/[companyId]/clients
// Create new client
// ============================================
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    // Get authenticated user
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Get company ID from params
    const params = await context.params;
    const companyId = parseInt(params.companyId);

    if (isNaN(companyId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid company ID'
      }, { status: 400 });
    }

    // Verify user has access to this company
    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Access denied to this company'
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required'
      }, { status: 400 });
    }

    // Create client with ALL Prisma schema fields
    const client = await prisma.clients.create({
      data: {
        company_id: companyId,                    // ← ОБЯЗАТЕЛЬНО: привязка к компании
        name: body.name,                          // ← ОБЯЗАТЕЛЬНО
        email: body.email,                        // ← ОБЯЗАТЕЛЬНО
        created_by: userId,                       // ← ОБЯЗАТЕЛЬНО: кто создал
        
        // Опциональные поля
        abbreviation: body.abbreviation || null,
        code: body.code || null,
        phone: body.phone || null,
        fax: body.fax || null,
        website: body.website || null,
        contact_information: body.contact_information || null,
        role: body.role || 'CLIENT',              // ← CLIENT / SUPPLIER / BOTH
        is_juridical: body.is_juridical ?? true,
        is_active: body.is_active ?? true,
        is_foreigner: body.is_foreigner ?? false,
        country: body.country || null,
        legal_address: body.legal_address || null,
        actual_address: body.actual_address || null,
        business_license_code: body.business_license_code || null,
        vat_code: body.vat_code || null,
        vat_rate: body.vat_rate ? parseFloat(body.vat_rate) : null,
        eori_code: body.eori_code || null,
        foreign_taxpayer_code: body.foreign_taxpayer_code || null,
        registration_number: body.registration_number || null,
        credit_sum: body.credit_sum ? parseFloat(body.credit_sum) : 0,
        pay_per: body.pay_per || null,
        currency: body.currency || 'EUR',
        payment_terms: body.payment_terms || null,
        automatic_debt_reminder: body.automatic_debt_reminder ?? false,
        registration_date: body.registration_date ? new Date(body.registration_date) : null,
        date_of_birth: body.date_of_birth ? new Date(body.date_of_birth) : null,
        sabis_customer_name: body.sabis_customer_name || null,
        sabis_customer_code: body.sabis_customer_code || null,
        additional_information: body.additional_information || null,
        notes: body.notes || null,
      }
    });

    return NextResponse.json({
      success: true,
      client: client
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating client:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json({
        success: false,
        error: `A client with this ${field} already exists`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create client'
    }, { status: 500 });
  }
}
```

---

### 📄 Файл 2: `[clientId]/route.ts` (Item — PUT/DELETE)

**Путь:** `src/app/api/company/[companyId]/clients/[clientId]/route.ts`

```typescript
// src/app/api/company/[companyId]/clients/[clientId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '7d5a2e3f4b1c9d8e0a6f5b2d1e4c3a9b8f7e6d5c4b3a2f1';

// Helper functions (same as collection route)
async function getUserIdFromToken(): Promise<number | null> {
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

async function verifyCompanyAccess(userId: number, companyId: number): Promise<boolean> {
  const membership = await prisma.company_users.findFirst({
    where: { user_id: userId, company_id: companyId, is_active: true }
  });
  return !!membership;
}

// ============================================
// PUT /api/company/[companyId]/clients/[clientId]
// Update existing client
// ============================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; clientId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const companyId = parseInt(params.companyId);
    const clientId = parseInt(params.clientId);

    if (isNaN(companyId) || isNaN(clientId)) {
      return NextResponse.json({ success: false, error: 'Invalid IDs' }, { status: 400 });
    }

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Verify client exists AND belongs to this company
    const existingClient = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    if (existingClient.company_id !== companyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client does not belong to this company'  // ← Multi-tenant защита
      }, { status: 403 });
    }

    const body = await request.json();

    // Update with all fields
    const updatedClient = await prisma.clients.update({
      where: { id: clientId },
      data: {
        name: body.name ?? existingClient.name,
        abbreviation: body.abbreviation ?? existingClient.abbreviation,
        code: body.code ?? existingClient.code,
        email: body.email ?? existingClient.email,
        phone: body.phone ?? existingClient.phone,
        role: body.role ?? existingClient.role,
        // ... все остальные поля по аналогии
      }
    });

    return NextResponse.json({ success: true, client: updatedClient });

  } catch (error: any) {
    console.error('Error updating client:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: 'Duplicate value' 
      }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

// ============================================
// DELETE /api/company/[companyId]/clients/[clientId]
// Delete client (with referential integrity check)
// ============================================
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ companyId: string; clientId: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const companyId = parseInt(params.companyId);
    const clientId = parseInt(params.clientId);

    const hasAccess = await verifyCompanyAccess(userId, companyId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const existingClient = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!existingClient || existingClient.company_id !== companyId) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    // ⚠️ ВАЖНО: Проверка ссылочной целостности
    const [salesCount, purchasesCount, bankOpsCount] = await Promise.all([
      prisma.sales.count({ where: { client_id: clientId } }),
      prisma.purchases.count({ where: { supplier_id: clientId } }),
      prisma.bank_operations.count({ where: { client_id: clientId } })
    ]);

    if (salesCount > 0 || purchasesCount > 0 || bankOpsCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete: ${salesCount} sales, ${purchasesCount} purchases, ${bankOpsCount} bank ops reference this client`
      }, { status: 400 });
    }

    await prisma.clients.delete({ where: { id: clientId } });

    return NextResponse.json({ success: true, message: 'Deleted' });

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
```

## 1.3 Роли клиентов (CLIENT / SUPPLIER / BOTH)

```typescript
enum ClientRole {
  CLIENT    // Покупатель — появляется в Sales
  SUPPLIER  // Поставщик — появляется в Purchases  
  BOTH      // И то, и другое — появляется везде
}
```

### Как роли влияют на систему:

| Роль | Sales | Purchases | Описание |
|------|-------|-----------|----------|
| `CLIENT` | ✅ Доступен | ❌ Не виден | Только покупает у нас |
| `SUPPLIER` | ❌ Не виден | ✅ Доступен | Только продаёт нам |
| `BOTH` | ✅ Доступен | ✅ Доступен | Партнёр (двусторонние операции) |

### Пример использования в Sales API (Sprint 3):

```typescript
// При создании Sale — фильтруем только CLIENT и BOTH
const clients = await prisma.clients.findMany({
  where: {
    company_id: companyId,
    role: { in: ['CLIENT', 'BOTH'] }  // ← Фильтр по роли
  }
})
```

### Пример использования в Purchases API (Sprint 3):

```typescript
// При создании Purchase — фильтруем только SUPPLIER и BOTH
const suppliers = await prisma.clients.findMany({
  where: {
    company_id: companyId,
    role: { in: ['SUPPLIER', 'BOTH'] }  // ← Фильтр по роли
  }
})
```

---

## 1.4 Обязательные vs опциональные поля

### 🔴 Обязательные поля (без них клиент НЕ создастся):

| Поле | Тип | Описание |
|------|-----|----------|
| `company_id` | Int | К какой компании принадлежит |
| `name` | String | Название организации или ФИО |
| `email` | String | Контактный email |
| `created_by` | Int | Кто создал (user ID) |

### 🟡 Важные опциональные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `role` | Enum | CLIENT / SUPPLIER / BOTH (default: CLIENT) |
| `code` | String | Внутренний код клиента |
| `phone` | String | Телефон |
| `country` | String | Страна |
| `vat_code` | String | НДС номер |
| `currency` | Enum | Валюта расчётов (EUR/USD/AED/UAH/GBP) |

### ⚪ Расширенные поля (для полноценной ERP):

| Поле | Описание |
|------|----------|
| `legal_address` | Юридический адрес |
| `actual_address` | Фактический адрес |
| `credit_sum` | Кредитный лимит |
| `payment_terms` | Условия оплаты |
| `is_juridical` | Юр. лицо или физ. лицо |
| `is_foreigner` | Иностранный контрагент |

---

## 1.5 API Endpoints Reference

### Реальная структура файлов:

```
src/app/api/company/[companyId]/clients/
├── route.ts              ← GET /clients, POST /clients
└── [clientId]/
    └── route.ts          ← PUT /clients/{id}, DELETE /clients/{id}
```

### Collection (route.ts)

| Method | URL | Описание | Реализовано |
|--------|-----|----------|-------------|
| `GET` | `/api/company/{companyId}/clients` | Список клиентов | ✅ |
| `POST` | `/api/company/{companyId}/clients` | Создать клиента | ✅ |

### Item ([clientId]/route.ts)

| Method | URL | Описание | Реализовано |
|--------|-----|----------|-------------|
| `PUT` | `/api/company/{companyId}/clients/{clientId}` | Обновить | ✅ |
| `DELETE` | `/api/company/{companyId}/clients/{clientId}` | Удалить | ✅ |

### Примеры запросов:

```bash
# Получить всех клиентов компании 16
curl http://localhost:3000/api/company/16/clients

# Создать нового клиента
curl -X POST http://localhost:3000/api/company/16/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corporation",
    "email": "contact@acme.com",
    "role": "CLIENT",
    "country": "Germany"
  }'

# Обновить клиента
curl -X PUT http://localhost:3000/api/company/16/clients/5 \
  -H "Content-Type: application/json" \
  -d '{"role": "BOTH"}'

# Удалить клиента
curl -X DELETE http://localhost:3000/api/company/16/clients/5
```

---

# 🎨 ЧАСТЬ 2: FRONTEND — CLIENTS PAGE

## 2.1 Расположение файла

```
src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx
```

### Разбор пути:

| Сегмент | Тип | Влияние на URL | Зачем нужен |
|---------|-----|----------------|-------------|
| `(products)` | Route Group | ❌ Не влияет | Логическая группировка модулей |
| `(dashboard)` | Route Group | ❌ Не влияет | Применяет общий layout |
| `company/` | Folder | ✅ `/company` | Namespace компании |
| `[companyId]/` | Dynamic | ✅ `/company/16` | ID компании в URL |
| `clients/` | Folder | ✅ `/company/16/clients` | Страница клиентов |
| `page.tsx` | Page | — | Рендерит UI |

### Итоговый URL:

```
https://solar-erp.com/company/16/clients
                      ↑          ↑
                      │          └── clients page
                      └── companyId = 16
```

---

## 2.2 Что такое Route Groups?

### `(products)` — логическая группа

```
src/app/(products)/
├── (dashboard)/           ← Ещё одна группа (с layout)
│   ├── company/
│   │   └── [companyId]/
│   │       ├── clients/   ← /company/16/clients
│   │       ├── products/  ← /company/16/products
│   │       └── sales/     ← /company/16/sales
│   └── account/
│       └── companies/     ← /account/companies
└── (auth)/                ← Группа авторизации
    ├── login/             ← /login
    └── register/          ← /register
```

**Зачем нужны группы:**
- Разные layouts для разных секций
- Логическая организация кода
- НЕ влияют на URL (скобки = невидимые)

---

## 2.3 Clients Page как основа для Sales и Purchases

### Архитектурный принцип:

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENTS PAGE (Sprint 1)                                    │
│                                                             │
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │ ID │ Name   │ Role        │ Actions     │               │
│  ├────┼────────┼─────────────┼─────────────┤               │
│  │ 1  │ ACME   │ CLIENT      │ Edit/Delete │               │
│  │ 2  │ Tech   │ SUPPLIER    │ Edit/Delete │               │
│  │ 3  │ Global │ BOTH        │ Edit/Delete │               │
│  └────┴────────┴─────────────┴─────────────┘               │
└─────────────────────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ SALES (Sprint 3)│   │PURCHASES(Spr.3) │
│                 │   │                 │
│ Client: [ACME▼] │   │ Supplier:[Tech▼]│
│ (только CLIENT  │   │ (только SUPPLIER│
│  и BOTH)        │   │  и BOTH)        │
└─────────────────┘   └─────────────────┘
```

**Clients Page создаёт данные, которые используются везде.**

---

## 2.4 ID Visibility как архитектурный принцип

### ❌ Неправильно: ID как "техническая деталь"

```
| Name        | Email            | Phone    |
|-------------|------------------|----------|
| ACME Corp   | acme@example.com | +49...   |
```

Проблема: Как найти клиента по ID? Как сообщить ID в поддержку?

### ✅ Правильно: ID как первичный идентификатор

```
| ID | Name        | Email            | Phone    |
|----|-------------|------------------|----------|
| 1  | ACME Corp   | acme@example.com | +49...   |
```

**Почему ID важен:**
1. **Уникальность** — имена могут повторяться
2. **Поддержка** — "У меня проблема с клиентом ID 42"
3. **Интеграции** — API работает с ID
4. **Отладка** — быстрый поиск в базе
5. **Ссылки** — URL содержит ID

### Реализация:

```tsx
// Первый столбец таблицы — ВСЕГДА ID
<th className="p-2 min-w-[60px]">
  <span className="font-medium text-gray-700">ID</span>
</th>

// Ячейка с ID
<td className="p-2 font-mono text-gray-600">{client.id}</td>
```

---

# 🧭 ЧАСТЬ 3: CANONICAL PATHS

## Реальные файлы Sprint 1 (Clients)

### Backend API (2 файла):

| # | Файл | Путь | Методы |
|---|------|------|--------|
| 1 | Collection route | `src/app/api/company/[companyId]/clients/route.ts` | GET, POST |
| 2 | Item route | `src/app/api/company/[companyId]/clients/[clientId]/route.ts` | PUT, DELETE |

### Frontend (1 файл):

| # | Файл | Путь |
|---|------|------|
| 1 | Clients page | `src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx` |

### Проверка структуры в терминале:

```bash
# Backend
tree src/app/api/company/\[companyId\]/clients
# Ожидаемый результат:
# .
# ├── [clientId]
# │   └── route.ts
# └── route.ts

# Frontend
ls src/app/\(products\)/\(dashboard\)/company/\[companyId\]/clients/
# Ожидаемый результат:
# page.tsx
```

---

## Таблица соответствия Delivery → Runtime

| # | Delivery (логика) | Runtime (Next.js) |
|---|-------------------|-------------------|
| 1 | `backend/clients/route.ts` | `src/app/api/company/[companyId]/clients/route.ts` |
| 2 | `backend/clients/[clientId]/route.ts` | `src/app/api/company/[companyId]/clients/[clientId]/route.ts` |
| 3 | `frontend/clients/page.tsx` | `src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx` |

---

## Что такое Delivery и Runtime?

### 📦 Delivery (доставка)

```
sprint-1-delivery/
├── backend/
│   └── clients/
│       ├── route.ts           ← Логический путь
│       └── [clientId]/
│           └── route.ts
├── frontend/
│   └── clients/
│       └── page.tsx           ← Логический путь
└── README.md
```

**Delivery** — это пакет файлов, который ты ПОЛУЧАЕШЬ при начале спринта.

### 🏃 Runtime (выполнение)

```
solar-erp-nextjs/
└── src/
    └── app/
        ├── api/
        │   └── company/
        │       └── [companyId]/
        │           └── clients/
        │               └── route.ts    ← Физический путь
        └── (products)/
            └── (dashboard)/
                └── company/
                    └── [companyId]/
                        └── clients/
                            └── page.tsx    ← Физический путь
```

**Runtime** — это где код ЖИВЁТ и ВЫПОЛНЯЕТСЯ.

---

## ⚠️ КРИТИЧНО: Delivery НЕ остаётся в проекте

```bash
# 1. Получил delivery
ls sprint-1-delivery/
# backend/ frontend/ README.md

# 2. Скопировал в проект
cp -r sprint-1-delivery/backend/clients/* src/app/api/company/\[companyId\]/clients/
cp sprint-1-delivery/frontend/clients/page.tsx src/app/\(products\)/\(dashboard\)/company/\[companyId\]/clients/

# 3. УДАЛИЛ delivery
rm -rf sprint-1-delivery/

# 4. Работаешь только с src/app/
```

**После установки папок `backend/` и `frontend/` в репозитории БЫТЬ НЕ ДОЛЖНО!**

---

# ⚠️ ЧАСТЬ 4: COMMON MISTAKES (5 типовых ошибок)

## ❌ Ошибка 1: Положить route.ts не туда

```bash
# НЕПРАВИЛЬНО ❌
src/app/api/clients/route.ts                    # Нет companyId!
src/app/api/company/clients/route.ts            # Нет [companyId]!
src/app/company/[companyId]/clients/route.ts    # Нет api/!

# ПРАВИЛЬНО ✅
src/app/api/company/[companyId]/clients/route.ts
```

**Как проверить:**
```bash
ls src/app/api/company/\[companyId\]/clients/route.ts
# Файл должен существовать
```

---

## ❌ Ошибка 2: Путать (products) с реальной папкой

```bash
# НЕПРАВИЛЬНО ❌
# Думать что URL будет: /products/dashboard/company/16/clients
# На самом деле URL: /company/16/clients

# Скобки (products) и (dashboard) — это Route Groups
# Они НЕ влияют на URL!
```

**Правило:** Всё что в скобках — невидимо в URL.

---

## ❌ Ошибка 3: Сломать [companyId]

```bash
# НЕПРАВИЛЬНО ❌
mkdir src/app/api/company/companyId/clients     # Без скобок!
mkdir src/app/api/company/{companyId}/clients   # Фигурные скобки!
mkdir src/app/api/company/[company_id]/clients  # Underscore!

# ПРАВИЛЬНО ✅
mkdir src/app/api/company/\[companyId\]/clients
```

**В терминале квадратные скобки нужно экранировать: `\[` и `\]`**

---

## ❌ Ошибка 4: Создать clients без company

```typescript
// НЕПРАВИЛЬНО ❌
const client = await prisma.clients.create({
  data: {
    name: "ACME",
    email: "acme@example.com"
    // Где company_id??? Клиент "ничей"!
  }
})

// ПРАВИЛЬНО ✅
const client = await prisma.clients.create({
  data: {
    company_id: parseInt(companyId),  // ← ОБЯЗАТЕЛЬНО!
    name: "ACME",
    email: "acme@example.com",
    created_by: userId
  }
})
```

**Каждый клиент ОБЯЗАН принадлежать компании.**

---

## ❌ Ошибка 5: Делать Products раньше Clients

```
# НЕПРАВИЛЬНАЯ последовательность:
Sprint 1: Products ❌
Sprint 2: Sales ❌
Sprint 3: "Упс, а кому продавать?" ❌

# ПРАВИЛЬНАЯ последовательность:
Sprint 1: Clients ✅ (фундамент)
Sprint 2: Products ✅ (что продаём)
Sprint 3: Sales/Purchases ✅ (транзакции)
```

**Почему:** Sales требует client_id. Без Clients — нет Sales.

---

# 🔗 ЧАСТЬ 5: СВЯЗЬ С ДРУГИМИ СПРИНТАМИ

## Диаграмма зависимостей

```
                    ┌─────────────────┐
                    │   SPRINT 1      │
                    │    CLIENTS      │
                    │   (Фундамент)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ SPRINT 2 │   │ SPRINT 3 │   │ SPRINT 3 │
       │ PRODUCTS │   │  SALES   │   │PURCHASES │
       └────┬─────┘   └────┬─────┘   └────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   SPRINT 3   │
                    │  WAREHOUSE   │
                    └──────────────┘
```

---

## Clients → Sales

```typescript
// Sales API (Sprint 3)
// Нужен client_id для создания продажи

const sale = await prisma.sales.create({
  data: {
    company_id: companyId,
    client_id: body.client_id,    // ← Ссылка на CLIENTS
    document_number: "INV-001",
    total_amount: 1000
  }
})
```

**Без Clients → Sales невозможны.**

---

## Clients → Purchases

```typescript
// Purchases API (Sprint 3)
// Нужен supplier_id (это тоже client, но с ролью SUPPLIER)

const purchase = await prisma.purchases.create({
  data: {
    company_id: companyId,
    supplier_id: body.supplier_id,  // ← Ссылка на CLIENTS (role=SUPPLIER)
    document_number: "PUR-001",
    total_amount: 500
  }
})
```

**supplier_id — это ID из таблицы clients с ролью SUPPLIER или BOTH.**

---

## Clients → Products (косвенная связь)

```
Clients определяют:
├── У кого покупаем (SUPPLIER) → какие товары получаем
└── Кому продаём (CLIENT) → какие товары отгружаем

Products появляются в:
├── Purchase Items → пришли от поставщика (client)
└── Sale Items → ушли к покупателю (client)
```

---

## Clients → Permissions (будущее)

```typescript
// Возможная структура (Sprint 5+)
const clientAccess = await prisma.client_permissions.findMany({
  where: {
    client_id: clientId,
    user_id: userId
  }
})

// Кто из сотрудников может работать с каким клиентом
```

---

## Почему Warehouse НЕ имеет смысла без Clients

```
Warehouse отвечает на вопрос: "Сколько товара на складе?"

Но откуда товар появился?
└── Purchases от SUPPLIER (client)

Куда товар уходит?
└── Sales для CLIENT (client)

Warehouse = результат операций Clients ↔ Products
```

**Без Clients — Warehouse это просто числа без контекста.**

---

# ✅ ЧАСТЬ 6: ACCEPTANCE CHECKLIST

## Файловая структура

- [ ] `src/app/api/company/[companyId]/clients/route.ts` существует
- [ ] `src/app/api/company/[companyId]/clients/[clientId]/route.ts` существует
- [ ] `src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx` существует

## API Collection (route.ts)

- [ ] `GET /api/company/{id}/clients` возвращает `{ success: true, clients: [...] }`
- [ ] `POST /api/company/{id}/clients` создаёт клиента и возвращает `{ success: true, client: {...} }`
- [ ] POST без `name` или `email` возвращает 400
- [ ] Запрос без token возвращает 401 Unauthorized
- [ ] Запрос к чужой компании возвращает 403 Access denied

## API Item ([clientId]/route.ts)

- [ ] `PUT /api/company/{id}/clients/{clientId}` обновляет клиента
- [ ] `DELETE /api/company/{id}/clients/{clientId}` удаляет клиента
- [ ] DELETE клиента со связанными Sales/Purchases возвращает ошибку
- [ ] PUT/DELETE чужого клиента возвращает 403

## Frontend

- [ ] `/company/{id}/clients` открывается
- [ ] Таблица клиентов отображается
- [ ] Можно создать нового клиента
- [ ] Можно редактировать клиента
- [ ] Можно удалить клиента
- [ ] ID отображается первым столбцом
- [ ] Фильтры по столбцам работают

## Multi-tenant

- [ ] Компания 16 видит ТОЛЬКО своих клиентов
- [ ] Компания 42 видит ТОЛЬКО своих клиентов
- [ ] Нет "утечки" данных между компаниями

## Роли

- [ ] Можно создать CLIENT
- [ ] Можно создать SUPPLIER
- [ ] Можно создать BOTH
- [ ] Роль отображается в таблице

## Интеграция (проверить после Sprint 3)

- [ ] CLIENT виден в выпадающем списке Sales
- [ ] SUPPLIER виден в выпадающем списке Purchases
- [ ] BOTH виден в обоих списках

---

# 📚 ЧАСТЬ 7: GLOSSARY (Глоссарий)

| Термин | Определение |
|--------|-------------|
| **companyId** | Уникальный идентификатор компании в URL. Определяет контекст multi-tenant. |
| **client** | Контрагент компании. Может быть покупателем (CLIENT), поставщиком (SUPPLIER) или обоими (BOTH). |
| **CLIENT** | Роль клиента — покупает у нас. Появляется в Sales. |
| **SUPPLIER** | Роль клиента — продаёт нам. Появляется в Purchases. |
| **BOTH** | Роль клиента — и покупает, и продаёт. Появляется везде. |
| **delivery** | Пакет файлов Sprint для установки. Временные папки `backend/` и `frontend/`. |
| **runtime** | Финальное расположение кода в `src/app/`. Где код выполняется. |
| **Route Group** | Папка в скобках `(name)`. Группирует routes без влияния на URL. |
| **Dynamic Segment** | Папка в квадратных скобках `[param]`. Становится параметром URL. |
| **multi-tenant** | Архитектура, где несколько компаний используют одну систему с изоляцией данных. |
| **foundation layer** | Базовый уровень системы. Clients = foundation для всех транзакций. |

---

# 🏁 ИТОГ

## Sprint 1 устанавливает:

1. ✅ **Фундамент ERP** — Clients как первичная сущность
2. ✅ **Multi-tenant паттерн** — companyId в каждом URL
3. ✅ **Роли контрагентов** — CLIENT / SUPPLIER / BOTH
4. ✅ **ID Visibility** — ID как первичный идентификатор
5. ✅ **Canonical paths** — стандарт размещения файлов
6. ✅ **Delivery → Runtime** — паттерн установки спринтов

## После Sprint 1 возможно:

- ✅ Sprint 2 (Products) — что продаём/покупаем
- ✅ Sprint 3 (Sales/Purchases/Warehouse) — транзакции
- ✅ Sprint 4+ (Reports, Finance, etc.)

---

**Version:** Sprint 1.0.0  
**Status:** FOUNDATION ✅  
**Architecture:** Next.js 15 Multi-Tenant  
**Last Updated:** December 2024  
**Team:** Leanid (Architect), Dashka (Senior), Claude (Engineer)

*"Без фундамента здание не построить."* 🏗️
