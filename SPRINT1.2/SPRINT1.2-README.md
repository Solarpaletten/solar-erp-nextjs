# SPRINT 1.2: CLIENTS UI (Professional / Site.pro-level)

> **Версия:** 1.0  
> **Дата:** 2024-12-26  
> **Статус:** ✅ Ready for Installation

---

## 🎯 ЦЕЛЬ

Профессиональная таблица Clients с Grid Config (шестерёнка) как в Site.pro:
- Все поля из Prisma доступны как колонки
- Настройка видимости колонок через модальное окно
- Сохранение конфигурации в localStorage
- Simple mode (default) / Advanced mode

---

## 📁 СТРУКТУРА ФАЙЛОВ

```
sprint1.2/
├── columnsConfig.ts      → src/config/clients/columnsConfig.ts
├── GridConfigModal.tsx   → src/components/clients/GridConfigModal.tsx
└── page.tsx              → src/app/(products)/(dashboard)/company/[companyId]/clients/page.tsx
```

---

## 🔧 ИНСТРУКЦИЯ ПО УСТАНОВКЕ

### Шаг 1: Создать директории

```bash
cd /path/to/solar-erp-nextjs

# Создать директорию для конфигурации
mkdir -p src/config/clients

# Создать директорию для компонентов
mkdir -p src/components/clients
```

### Шаг 2: Скопировать файлы

```bash
# 1. Конфигурация колонок
cp columnsConfig.ts src/config/clients/columnsConfig.ts

# 2. Модальное окно Grid Config
cp GridConfigModal.tsx src/components/clients/GridConfigModal.tsx

# 3. Обновить страницу clients (ЗАМЕНИТЬ существующий файл)
cp page.tsx src/app/\(products\)/\(dashboard\)/company/\[companyId\]/clients/page.tsx
```

### Шаг 3: Установить зависимости (если нет)

```bash
npm install lucide-react
```

### Шаг 4: Проверить сборку

```bash
npm run build
```

---

## 📊 КОЛОНКИ (33 поля из Prisma)

### 🔑 Basic (Simple mode - default ON)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 1 | `id` | ID | number |
| 2 | `name` | Название | string |
| 3 | `abbreviation` | Сокращение | string |
| 4 | `code` | Код | string |
| 5 | `email` | Email | string |
| 6 | `phone` | Телефон | string |
| 7 | `role` | Роль | enum |
| 8 | `currency` | Валюта | enum |
| 9 | `is_active` | Активен | boolean |

### 📋 Registration (Advanced - default OFF)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 10 | `registration_date` | Дата регистрации | date |
| 11 | `registration_number` | Рег. номер | string |
| 12 | `business_license_code` | Бизнес лицензия | string |
| 13 | `is_juridical` | Юр. лицо | boolean |
| 14 | `date_of_birth` | Дата рождения | date |

### 💰 Tax (Advanced - default OFF)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 15 | `vat_code` | НДС код | string |
| 16 | `vat_rate` | Ставка НДС | number |
| 17 | `foreign_taxpayer_code` | ИНН иностранца | string |
| 18 | `is_foreigner` | Иностранец | boolean |
| 19 | `country` | Страна | string |

### 📍 Address (Advanced - default OFF)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 20 | `legal_address` | Юр. адрес | string |
| 21 | `actual_address` | Факт. адрес | string |

### 📞 Contact (Advanced - default OFF)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 22 | `fax` | Факс | string |
| 23 | `website` | Сайт | string |
| 24 | `contact_information` | Контакт. инфо | string |

### 💵 Finance (Advanced - default OFF)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 25 | `credit_sum` | Кредитный лимит | number |
| 26 | `pay_per` | Оплата за | string |
| 27 | `payment_terms` | Условия оплаты | string |
| 28 | `automatic_debt_reminder` | Авто-напоминание | boolean |

### 🚚 Logistics/ERP (Advanced - default OFF)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 29 | `eori_code` | EORI код | string |
| 30 | `sabis_customer_name` | SABIS имя | string |
| 31 | `sabis_customer_code` | SABIS код | string |
| 32 | `notes` | Примечания | string |
| 33 | `additional_information` | Доп. информация | string |

### ⚙️ System (Advanced - default OFF)

| # | Поле | Label | Тип |
|---|------|-------|-----|
| 34 | `created_at` | Создан | date |
| 35 | `updated_at` | Обновлён | date |
| 36 | `created_by` | Создал | number |

---

## 🎨 ФУНКЦИОНАЛ GRID CONFIG

### Модальное окно (⚙️)

- **Search** — поиск по названию колонки
- **Select all / Deselect all** — массовый выбор
- **Checkbox grid** — 4 колонки с чекбоксами
- **Default badge** — метка для колонок Simple mode
- **Save** — сохранить конфигурацию
- **Reset** — сбросить к default
- **LocalStorage** — `clients:grid-config:{companyId}`

### Фильтры в таблице

| Тип колонки | Фильтр |
|-------------|--------|
| `string` | Text input |
| `enum` | Select dropdown |
| `boolean` | Select (Да/Нет) |
| `number` | Text input |
| `date` | Text input |

---

## ✅ ACCEPTANCE CRITERIA

### Grid Config

- [ ] Кнопка ⚙️ открывает модальное окно
- [ ] Все 36 колонок отображаются в модальном окне
- [ ] Поиск по колонкам работает
- [ ] Select all / Deselect all работает
- [ ] Чекбоксы переключают видимость
- [ ] Save сохраняет в localStorage
- [ ] Reset восстанавливает defaults
- [ ] Конфигурация сохраняется после перезагрузки

### Таблица

- [ ] Колонки отображаются согласно конфигурации
- [ ] ID всегда первая колонка
- [ ] Фильтры работают для каждого типа
- [ ] Role отображается как badge
- [ ] is_active отображается как статус-индикатор
- [ ] Даты форматируются правильно
- [ ] Длинные строки обрезаются

### UX

- [ ] Simple mode по умолчанию (9 колонок)
- [ ] Advanced mode включается через Grid Config
- [ ] Таблица не перегружена в default состоянии
- [ ] Адаптивная ширина колонок

---

## 🔗 СВЯЗАННЫЕ ДОКУМЕНТЫ

- [SPRINT1-ARCHITECTURE-README.md](./SPRINT1-ARCHITECTURE-README.md) — Архитектура Clients
- [SPRINT1.1-CLIENTS-IMPORT-MAPPING.md](./SPRINT1.1-CLIENTS-IMPORT-MAPPING.md) — Mapping импорта
- [prisma/schema.prisma](../prisma/schema.prisma) — Prisma Schema

---

## 🚀 ПОСЛЕ УСТАНОВКИ

1. Запустить `npm run dev`
2. Открыть `/company/16/clients`
3. Проверить базовый вид (9 колонок)
4. Нажать ⚙️ и включить дополнительные колонки
5. Сохранить и проверить что конфигурация сохранилась
6. Перезагрузить страницу и проверить persistence

---

**Sprint 1.2 готов к установке!** 🎉
