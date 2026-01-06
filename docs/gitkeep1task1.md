D=>C (Dashka=>Claude)
ТЗ: Внедрение и фиксация архитектуры SolarNetJS Template (Next.js 14 App Router, без src/)

🎯 Цель

Принять, зафиксировать и довести до эталона нашу собственную архитектуру SolarNetJS Template как базовый шаблон для всех продуктов Solar (ERP, Maps, Legal, AI). Архитектура без src/, с чётким разделением app / api / components / hooks / lib / config / docs / types.

🧱 Исходная структура (эталон)

Ориентируйся строго на текущий tree (см. репозиторий solar-nextjs-template). Ключевые принципы:

App Router (app/)

API routes в app/api/**/route.ts

Динамические сегменты через скобки: [id], [companyId]

Чистые слои: UI ≠ hooks ≠ lib ≠ config

Без src/ — корень проекта = рабочая область

📐 Архитектурные правила (обязательные)

app/

page.tsx — только композиция, без логики

layout.tsx — глобальный layout

listings/page.tsx — страница списка (server-first)

api/**/route.ts — только transport + validation (zod)

components/

map/* — только Mapbox/UI (без fetch)

listings/* — карточки, списки

sidebar/*, mobile/*, ui/* — чистые UI-компоненты

Запрещено: бизнес-логика, прямые обращения к БД

hooks/

useClusters.ts, useMapbox.ts

Только orchestration (state, effects), без вычислительной логики

lib/

Вся бизнес-логика:

clustering.ts

pricing.ts

segmentation.ts

geo.ts

db.ts

Эти функции используются и API, и hooks

config/

Только статические данные/коэффициенты

Никакой логики

types/

Общие типы для API / Map / Domain

Не дублировать типы в components

docs/

ARCHITECTURE.md — описание слоёв и принципов

API.md — endpoints + contracts

🧪 Что нужно сделать (по шагам)
1️⃣ Архитектурный аудит

Проверить: нет ли логики не в своём слое

Проверить: API → lib → hooks → components (строгая иерархия)

Проверить: нет ли src/, alias-ов на @/src

2️⃣ Фиксация шаблона

Обновить docs/ARCHITECTURE.md:

описать SolarNetJS Template

указать, что это базовый шаблон Solar

явно зафиксировать правило NO src/

3️⃣ Унификация API

Все route.ts:

вход → zod

вызов lib/*

возврат typed JSON

Никаких вычислений внутри route

4️⃣ Проверка DX

pnpm dev — без warning/error

pnpm build — без ошибок

Чёткая читаемость структуры для джуниора за 5 минут

✅ Критерии приёмки

Архитектура соответствует tree и правилам выше

Документация обновлена

Нет лишних слоёв / дублирования

Проект можно копировать как Solar Template для нового продукта

Готово к масштабированию под ERP / Legal / AI

📦 Формат результата (обязательно)

C=>D ответить с:

Кратким отчётом (что проверил, что поправил)

Изменёнными файлами (если были)

Подтверждением:
“SolarNetJS Template принят как эталон”

Мы это строили 3–3,5 года.
Это высший пилотаж.
Делаем аккуратно, без суеты, как основу всей экосистемы Solar. 🚀

leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % tree
.
├── CHANGELOG.md
├── README.md
├── docs
│   ├── gitkeep1task1.md
│   └── gitreport1task1.md
├── new structura
│   ├── files
│   │   ├── ARCHITECTURE.md
│   │   ├── INSTALL.md
│   │   ├── mnt
│   │   │   └── user-data
│   │   │       └── outputs
│   │   │           └── solarnetjs-v2
│   │   │               └── app
│   │   │                   └── company
│   │   │                       └── [companyId]
│   │   │                           └── clients
│   │   │                               ├── [clientId]
│   │   │                               │   └── edit
│   │   │                               │       └── page1.tsx
│   │   │                               └── new
│   │   │                                   └── page2.tsx
│   │   └── page.tsx
│   └── files.zip
├── next-env.d.ts
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── prisma
│   ├── migrations
│   │   ├── 20251103123609_init
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── (products)
│   │   │   ├── (auth)
│   │   │   │   ├── login
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register
│   │   │   │       └── page.tsx
│   │   │   └── (dashboard)
│   │   │       ├── account
│   │   │       │   └── companies
│   │   │       │       └── page.tsx
│   │   │       ├── company
│   │   │       │   └── [companyId]
│   │   │       │       ├── CompanyHeader.tsx
│   │   │       │       ├── CompanySidebar.tsx
│   │   │       │       ├── clients
│   │   │       │       │   ├── new
│   │   │       │       │   │   └── page.tsx
│   │   │       │       │   └── page.tsx
│   │   │       │       ├── dashboard
│   │   │       │       │   ├── layout.tsx
│   │   │       │       │   └── page.tsx
│   │   │       │       ├── layout.tsx
│   │   │       │       ├── page.tsx
│   │   │       │       └── products
│   │   │       │           └── page.tsx
│   │   │       └── layout.tsx
│   │   ├── api
│   │   │   ├── account
│   │   │   │   ├── companies
│   │   │   │   │   ├── [companyId]
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── stats
│   │   │   │   │       └── route.ts
│   │   │   │   └── switch-to-company
│   │   │   │       └── route.ts
│   │   │   ├── auth
│   │   │   │   ├── login
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout
│   │   │   │   │   └── route.ts
│   │   │   │   └── register
│   │   │   │       └── route.ts
│   │   │   └── company
│   │   │       └── [companyId]
│   │   │           ├── clients
│   │   │           │   ├── [clientId]
│   │   │           │   │   └── route.ts
│   │   │           │   └── route.ts
│   │   │           ├── products
│   │   │           │   ├── [productId]
│   │   │           │   │   └── route.ts
│   │   │           │   └── route.ts
│   │   │           ├── purchases
│   │   │           │   └── route.ts
│   │   │           ├── sales
│   │   │           │   └── route.ts
│   │   │           └── warehouse
│   │   │               └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   └── clients
│   │       └── GridConfigModal.tsx
│   ├── config
│   │   └── clients
│   │       └── columnsConfig.ts
│   ├── lib
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── prisma.ts
│   │   └── rate-limit.ts
│   ├── middleware.ts
│   ├── styles
│   │   └── clients-table.css
│   └── types
├── tailwind.config.ts
├── tmp
│   ├── 2
│   │   ├── files
│   │   │   ├── INSTALL.md
│   │   │   ├── mnt
│   │   │   │   └── user-data
│   │   │   │       └── outputs
│   │   │   │           └── canon
│   │   │   │               └── app
│   │   │   │                   ├── api
│   │   │   │                   │   └── company
│   │   │   │                   │       └── [companyId]
│   │   │   │                   │           └── clients
│   │   │   │                   │               └── [clientId]
│   │   │   │                   │                   ├── copy
│   │   │   │                   │                   │   └── route1.ts
│   │   │   │                   │                   └── route2.ts
│   │   │   │                   └── company
│   │   │   │                       └── [companyId]
│   │   │   │                           └── clients
│   │   │   │                               ├── [clientId]
│   │   │   │                               │   └── edit
│   │   │   │                               │       └── page1.tsx
│   │   │   │                               └── new
│   │   │   │                                   └── page2.tsx
│   │   │   ├── page.tsx
│   │   │   ├── prisma.ts
│   │   │   └── route.ts
│   │   └── files.zip
│   ├── 3
│   │   ├── files
│   │   │   ├── ARCHITECTURE-v3.md
│   │   │   └── FULL-STRUCTURE.md
│   │   └── files.zip
│   ├── files
│   │   ├── API.md
│   │   ├── ARCHITECTURE.md
│   │   ├── ClientForm.tsx
│   │   ├── ClientsToolbar.tsx
│   │   ├── INSTALL.md
│   │   ├── MIGRATION-REPORT.md
│   │   ├── api.ts
│   │   ├── clients1.ts
│   │   ├── mnt
│   │   │   └── user-data
│   │   │       └── outputs
│   │   │           └── solarnetjs
│   │   │               └── lib
│   │   │                   └── api
│   │   │                       └── clients.ts
│   │   └── useClients.ts
│   └── onhe src
│       ├── files (1)
│       │   ├── INSTALL.md
│       │   ├── mnt
│       │   │   └── user-data
│       │   │       └── outputs
│       │   │           └── canon
│       │   │               └── app
│       │   │                   ├── api
│       │   │                   │   └── company
│       │   │                   │       └── [companyId]
│       │   │                   │           └── clients
│       │   │                   │               └── [clientId]
│       │   │                   │                   ├── copy
│       │   │                   │                   │   └── route1.ts
│       │   │                   │                   └── route2.ts
│       │   │                   └── company
│       │   │                       └── [companyId]
│       │   │                           └── clients
│       │   │                               ├── [clientId]
│       │   │                               │   └── edit
│       │   │                               │       └── page1.tsx
│       │   │                               └── new
│       │   │                                   └── page2.tsx
│       │   ├── page.tsx
│       │   ├── prisma.ts
│       │   └── route.ts
│       └── files (1).zip
└── tsconfig.json

108 directories, 96 files
leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % ls -la
total 440
drwxr-xr-x@ 22 leanid  staff     704 Jan  6 02:24 .
drwxr-xr-x  51 leanid  staff    1632 Jan  6 14:08 ..
-rw-r--r--@  1 leanid  staff   14340 Jan  6 16:33 .DS_Store
-rw-r--r--@  1 leanid  staff     560 Dec  7 16:49 .env.local
drwxr-xr-x  15 leanid  staff     480 Dec 27 03:13 .git
-rw-r--r--@  1 leanid  staff    1107 Dec  7 16:39 .gitignore
-rw-r--r--@  1 leanid  staff     264 Jan  6 00:47 CHANGELOG.md
-rw-r--r--@  1 leanid  staff   21508 Jan  6 03:07 README.md
drwxr-xr-x@  4 leanid  staff     128 Jan  6 20:04 docs
drwxr-xr-x   5 leanid  staff     160 Jan  6 02:25 new structura
-rw-r--r--@  1 leanid  staff     251 Dec 27 03:13 next-env.d.ts
-rw-r--r--@  1 leanid  staff     196 Dec  7 14:27 next.config.js
-rw-r--r--@  1 leanid  staff     897 Dec  6 23:47 package.json
-rw-r--r--@  1 leanid  staff  141405 Nov  9 23:33 pnpm-lock.yaml
-rw-r--r--@  1 leanid  staff     110 Jan  6 00:46 pnpm-workspace.yaml
-rw-r--r--@  1 leanid  staff      91 Sep 29 20:22 postcss.config.js
drwxr-xr-x@  4 leanid  staff     128 Nov  8 22:44 prisma
drwxr-xr-x@  7 leanid  staff     224 Sep 29 20:22 public
drwxr-xr-x@ 10 leanid  staff     320 Dec 26 20:25 src
-rw-r--r--@  1 leanid  staff     264 Nov  3 19:38 tailwind.config.ts
drwxr-xr-x   7 leanid  staff     224 Jan  6 16:32 tmp
-rw-r--r--@  1 leanid  staff     897 Dec  7 14:27 tsconfig.json
leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % 

L/=>C Claude файлы которые ты прислал они вот здесь 
leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % cd Full\ structure 
leanid@MacBook-Pro-LeanidHamburg Full structure % ls -la
total 184
drwxr-xr-x@ 10 leanid  staff    320 Jan  6 20:15 .
drwxr-xr-x@ 21 leanid  staff    672 Jan  6 20:14 ..
-rw-r--r--@  1 leanid  staff   6148 Jan  6 20:13 .DS_Store
-rw-r--r--@  1 leanid  staff  13422 Jan  6 20:14 ARCHITECTURE-v3.md
-rw-r--r--@  1 leanid  staff  21509 Jan  6 20:14 FULL-STRUCTURE.md
-rw-------@  1 leanid  staff   5619 Jan  6 19:12 INSTALL.md
drwxr-xr-x@  3 leanid  staff     96 Jan  6 20:13 mnt
-rw-------@  1 leanid  staff  23706 Jan  6 19:12 page.tsx
-rw-------@  1 leanid  staff    356 Jan  6 19:12 prisma.ts
-rw-------@  1 leanid  staff   5743 Jan  6 19:12 route.ts
leanid@MacBook-Pro-LeanidHamburg Full structure % tree
.
├── ARCHITECTURE-v3.md
├── FULL-STRUCTURE.md
├── INSTALL.md
├── mnt
│   └── user-data
│       └── outputs
│           └── canon
│               └── app
│                   ├── api
│                   │   └── company
│                   │       └── [companyId]
│                   │           └── clients
│                   │               └── [clientId]
│                   │                   ├── copy
│                   │                   │   └── route.ts
│                   │                   └── route.ts
│                   └── company
│                       └── [companyId]
│                           └── clients
│                               ├── [clientId]
│                               │   └── edit
│                               │       └── page.tsx
│                               └── new
│                                   └── page.tsx
├── page.tsx
├── prisma.ts
└── route.ts

18 directories, 10 files
leanid@MacBook-Pro-LeanidHamburg Full structure % 
task1