# Solar ERP – Backend/API Release Notes v2.0.0

**Дата релиза:** 2025-12-06  
**Архитектор:** Leanid  
**Senior Coordinator:** Dashka  
**Lead Engineer:** Claude  

---

## 1. Общее описание

Backend Solar ERP v2.0.0 реализован на базе **Next.js API Routes** и **Prisma ORM**:

- ✅ Нет отдельного Express-сервера
- ✅ Все API находятся в `src/app/api/*`
- ✅ Используется **PostgreSQL** как основная база данных
- ✅ Подключение через **Prisma Client** (v6.18.0)
- ✅ Деплой: **Render.com** (Node.js 20.18.0)

**Build Command:**
```bash
prisma generate && next build
```

---

## 2. Структура Backend/API

### 2.1. Реальная структура API routes

```
src/app/api/
├── account/
│   ├── companies/
│   │   ├── route.ts               (GET, POST, PUT, DELETE)
│   │   └── stats/
│   │       └── route.ts           (GET)
│   └── switch-to-company/
│       └── route.ts               (POST)
└── auth/
    ├── login/
    │   └── route.ts               (POST)
    └── register/
        └── route.ts               (POST)
```

### 2.2. Отсутствующие API routes (TODO)

```
❌ НЕ РЕАЛИЗОВАНО (требуется создать):

src/app/api/company/[companyId]/
├── clients/
│   ├── route.ts                   (GET, POST)
│   └── [clientId]/
│       └── route.ts               (PUT, DELETE)
├── products/
│   └── route.ts
├── sales/
│   └── route.ts
├── purchases/
│   └── route.ts
└── warehouse/
    └── route.ts
```

---

## 3. Prisma и база данных

### 3.1. Подключение

**Файл:** `prisma/schema.prisma`

**Datasource:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

**Environment Variable:**
```bash
DATABASE_URL=postgresql://solar_user:Pass123@207.154.220.86:5433/solar?schema=solar_schema
```

### 3.2. Основные модели

#### Users
```prisma
model users {
  id                Int       @id @default(autoincrement())
  username          String    @unique @db.VarChar(50)
  email             String    @unique @db.VarChar(100)
  password_hash     String    @db.VarChar(255)
  first_name        String?   @db.VarChar(50)
  last_name         String?   @db.VarChar(50)
  phone             String?   @db.VarChar(20)
  role              UserRole  @default(USER)
  is_active         Boolean   @default(true)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  
  // Relations
  owned_companies   companies[]  @relation("CompanyOwner")
  company_memberships company_users[]
}
```

#### Companies
```prisma
model companies {
  id                Int       @id @default(autoincrement())
  code              String    @unique @db.VarChar(20)
  name              String    @db.VarChar(100)
  owner_id          Int
  director_name     String    @db.VarChar(100)
  legal_entity_type String    @db.VarChar(50)
  tax_country       String    @default("UAE") @db.VarChar(3)
  base_currency     Currency  @default(AED)
  is_active         Boolean   @default(true)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  
  // Relations
  owner             users     @relation("CompanyOwner", fields: [owner_id], references: [id])
  employees         company_users[]
  clients           clients[]
  products          products[]
  sales             sales[]
  purchases         purchases[]
}
```

#### Company Users (Multi-tenant membership)
```prisma
model company_users {
  id          Int             @id @default(autoincrement())
  company_id  Int
  user_id     Int
  role        CompanyUserRole @default(EMPLOYEE)
  permissions String[]        @default([])
  is_active   Boolean         @default(true)
  joined_at   DateTime        @default(now())
  
  // Relations
  company     companies  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  user        users      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@unique([company_id, user_id])
}
```

#### Clients
```prisma
model clients {
  id                 Int      @id @default(autoincrement())
  company_id         Int
  name               String   @db.VarChar(200)
  email              String   @db.VarChar(100)
  code               String?  @db.VarChar(50)
  vat_code           String?  @db.VarChar(50)
  role               ClientRole @default(CLIENT)
  is_active          Boolean  @default(true)
  created_by         Int
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
  
  // Relations
  company            companies @relation(fields: [company_id], references: [id], onDelete: Cascade)
  creator            users     @relation("ClientCreator", fields: [created_by], references: [id])
  
  @@unique([company_id, code])
  @@unique([company_id, vat_code])
}
```

### 3.3. Prisma Client

**Файл:** `src/lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

// Cache in both dev AND production (fixed from audit)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
```

**Особенности:**
- ✅ Singleton pattern
- ✅ Кэширование в `globalThis` (dev + production)
- ✅ Логирование запросов в development
- ✅ Автоматическое переподключение

---

## 4. API: Аутентификация

### 4.1. POST /api/auth/register

**Файл:** `src/app/api/auth/register/route.ts`

**Назначение:** Регистрация нового пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

**Логика:**
1. Проверяет, существует ли пользователь с таким `email`
2. Хэширует пароль через `bcryptjs.hash(password, 10)`
3. Создаёт запись в `users` таблице
4. Возвращает данные пользователя (без пароля)

**Error Handling:**
```typescript
// Email already exists
if (existing) {
  return NextResponse.json({ 
    error: 'User already exists' 
  }, { status: 400 })
}
```

---

### 4.2. POST /api/auth/login

**Файл:** `src/app/api/auth/login/route.ts`

**Назначение:** Вход пользователя в систему

**Request Body:**
```json
{
  "email": "solar@solar.com",
  "password": "pass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "solar@solar.com",
    "username": "solar"
  }
}
```

**Логика:**
1. Ищет пользователя по `email` в БД
2. Сравнивает пароль: `bcrypt.compare(password, user.password_hash)`
3. Генерирует JWT token:
   ```typescript
   const token = jwt.sign(
     { userId: user.id, email: user.email },
     JWT_SECRET,
     { expiresIn: '24h' }
   )
   ```
4. Устанавливает HTTP-only cookie:
   ```typescript
   response.cookies.set('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 86400 // 24 hours
   })
   ```
5. Возвращает `token` и `user`

**JWT Payload:**
```json
{
  "userId": 1,
  "email": "solar@solar.com",
  "iat": 1733515200,
  "exp": 1733601600
}
```

**JWT Secret:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 
  '7d5a2e3f4b1c9d8e0a6f5b2d1e4c3a9b8f7e6d5c4b3a2f1'
```

⚠️ **Security Note:** Fallback secret должен быть изменён в production!

---

## 5. API: Account / Companies

### 5.1. ⚠️ Критическая проблема: Hardcoded User ID

**Текущая реализация (НЕПРАВИЛЬНО):**
```typescript
export async function GET() {
  const userId = 1; // ← TODO: из JWT token
  
  const companies = await prisma.companies.findMany({
    where: {
      employees: { some: { user_id: userId } }
    }
  })
}
```

**Проблема:** Любой авторизованный пользователь получает компании userId=1

**Правильная реализация (TODO):**
```typescript
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

async function getUserIdFromToken(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    return decoded.userId
  } catch {
    return null
  }
}

export async function GET() {
  const userId = await getUserIdFromToken()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // ... rest of logic
}
```

---

### 5.2. GET /api/account/companies

**Файл:** `src/app/api/account/companies/route.ts`

**Назначение:** Получить список компаний текущего пользователя

**Response:**
```json
{
  "success": true,
  "companies": [
    {
      "id": 16,
      "code": "DEMO001",
      "name": "Solar Demo GmbH",
      "short_name": null,
      "description": "Demo company",
      "is_active": true,
      "owner_id": 1,
      "created_at": "2025-12-06T10:30:00.000Z",
      "updated_at": "2025-12-06T10:30:00.000Z"
    }
  ]
}
```

**Логика:**
```typescript
const companies = await prisma.companies.findMany({
  where: {
    employees: {  // ← Правильное название relation
      some: { user_id: userId }
    }
  },
  orderBy: { created_at: 'desc' }
})
```

**⚠️ Важно:** Используется `employees`, а не `users_companies` (см. audit)

---

### 5.3. POST /api/account/companies

**Request Body:**
```json
{
  "name": "New Company Ltd",
  "code": "NEWCO",
  "description": "New solar energy company",
  "industry": "RENEWABLE_ENERGY",
  "country": "DE"
}
```

**Response:**
```json
{
  "success": true,
  "company": {
    "id": 17,
    "code": "NEWCO",
    "name": "New Company Ltd",
    "owner_id": 1,
    "is_active": true,
    "created_at": "2025-12-06T12:00:00.000Z"
  }
}
```

**Логика:**
```typescript
const company = await prisma.companies.create({
  data: {
    name: body.name,
    code: body.code,
    description: body.description,
    legal_entity_type: body.industry || 'LLC',
    tax_country: body.country || 'UAE',
    director_name: 'Director',
    owner_id: userId,
    is_active: true,
    employees: {
      create: {
        user_id: userId,
        role: 'OWNER'
      }
    }
  }
})
```

**Error Handling - Unique Constraint:**
```typescript
catch (error: any) {
  if (error.code === 'P2002') {
    return NextResponse.json({ 
      success: false,
      error: 'Company code already exists. Please use a different code.' 
    }, { status: 400 })
  }
}
```

---

### 5.4. PUT /api/account/companies?id=[id]

**Request:**
```
PUT /api/account/companies?id=16
```

**Body:**
```json
{
  "name": "Updated Company Name",
  "code": "UPDATED",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "company": {
    "id": 16,
    "name": "Updated Company Name",
    "code": "UPDATED"
  }
}
```

---

### 5.5. DELETE /api/account/companies?id=[id]

**Request:**
```
DELETE /api/account/companies?id=16
```

**Response:**
```json
{
  "success": true
}
```

**Логика:**
```typescript
await prisma.companies.delete({
  where: { id: parseInt(id) }
})
```

**⚠️ Каскадное удаление:** Благодаря `onDelete: Cascade` в схеме:
- Удаляются все связанные `company_users`
- Удаляются все связанные `clients`
- Удаляются все связанные `products`, `sales`, `purchases`

---

### 5.6. GET /api/account/companies/stats

**Файл:** `src/app/api/account/companies/stats/route.ts`

**Назначение:** Получить статистику компаний

**Response:**
```json
{
  "totalCompanies": 5,
  "activeCompanies": 5
}
```

**Логика:**
```typescript
const companiesCount = await prisma.companies.count({
  where: {
    employees: {
      some: { user_id: userId }
    }
  }
})

return NextResponse.json({
  totalCompanies: companiesCount,
  activeCompanies: companiesCount
})
```

---

### 5.7. POST /api/account/switch-to-company

**Файл:** `src/app/api/account/switch-to-company/route.ts`

**Назначение:** Переключить текущую компанию пользователя

**Request Body:**
```json
{
  "companyId": 16
}
```

**Response:**
```json
{
  "success": true,
  "companyId": 16
}
```

**Логика:**
```typescript
export async function POST(request: NextRequest) {
  const { companyId } = await request.json()
  
  // TODO: Сохранить в users.current_company_id
  // Пока просто возвращаем успех
  
  return NextResponse.json({
    success: true,
    companyId: companyId
  })
}
```

**⚠️ TODO:** Реальное сохранение в БД не реализовано!

---

## 6. API: Company / Clients (НЕ РЕАЛИЗОВАНО)

### 6.1. Текущий статус

| Endpoint | Method | Status | File Path |
|----------|--------|--------|-----------|
| `/api/company/[companyId]/clients` | GET | ❌ Не существует | - |
| `/api/company/[companyId]/clients` | POST | ❌ Не существует | - |
| `/api/company/[companyId]/clients/[id]` | PUT | ❌ Не существует | - |
| `/api/company/[companyId]/clients/[id]` | DELETE | ❌ Не существует | - |

### 6.2. Требуемая структура

```
src/app/api/company/[companyId]/
└── clients/
    ├── route.ts                    ← GET, POST
    └── [clientId]/
        └── route.ts                ← PUT, DELETE
```

### 6.3. Планируемая реализация (v2.1.0)

**GET /api/company/[companyId]/clients:**
```typescript
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  const userId = await getUserIdFromToken()
  if (!userId) return unauthorizedResponse()
  
  const params = await context.params
  const companyId = parseInt(params.companyId)
  
  // Verify user has access to company
  const hasAccess = await verifyCompanyAccess(userId, companyId)
  if (!hasAccess) return forbiddenResponse()
  
  const clients = await prisma.clients.findMany({
    where: { company_id: companyId },
    orderBy: { created_at: 'desc' }
  })
  
  return NextResponse.json({ success: true, clients })
}
```

**POST /api/company/[companyId]/clients:**
```typescript
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  // 1. Verify authentication
  // 2. Verify company access
  // 3. Validate input (Zod)
  // 4. Create client
  // 5. Return created client
}
```

---

## 7. Middleware и защита API

### 7.1. Текущий Middleware

**Файл:** `src/middleware.ts`

**Логика:**
- ✅ Защищает UI routes (`/account/*`, `/company/*`)
- ✅ Редиректит неавторизованных на `/login`
- ✅ Редиректит авторизованных с `/login` на `/account/companies`
- ✅ **НЕ** блокирует `/api/*` routes

**Код:**
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/account') || 
      request.nextUrl.pathname.startsWith('/company')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users from auth pages
  if ((request.nextUrl.pathname.startsWith('/login') || 
       request.nextUrl.pathname.startsWith('/register')) && token) {
    return NextResponse.redirect(new URL('/account/companies', request.url))
  }

  return NextResponse.next()
}
```

### 7.2. API Routes Protection

**Проблема:** API routes не проверяют JWT автоматически

**Решение:** Каждый API route должен:
1. Извлечь token из cookies
2. Верифицировать JWT
3. Извлечь userId
4. Проверить права доступа

**Рекомендуемый helper:**
```typescript
// src/lib/auth.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function getUserIdFromToken(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    return decoded.userId
  } catch {
    return null
  }
}

export async function verifyCompanyAccess(
  userId: number, 
  companyId: number
): Promise<boolean> {
  const membership = await prisma.company_users.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
      is_active: true
    }
  })
  
  return !!membership
}
```

---

## 8. Environment Variables

### 8.1. Обязательные переменные

```bash
# Database Connection
DATABASE_URL=postgresql://solar_user:Pass123@207.154.220.86:5433/solar?schema=solar_schema

# JWT Authentication
JWT_SECRET=your-very-strong-secret-key-change-in-production

# Node Environment
NODE_ENV=production
```

### 8.2. Опциональные переменные

```bash
# Prisma
PRISMA_CLI_QUERY_ENGINE_TYPE=binary

# Next.js
NEXT_PUBLIC_API_URL=https://solar-erp.onrender.com

# Logging
LOG_LEVEL=error
```

### 8.3. Настройка на Render.com

**Path:** Dashboard → Environment → Environment Variables

```
DATABASE_URL: [Secret]
JWT_SECRET: [Secret]
NODE_ENV: production
```

**⚠️ Important:** Секреты должны быть помечены как "Secret" в Render!

---

## 9. Deployment на Render.com

### 9.1. Build Settings

**Build Command:**
```bash
npm install && npm run build
```

**В `package.json`:**
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

**Что происходит:**
1. `npm install` - устанавливает зависимости
2. `prisma generate` - генерирует Prisma Client
3. `next build` - строит Next.js production build

### 9.2. Start Command

```bash
npm start
```

**В `package.json`:**
```json
{
  "scripts": {
    "start": "next start"
  }
}
```

### 9.3. Environment

- **Node Version:** 20.18.0 (задаётся в Render settings)
- **Port:** Автоматически через `process.env.PORT`
- **Region:** Frankfurt (ближайший к DigitalOcean Frankfurt)

### 9.4. Database Connection

**DigitalOcean PostgreSQL:**
- Host: `207.154.220.86`
- Port: `5433`
- Database: `solar`
- Schema: `solar_schema`
- User: `solar_user`
- Password: `Pass123` (рекомендуется изменить!)

**Connection String:**
```
postgresql://solar_user:Pass123@207.154.220.86:5433/solar?schema=solar_schema
```

---

## 10. Error Handling & Logging

### 10.1. Текущий подход

**Console Logging:**
```typescript
try {
  // ... logic
} catch (error) {
  console.error('Error fetching companies:', error)
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

**Проблемы:**
- ❌ Нет структурированного логирования
- ❌ Разные форматы ошибок
- ❌ Нет трейсинга запросов

### 10.2. Рекомендации (v2.1.0)

**Добавить Winston:**
```bash
npm install winston
```

**Создать logger:**
```typescript
// src/lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

**Использование:**
```typescript
import { logger } from '@/lib/logger'

try {
  // ... logic
} catch (error) {
  logger.error('Failed to fetch companies', {
    userId,
    error: error.message,
    stack: error.stack
  })
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

---

## 11. Ограничения и TODO Backend

### 11.1. Критические ограничения

| Issue | Priority | Description | ETA |
|-------|----------|-------------|-----|
| Hardcoded userId | 🔴 CRITICAL | All API routes use `userId = 1` | v2.1.0 |
| Missing Clients API | 🔴 CRITICAL | No routes for `/api/company/[id]/clients` | v2.1.0 |
| No input validation | 🟡 MEDIUM | No Zod schemas for request bodies | v2.1.0 |
| No rate limiting | 🟡 MEDIUM | API open to brute force | v2.2.0 |

### 11.2. Security TODO

```typescript
// 1. Add Zod validation
import { z } from 'zod'

const CreateCompanySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().regex(/^[A-Z0-9_]+$/),
  description: z.string().optional()
})

// 2. Add rate limiting
import rateLimit from 'express-rate-limit'

// 3. Add CORS headers
// 4. Add CSRF protection
// 5. Add API key authentication for webhooks
```

### 11.3. Database TODO

```prisma
// 1. Add soft delete
model companies {
  deleted_at DateTime?
}

// 2. Add audit log
model audit_log {
  id         Int      @id @default(autoincrement())
  user_id    Int
  action     String
  entity     String
  entity_id  Int
  changes    Json
  created_at DateTime @default(now())
}

// 3. Add indexes for performance
@@index([deleted_at])
@@index([created_at])
```

---

## 12. Performance Considerations

### 12.1. Database Connection Pooling

**Prisma по умолчанию:**
- Connection pool size: `num_physical_cpus * 2 + 1`
- Connection timeout: 10s
- Pool timeout: 10s

**Настройка (если нужно):**
```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Custom pool settings
  connection_limit = 10
}
```

### 12.2. Query Optimization

**Используйте `select` для больших таблиц:**
```typescript
const companies = await prisma.companies.findMany({
  select: {
    id: true,
    name: true,
    code: true,
    is_active: true
  }
})
```

**Используйте `include` осторожно:**
```typescript
// ❌ Bad: загружает все clients
const company = await prisma.companies.findUnique({
  where: { id: companyId },
  include: { clients: true }
})

// ✅ Good: только count
const company = await prisma.companies.findUnique({
  where: { id: companyId },
  include: {
    _count: {
      select: { clients: true }
    }
  }
})
```

---

## 13. Итоги Backend-релиза v2.0.0

### ✅ Что работает:

1. **Полная миграция на Next.js API Routes**
   - ✅ Удалён Express backend
   - ✅ Удалён Proxy layer
   - ✅ Прямое подключение Prisma → PostgreSQL

2. **Аутентификация**
   - ✅ Регистрация пользователей (bcrypt hashing)
   - ✅ Login с JWT tokens
   - ✅ HTTP-only cookies
   - ✅ 24-hour token expiration

3. **Companies Management**
   - ✅ GET список компаний пользователя
   - ✅ POST создание компании
   - ✅ PUT обновление компании
   - ✅ DELETE удаление компании
   - ✅ Multi-tenant через `company_users`

4. **Production Deployment**
   - ✅ Render.com deployment
   - ✅ PostgreSQL на DigitalOcean
   - ✅ Рабочие API endpoints
   - ✅ HTTPS enabled

### ⚠️ Что требует исправления:

1. **JWT Authentication** (CRITICAL)
   ```typescript
   // ❌ Текущее:
   const userId = 1;
   
   // ✅ Нужно:
   const userId = await getUserIdFromToken();
   if (!userId) return unauthorizedResponse();
   ```

2. **Clients API** (CRITICAL)
   - Создать `/api/company/[companyId]/clients/route.ts`
   - Создать `/api/company/[companyId]/clients/[clientId]/route.ts`

3. **Input Validation** (MEDIUM)
   - Добавить Zod schemas
   - Валидировать все POST/PUT запросы

4. **Security Headers** (MEDIUM)
   - Add CORS configuration
   - Add rate limiting
   - Add CSRF protection

---

## 14. Roadmap

### v2.1.0 (Priority: CRITICAL)
- [ ] Fix hardcoded `userId = 1` in all API routes
- [ ] Create Clients API routes (GET, POST, PUT, DELETE)
- [ ] Add Zod validation schemas
- [ ] Create `src/lib/auth.ts` helper utilities

### v2.2.0 (Priority: MEDIUM)
- [ ] Add Products API routes
- [ ] Add Sales API routes
- [ ] Add Purchases API routes
- [ ] Add Warehouse API routes
- [ ] Add Banking API routes

### v2.3.0 (Priority: LOW)
- [ ] Add soft delete support
- [ ] Add audit logging
- [ ] Add structured logging (Winston)
- [ ] Add rate limiting
- [ ] Add API documentation (Swagger)

---

**Документация подготовлена:** 2025-12-06  
**Production URL:** https://solar-erp.onrender.com  
**Database:** PostgreSQL @ DigitalOcean Frankfurt  
**Следующий релиз:** v2.1.0 (JWT fixes + Clients API)
