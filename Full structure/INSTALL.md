# 🔧 Solar ERP — SolarNetJS CANON Installation

**Версия:** CANON (Final)  
**Дата:** 28.12.2025  
**Команда:** Leanid (Architect), Dashka (Senior), Claude (Engineer)

---

## 🚨 ГЛАВНЫЕ ПРАВИЛА SOLARNETJS

| Правило | Статус |
|---------|--------|
| `src/` запрещён | ❌ НЕТ |
| `(products)` запрещён | ❌ НЕТ |
| `(dashboard)` запрещён | ❌ НЕТ |
| Корень = `app/` | ✅ ДА |
| Company-first | ✅ ДА |

---

## ✅ КАНОНИЧЕСКАЯ СТРУКТУРА

```
project-root/
├── app/
│   ├── company/
│   │   └── [companyId]/
│   │       └── clients/
│   │           ├── page.tsx            ← LIST
│   │           ├── new/
│   │           │   └── page.tsx        ← CREATE
│   │           └── [clientId]/
│   │               └── edit/
│   │                   └── page.tsx    ← EDIT
│   │
│   ├── api/
│   │   └── company/
│   │       └── [companyId]/
│   │           └── clients/
│   │               ├── route.ts        ← GET/POST
│   │               └── [clientId]/
│   │                   ├── route.ts    ← GET/PUT/DELETE
│   │                   └── copy/
│   │                       └── route.ts ← POST copy
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   └── clients/
│       └── GridConfigModal.tsx
│
├── config/
│   └── clients/
│       └── columnsConfig.ts
│
├── lib/
│   └── prisma.ts
│
├── prisma/
│   └── schema.prisma
│
├── docs/
│   └── ARCHITECTURE.md
│
└── package.json
```

---

## 🔧 ШАГ 1: УДАЛИТЬ МУСОР

```bash
cd /path/to/solar-erp

# Удалить src/ если есть
rm -rf src/

# Удалить route groups если есть
rm -rf 'app/(products)'
rm -rf 'app/(dashboard)'

# Удалить артефакты
rm -rf 1/
rm -rf file/
```

---

## 🔧 ШАГ 2: СОЗДАТЬ СТРУКТУРУ

```bash
# FrontEnd
mkdir -p 'app/company/[companyId]/clients/new'
mkdir -p 'app/company/[companyId]/clients/[clientId]/edit'

# BackEnd
mkdir -p 'app/api/company/[companyId]/clients/[clientId]/copy'

# Support
mkdir -p components/clients
mkdir -p config/clients
mkdir -p lib
mkdir -p docs
```

---

## 🔧 ШАГ 3: СКОПИРОВАТЬ ФАЙЛЫ

### FrontEnd Pages

```bash
# List
cp page.tsx 'app/company/[companyId]/clients/page.tsx'

# Create
cp new-page.tsx 'app/company/[companyId]/clients/new/page.tsx'

# Edit
cp edit-page.tsx 'app/company/[companyId]/clients/[clientId]/edit/page.tsx'
```

### BackEnd API

```bash
# Collection (GET list, POST create)
cp clients-route.ts 'app/api/company/[companyId]/clients/route.ts'

# Item (GET, PUT, DELETE)
cp clientId-route.ts 'app/api/company/[companyId]/clients/[clientId]/route.ts'

# Copy
cp copy-route.ts 'app/api/company/[companyId]/clients/[clientId]/copy/route.ts'
```

### Support Files

```bash
# Prisma client
cp prisma.ts lib/prisma.ts

# Config (если нет)
cp columnsConfig.ts config/clients/columnsConfig.ts

# Component (если нет)
cp GridConfigModal.tsx components/clients/GridConfigModal.tsx
```

---

## 🔧 ШАГ 4: ПРОВЕРИТЬ tsconfig.json

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

**ВАЖНО:** Путь `@/*` указывает на корень проекта, НЕ на `src/`!

---

## 🔧 ШАГ 5: BUILD & TEST

```bash
# Clean
rm -rf .next

# Build
npm run build

# Dev
npm run dev
```

---

## ✅ SMOKE TESTS

### UI Routes

| URL | Ожидание |
|-----|----------|
| `/company/17/clients` | ✅ Список клиентов |
| `/company/17/clients/new` | ✅ Форма создания |
| `/company/17/clients/1/edit` | ✅ Форма редактирования |

### API Tests

```bash
TOKEN="your_jwt"

# GET list
curl localhost:3000/api/company/17/clients -H "Cookie: token=$TOKEN"

# POST create
curl -X POST localhost:3000/api/company/17/clients \
  -H "Content-Type: application/json" \
  -H "Cookie: token=$TOKEN" \
  -d '{"name":"Test","email":"test@t.com"}'

# PUT update
curl -X PUT localhost:3000/api/company/17/clients/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=$TOKEN" \
  -d '{"phone":"+370"}'

# DELETE
curl -X DELETE localhost:3000/api/company/17/clients/1 \
  -H "Cookie: token=$TOKEN"

# COPY
curl -X POST localhost:3000/api/company/17/clients/1/copy \
  -H "Cookie: token=$TOKEN"
```

---

## 🔧 ШАГ 6: COMMIT

```bash
git add .
git commit -m "feat: SolarNetJS Canon - Company-first, no src/"
git push
```

---

## ⚠️ ПРОВЕРКА: В ПРОЕКТЕ НЕ ДОЛЖНО БЫТЬ

```bash
# Эти команды должны вернуть ошибку "No such file or directory"
ls src/
ls 'app/(products)/'
ls 'app/(dashboard)/'
```

---

## 📋 DEFINITION OF DONE

- [ ] `npm run build` — OK
- [ ] `/company/17/clients` — работает
- [ ] `/company/17/clients/new` — работает
- [ ] `/company/17/clients/1/edit` — работает
- [ ] API CRUD — работает
- [ ] НЕТ папки `src/`
- [ ] НЕТ route groups `(products)`, `(dashboard)`

---

**Installation Complete!** ✅

---

**Solar ERP Team** ☀️  
*"Космический корабль с заправленными баками — строго к цели!"* 🚀
