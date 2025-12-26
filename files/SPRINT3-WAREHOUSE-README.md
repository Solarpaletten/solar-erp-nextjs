# 🏭 SPRINT 3: WAREHOUSE API

## Складской учёт через Purchases & Sales

### Принцип работы

```
Purchases (+) → products.current_stock → Sales (-)
                      ↓
              Warehouse (READ ONLY)
```

### ❌ Запрещено:
- Прямое редактирование склада
- Ручная корректировка `current_stock`
- POST/PUT/DELETE на `/warehouse`

### ✅ Разрешено:
- Приход через Purchases → `increment`
- Расход через Sales → `decrement` (с проверкой остатков)
- Чтение склада через Warehouse API

---

## 📁 Файлы для размещения

| Файл | Путь в проекте |
|------|----------------|
| `purchases-route.ts` | `src/app/api/company/[companyId]/purchases/route.ts` |
| `sales-route.ts` | `src/app/api/company/[companyId]/sales/route.ts` |
| `warehouse-route.ts` | `src/app/api/company/[companyId]/warehouse/route.ts` |

---

## 📥 Purchases API

### GET `/api/company/[companyId]/purchases`
Список всех закупок с items и supplier

### POST `/api/company/[companyId]/purchases`
Создание закупки + **автоматический приход на склад**

```json
{
  "document_number": "PUR-001",
  "document_date": "2025-01-15",
  "supplier_id": 1,
  "items": [
    {
      "product_id": 5,
      "quantity": 100,
      "unit_price": 50.00,
      "vat_rate": 19
    }
  ],
  "currency": "EUR"
}
```

**Результат:** `products.current_stock += quantity`

---

## 📤 Sales API

### GET `/api/company/[companyId]/sales`
Список всех продаж с items и client

### POST `/api/company/[companyId]/sales`
Создание продажи + **автоматическое списание со склада**

```json
{
  "document_number": "INV-001",
  "document_date": "2025-01-15",
  "client_id": 2,
  "items": [
    {
      "product_id": 5,
      "quantity": 25,
      "unit_price_base": 75.00,
      "vat_rate": 19
    }
  ],
  "currency": "EUR"
}
```

**Проверка:** Если `current_stock < quantity` → **400 Insufficient stock**

**Результат:** `products.current_stock -= quantity`

---

## 🏭 Warehouse API (READ ONLY)

### GET `/api/company/[companyId]/warehouse`
Витрина остатков

**Query параметры:**
- `category` - фильтр по категории
- `status` - `LOW`, `OK`, `OUT_OF_STOCK`, `ALL`
- `active` - `true`/`false`

**Response:**
```json
{
  "success": true,
  "warehouse": [
    {
      "id": 5,
      "code": "OIL001",
      "name": "Rapeseed Oil",
      "unit": "L",
      "current_stock": 75,
      "min_stock": 50,
      "status": "OK",
      "stock_value": 3750.00
    }
  ],
  "stats": {
    "total_products": 10,
    "in_stock": 7,
    "low_stock": 2,
    "out_of_stock": 1,
    "total_stock_value": 125000.00
  }
}
```

### POST/PUT/DELETE → **405 Method Not Allowed**
```json
{
  "error": "Direct warehouse modification is not allowed. Use Purchases or Sales."
}
```

---

## 🧪 Тестирование

```bash
# Запуск тестов
chmod +x test-warehouse-api.sh
./test-warehouse-api.sh http://localhost:3000 16
```

### Тест-сценарий:
1. GET Warehouse (начальное состояние)
2. POST Purchase +100 → stock увеличивается
3. POST Sale 999999 → **REJECTED** (insufficient)
4. POST Sale +25 → stock уменьшается
5. POST Warehouse → **REJECTED** (405)
6. GET Warehouse (финальное состояние)

---

## ⚠️ Критические правила

1. **Транзакции обязательны** - создание документа + изменение stock в одной транзакции
2. **Только increment/decrement** - никогда не используем `set` для stock
3. **Проверка до списания** - всегда проверяем остаток перед Sale
4. **Склад = производная** - Warehouse только читает, никогда не пишет

---

## 📊 Acceptance Criteria

- [x] Purchase увеличивает stock ✅
- [x] Sale уменьшает stock ✅
- [x] Sale > stock → ошибка 400 ✅
- [x] Warehouse = read-only ✅
- [x] Транзакционность ✅
