# 🚀 Solar ERP Sprint 2 — Products Module + ID Visibility

## Архитектурная документация и руководство по установке

---

# 📐 ЧАСТЬ 0: ARCHITECTURE DECISION RECORD (ADR)

## ADR-001: Структура проекта Solar ERP

| Поле | Значение |
|------|----------|
| **Статус** | ✅ Принято |
| **Дата** | Декабрь 202 |
| **Авторы** | Leanid (Architect), Dashka (Senior), Claude (Engineer) |

### Контекст

Solar ERP — это multi-tenant ERP система. Нужно было решить:
1. Как организовать код (монолит vs микросервисы)?
2. Как доставлять обновления между спринтами?
3. Как структурировать файлы для понимания джуниорами?

### Решение

```
┌─────────────────────────────────────────────────────────────┐
│  Solar ERP = ЕДИНЫЙ Next.js 15 репозиторий                 │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐                        │
│  │  "Backend"  │    │ "Frontend"  │                        │
│  │  API Routes │    │   Pages     │                        │
│  │             │    │             │                        │
│  │ src/app/api │    │ src/app/    │                        │
│  │             │    │ (products)/ │                        │
│  └─────────────┘    └─────────────┘                        │
│         │                  │                                │
│         └────────┬─────────┘                                │
│                  │                                          │
│           Один npm run dev                                  │
│           Один npm run build                                │
│           Один деплой на Vercel                             │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые решения

| # | Вопрос | Решение |
|---|--------|---------|
| 1 | Отдельный backend сервер? | ❌ НЕТ. Используем Next.js API Routes |
| 2 | Express.js? | ❌ НЕТ. Только Next.js Route Handlers |
| 3 | Два репозитория? | ❌ НЕТ. Один репозиторий |
| 4 | Папки `backend/` `frontend/`? | ⚠️ Только для ДОСТАВКИ, не для runtime |

### Последствия

✅ **Плюсы:**
- Один деплой вместо двух
- Общие типы TypeScript
- Упрощённая аутентификация (cookies работают из коробки)
- Vercel оптимизирует автоматически

⚠️ **Что нужно понимать:**
- "Backend" и "Frontend" — это ЛОГИЧЕСКИЕ зоны, не физические сервисы
- Папки `backend/` и `frontend/` в delivery bundle — это ВРЕМЕННЫЕ файлы
- После установки весь код живёт в `src/app/`

---

# 📦 ЧАСТЬ 1: PROJECT STRUCTURE PHILOSOPHY

## 1.1 Что такое Solar ERP технически?

```
Solar ERP = Next.js 15 App Router + Prisma ORM + PostgreSQL
```

**Это НЕ:**
- ❌ Express.js backend + React frontend
- ❌ Микросервисная архитектура
- ❌ Монорепозиторий с несколькими packages
- ❌ Два отдельных проекта

**Это:**
- ✅ Один Next.js проект
- ✅ API Routes = "Backend"
- ✅ App Router Pages = "Frontend"
- ✅ Shared code в `src/lib/`

---

## 1.2 Почему мы говорим "backend" и "frontend"?

Для **ясности коммуникации** в команде:

| Термин | Что имеем в виду | Физическое расположение |
|--------|------------------|------------------------|
| "Backend" | API логика, база данных, авторизация | `src/app/api/**/*.ts` |
| "Frontend" | UI компоненты, страницы, формы | `src/app/(products)/**/*.tsx` |
| "Shared" | Утилиты, типы, Prisma client | `src/lib/**/*` |

⚠️ **Важно:** Это ЛОГИЧЕСКОЕ разделение для удобства разработки, а не физическое разделение на сервисы.

---

## 1.3 Что такое папки `backend/` и `frontend/` в Sprint delivery?

### ❓ Вопрос, который возникает у джуниоров:

> "Я вижу папку `backend/` в архиве Sprint 2. Это отдельный сервер? Мне его запускать отдельно?"

### ✅ Ответ:

**НЕТ.** Папки `backend/` и `frontend/` в Sprint delivery — это:

| Что это | Описание |
|---------|----------|
| 📦 **Delivery Bundle** | Пакет файлов для установки в проект |
| 🩹 **Patch Package** | Набор изменений для применения к существующему коду |
| 📚 **Reference Implementation** | Эталонная реализация для копирования |

### Жизненный цикл delivery файлов:

```
1. Получил архив Sprint 2
   └── backend/
   └── frontend/
   
2. Скопировал файлы в src/app/
   └── src/app/api/...      ← из backend/
   └── src/app/(products)/  ← из frontend/
   
3. УДАЛИЛ или АРХИВИРОВАЛ папки backend/ и frontend/
   └── Они больше не нужны!
   
4. Работаешь только с src/app/
```

### ⚠️ КРИТИЧНО:

```
После установки Sprint файлы backend/ и frontend/ 
НЕ ДОЛЖНЫ оставаться в рабочем репозитории!

Они существуют ТОЛЬКО для доставки кода.
```

---

# 🗂️ ЧАСТЬ 2: CANONICAL PATHS (Каноничные пути)

## 2.1 Куда что копировать

После установки Sprint 2 код должен находиться ТОЛЬКО здесь:

### Backend (API Routes)

| Логический путь в delivery | Реальный путь в проекте |
|---------------------------|------------------------|
| `backend/products/route.ts` | `src/app/api/company/[companyId]/products/route.ts` |
| `backend/products/[productId]/route.ts` | `src/app/api/company/[companyId]/products/[productId]/route.ts` |
| `backend/auth.ts` | `src/lib/auth.ts` |

### Frontend (Pages)

| Логический путь в delivery | Реальный путь в проекте |
|---------------------------|------------------------|
| `frontend/products/page.tsx` | `src/app/(products)/(dashboard)/company/[companyId]/products/page.tsx` |
| `frontend/account/companies-page.tsx` | `src/app/(products)/(dashboard)/account/companies/page.tsx` |
| `frontend/company/CompanyHeader.tsx` | `src/app/(products)/(dashboard)/company/[companyId]/CompanyHeader.tsx` |
| `frontend/company/dashboard-page.tsx` | `src/app/(products)/(dashboard)/company/[companyId]/dashboard/page.tsx` |

---

## 2.2 Структура проекта ПОСЛЕ установки Sprint 2

```
solar-erp-nextjs/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── account/
│   │   │   │   └── companies/route.ts
│   │   │   └── company/
│   │   │       └── [companyId]/
│   │   │           ├── clients/route.ts
│   │   │           └── products/           ← Sprint 2 NEW
│   │   │               ├── route.ts        ← Sprint 2 NEW
│   │   │               └── [productId]/    ← Sprint 2 NEW
│   │   │                   └── route.ts    ← Sprint 2 NEW
│   │   ├── (products)/
│   │   │   └── (dashboard)/
│   │   │       ├── account/
│   │   │       │   └── companies/
│   │   │       │       └── page.tsx        ← Sprint 2 UPDATED
│   │   │       └── company/
│   │   │           └── [companyId]/
│   │   │               ├── CompanyHeader.tsx   ← Sprint 2 UPDATED
│   │   │               ├── dashboard/
│   │   │               │   └── page.tsx        ← Sprint 2 UPDATED
│   │   │               ├── clients/
│   │   │               │   └── page.tsx
│   │   │               └── products/           ← Sprint 2 NEW
│   │   │                   └── page.tsx        ← Sprint 2 NEW
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── db.ts
│       └── auth.ts                             ← Sprint 2 NEW
├── package.json
├── next.config.js
└── tsconfig.json
```

**Обрати внимание:** Нет папок `backend/` или `frontend/` в финальной структуре!

---

# ⚠️ ЧАСТЬ 3: COMMON MISTAKES (Частые ошибки)

## ❌ Ошибка 1: Пытаться запустить backend отдельно

```bash
# НЕПРАВИЛЬНО ❌
cd backend
npm install
npm run start

# Ошибка: папка backend — это не отдельный проект!
```

**Правильно:**
```bash
# ПРАВИЛЬНО ✅
cd solar-erp-nextjs
npm run dev
# Запускается И backend (API) И frontend (Pages)
```

---

## ❌ Ошибка 2: Думать что backend это Express.js

```javascript
// НЕПРАВИЛЬНО ❌ — это НЕ Express.js
const express = require('express')
const app = express()
app.get('/api/products', ...)

// ПРАВИЛЬНО ✅ — это Next.js Route Handler
// Файл: src/app/api/company/[companyId]/products/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // ...
  return NextResponse.json({ products })
}
```

---

## ❌ Ошибка 3: Оставить delivery папки в репозитории

```bash
# НЕПРАВИЛЬНО ❌
git add .
git commit -m "Sprint 2"
# Коммитишь папки backend/ и frontend/ — они не нужны!

# ПРАВИЛЬНО ✅
# После копирования файлов — удали или добавь в .gitignore:
rm -rf backend/ frontend/
# ИЛИ
echo "backend/" >> .gitignore
echo "frontend/" >> .gitignore
```

---

## ❌ Ошибка 4: Неправильное расширение файла

```bash
# НЕПРАВИЛЬНО ❌
src/app/api/company/[companyId]/products/route.tsx  # .tsx для API

# ПРАВИЛЬНО ✅
src/app/api/company/[companyId]/products/route.ts   # .ts для API
src/app/(products)/.../products/page.tsx            # .tsx для Pages
```

**Правило:**
| Тип файла | Расширение |
|-----------|------------|
| API Route | `.ts` |
| Page/Component с JSX | `.tsx` |
| Utility/Helper | `.ts` |

---

## ❌ Ошибка 5: Забыть скобки в путях

```bash
# НЕПРАВИЛЬНО ❌
mkdir src/app/products/dashboard/company/companyId/products

# ПРАВИЛЬНО ✅
mkdir -p src/app/\(products\)/\(dashboard\)/company/\[companyId\]/products
```

**Почему скобки:**
- `(products)` — Route Group, не влияет на URL
- `[companyId]` — Dynamic Segment, становится параметром

---

# 📋 ЧАСТЬ 4: УСТАНОВКА SPRINT 2 (Пошагово)

## Шаг 1: Убедись что ты в корне проекта

```bash
cd /путь/к/solar-erp-nextjs
ls package.json  # Должен существовать
```

---

## Шаг 2: Создай папки для Products API

```bash
# Создаём структуру для API
mkdir -p src/app/api/company/\[companyId\]/products/\[productId\]
```

**Проверь:**
```bash
ls src/app/api/company/\[companyId\]/
# Должны быть: clients/ products/
```

---

## Шаг 3: Скопируй Backend файлы

```bash
# Products collection route
cp backend/products/route.ts \
   src/app/api/company/\[companyId\]/products/route.ts

# Product item route
cp backend/products/\[productId\]/route.ts \
   src/app/api/company/\[companyId\]/products/\[productId\]/route.ts

# Auth helper (если не существует)
cp backend/auth.ts src/lib/auth.ts
```

---

## Шаг 4: Создай папку для Products Page

```bash
mkdir -p src/app/\(products\)/\(dashboard\)/company/\[companyId\]/products
```

---

## Шаг 5: Скопируй Frontend файлы

```bash
# Products page
cp frontend/products/page.tsx \
   src/app/\(products\)/\(dashboard\)/company/\[companyId\]/products/page.tsx

# Companies page (обновлённая с ID visibility)
cp frontend/account/companies-page.tsx \
   src/app/\(products\)/\(dashboard\)/account/companies/page.tsx

# Company Header (обновлённый)
cp frontend/company/CompanyHeader.tsx \
   src/app/\(products\)/\(dashboard\)/company/\[companyId\]/CompanyHeader.tsx

# Dashboard (обновлённый)
cp frontend/company/dashboard-page.tsx \
   src/app/\(products\)/\(dashboard\)/company/\[companyId\]/dashboard/page.tsx
```

---

## Шаг 6: Проверь структуру

```bash
tree src/app/api/company/\[companyId\] -L 2
```

**Ожидаемый результат:**
```
src/app/api/company/[companyId]
├── clients
│   └── route.ts
└── products
    ├── route.ts
    └── [productId]
        └── route.ts
```

```bash
tree src/app/\(products\)/\(dashboard\)/company/\[companyId\] -L 2
```

**Ожидаемый результат:**
```
src/app/(products)/(dashboard)/company/[companyId]
├── CompanyHeader.tsx
├── clients
│   └── page.tsx
├── dashboard
│   └── page.tsx
└── products
    └── page.tsx
```

---

## Шаг 7: (Опционально) Добавь SKU в Prisma Schema

Открой `prisma/schema.prisma`, найди модель `products`:

```prisma
model products {
  id             Int              @id @default(autoincrement())
  company_id     Int
  code           String           @db.VarChar(50)
  name           String           @db.VarChar(255)
  description    String?
  sku            String?          @db.VarChar(100)  // ← ДОБАВЬ ЭТУ СТРОКУ
  unit           String           @db.VarChar(20)
  // ... остальные поля ...
}
```

Выполни миграцию:
```bash
npx prisma migrate dev --name add_sku_to_products
npx prisma generate
```

---

## Шаг 8: Удали delivery папки

```bash
# Удаляем временные папки
rm -rf backend/ frontend/

# ИЛИ добавляем в gitignore
echo "backend/" >> .gitignore
echo "frontend/" >> .gitignore
```

---

## Шаг 9: Build и проверка

```bash
npm run build
```

**Ожидаемый результат:** Сборка без ошибок.

---

## Шаг 10: Локальный тест

```bash
npm run dev
```

1. Открой `http://localhost:3000`
2. Залогинься (solar@solar.com / pass123)
3. Выбери компанию
4. Перейди в Products
5. Создай тестовый продукт
6. Проверь что ID отображается в первом столбце

---

## Шаг 11: Деплой

```bash
git add .
git commit -m "feat: Sprint 2 - Products module + ID visibility"
git push origin main
```

Vercel автоматически задеплоит.

---

# ✅ ЧАСТЬ 5: ACCEPTANCE CHECKLIST

## API Endpoints
- [ ] `GET /api/company/[id]/products` возвращает список
- [ ] `POST /api/company/[id]/products` создаёт продукт
- [ ] `GET /api/company/[id]/products/[productId]` возвращает продукт
- [ ] `PUT /api/company/[id]/products/[productId]` обновляет
- [ ] `DELETE /api/company/[id]/products/[productId]` удаляет

## Frontend
- [ ] Products page загружается
- [ ] ID отображается первым столбцом
- [ ] CRUD операции работают
- [ ] Copy функция создаёт копию
- [ ] Фильтры по столбцам работают

## ID Visibility
- [ ] Company ID в карточке компании
- [ ] Company ID в header
- [ ] Client ID в таблице клиентов
- [ ] Product ID в таблице продуктов
- [ ] Company ID в Dashboard info card

## Clean Structure
- [ ] Нет папки `backend/` в репозитории
- [ ] Нет папки `frontend/` в репозитории
- [ ] Все файлы в `src/app/`

---

# 🔧 ЧАСТЬ 6: API REFERENCE

## Products Collection

### GET /api/company/{companyId}/products

Возвращает список всех продуктов компании.

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "code": "PRD-16-001",
      "name": "Solar Panel 400W",
      "price": "450.00",
      "current_stock": "100.00",
      "is_active": true
    }
  ]
}
```

### POST /api/company/{companyId}/products

Создаёт новый продукт.

**Request Body:**
```json
{
  "name": "Solar Panel 400W",
  "code": "SP-400",
  "unit": "pcs",
  "price": 450,
  "cost_price": 300,
  "currency": "EUR",
  "vat_rate": 19,
  "category": "Solar Panels",
  "min_stock": 10,
  "current_stock": 0,
  "is_active": true,
  "is_service": false
}
```

## Product Item

### GET /api/company/{companyId}/products/{productId}

Возвращает один продукт по ID.

### PUT /api/company/{companyId}/products/{productId}

Обновляет продукт.

### DELETE /api/company/{companyId}/products/{productId}

Удаляет продукт.

---

# 📚 ЧАСТЬ 7: GLOSSARY (Глоссарий)

| Термин | Определение |
|--------|-------------|
| **Route Handler** | Next.js функция в `route.ts` файле, обрабатывающая HTTP запросы |
| **App Router** | Система маршрутизации Next.js 13+ на основе файловой структуры |
| **Route Group** | Папка в скобках `(name)` — группирует routes без влияния на URL |
| **Dynamic Segment** | Папка в квадратных скобках `[param]` — становится параметром URL |
| **Delivery Bundle** | Пакет файлов Sprint для установки в проект |
| **Canonical Path** | Правильный финальный путь файла в проекте |

---

# 🎯 ЧАСТЬ 8: STANDARDS FOR FUTURE SPRINTS

## Паттерн доставки Sprint файлов

Начиная со Sprint 2, все спринты используют единый паттерн:

```
sprint-N-delivery/
├── backend/           # Файлы для src/app/api/
├── frontend/          # Файлы для src/app/(products)/
├── shared/            # Файлы для src/lib/
├── prisma/            # Изменения в schema (если есть)
└── README.md          # Инструкция по установке
```

**Правила:**
1. Delivery папки — ВРЕМЕННЫЕ
2. После установки — удалить или gitignore
3. Финальный код ВСЕГДА в `src/app/`
4. README обязателен для каждого Sprint

---

**Version:** Sprint 2.1.0  
**Architecture:** Next.js 15 Unified  
**Last Updated:** December 2024  
**Team:** Leanid (Architect), Dashka (Senior), Claude (Engineer)

*"Космический корабль с заправленными баками!"* 🚀
