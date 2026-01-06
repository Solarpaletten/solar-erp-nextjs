leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % chmod +x ./migrate.sh
leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % ./migrate.sh
🚀 SOLAR ERP MIGRATION — Canon Structure
=========================================

📍 Текущая папка: /Users/leanid/Documents/ITproject/solar-erp-nextjs

═══════════════════════════════════════
ШАГ 1: БЭКАП
═══════════════════════════════════════
Создать бэкап src/? (y/n) y
✅ Бэкап создан: src_backup/

═══════════════════════════════════════
ШАГ 2: СОЗДАНИЕ НОВОЙ СТРУКТУРЫ
═══════════════════════════════════════
Создать новую структуру папок? (y/n) y
📁 Создаю app/ структуру...
✅ Структура создана!

═══════════════════════════════════════
ШАГ 3: КОПИРОВАНИЕ ИЗ FULL STRUCTURE
═══════════════════════════════════════
Копировать файлы из 'Full structure'? (y/n) y
✅ Скопирован: clients/page.tsx
✅ Скопирован: api/clients/route.ts
✅ Скопирован: api/clients/[clientId]/copy/route.ts
✅ Скопирован: lib/prisma.ts
✅ Скопирован: docs/ARCHITECTURE.md
✅ Скопирован: docs/FULL-STRUCTURE.md

═══════════════════════════════════════
ШАГ 4: ПЕРЕНОС ФАЙЛОВ ИЗ SRC
═══════════════════════════════════════
Перенести файлы из src/? (y/n) y
✅ layout.tsx
✅ globals.css
✅ page.tsx
✅ middleware.ts
✅ lib/auth.ts
✅ lib/db.ts
✅ lib/rate-limit.ts
✅ GridConfigModal.tsx
✅ columnsConfig.ts
✅ auth/login/page.tsx
✅ auth/register/page.tsx
✅ api/auth/login
✅ api/auth/logout
✅ api/auth/register
✅ company/layout.tsx
✅ company/page.tsx
✅ CompanySidebar.tsx
✅ CompanyHeader.tsx
✅ products/page.tsx
✅ api/products
✅ api/warehouse
✅ api/purchases
✅ api/sales

✅ Перенос из src/ завершён!

═══════════════════════════════════════
ШАГ 5: ОБНОВЛЕНИЕ ИМПОРТОВ
═══════════════════════════════════════
Обновить импорты (заменить @/src/ на @/)? (y/n) y
✅ Импорты обновлены

═══════════════════════════════════════
ШАГ 6: УДАЛЕНИЕ СТАРОГО (ОПЦИОНАЛЬНО)
═══════════════════════════════════════
Удалить src/ и временные папки? (y/n) y
✅ Старые папки удалены

═══════════════════════════════════════
ШАГ 7: СБОРКА
═══════════════════════════════════════
Запустить сборку (pnpm build)? (y/n) y
Downloading prisma@6.19.0: 17.62 MB/17.62 MB, done
Downloading @prisma/client@6.19.0: 27.21 MB/27.21 MB, done
Downloading next@16.1.1: 30.65 MB/30.65 MB, done
Packages: +421
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Downloading @img/sharp-libvips-darwin-arm64@1.2.4: 7.65 MB/7.65 MB, done
Downloading @next/swc-darwin-arm64@16.1.1: 36.31 MB/36.31 MB, done
Progress: resolved 473, reused 304, downloaded 122, added 421, done

dependencies:
+ @prisma/client 6.19.0
+ @types/bcryptjs 2.4.6
+ @types/jsonwebtoken 9.0.10
+ @types/node 20.19.24
+ @types/react 19.2.2
+ @types/react-dom 19.2.2
+ autoprefixer 10.4.21
+ bcryptjs 3.0.3
+ eslint 9.39.1
+ eslint-config-next 15.5.3
+ jsonwebtoken 9.0.2
+ lucide-react 0.553.0
+ next 16.1.1
+ postcss 8.5.6
+ prisma 6.19.0
+ react 19.2.0
+ react-dom 19.2.0
+ tailwindcss 3.4.18
+ typescript 5.9.3

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: sharp@0.34.5.                                                     │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
Done in 11.1s using pnpm v10.27.0

> solar-erp-nextjs@2.0.0 build /Users/leanid/Documents/ITproject/solar-erp-nextjs
> prisma generate && next build

Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.19.0) to ./node_modules/.pnpm/@prisma+client@6.19.0_prisma@6.19.0_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client in 72ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints

[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
▲ Next.js 16.1.1 (Turbopack)
- Environments: .env.local

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`

> Build error occurred
Error: Turbopack build failed with 10 errors:
./app/company/[companyId]/clients/page.tsx:17:1
Module not found: Can't resolve '@/components/clients/GridConfigModal'
  15 |   ColumnConfig,
  16 | } from '@/config/clients/columnsConfig';
> 17 | import GridConfigModal from '@/components/clients/GridConfigModal';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  18 | import {
  19 |   Plus, Settings2, Pencil, Trash2, Copy, Search,
  20 |   ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,

Import map: aliased to relative './src/components/clients/GridConfigModal' inside of [project]/


Import traces:
  Client Component Browser:
    ./app/company/[companyId]/clients/page.tsx [Client Component Browser]
    ./app/company/[companyId]/clients/page.tsx [Server Component]

  Client Component SSR:
    ./app/company/[companyId]/clients/page.tsx [Client Component SSR]
    ./app/company/[companyId]/clients/page.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found


./app/company/[companyId]/clients/page.tsx:8:1
Module not found: Can't resolve '@/config/clients/columnsConfig'
   6 | import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
   7 | import { useParams, useRouter, useSearchParams } from 'next/navigation';
>  8 | import {
     | ^^^^^^^^
>  9 |   CLIENTS_COLUMNS,
     | ^^^^^^^^^^^^^^^^^^
> 10 |   getDefaultVisibleColumns,
     | ^^^^^^^^^^^^^^^^^^
> 11 |   loadGridConfig,
     | ^^^^^^^^^^^^^^^^^^
> 12 |   saveGridConfig,
     | ^^^^^^^^^^^^^^^^^^
> 13 |   resetGridConfig,
     | ^^^^^^^^^^^^^^^^^^
> 14 |   getColumnByKey,
     | ^^^^^^^^^^^^^^^^^^
> 15 |   ColumnConfig,
     | ^^^^^^^^^^^^^^^^^^
> 16 | } from '@/config/clients/columnsConfig';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  17 | import GridConfigModal from '@/components/clients/GridConfigModal';
  18 | import {
  19 |   Plus, Settings2, Pencil, Trash2, Copy, Search,

Import map: aliased to relative './src/config/clients/columnsConfig' inside of [project]/


Import traces:
  Client Component Browser:
    ./app/company/[companyId]/clients/page.tsx [Client Component Browser]
    ./app/company/[companyId]/clients/page.tsx [Server Component]

  Client Component SSR:
    ./app/company/[companyId]/clients/page.tsx [Client Component SSR]
    ./app/company/[companyId]/clients/page.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found


./app/api/company/[companyId]/products/route.ts:3:1
Module not found: Can't resolve '@/lib/auth'
   1 | import { NextRequest, NextResponse } from 'next/server';
   2 | import { prisma } from '@/lib/db';
>  3 | import { 
     | ^^^^^^^^^
>  4 |   getUserIdFromToken, 
     | ^^^^^^^^^^^^^^^^^^^^^^
>  5 |   verifyCompanyAccess,
     | ^^^^^^^^^^^^^^^^^^^^^^
>  6 |   unauthorizedResponse,
     | ^^^^^^^^^^^^^^^^^^^^^^
>  7 |   forbiddenResponse,
     | ^^^^^^^^^^^^^^^^^^^^^^
>  8 |   badRequestResponse
     | ^^^^^^^^^^^^^^^^^^^^^^
>  9 | } from '@/lib/auth';
     | ^^^^^^^^^^^^^^^^^^^^^
  10 |
  11 | /**
  12 |  * GET /api/company/[companyId]/products

Import map: aliased to relative './src/lib/auth' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


./app/api/auth/login/route.ts:2:1
Module not found: Can't resolve '@/lib/db'
  1 | import { NextRequest, NextResponse } from 'next/server';
> 2 | import { prisma } from '@/lib/db';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  3 | import bcrypt from 'bcryptjs';
  4 | import jwt from 'jsonwebtoken';
  5 |

Import map: aliased to relative './src/lib/db' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


./app/api/auth/register/route.ts:3:1
Module not found: Can't resolve '@/lib/db'
  1 | // src/app/api/auth/register/route.ts
  2 | import { NextRequest, NextResponse } from 'next/server';
> 3 | import { prisma } from '@/lib/db';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  4 | import { rateLimit } from '@/lib/rate-limit';
  5 | import bcrypt from 'bcryptjs';
  6 |

Import map: aliased to relative './src/lib/db' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


./app/api/company/[companyId]/products/route.ts:2:1
Module not found: Can't resolve '@/lib/db'
  1 | import { NextRequest, NextResponse } from 'next/server';
> 2 | import { prisma } from '@/lib/db';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  3 | import { 
  4 |   getUserIdFromToken, 
  5 |   verifyCompanyAccess,

Import map: aliased to relative './src/lib/db' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


./app/api/company/[companyId]/clients/[clientId]/copy/route.ts:5:1
Module not found: Can't resolve '@/lib/prisma'
  3 |
  4 | import { NextRequest, NextResponse } from 'next/server';
> 5 | import { prisma } from '@/lib/prisma';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { cookies } from 'next/headers';
  7 | import jwt from 'jsonwebtoken';
  8 |

Import map: aliased to relative './src/lib/prisma' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


./app/api/company/[companyId]/clients/route.ts:5:1
Module not found: Can't resolve '@/lib/prisma'
  3 |
  4 | import { NextRequest, NextResponse } from 'next/server';
> 5 | import { prisma } from '@/lib/prisma';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { cookies } from 'next/headers';
  7 | import jwt from 'jsonwebtoken';
  8 |

Import map: aliased to relative './src/lib/prisma' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


./app/api/auth/register/route.ts:4:1
Module not found: Can't resolve '@/lib/rate-limit'
  2 | import { NextRequest, NextResponse } from 'next/server';
  3 | import { prisma } from '@/lib/db';
> 4 | import { rateLimit } from '@/lib/rate-limit';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  5 | import bcrypt from 'bcryptjs';
  6 |
  7 | export async function POST(request: NextRequest) {

Import map: aliased to relative './src/lib/rate-limit' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


./app/layout.tsx:4:1
Module not found: Can't resolve '@/styles/clients-table.css'
  2 | import { Geist, Geist_Mono } from "next/font/google";
  3 | import "./globals.css";
> 4 | import '@/styles/clients-table.css';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  5 |
  6 | const geistSans = Geist({
  7 |   variable: "--font-geist-sans",

Import map: aliased to relative './src/styles/clients-table.css' inside of [project]/


https://nextjs.org/docs/messages/module-not-found


    at <unknown> (./app/company/[companyId]/clients/page.tsx:17:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/company/[companyId]/clients/page.tsx:8:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/api/company/[companyId]/products/route.ts:3:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/api/auth/login/route.ts:2:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/api/auth/register/route.ts:3:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/api/company/[companyId]/products/route.ts:2:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/api/company/[companyId]/clients/[clientId]/copy/route.ts:5:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/api/company/[companyId]/clients/route.ts:5:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/api/auth/register/route.ts:4:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at <unknown> (./app/layout.tsx:4:1)
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
 ELIFECYCLE  Command failed with exit code 1.

═══════════════════════════════════════
✅ МИГРАЦИЯ ЗАВЕРШЕНА!
═══════════════════════════════════════

Следующие шаги:
1. Проверь tsconfig.json (paths должны указывать на ./)
2. Запусти: pnpm dev
3. Проверь: http://localhost:3000/company/17/clients
4. Закоммить: git add . && git commit -m 'refactor: Canon structure'

1 Проверь tsconfig.json
заменил "@/src/*": ["./src/*"] на "@/ *": ["./ *"]
2 Запусти: pnpm dev
3 Проверил: http://localhost:3000/company/17/clients
4 Закоммитил: git add . && git commit -m 'refactor: Canon structure'