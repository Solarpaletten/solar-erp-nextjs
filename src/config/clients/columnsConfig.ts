// src/config/clients/columnsConfig.ts
// Sprint 1.2 — Declarative Column Configuration for Clients Grid
// Source of Truth: Prisma schema + Site.pro fields

export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'currency';

export interface ColumnConfig {
  key: string;                    // Prisma field name
  label: string;                  // Display label (RU)
  labelEn: string;                // Display label (EN)
  type: ColumnType;
  defaultVisible: boolean;        // Show in Simple mode
  category: 'basic' | 'registration' | 'tax' | 'address' | 'contact' | 'finance' | 'logistics' | 'system';
  width?: number;                 // Default width in px
  sortable?: boolean;
  filterable?: boolean;
  enumOptions?: { value: string; label: string }[];
}

// ============================================
// FULL COLUMNS CONFIGURATION
// Based on Prisma clients model + Site.pro
// ============================================

export const CLIENTS_COLUMNS: ColumnConfig[] = [
  // ═══════════════════════════════════════════
  // 🔑 BASIC (Simple mode - default ON)
  // ═══════════════════════════════════════════
  {
    key: 'id',
    label: 'ID',
    labelEn: 'ID',
    type: 'number',
    defaultVisible: true,
    category: 'basic',
    width: 70,
    sortable: true,
    filterable: true,
  },
  {
    key: 'name',
    label: 'Название',
    labelEn: 'Name',
    type: 'string',
    defaultVisible: true,
    category: 'basic',
    width: 200,
    sortable: true,
    filterable: true,
  },
  {
    key: 'abbreviation',
    label: 'Сокращение',
    labelEn: 'Abbreviation',
    type: 'string',
    defaultVisible: true,
    category: 'basic',
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: 'code',
    label: 'Код',
    labelEn: 'Code',
    type: 'string',
    defaultVisible: true,
    category: 'basic',
    width: 100,
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    label: 'Email',
    labelEn: 'Email',
    type: 'string',
    defaultVisible: true,
    category: 'basic',
    width: 180,
    sortable: true,
    filterable: true,
  },
  {
    key: 'phone',
    label: 'Телефон',
    labelEn: 'Phone',
    type: 'string',
    defaultVisible: true,
    category: 'basic',
    width: 130,
    sortable: true,
    filterable: true,
  },
  {
    key: 'role',
    label: 'Роль',
    labelEn: 'Role',
    type: 'enum',
    defaultVisible: true,
    category: 'basic',
    width: 100,
    sortable: true,
    filterable: true,
    enumOptions: [
      { value: 'CLIENT', label: 'Клиент' },
      { value: 'SUPPLIER', label: 'Поставщик' },
      { value: 'BOTH', label: 'Оба' },
    ],
  },
  {
    key: 'currency',
    label: 'Валюта',
    labelEn: 'Currency',
    type: 'enum',
    defaultVisible: true,
    category: 'basic',
    width: 80,
    sortable: true,
    filterable: true,
    enumOptions: [
      { value: 'EUR', label: 'EUR' },
      { value: 'USD', label: 'USD' },
      { value: 'AED', label: 'AED' },
      { value: 'UAH', label: 'UAH' },
      { value: 'GBP', label: 'GBP' },
    ],
  },
  {
    key: 'is_active',
    label: 'Активен',
    labelEn: 'Active',
    type: 'boolean',
    defaultVisible: true,
    category: 'basic',
    width: 80,
    sortable: true,
    filterable: true,
  },

  // ═══════════════════════════════════════════
  // 📋 REGISTRATION (Advanced - default OFF)
  // ═══════════════════════════════════════════
  {
    key: 'registration_date',
    label: 'Дата регистрации',
    labelEn: 'Registration Date',
    type: 'date',
    defaultVisible: false,
    category: 'registration',
    width: 130,
    sortable: true,
    filterable: true,
  },
  {
    key: 'registration_number',
    label: 'Рег. номер',
    labelEn: 'Reg. Number',
    type: 'string',
    defaultVisible: false,
    category: 'registration',
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: 'business_license_code',
    label: 'Бизнес лицензия',
    labelEn: 'Business License',
    type: 'string',
    defaultVisible: false,
    category: 'registration',
    width: 140,
    sortable: true,
    filterable: true,
  },
  {
    key: 'is_juridical',
    label: 'Юр. лицо',
    labelEn: 'Legal Entity',
    type: 'boolean',
    defaultVisible: false,
    category: 'registration',
    width: 90,
    sortable: true,
    filterable: true,
  },
  {
    key: 'date_of_birth',
    label: 'Дата рождения',
    labelEn: 'Date of Birth',
    type: 'date',
    defaultVisible: false,
    category: 'registration',
    width: 130,
    sortable: true,
    filterable: true,
  },

  // ═══════════════════════════════════════════
  // 💰 TAX (Advanced - default OFF)
  // ═══════════════════════════════════════════
  {
    key: 'vat_code',
    label: 'НДС код',
    labelEn: 'VAT Code',
    type: 'string',
    defaultVisible: false,
    category: 'tax',
    width: 130,
    sortable: true,
    filterable: true,
  },
  {
    key: 'vat_rate',
    label: 'Ставка НДС',
    labelEn: 'VAT Rate',
    type: 'number',
    defaultVisible: false,
    category: 'tax',
    width: 100,
    sortable: true,
    filterable: true,
  },
  {
    key: 'foreign_taxpayer_code',
    label: 'ИНН иностранца',
    labelEn: 'Foreign Taxpayer ID',
    type: 'string',
    defaultVisible: false,
    category: 'tax',
    width: 140,
    sortable: true,
    filterable: true,
  },
  {
    key: 'is_foreigner',
    label: 'Иностранец',
    labelEn: 'Foreigner',
    type: 'boolean',
    defaultVisible: false,
    category: 'tax',
    width: 100,
    sortable: true,
    filterable: true,
  },
  {
    key: 'country',
    label: 'Страна',
    labelEn: 'Country',
    type: 'string',
    defaultVisible: false,
    category: 'tax',
    width: 100,
    sortable: true,
    filterable: true,
  },

  // ═══════════════════════════════════════════
  // 📍 ADDRESS (Advanced - default OFF)
  // ═══════════════════════════════════════════
  {
    key: 'legal_address',
    label: 'Юр. адрес',
    labelEn: 'Legal Address',
    type: 'string',
    defaultVisible: false,
    category: 'address',
    width: 200,
    sortable: false,
    filterable: true,
  },
  {
    key: 'actual_address',
    label: 'Факт. адрес',
    labelEn: 'Actual Address',
    type: 'string',
    defaultVisible: false,
    category: 'address',
    width: 200,
    sortable: false,
    filterable: true,
  },

  // ═══════════════════════════════════════════
  // 📞 CONTACT (Advanced - default OFF)
  // ═══════════════════════════════════════════
  {
    key: 'fax',
    label: 'Факс',
    labelEn: 'Fax',
    type: 'string',
    defaultVisible: false,
    category: 'contact',
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: 'website',
    label: 'Сайт',
    labelEn: 'Website',
    type: 'string',
    defaultVisible: false,
    category: 'contact',
    width: 150,
    sortable: true,
    filterable: true,
  },
  {
    key: 'contact_information',
    label: 'Контакт. инфо',
    labelEn: 'Contact Info',
    type: 'string',
    defaultVisible: false,
    category: 'contact',
    width: 180,
    sortable: false,
    filterable: true,
  },

  // ═══════════════════════════════════════════
  // 💵 FINANCE (Advanced - default OFF)
  // ═══════════════════════════════════════════
  {
    key: 'credit_sum',
    label: 'Кредитный лимит',
    labelEn: 'Credit Limit',
    type: 'number',
    defaultVisible: false,
    category: 'finance',
    width: 130,
    sortable: true,
    filterable: true,
  },
  {
    key: 'pay_per',
    label: 'Оплата за',
    labelEn: 'Pay Per',
    type: 'string',
    defaultVisible: false,
    category: 'finance',
    width: 100,
    sortable: true,
    filterable: true,
  },
  {
    key: 'payment_terms',
    label: 'Условия оплаты',
    labelEn: 'Payment Terms',
    type: 'string',
    defaultVisible: false,
    category: 'finance',
    width: 130,
    sortable: true,
    filterable: true,
  },
  {
    key: 'automatic_debt_reminder',
    label: 'Авто-напоминание',
    labelEn: 'Auto Reminder',
    type: 'boolean',
    defaultVisible: false,
    category: 'finance',
    width: 130,
    sortable: true,
    filterable: true,
  },

  // ═══════════════════════════════════════════
  // 🚚 LOGISTICS / ERP (Advanced - default OFF)
  // ═══════════════════════════════════════════
  {
    key: 'eori_code',
    label: 'EORI код',
    labelEn: 'EORI Code',
    type: 'string',
    defaultVisible: false,
    category: 'logistics',
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: 'sabis_customer_name',
    label: 'SABIS имя',
    labelEn: 'SABIS Name',
    type: 'string',
    defaultVisible: false,
    category: 'logistics',
    width: 150,
    sortable: true,
    filterable: true,
  },
  {
    key: 'sabis_customer_code',
    label: 'SABIS код',
    labelEn: 'SABIS Code',
    type: 'string',
    defaultVisible: false,
    category: 'logistics',
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: 'notes',
    label: 'Примечания',
    labelEn: 'Notes',
    type: 'string',
    defaultVisible: false,
    category: 'logistics',
    width: 200,
    sortable: false,
    filterable: true,
  },
  {
    key: 'additional_information',
    label: 'Доп. информация',
    labelEn: 'Additional Info',
    type: 'string',
    defaultVisible: false,
    category: 'logistics',
    width: 200,
    sortable: false,
    filterable: true,
  },

  // ═══════════════════════════════════════════
  // ⚙️ SYSTEM (Advanced - default OFF)
  // ═══════════════════════════════════════════
  {
    key: 'created_at',
    label: 'Создан',
    labelEn: 'Created At',
    type: 'date',
    defaultVisible: false,
    category: 'system',
    width: 150,
    sortable: true,
    filterable: true,
  },
  {
    key: 'updated_at',
    label: 'Обновлён',
    labelEn: 'Updated At',
    type: 'date',
    defaultVisible: false,
    category: 'system',
    width: 150,
    sortable: true,
    filterable: true,
  },
  {
    key: 'created_by',
    label: 'Создал',
    labelEn: 'Created By',
    type: 'number',
    defaultVisible: false,
    category: 'system',
    width: 100,
    sortable: true,
    filterable: true,
  },
];

// ============================================
// CATEGORY LABELS
// ============================================

export const CATEGORY_LABELS: Record<string, { ru: string; en: string; icon: string }> = {
  basic: { ru: 'Основные', en: 'Basic', icon: '🔑' },
  registration: { ru: 'Регистрация', en: 'Registration', icon: '📋' },
  tax: { ru: 'Налоги', en: 'Tax', icon: '💰' },
  address: { ru: 'Адреса', en: 'Address', icon: '📍' },
  contact: { ru: 'Контакты', en: 'Contact', icon: '📞' },
  finance: { ru: 'Финансы', en: 'Finance', icon: '💵' },
  logistics: { ru: 'Логистика/ERP', en: 'Logistics/ERP', icon: '🚚' },
  system: { ru: 'Системные', en: 'System', icon: '⚙️' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get default visible columns (Simple mode)
 */
export function getDefaultVisibleColumns(): string[] {
  return CLIENTS_COLUMNS
    .filter(col => col.defaultVisible)
    .map(col => col.key);
}

/**
 * Get all column keys
 */
export function getAllColumnKeys(): string[] {
  return CLIENTS_COLUMNS.map(col => col.key);
}

/**
 * Get columns by category
 */
export function getColumnsByCategory(category: string): ColumnConfig[] {
  return CLIENTS_COLUMNS.filter(col => col.category === category);
}

/**
 * Get column config by key
 */
export function getColumnByKey(key: string): ColumnConfig | undefined {
  return CLIENTS_COLUMNS.find(col => col.key === key);
}

/**
 * LocalStorage key for grid config
 */
export function getGridConfigKey(companyId: string | number): string {
  return `clients:grid-config:${companyId}`;
}

/**
 * Save grid config to localStorage
 */
export function saveGridConfig(companyId: string | number, visibleColumns: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(getGridConfigKey(companyId), JSON.stringify(visibleColumns));
  }
}

/**
 * Load grid config from localStorage
 */
export function loadGridConfig(companyId: string | number): string[] | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(getGridConfigKey(companyId));
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Reset grid config to defaults
 */
export function resetGridConfig(companyId: string | number): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getGridConfigKey(companyId));
  }
}
