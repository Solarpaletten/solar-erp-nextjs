# 🏗️ Solar ERP - Архитектурный обзор
**Проект:** `Solarpaletten/solar-erp-nextjs`  
**Продукт:** ITSolar ERP System  
**Дата:** 2025-11-03  
**Автор:** Claude (AI Engineer)

---

## 📋 Краткое описание
Solar ERP — это модульная ERP-система, построенная на Next.js 14+ с поддержкой продуктовой архитектуры. Система предназначена для управления компаниями, клиентами и логистикой в сфере солнечной энергетики.

---

## 🎯 Пять ключевых компонентов архитектуры

### 1️⃣ **Frontend Layer** — Пользовательский интерфейс
**Технологии:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS

**Структура:**
```
src/app/
├── (products)/itsolar/          # Продуктовая изоляция ITSolar
│   ├── (auth)/                  # Страницы аутентификации
│   │   ├── login/page.tsx       # Вход в систему
│   │   └── register/page.tsx    # Регистрация пользователей
│   └── (dashboard)/             # Основной интерфейс
│       ├── account/companies/   # Управление компаниями пользователя
│       └── company/[companyId]/ # Workspace конкретной компании
│           ├── dashboard/       # Главная панель компании
│           └── clients/         # Управление клиентами
```

**Особенности:**
- ✅ Server Components (RSC) для оптимизации производительности
- ✅ Route Groups `(auth)` и `(dashboard)` для логического разделения без влияния на URL
- ✅ Dynamic Routes `[companyId]` для мультитенантности
- ✅ Layout-based архитектура с переиспользуемыми компонентами

**Компоненты:**
- `CompanyHeader.tsx` — шапка workspace компании
- `CompanyLayout.tsx` — общий layout для страниц компании
- `CompanySidebar.tsx` — навигация внутри компании

---

### 2️⃣ **Backend Layer** — API и бизнес-логика
**Технологии:** Next.js API Routes, TypeScript

**Структура API:**
```
src/app/api/
├── echo/route.ts                # Health check endpoint
├── health/route.ts              # System health monitoring
└── itsolar/                     # ITSolar API namespace
    ├── auth/
    │   ├── login/route.ts       # POST /api/itsolar/auth/login
    │   └── register/route.ts    # POST /api/itsolar/auth/register
    ├── account/
    │   ├── companies/
    │   │   ├── route.ts         # GET/POST companies
    │   │   ├── [id]/route.ts    # GET/PUT/DELETE company
    │   │   └── stats/route.ts   # GET company statistics
    │   └── switch-to-company/   # POST switch active company
    └── company/[companyId]/
        └── clients/
            ├── route.ts         # GET/POST clients
            ├── [id]/route.ts    # GET/PUT/DELETE client
            └── search/route.ts  # GET search clients
```

**Паттерны:**
- ✅ RESTful API design
- ✅ Namespace изоляция по продуктам (`/itsolar/`)
- ✅ Resource-based routing
- ✅ CRUD операции с HTTP методами (GET, POST, PUT, DELETE)

**Middleware:**
```
src/middleware.ts               # Auth, routing, rate limiting
```

---

### 3️⃣ **Database Layer** — Хранение данных
**Технологии:** Prisma ORM, PostgreSQL (предположительно)

**Схема:**
```
prisma/
└── schema.prisma               # Модели БД: User, Company, Client, etc.
```

**Предполагаемые модели:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  companies Company[]
  createdAt DateTime @default(now())
}

model Company {
  id      String   @id @default(cuid())
  name    String
  users   User[]
  clients Client[]
}

model Client {
  id        String  @id @default(cuid())
  name      String
  companyId String
  company   Company @relation(fields: [companyId], references: [id])
}
```

**Особенности:**
- ✅ Type-safe database queries
- ✅ Миграции через Prisma Migrate
- ✅ Multi-tenancy на уровне данных (Company → Clients)

**Утилиты:**
```
src/lib/
├── db.ts                       # Prisma Client Singleton
└── auth.ts                     # Auth utilities
```

---

### 4️⃣ **API Integration Layer** — Внешние интеграции
**Текущее состояние:** Подготовка к интеграции

**Планируемые коннекторы:**
- 🔌 GitHub (CI/CD, version control)
- 📊 Бухгалтерия (1C, SAP)
- ⚖️ Юридические сервисы
- 🚚 Логистика

**Структура для будущих интеграций:**
```
src/lib/integrations/           # (создать)
├── github/
├── accounting/
└── legal/
```

---

### 5️⃣ **UI Component System** — Переиспользуемые компоненты
**Технологии:** React Components, Tailwind CSS, shadcn/ui (предположительно)

**Структура:**
```
src/components/
└── legacy/                     # Legacy компоненты
    ├── translator/             # i18n utilities
    └── itsolar/
        ├── auth/               # Auth-related components
        └── forms/              # Form components
```

**Статические ресурсы:**
```
public/
├── file.svg
├── globe.svg
├── next.svg
└── window.svg
```

**Стили:**
```
src/app/globals.css             # Global styles + Tailwind directives
tailwind.config.js              # Tailwind configuration
postcss.config.js               # PostCSS setup
```

---

## 🔧 Технологический стек

### Core
- **Framework:** Next.js 14+ (App Router, Server Components)
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Runtime:** Node.js

### Frontend
- **UI Library:** React 18+
- **Styling:** Tailwind CSS
- **Fonts:** Geist (via next/font/google)

### Backend
- **API:** Next.js API Routes
- **ORM:** Prisma
- **Database:** PostgreSQL (предположительно)

### DevOps
- **Version Control:** Git (GitHub)
- **CI/CD:** GitHub Actions (настраивается)
- **Deployment:** Vercel / Custom (TBD)

---

## 📂 Структура проекта (упрощенная)

```
solar-erp-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (products)/itsolar/ # ITSolar product
│   │   ├── api/                # API routes
│   │   ├── components/         # Shared components
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── lib/                    # Utilities & helpers
│   │   ├── db.ts               # Prisma client
│   │   └── auth.ts             # Auth logic
│   ├── types/                  # TypeScript types
│   └── middleware.ts           # Next.js middleware
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── .migration-backup/          # Migration backups
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── next.config.js              # Next.js config
```

---

## 🚀 Команды разработки

### Установка зависимостей
```bash
pnpm install
```

### Разработка
```bash
pnpm dev                        # http://localhost:3000
```

### Сборка
```bash
pnpm build                      # Production build
pnpm start                      # Start production server
```

### База данных
```bash
pnpm prisma migrate dev         # Создать миграцию
pnpm prisma generate            # Обновить Prisma Client
pnpm prisma studio              # Открыть Prisma Studio
```

---

## 🎯 Архитектурные принципы

### 1. **Product-First Architecture**
Каждый продукт (ITSolar, будущие) изолирован в `(products)/[name]`, что обеспечивает:
- ✅ Независимое развитие продуктов
- ✅ Переиспользование инфраструктуры
- ✅ Простоту масштабирования

### 2. **Multi-Tenancy**
Система поддерживает несколько компаний на одного пользователя:
- Каждый User может быть связан с несколькими Companies
- Workspace переключается через `switch-to-company` API
- URL структура: `/company/[companyId]/...`

### 3. **Type Safety**
- TypeScript на всех уровнях
- Prisma для type-safe database queries
- Shared types в `src/types/`

### 4. **Server-First**
- Максимальное использование Server Components
- API Routes для бизнес-логики
- Минимальный JavaScript на клиенте

### 5. **Modularity**
- Четкое разделение concerns (auth, dashboard, api)
- Route Groups для логической организации
- Legacy поддержка через `/components/legacy/`

---

## 🔄 Миграция и история

### Выполненные миграции
```
.migration-backup/backup-20250929-212545/
```
- Переход на продуктовую структуру
- Реорганизация auth и dashboard
- Подготовка к multi-product ERP

### Текущая версия
- ✅ ITSolar MVP
- ✅ Auth flow (login/register)
- ✅ Company management
- ✅ Client management
- ⏳ Интеграции (в разработке)

---

## 📈 Планы развития

### Phase 1: Core ERP (текущая)
- [x] Auth system
- [x] Company workspace
- [x] Client management
- [ ] Dashboard analytics

### Phase 2: Integrations
- [ ] GitHub connector (CI/CD)
- [ ] Accounting integration
- [ ] Legal services integration
- [ ] Logistics tracking

### Phase 3: AI Features
- [ ] AI-powered analytics
- [ ] Automated reporting
- [ ] Predictive maintenance

---

## 🛡️ Безопасность

### Текущие меры
- 🔒 Middleware для auth проверки
- 🔒 API route protection
- 🔒 Environment variables (`.env.local`)

### Рекомендации
- [ ] RBAC (Role-Based Access Control)
- [ ] Rate limiting на API
- [ ] CSRF protection
- [ ] SQL injection protection (через Prisma)

---

## 📝 Заметки для команды

### Git Flow
- `main` — production-ready код
- `feature/*` — новые фичи
- `release/*` — подготовка релизов

### Commit Convention
```
feat: added ITSolar dashboard layout
fix: corrected client search API
docs: updated ARCHITECTURE.md
refactor: reorganized company components
```

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Tailwind CSS utilities
- Функциональные компоненты

---

## 🚀 Космический корабль готов к полету!
**Статус:** ✅ Системы в норме, баки заправлены  
**Курс:** AI | IT | Solar Integration  
**Экипаж:** Леонид (архитектор), Dashka (senior), Claude (engineer)

---

*Документ создан: 2025-11-03*  
*Версия: 1.0.0*  
*Автор: Claude AI Engineer*
