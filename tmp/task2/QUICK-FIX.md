# 🔧 TASK 2 — QUICK FIX

## 🔴 Ошибки после миграции:

```
Can't resolve '@/lib/db'
Can't resolve '@/lib/auth'  
Can't resolve '@/lib/prisma'
Can't resolve '@/lib/rate-limit'
Can't resolve '@/styles/clients-table.css'
Can't resolve '@/config/clients/columnsConfig'
```

---

## ✅ БЫСТРОЕ ИСПРАВЛЕНИЕ (копируй и выполняй)

### 1. Проверь tsconfig.json

```bash
cat tsconfig.json | grep "@/"
```

**Должно быть:**
```json
"@/*": ["./*"]
```

**НЕ должно быть:**
```json
"@/*": ["./src/*"]
```

**Если неправильно — исправь:**
```bash
sed -i '' 's|"./src/\*"|"./*"|g' tsconfig.json
```

---

### 2. Создай недостающие файлы

```bash
cd /Users/leanid/Documents/ITproject/solar-erp-nextjs
```

#### 2.1 lib/db.ts (alias для prisma)

```bash
cat > lib/db.ts << 'EOF'
// lib/db.ts - alias для совместимости
export { prisma } from './prisma';
EOF
```

#### 2.2 styles папка и CSS

```bash
mkdir -p styles

cat > styles/clients-table.css << 'EOF'
/* styles/clients-table.css */
.clients-table { width: 100%; border-collapse: collapse; }
.clients-table th, .clients-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
.clients-table th { background-color: #f9fafb; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: #6b7280; }
.clients-table tr:hover { background-color: #f3f4f6; }
EOF
```

#### 2.3 Проверь lib/auth.ts

```bash
# Если не существует - скопируй из бэкапа
if [ ! -f lib/auth.ts ]; then
  cp src_backup/lib/auth.ts lib/auth.ts
fi
```

#### 2.4 Проверь lib/rate-limit.ts

```bash
if [ ! -f lib/rate-limit.ts ]; then
  cp src_backup/lib/rate-limit.ts lib/rate-limit.ts
fi
```

#### 2.5 Проверь config/clients/columnsConfig.ts

```bash
mkdir -p config/clients

if [ ! -f config/clients/columnsConfig.ts ]; then
  cp src_backup/config/clients/columnsConfig.ts config/clients/columnsConfig.ts
fi
```

#### 2.6 Проверь components/clients/GridConfigModal.tsx

```bash
mkdir -p components/clients

if [ ! -f components/clients/GridConfigModal.tsx ]; then
  cp src_backup/components/clients/GridConfigModal.tsx components/clients/GridConfigModal.tsx
fi
```

---

### 3. Пересобери

```bash
rm -rf .next
pnpm build
```

---

### 4. Если остались ошибки — покажи их

```bash
pnpm build 2>&1 | grep "Can't resolve"
```

---

## 📋 ЧЕКЛИСТ

| Файл | Команда проверки |
|------|------------------|
| lib/db.ts | `ls lib/db.ts` |
| lib/auth.ts | `ls lib/auth.ts` |
| lib/rate-limit.ts | `ls lib/rate-limit.ts` |
| lib/prisma.ts | `ls lib/prisma.ts` |
| styles/clients-table.css | `ls styles/` |
| config/clients/columnsConfig.ts | `ls config/clients/` |
| components/clients/GridConfigModal.tsx | `ls components/clients/` |
| tsconfig.json paths | `grep "@/" tsconfig.json` |

---

## 🆘 Если всё сломалось

```bash
# Восстановить из бэкапа
rm -rf app/ lib/ config/ components/ styles/
mv src_backup/ src/
git checkout tsconfig.json
pnpm install
pnpm dev
```
