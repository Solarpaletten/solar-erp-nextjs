# SPRINT 1.2 v2: CLIENTS UI + HORIZONTAL SCROLL + API

> **Версия:** 2.0  
> **Дата:** 2024-12-26  
> **Статус:** ✅ Ready for Installation

---

## 🎯 ЧТО ДОБАВЛЕНО В v2

1. **Горизонтальная прокрутка** — как в Site.pro
2. **Sticky колонки:**
   - ☑️ Checkbox слева (sticky)
   - 📌 ID колонка (sticky)
   - 🔧 Actions справа (sticky)
3. **Кнопки прокрутки** — ◀ ▶ в toolbar
4. **Полный API backend** — все 36 полей из Prisma
5. **CSS для scrollbar** — кастомный стиль

---

## 📁 СТРУКТУРА ФАЙЛОВ (6 файлов)

```
sprint1.2-v2/
├── columnsConfig.ts      → src/config/clients/columnsConfig.ts
├── GridConfigModal.tsx   → src/components/clients/GridConfigModal.tsx
├── page.tsx              → src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx
├── route.ts              → src/app/api/company/[companyId]/clients/route.ts
├── clientId-route.ts     → src/app/api/company/[companyId]/clients/[clientId]/route.ts
└── clients-table.css     → src/styles/clients-table.css (опционально)
```

---

## 🔧 ИНСТРУКЦИЯ ПО УСТАНОВКЕ

### Шаг 1: Создать директории

```bash
cd /path/to/solar-erp-nextjs

# Config
mkdir -p src/config/clients

# Components
mkdir -p src/components/clients

# Styles (опционально)
mkdir -p src/styles
```

### Шаг 2: Скопировать файлы

```bash
# 1. Config
cp columnsConfig.ts src/config/clients/columnsConfig.ts

# 2. Components
cp GridConfigModal.tsx src/components/clients/GridConfigModal.tsx

# 3. Frontend page (ЗАМЕНИТЬ)
cp page.tsx src/app/\(products\)/\(dashboard\)/company/\[companyId\]/clients/page.tsx

# 4. Backend API - Collection (ЗАМЕНИТЬ)
cp route.ts src/app/api/company/\[companyId\]/clients/route.ts

# 5. Backend API - Item (ЗАМЕНИТЬ)
cp clientId-route.ts src/app/api/company/\[companyId\]/clients/\[clientId\]/route.ts

# 6. CSS (опционально)
cp clients-table.css src/styles/clients-table.css
```

### Шаг 3: Добавить CSS в layout (если используете)

```tsx
// src/app/layout.tsx
import '@/styles/clients-table.css';
```

### Шаг 4: Проверить сборку

```bash
npm run build
```

---

## 📊 ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА

### Sticky колонки (всегда видны):

| Позиция | Колонка | Z-index |
|---------|---------|---------|
| LEFT | ☑️ Checkbox | z-30 |
| LEFT | ID (первая data колонка) | z-30 |
| RIGHT | 🔧 Actions | z-30 |

### Прокручиваемые колонки:

Все остальные колонки прокручиваются по горизонтали.

### Кнопки прокрутки:

```
[◀ Scroll Left] [▶ Scroll Right]
```

- Автоматически скрываются если прокрутка не нужна
- Smooth scroll на 300px

---

## 🔌 API ENDPOINTS

### Collection (route.ts)

| Method | URL | Описание |
|--------|-----|----------|
| `GET` | `/api/company/{id}/clients` | Список всех клиентов (36 полей) |
| `POST` | `/api/company/{id}/clients` | Создать клиента |

### Item (clientId-route.ts)

| Method | URL | Описание |
|--------|-----|----------|
| `GET` | `/api/company/{id}/clients/{clientId}` | Один клиент + addresses + bank_accounts |
| `PUT` | `/api/company/{id}/clients/{clientId}` | Обновить (36 полей) |
| `DELETE` | `/api/company/{id}/clients/{clientId}` | Удалить (с проверкой ссылок) |

---

## 📋 ВСЕ ПОЛЯ В API (36)

### Basic
- id, name, abbreviation, code, email, phone, fax, website, contact_information

### Role & Type
- role, is_juridical, is_active, is_foreigner, country

### Addresses
- legal_address, actual_address

### Registration
- business_license_code, registration_number, registration_date, date_of_birth

### Tax
- vat_code, vat_rate, eori_code, foreign_taxpayer_code

### Finance
- credit_sum, pay_per, currency, payment_terms, automatic_debt_reminder

### SABIS / ERP
- sabis_customer_name, sabis_customer_code

### Notes
- additional_information, notes

### System
- created_by, created_at, updated_at

---

## ✅ ACCEPTANCE CRITERIA

### Horizontal Scroll
- [ ] Таблица прокручивается по горизонтали
- [ ] Checkbox колонка sticky слева
- [ ] ID колонка sticky слева
- [ ] Actions колонка sticky справа
- [ ] Кнопки ◀ ▶ работают
- [ ] Scrollbar виден и стилизован

### API
- [ ] GET возвращает все 36 полей
- [ ] POST создаёт с любыми полями
- [ ] PUT обновляет частично
- [ ] DELETE проверяет references

### Grid Config
- [ ] ⚙️ открывает модальное окно
- [ ] Все колонки в списке
- [ ] Save сохраняет в localStorage
- [ ] Reset восстанавливает defaults

---

## 🎨 ВИЗУАЛЬНЫЕ ЭЛЕМЕНТЫ

### Role Badge
- CLIENT → зелёный
- SUPPLIER → синий
- BOTH → фиолетовый

### Status Indicator (is_active)
- Active → ●●● зелёные
- Inactive → ●●● красные

### Boolean Fields
- true → ✓ зелёный
- false → - серый

---

## 🚀 ПОСЛЕ УСТАНОВКИ

1. `npm run dev`
2. Открыть `/company/16/clients`
3. Включить больше колонок через ⚙️
4. Проверить горизонтальную прокрутку
5. Проверить что checkbox и ID остаются на месте

---

**Sprint 1.2 v2 готов!** 🎉
