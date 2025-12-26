# SPRINT 1.1: CLIENTS IMPORT MAPPING (Site.pro)

> **Версия:** 1.0  
> **Дата:** 2024-12-26  
> **Автор:** Claude (AI Engineer)  
> **Статус:** ADR Approved

---

## 📋 ОГЛАВЛЕНИЕ

1. [ADR-IMPORT-001: Архитектурные решения](#adr-import-001)
2. [Таблица mapping Excel → Prisma](#mapping-table)
3. [Инструкция для джуна: Как импортировать](#how-to-import)
4. [Проверка после импорта](#verification)
5. [Спецификация API эндпоинта импорта](#api-spec)

---

# 🏛️ ADR-IMPORT-001: АРХИТЕКТУРНЫЕ РЕШЕНИЯ {#adr-import-001}

## Контекст

Site.pro предоставляет Excel-шаблон для импорта клиентов (`b1_import-clients-en.xlsx`).
Этот шаблон раскрывает их модель данных и позволяет нам:
1. Понять структуру их БД
2. Обеспечить совместимость при миграции данных
3. Определить, как наша Prisma-схема соответствует их модели

## Источник данных

**Файл:** `b1_import-clients-en.xlsx`

**Структура файла:**
- Строка 1: Описание полей с примерами
- Строка 2: Технические названия полей для импорта
- Строка 3+: Данные клиентов

**Обязательные поля (помечены `*`):**
- `name*` — название клиента
- `isJuridical*` — юридическое лицо (0/1)
- `location*` — локация (lt/eu/rest)

---

## 📌 РЕШЕНИЕ 1: Интерпретация поля `location*`

### Проблема
Site.pro использует поле `location` с значениями: `lt`, `eu`, `rest`.
У нас в Prisma есть: `is_foreigner: Boolean` и `country: String`.

### Решение

| Site.pro `location` | Solar ERP `is_foreigner` | Solar ERP `country` | Описание |
|---------------------|--------------------------|---------------------|----------|
| `lt` | `false` | `LT` | Местный клиент (Литва) |
| `eu` | `true` | из `registrationCountryCode` или `null` | Клиент из ЕС |
| `rest` | `true` | из `registrationCountryCode` или `null` | Клиент вне ЕС |

### Код трансформации

```typescript
function transformLocation(location: string, regCountryCode?: string): {
  is_foreigner: boolean;
  country: string | null;
} {
  const loc = location?.toLowerCase().trim();
  
  if (loc === 'lt') {
    return { is_foreigner: false, country: 'LT' };
  }
  
  // eu или rest → иностранец
  return {
    is_foreigner: true,
    country: regCountryCode?.trim().toUpperCase() || null
  };
}
```

---

## 📌 РЕШЕНИЕ 2: Где хранить адреса

### Проблема
Excel содержит два набора адресов:
- Registration (юридический): `registrationCountryCode`, `registrationCity`, `registrationAddress`, `registrationZipCode`
- Correspondence (фактический): `correspondenceCountryCode`, `correspondenceCity`, `correspondenceAddress`, `correspondenceZipCode`

У нас в Prisma:
- `clients.legal_address` — текстовое поле
- `clients.actual_address` — текстовое поле
- `client_addresses` — отдельная таблица с типами адресов

### Решение

**Используем ОБА подхода:**

1. **В `clients` записываем конкатенированный адрес:**
   ```typescript
   legal_address = `${registrationAddress}, ${registrationCity}, ${registrationZipCode}, ${registrationCountryCode}`
   actual_address = `${correspondenceAddress}, ${correspondenceCity}, ${correspondenceZipCode}, ${correspondenceCountryCode}`
   ```

2. **В `client_addresses` создаём детальные записи:**
   ```typescript
   // Registration address
   {
     client_id: newClient.id,
     address: registrationAddress,
     city: registrationCity,
     country: registrationCountryCode,
     postcode: registrationZipCode,
     is_registration: true,
     is_correspondence: false
   }
   
   // Correspondence address
   {
     client_id: newClient.id,
     address: correspondenceAddress,
     city: correspondenceCity,
     country: correspondenceCountryCode,
     postcode: correspondenceZipCode,
     is_registration: false,
     is_correspondence: true
   }
   ```

### Обоснование
- `clients.legal_address/actual_address` — для быстрого отображения в UI
- `client_addresses` — для детальной работы с адресами, фильтрации по городу/стране

---

## 📌 РЕШЕНИЕ 3: Где хранить банковские реквизиты

### Проблема
Excel содержит: `bankAccount`, `bankName`, `bankCode`, `bankSwiftCode`

### Решение

**Всегда создаём запись в `client_bank_accounts`:**

```typescript
// Создаём только если bankAccount заполнен
if (row.bankAccount) {
  await prisma.client_bank_accounts.create({
    data: {
      client_id: newClient.id,
      account_number: row.bankAccount,
      bank_name: row.bankName || 'Unknown Bank',  // required в Prisma
      bank_code: row.bankCode || null,
      swift_code: row.bankSwiftCode || null,
      currency: 'EUR',  // default
      is_primary: true,  // первый банк = основной
      is_active: true
    }
  });
}
```

---

## 📌 РЕШЕНИЕ 4: Стратегия для отсутствующего `email`

### Проблема
В Excel поле `email` **не обязательное** (нет `*`).
В нашей Prisma-схеме `email` — **required** поле.

### Решение

**Стратегия генерации:**

```typescript
function generateEmail(row: ImportRow): string {
  // Приоритет: email → код компании → имя
  if (row.email?.trim()) {
    return row.email.trim().toLowerCase();
  }
  
  if (row.code?.trim()) {
    return `client.${row.code.trim().toLowerCase()}@import.local`;
  }
  
  // Fallback: генерируем из имени + timestamp
  const slug = row.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  
  return `${slug}.${Date.now()}@import.local`;
}
```

### Правила
1. Если `email` заполнен → используем его
2. Если пустой, но есть `code` → `client.{code}@import.local`
3. Если нет ни того ни другого → генерируем уникальный

### Важно
После импорта **рекомендуется** обновить email вручную для клиентов с `@import.local`

---

## 📌 РЕШЕНИЕ 5: Ключи для UPSERT

### Проблема
При повторном импорте нужно решить: создавать нового клиента или обновлять существующего?

### Решение

**Приоритет ключей для поиска существующего клиента:**

```typescript
async function findExistingClient(companyId: number, row: ImportRow) {
  // 1. Поиск по code (если заполнен)
  if (row.code?.trim()) {
    const byCode = await prisma.clients.findUnique({
      where: {
        company_id_code: {
          company_id: companyId,
          code: row.code.trim()
        }
      }
    });
    if (byCode) return byCode;
  }
  
  // 2. Поиск по vat_code (если заполнен)
  if (row.vatCode?.trim()) {
    const byVat = await prisma.clients.findUnique({
      where: {
        company_id_vat_code: {
          company_id: companyId,
          vat_code: row.vatCode.trim().toUpperCase()
        }
      }
    });
    if (byVat) return byVat;
  }
  
  // 3. Не найден → создаём нового
  return null;
}
```

### Уникальные индексы в Prisma (напоминание)
```prisma
model clients {
  @@unique([company_id, code])
  @@unique([company_id, vat_code])
}
```

---

## 📌 РЕШЕНИЕ 6: Поле `payWithin` → куда?

### Проблема
Site.pro: `payWithin` = "Invoice payment term (days), for ex.: 7"
У нас есть:
- `clients.payment_terms` — String (текстовое описание)
- `clients.pay_per` — String

### Решение

**Записываем в `payment_terms` с нормализацией:**

```typescript
function transformPayWithin(value: string | number): string | null {
  if (!value) return null;
  
  const days = parseInt(String(value).trim());
  if (isNaN(days)) return String(value).trim();
  
  // Нормализуем в читаемый формат
  if (days === 0) return 'Prepayment';
  if (days === 1) return '1 day';
  return `${days} days`;
}

// Пример использования
payment_terms: transformPayWithin(row.payWithin)  // "7" → "7 days"
```

---

## 📌 РЕШЕНИЕ 7: Поле `residentCode`

### Проблема
Site.pro: `residentCode` = "Taxpayer ID no. in a foreign country"

У нас есть:
- `clients.foreign_taxpayer_code` — для иностранного налогового ID
- `clients.registration_number` — для регистрационного номера

### Решение

**Записываем в `foreign_taxpayer_code`:**

```typescript
foreign_taxpayer_code: row.residentCode?.trim() || null
```

### Обоснование
Название поля Site.pro "Taxpayer ID in a foreign country" точно соответствует нашему `foreign_taxpayer_code`.

---

# 📊 ТАБЛИЦА MAPPING: Excel → Prisma {#mapping-table}

## Основная таблица `clients`

| # | Excel Field | Required | Prisma Target | Transform | Notes |
|---|-------------|----------|---------------|-----------|-------|
| 1 | `name*` | ✅ | `clients.name` | `trim()` | Обязательное |
| 2 | `shortName` | ⛔ | `clients.abbreviation` | `trim()` | Сокращённое название |
| 3 | `code` | ⛔ | `clients.code` | `trim()` | Unique per company |
| 4 | `vatCode` | ⛔ | `clients.vat_code` | `trim().toUpperCase()` | Unique per company |
| 5 | `businessLicenseCode` | ⛔ | `clients.business_license_code` | `trim()` | Бизнес-лицензия |
| 6 | `phoneNumber` | ⛔ | `clients.phone` | `trim()` | Телефон |
| 7 | `faxNumber` | ⛔ | `clients.fax` | `trim()` | Факс |
| 8 | `email` | ⛔ | `clients.email` | См. ADR #4 | **Required у нас!** |
| 9 | `notes` | ⛔ | `clients.notes` | `trim()` | Комментарии |
| 10 | `payWithin` | ⛔ | `clients.payment_terms` | См. ADR #6 | Срок оплаты (дни) |
| 11 | `isJuridical*` | ✅ | `clients.is_juridical` | `0/1 → boolean` | Юр. лицо |
| 12 | `automaticDebtRemind` | ⛔ | `clients.automatic_debt_reminder` | `0/1 → boolean` | Напоминание о долге |
| 13 | `creditSum` | ⛔ | `clients.credit_sum` | `parseFloat()` | Кредитный лимит |
| 14 | `contactInformation` | ⛔ | `clients.contact_information` | `trim()` | Контактная информация |
| 15 | `location*` | ✅ | `is_foreigner` + `country` | См. ADR #1 | **Важно!** |
| 16 | `birthday` | ⛔ | `clients.date_of_birth` | `parseDate()` | Дата рождения |
| 17 | `residentCode` | ⛔ | `clients.foreign_taxpayer_code` | `trim()` | ИНН иностранца |

## Адреса → таблица `client_addresses`

| # | Excel Fields | Prisma Target | Flags | Notes |
|---|--------------|---------------|-------|-------|
| 18-21 | `registrationCountryCode`, `registrationCity`, `registrationAddress`, `registrationZipCode` | `client_addresses` | `is_registration: true` | Юридический адрес |
| 22-25 | `correspondenceCountryCode`, `correspondenceCity`, `correspondenceAddress`, `correspondenceZipCode` | `client_addresses` | `is_correspondence: true` | Фактический адрес |

### Mapping адресов:

| Excel Field | Prisma `client_addresses` Field |
|-------------|--------------------------------|
| `registrationCountryCode` / `correspondenceCountryCode` | `country` |
| `registrationCity` / `correspondenceCity` | `city` |
| `registrationAddress` / `correspondenceAddress` | `address` |
| `registrationZipCode` / `correspondenceZipCode` | `postcode` |

## Банк → таблица `client_bank_accounts`

| # | Excel Field | Prisma Target | Notes |
|---|-------------|---------------|-------|
| 26 | `bankAccount` | `account_number` | Номер счёта |
| 27 | `bankName` | `bank_name` | Название банка (required если есть счёт) |
| 28 | `bankCode` | `bank_code` | Код банка |
| 29 | `bankSwiftCode` | `swift_code` | SWIFT код |

---

# 📝 ИНСТРУКЦИЯ ДЛЯ ДЖУНА: КАК ИМПОРТИРОВАТЬ {#how-to-import}

## Шаг 1: Скачать шаблон

1. Откройте Site.pro → Settings → Data Import
2. Выберите "Clients"
3. Нажмите "Download template"
4. Сохраните файл `b1_import-clients-en.xlsx`

## Шаг 2: Заполнить данные

### Обязательные поля (MUST HAVE)

| Поле | Формат | Пример |
|------|--------|--------|
| `name*` | Текст | `UAB Solar Energy` |
| `isJuridical*` | 0 или 1 | `1` (юр. лицо) |
| `location*` | lt / eu / rest | `lt` (местный) |

### Рекомендуемые поля

| Поле | Формат | Пример |
|------|--------|--------|
| `code` | До 20 символов | `SOLAR001` |
| `vatCode` | До 20 символов | `LT123456789` |
| `email` | email | `info@solar.lt` |
| `phoneNumber` | Текст | `+370 46 123456` |

### Форматы данных

| Тип | Формат | Пример |
|-----|--------|--------|
| Дата | `YYYY.MM.DD` | `1990.10.13` |
| Число | Без пробелов | `1000.50` |
| Boolean | `0` или `1` | `1` = да |
| Страна | ISO 2-буквенный код | `LT`, `DE`, `PL` |

## Шаг 3: Тестовая строка

Заполните одну тестовую строку:

```
name*: Test Client LLC
shortName: TC
code: TEST001
vatCode: LT100000000001
phoneNumber: +370 600 00000
email: test@example.com
isJuridical*: 1
location*: lt
registrationCountryCode: LT
registrationCity: Vilnius
registrationAddress: Test str. 1
registrationZipCode: 01234
```

## Шаг 4: Импорт (будущий API)

```bash
# POST запрос на импорт
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@clients.xlsx" \
  -F "dryRun=true" \
  https://solar-erp.com/api/company/16/clients/import
```

### Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `file` | File | Excel или CSV файл |
| `dryRun` | boolean | `true` = только проверка, без записи |
| `updateExisting` | boolean | `true` = обновлять существующих |

## Шаг 5: Обработка ошибок

### Типичные ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `name is required` | Пустое имя | Заполните колонку `name*` |
| `Duplicate code` | Код уже существует | Используйте другой `code` |
| `Duplicate vat_code` | VAT код уже есть | Используйте другой `vatCode` |
| `Invalid location` | Неверное значение | Используйте: `lt`, `eu`, `rest` |
| `Invalid isJuridical` | Не 0 и не 1 | Укажите `0` или `1` |
| `Invalid date format` | Неверный формат даты | Используйте `YYYY.MM.DD` |

### Что делать если ошибка

1. **Откройте лог импорта** — там указана строка с ошибкой
2. **Исправьте данные** в Excel
3. **Повторите импорт** с `dryRun=true`
4. **Если dryRun успешен** — запустите без dryRun

---

# ✅ ПРОВЕРКА ПОСЛЕ ИМПОРТА {#verification}

## SQL проверки (Prisma Studio или psql)

### 1. Проверить что клиент создался

```sql
-- Найти клиента по имени
SELECT id, name, code, vat_code, email, is_foreigner, country 
FROM clients 
WHERE company_id = 16 
  AND name LIKE '%Test Client%';
```

### 2. Проверить адреса клиента

```sql
-- Найти адреса клиента
SELECT 
  ca.id,
  ca.address,
  ca.city,
  ca.country,
  ca.postcode,
  ca.is_registration,
  ca.is_correspondence
FROM client_addresses ca
JOIN clients c ON ca.client_id = c.id
WHERE c.company_id = 16 
  AND c.name LIKE '%Test Client%';
```

### 3. Проверить банковский счёт

```sql
-- Найти банк клиента
SELECT 
  cba.account_number,
  cba.bank_name,
  cba.bank_code,
  cba.swift_code
FROM client_bank_accounts cba
JOIN clients c ON cba.client_id = c.id
WHERE c.company_id = 16 
  AND c.name LIKE '%Test Client%';
```

## Prisma проверки (код)

```typescript
// Проверка клиента
const client = await prisma.clients.findFirst({
  where: {
    company_id: 16,
    name: { contains: 'Test Client' }
  },
  include: {
    addresses: true,
    bank_accounts: true
  }
});

console.log('Client:', client?.name);
console.log('Addresses:', client?.addresses.length);
console.log('Bank accounts:', client?.bank_accounts.length);
```

## UI проверка

1. Откройте: `https://solar-erp.com/company/16/clients`
2. Найдите клиента в таблице
3. Проверьте что отображаются:
   - ✅ ID (первая колонка)
   - ✅ Название
   - ✅ Код
   - ✅ VAT код
   - ✅ Email
   - ✅ Телефон
   - ✅ Страна
   - ✅ Роль (CLIENT по умолчанию)

---

# 🔌 СПЕЦИФИКАЦИЯ API ИМПОРТА (Будущее) {#api-spec}

## Endpoint

```
POST /api/company/[companyId]/clients/import
```

## Путь файла

```
src/app/api/company/[companyId]/clients/import/route.ts
```

## Request

```typescript
// multipart/form-data
{
  file: File,           // xlsx или csv
  dryRun?: boolean,     // default: false
  updateExisting?: boolean  // default: false
}
```

## Response (Success)

```typescript
{
  success: true,
  stats: {
    total: 100,        // всего строк
    created: 85,       // создано новых
    updated: 10,       // обновлено существующих
    skipped: 3,        // пропущено (дубликаты без updateExisting)
    errors: 2          // ошибок
  },
  errors: [
    { row: 15, field: 'vatCode', message: 'Duplicate value' },
    { row: 42, field: 'email', message: 'Invalid format' }
  ]
}
```

## Response (Dry Run)

```typescript
{
  success: true,
  dryRun: true,
  preview: {
    total: 100,
    willCreate: 85,
    willUpdate: 10,
    willSkip: 3,
    willFail: 2
  },
  sampleData: [
    { row: 1, name: 'UAB Test', code: 'TEST001', action: 'CREATE' },
    { row: 2, name: 'UAB Existing', code: 'EX001', action: 'UPDATE' }
  ],
  errors: [...]
}
```

## Алгоритм импорта

```typescript
async function importClients(companyId: number, file: File, options: ImportOptions) {
  const rows = await parseExcel(file);
  const results = { created: 0, updated: 0, skipped: 0, errors: [] };
  
  for (const [index, row] of rows.entries()) {
    try {
      // 1. Валидация
      validateRow(row);
      
      // 2. Поиск существующего
      const existing = await findExistingClient(companyId, row);
      
      // 3. Трансформация данных
      const clientData = transformRowToClient(row, companyId);
      
      if (options.dryRun) {
        // Только проверка
        continue;
      }
      
      if (existing) {
        if (options.updateExisting) {
          await prisma.clients.update({
            where: { id: existing.id },
            data: clientData
          });
          results.updated++;
        } else {
          results.skipped++;
        }
      } else {
        // 4. Создание клиента
        const newClient = await prisma.clients.create({
          data: clientData
        });
        
        // 5. Создание адресов
        await createAddresses(newClient.id, row);
        
        // 6. Создание банка
        await createBankAccount(newClient.id, row);
        
        results.created++;
      }
    } catch (error) {
      results.errors.push({
        row: index + 1,
        message: error.message
      });
    }
  }
  
  return results;
}
```

---

# 📎 ПРИЛОЖЕНИЯ

## A. Полный пример трансформации строки

```typescript
function transformRowToClient(row: ExcelRow, companyId: number, userId: number) {
  const { is_foreigner, country } = transformLocation(
    row.location,
    row.registrationCountryCode
  );
  
  return {
    company_id: companyId,
    created_by: userId,
    
    // Основные данные
    name: row.name.trim(),
    abbreviation: row.shortName?.trim() || null,
    code: row.code?.trim() || null,
    vat_code: row.vatCode?.trim().toUpperCase() || null,
    business_license_code: row.businessLicenseCode?.trim() || null,
    
    // Контакты
    phone: row.phoneNumber?.trim() || null,
    fax: row.faxNumber?.trim() || null,
    email: generateEmail(row),
    contact_information: row.contactInformation?.trim() || null,
    notes: row.notes?.trim() || null,
    
    // Финансы
    payment_terms: transformPayWithin(row.payWithin),
    credit_sum: row.creditSum ? parseFloat(row.creditSum) : 0,
    automatic_debt_reminder: row.automaticDebtRemind === '1',
    
    // Тип клиента
    is_juridical: row.isJuridical === '1',
    is_foreigner,
    country,
    
    // Адреса (конкатенация)
    legal_address: formatAddress(
      row.registrationAddress,
      row.registrationCity,
      row.registrationZipCode,
      row.registrationCountryCode
    ),
    actual_address: formatAddress(
      row.correspondenceAddress,
      row.correspondenceCity,
      row.correspondenceZipCode,
      row.correspondenceCountryCode
    ),
    
    // Прочее
    date_of_birth: row.birthday ? parseDate(row.birthday) : null,
    foreign_taxpayer_code: row.residentCode?.trim() || null,
    
    // Defaults
    role: 'CLIENT',
    currency: 'EUR',
    is_active: true
  };
}
```

## B. Соответствие Prisma Schema

```prisma
model clients {
  // ✅ Покрыто импортом:
  name                    String       // name*
  abbreviation            String?      // shortName
  code                    String?      // code
  vat_code                String?      // vatCode
  business_license_code   String?      // businessLicenseCode
  phone                   String?      // phoneNumber
  fax                     String?      // faxNumber
  email                   String       // email (generated if empty)
  notes                   String?      // notes
  payment_terms           String?      // payWithin
  is_juridical            Boolean      // isJuridical*
  automatic_debt_reminder Boolean?     // automaticDebtRemind
  credit_sum              Decimal?     // creditSum
  contact_information     String?      // contactInformation
  is_foreigner            Boolean      // location* → mapped
  country                 String?      // location* + registrationCountryCode
  legal_address           String?      // registration* fields
  actual_address          String?      // correspondence* fields
  date_of_birth           DateTime?    // birthday
  foreign_taxpayer_code   String?      // residentCode
  
  // ⛔ НЕ в импорте (defaults или manual):
  role                    ClientRole   // default: CLIENT
  currency                Currency     // default: EUR
  is_active               Boolean      // default: true
  vat_rate                Decimal?     // manual
  eori_code               String?      // manual
  registration_number     String?      // manual (different from residentCode)
  pay_per                 String?      // not used
  registration_date       DateTime?    // not in template
  website                 String?      // not in template
  sabis_customer_name     String?      // not in template
  sabis_customer_code     String?      // not in template
  additional_information  String?      // not in template
}
```

---

## 📚 СВЯЗАННЫЕ ДОКУМЕНТЫ

- [SPRINT1-ARCHITECTURE-README.md](./SPRINT1-ARCHITECTURE-README.md) — Архитектура Sprint 1 (Clients)
- [SPRINT2-ARCHITECTURE-README.md](./SPRINT2-ARCHITECTURE-README.md) — Архитектура Sprint 2 (Products)
- [prisma/schema.prisma](../prisma/schema.prisma) — Prisma Schema

---

**Документ создан:** 2024-12-26  
**Последнее обновление:** 2024-12-26  
**Статус:** ✅ Ready for Review
