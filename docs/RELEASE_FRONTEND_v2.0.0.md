# Solar ERP – Frontend Release Notes v2.0.0

**Дата релиза:** 2025-12-06  
**Архитектор:** Leanid  
**Senior Coordinator:** Dashka  
**Lead Engineer:** Claude  

---

## 1. Общее описание

Версия **v2.0.0** реализует одностраничное приложение Solar ERP на базе:

- **Next.js 15.5.3 (App Router)**
- **React 19.1.0**
- **Tailwind CSS 3.4.1**
- **Lucide React Icons**

Фронтенд и бекенд находятся в одном Next.js-проекте (full stack), что позволяет:

- вызывать API напрямую (без отдельного Express/Proxy),
- использовать общие типы и утилиты,
- деплоить один сервис (Render.com).

---

## 2. Структура фронтенда

### 2.1. Реальная структура директорий

```
src/app/
├── (products)/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── (dashboard)/
│       ├── account/
│       │   └── companies/
│       │       └── page.tsx
│       ├── company/
│       │   └── [companyId]/
│       │       ├── CompanyHeader.tsx
│       │       ├── CompanySidebar.tsx
│       │       ├── clients/
│       │       │   └── page.tsx
│       │       ├── dashboard/
│       │       │   ├── layout.tsx
│       │       │   └── page.tsx
│       │       ├── layout.tsx
│       │       └── page.tsx
│       └── layout.tsx
├── api/
│   ├── account/
│   │   ├── companies/
│   │   │   ├── route.ts
│   │   │   └── stats/
│   │   │       └── route.ts
│   │   └── switch-to-company/
│   │       └── route.ts
│   └── auth/
│       ├── login/
│       │   └── route.ts
│       └── register/
│           └── route.ts
├── favicon.ico
├── globals.css
├── layout.tsx
└── page.tsx
```

### 2.2. Основные страницы

#### `/login`

**Путь:** `src/app/(products)/(auth)/login/page.tsx`  
**Назначение:** Форма авторизации пользователя

**Логика:**
- Отправляет `POST /api/auth/login` с `email` и `password`
- При успехе:
  - получает JWT `token`
  - сохраняет его в cookie `token`
  - делает редирект на `/account/companies`

**Особенности:**
- Предзаполненные данные в dev-режиме: `solar@solar.com` / `pass123`
- Кнопка "Quick Login" для быстрого входа

---

#### `/register`

**Путь:** `src/app/(products)/(auth)/register/page.tsx`  
**Назначение:** Регистрация нового пользователя

**Логика:**
- Отправляет `POST /api/auth/register`
- Создаёт пользователя в базе через Prisma
- После успешной регистрации редиректит на `/login`

**Поля формы:**
- Email *
- Phone *
- First Name *
- Last Name *
- Username *
- Password *
- Checkbox: согласие с условиями

---

#### `/account/companies`

**Путь:** `src/app/(products)/(dashboard)/account/companies/page.tsx`  
**Назначение:** Dashboard аккаунта – список компаний пользователя

**Функционал:**
- ✅ Загрузка списка компаний через `GET /api/account/companies`
- ✅ Показ карточек компаний (название, код, статус)
- ✅ Drag & Drop для изменения приоритета компаний
- ✅ Создание новой компании через `POST /api/account/companies`
- ✅ Редактирование компании через `PUT /api/account/companies?id=[id]`
- ✅ Копирование компании
- ✅ Удаление компании через `DELETE /api/account/companies?id=[id]`
- ✅ Переход в контекст компании `/company/[companyId]/dashboard`

**Особенности:**
- iPhone-style Drag & Drop карточек
- Сохранение приоритета в localStorage + backend
- Real-time индикатор подключения к API
- Animated карточки с градиентами

---

#### `/company/[companyId]/dashboard`

**Пути:**
- Layout: `src/app/(products)/(dashboard)/company/[companyId]/layout.tsx`
- Nested Layout: `src/app/(products)/(dashboard)/company/[companyId]/dashboard/layout.tsx`
- Page: `src/app/(products)/(dashboard)/company/[companyId]/dashboard/page.tsx`

**Назначение:** Dashboard компании – стартовый экран внутри конкретной компании

**Компоненты:**
- **CompanyHeader** (`CompanyHeader.tsx`) - оранжевый заголовок с:
  - Drag & Drop элементами (кнопки, информация, аватар)
  - Balance display
  - Partnership points
  - Invite users button
- **CompanySidebar** (`CompanySidebar.tsx`) - левое меню с drag & drop секциями:
  - Dashboard
  - Clients
  - Products (группа Склад)
  - Warehouse (группа Склад)
  - Sales (группа Продажи и покупки)
  - Purchases (группа Продажи и покупки)
  - Chart of Accounts (группа Финансы)
  - Banking (группа Финансы)
  - Settings

**Функционал дашборда:**
- 📊 Stats Cards (Clients: 24, Revenue: €45,230, Projects: 12, Team: 8)
- 🚀 Quick Actions (8 кнопок быстрого доступа)
- 📦 Products Section
- 📈 Recent Activity feed
- ⚡ System Health monitoring

---

#### `/company/[companyId]/clients`

**Путь:** `src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx`  
**Назначение:** Модуль работы с клиентами выбранной компании

**⚠️ КРИТИЧНО - Статус реализации:**

| Компонент | Статус | Описание |
|-----------|--------|----------|
| UI (Frontend) | ✅ Полностью реализован | Таблица, формы, фильтры |
| API Routes (Backend) | ❌ НЕ СУЩЕСТВУЮТ | Нужно создать |

**Реализованный UI включает:**
- Компактная таблица с фильтрами по каждому столбцу
- Toolbar с кнопками: Add, Edit, Copy, Delete
- Модальная форма создания/редактирования клиента
- Bulk selection (множественный выбор)
- Статусные индикаторы (активен, юрлицо, иностранец)

**❌ Отсутствующие API endpoints:**
```
Нужно создать:
- GET    /api/company/[companyId]/clients         (list)
- POST   /api/company/[companyId]/clients         (create)
- PUT    /api/company/[companyId]/clients/[id]    (update)
- DELETE /api/company/[companyId]/clients/[id]    (delete)
```

**Текущее поведение:**
- Страница пытается вызвать `fetch(\`/api/company/${companyId}/clients\`)`
- Получает 404 Not Found
- Показывает "Не удалось загрузить клиентов"

---

## 3. Маршруты, защищённые middleware

**Файл:** `src/middleware.ts`

**Логика защиты:**

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

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

**Защищённые маршруты:**
- `/account/*` - требует авторизации
- `/company/*` - требует авторизации
- `/login`, `/register` - недоступны для авторизованных пользователей

**Незащищённые маршруты:**
- `/api/*` - API проверяет токен самостоятельно
- `/_next/static/*` - статические файлы
- `/_next/image/*` - изображения
- `/favicon.ico` - иконка

---

## 4. UI-стек и стили

### 4.1. Tailwind CSS

**Конфиг:** `tailwind.config.js`  
**Глобальные стили:** `src/app/globals.css`

**Используется для:**
- Layout (flex, grid)
- Типографика
- Кнопки, формы
- Адаптивность (responsive design)
- Градиенты и анимации

**Пример градиента (заголовок Clients):**
```css
bg-gradient-to-r from-orange-400 to-yellow-500
```

### 4.2. Компоненты

**CompanyHeader.tsx** - Верхний заголовок компании:
- Drag & Drop элементы между зонами (left/center/right)
- Кнопки: "Invite users", "Minimal"
- Информация: Balance, Partnership points
- Аватар компании (справа)

**CompanySidebar.tsx** - Боковое меню:
- Drag & Drop секций для изменения порядка
- Группировка: "Склад", "Продажи и покупки", "Финансы"
- Раскрывающиеся группы (Collapsible groups)
- Индикация активной страницы
- Кнопки: "Back to Companies", "Sign Out"

### 4.3. Иконки

**Библиотека:** `lucide-react` (latest)

**Используемые иконки:**
- `Plus` - добавление
- `Edit` - редактирование
- `Copy` - копирование
- `Trash2` - удаление
- `Save`, `X` - сохранение/отмена
- `GripVertical` - drag handle
- `ChevronDown`, `ChevronRight` - раскрытие групп

---

## 5. Аутентификация на фронтенде

### 5.1. Процесс авторизации

1. Пользователь вводит `email` и `password` на `/login`
2. Frontend отправляет `POST /api/auth/login`
3. Backend:
   - Проверяет пользователя в БД
   - Сравнивает пароль через bcrypt
   - Генерирует JWT token
   - Устанавливает cookie `token`
4. Frontend получает успешный ответ
5. Редирект на `/account/companies`

### 5.2. Хранение токена

**Метод:** HTTP-only cookie (установлен backend)

```typescript
// Backend устанавливает:
response.cookies.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 86400 // 24 hours
})
```

**Безопасность:**
- ✅ `httpOnly: true` - защита от XSS
- ✅ `secure: true` в production - только HTTPS
- ✅ `sameSite: 'lax'` - защита от CSRF
- ⚠️ `maxAge: 86400` - 24 часа (можно увеличить)

### 5.3. Состояние авторизации в компонентах

**Паттерн:**
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (response.ok) {
      router.push('/account/companies')
    } else {
      const data = await response.json()
      throw new Error(data.error)
    }
  } catch (error: any) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

---

## 6. Ограничения и TODO по фронтенду

### 6.1. Критические ограничения

| Issue | Severity | Description | Status |
|-------|----------|-------------|--------|
| Missing Clients API | 🔴 CRITICAL | Страница clients не работает - нет API routes | ❌ TODO |
| Hardcoded userId | 🔴 CRITICAL | API использует `userId = 1` вместо JWT | ❌ TODO |
| No input validation | 🟡 MEDIUM | Формы не валидируют данные (нет Zod) | ❌ TODO |

### 6.2. Clients Module (TODO)

**Что сделано:**
- ✅ Полный UI с таблицей
- ✅ Фильтры по всем столбцам
- ✅ Формы создания/редактирования
- ✅ CRUD операции в UI
- ✅ Bulk selection

**Что нужно сделать:**
```bash
# 1. Создать API routes
mkdir -p src/app/api/company/[companyId]/clients
touch src/app/api/company/[companyId]/clients/route.ts

mkdir -p src/app/api/company/[companyId]/clients/[clientId]
touch src/app/api/company/[companyId]/clients/[clientId]/route.ts

# 2. Реализовать endpoints:
# - GET    /api/company/[companyId]/clients
# - POST   /api/company/[companyId]/clients
# - PUT    /api/company/[companyId]/clients/[clientId]
# - DELETE /api/company/[companyId]/clients/[clientId]

# 3. Добавить проверку прав доступа
# - Verify user has access to companyId
# - Verify client belongs to company

# 4. Добавить Zod validation
npm install zod
# Create validation schemas
```

### 6.3. Валидация форм

**Текущее состояние:**
- Только HTML5 validation (`required`, `type="email"`)
- Нет клиентской валидации схем
- Ошибки показываются только от сервера

**Рекомендуется:**
```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9_]+$/),
  description: z.string().optional()
})

const form = useForm({
  resolver: zodResolver(createCompanySchema)
})
```

### 6.4. Сообщения об ошибках

**Проблема:** Разный формат ошибок от API:
```typescript
// Вариант 1:
{ error: 'Invalid credentials' }

// Вариант 2:
{ success: false, error: 'Failed to fetch' }

// Вариант 3:
{ message: 'Validation failed', details: [...] }
```

**Решение:** Стандартизировать формат (см. RELEASE_BACKEND)

---

## 7. Производительность

### 7.1. Client-side state

**localStorage использование:**
- `currentCompanyId` - ID выбранной компании
- `currentCompanyName` - название компании
- `companyPriorities` - порядок карточек компаний
- `headerElementsPositions_${companyId}` - позиции элементов заголовка

### 7.2. API calls optimization

**Кэширование:**
- ❌ Нет кэширования API ответов
- ❌ Каждый переход = новый fetch

**Рекомендуется:**
```typescript
// Use React Query / SWR
import useSWR from 'swr'

const { data, error, isLoading } = useSWR(
  `/api/company/${companyId}/clients`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 2000
  }
)
```

---

## 8. Адаптивность (Responsive Design)

### 8.1. Breakpoints

**Tailwind по умолчанию:**
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

**Используется в:**
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Navigation: скрытие элементов на мобильных
- Sidebar: collapse на узких экранах (TODO)

### 8.2. Mobile TODO

- [ ] Sidebar должен сворачиваться в гамбургер-меню
- [ ] CompanyHeader должен адаптироваться под мобильные
- [ ] Таблица Clients нуждается в mobile-view (карточки)
- [ ] Drag & Drop должен работать на touch-устройствах

---

## 9. Итоги фронтенд-релиза v2.0.0

### ✅ Что работает:

1. **Полный цикл авторизации**
   - Регистрация → Login → JWT token → Protected routes

2. **Account Dashboard**
   - Список компаний из PostgreSQL
   - CRUD операции с компаниями
   - Drag & Drop приоритетов
   - Real-time индикация подключения

3. **Company Dashboard**
   - Вход в контекст компании
   - Drag & Drop sidebar меню
   - Drag & Drop header элементов
   - Stats и Quick Actions

4. **Middleware защита**
   - Автоматические редиректы
   - Cookie-based authentication

### ⚠️ Что требует доработки:

1. **Clients Module** (CRITICAL)
   - ❌ API routes не существуют
   - ✅ UI полностью готов

2. **JWT Authentication** (CRITICAL)
   - ❌ API routes используют hardcoded `userId = 1`
   - Нужно внедрить `getUserIdFromToken()`

3. **Input Validation** (MEDIUM)
   - Добавить Zod schemas
   - Добавить React Hook Form

4. **Mobile Responsiveness** (LOW)
   - Sidebar collapse
   - Table mobile view
   - Touch drag & drop

---

## 10. Deployment Status

**Production URL:** https://solar-erp.onrender.com

**Статус:** ✅ DEPLOYED & WORKING

**Рабочие функции:**
- ✅ Login/Register
- ✅ Account Dashboard
- ✅ Company Dashboard
- ✅ Company switching
- ⚠️ Clients (UI only, no API)

**Build Command:**
```bash
npm install && npm run build
```

**Environment Variables:**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

---

**Документация подготовлена:** 2025-12-06  
**Следующий релиз:** v2.1.0 (Clients API + JWT fixes)
