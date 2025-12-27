// src/config/clients/columnsConfig.ts
// Sprint 1.3 — Updated columns order + SSR-safe localStorage

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'currency';
  width: string;
  filterable: boolean;
  sortable: boolean;
  visible: boolean;
  enumOptions?: { value: string; label: string }[];
}

export const CLIENTS_COLUMNS: ColumnConfig[] = [
  { key: 'registration_date', label: 'Registracijos data', type: 'date', width: '130px', filterable: true, sortable: true, visible: true },
  { key: 'name', label: 'Pavadinimas', type: 'string', width: '200px', filterable: true, sortable: true, visible: true },
  { key: 'abbreviation', label: 'Trumpinys', type: 'string', width: '120px', filterable: true, sortable: true, visible: true },
  { key: 'code', label: 'Kodas', type: 'string', width: '120px', filterable: true, sortable: true, visible: true },
  { key: 'vat_code', label: 'PVM kodas', type: 'string', width: '130px', filterable: true, sortable: true, visible: true },
  { key: 'phone', label: 'Tel. nr.', type: 'string', width: '130px', filterable: true, sortable: true, visible: true },
  { key: 'email', label: 'El. paštas', type: 'string', width: '180px', filterable: true, sortable: true, visible: true },
  { key: 'role', label: 'Vaidmuo', type: 'enum', width: '130px', filterable: true, sortable: true, visible: true,
    enumOptions: [
      { value: 'CLIENT', label: 'Kliyent' },
      { value: 'SUPPLIER', label: 'Tiekėjas' },
      { value: 'BOTH', label: 'Abu' },
    ],
  },
  { key: 'is_juridical', label: 'Juridinis', type: 'boolean', width: '100px', filterable: true, sortable: true, visible: false },
  { key: 'is_active', label: 'Aktyvus', type: 'boolean', width: '100px', filterable: true, sortable: true, visible: false },
  { key: 'is_foreigner', label: 'Užsienis', type: 'boolean', width: '100px', filterable: true, sortable: true, visible: false },
  { key: 'country', label: 'Šalis', type: 'string', width: '130px', filterable: true, sortable: true, visible: false },
  { key: 'legal_address', label: 'Jur. adresas', type: 'string', width: '200px', filterable: true, sortable: true, visible: false },
  { key: 'actual_address', label: 'Faktinis adresas', type: 'string', width: '200px', filterable: true, sortable: true, visible: false },
  { key: 'eori_code', label: 'EORI kodas', type: 'string', width: '150px', filterable: true, sortable: true, visible: false },
  { key: 'business_license_code', label: 'Verslo licencija', type: 'string', width: '150px', filterable: true, sortable: true, visible: false },
  { key: 'vat_rate', label: 'PVM tarifas', type: 'number', width: '100px', filterable: true, sortable: true, visible: false },
  { key: 'credit_sum', label: 'Kredito suma', type: 'currency', width: '130px', filterable: true, sortable: true, visible: false },
  { key: 'currency', label: 'Valiuta', type: 'string', width: '80px', filterable: true, sortable: true, visible: false },
  { key: 'payment_terms', label: 'Mokėjimo sąlygos', type: 'string', width: '150px', filterable: true, sortable: true, visible: false },
  { key: 'date_of_birth', label: 'Giminio data', type: 'date', width: '130px', filterable: true, sortable: true, visible: false },
  { key: 'registration_number', label: 'Registracijos numeris', type: 'string', width: '150px', filterable: true, sortable: true, visible: false },
  { key: 'notes', label: 'Pastabos', type: 'string', width: '180px', filterable: true, sortable: true, visible: false },
  { key: 'additional_information', label: 'Papildoma inf.', type: 'string', width: '200px', filterable: true, sortable: true, visible: false },
  { key: 'contact_information', label: 'Kontaktai', type: 'string', width: '180px', filterable: true, sortable: true, visible: false },
  { key: 'fax', label: 'Faksas', type: 'string', width: '130px', filterable: true, sortable: true, visible: false },
  { key: 'website', label: 'Svetainė', type: 'string', width: '150px', filterable: true, sortable: true, visible: false },
];

export function getDefaultVisibleColumns(): string[] {
  return [
    'registration_date',
    'name',
    'abbreviation',
    'code',
    'vat_code',
    'phone',
    'email',
  ];
}

export function getColumnByKey(key: string): ColumnConfig | undefined {
  return CLIENTS_COLUMNS.find(col => col.key === key);
}

export function loadGridConfig(companyId: string): string[] | null {
  if (typeof window === 'undefined') return null;
  const key = `gridConfig_${companyId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
}

export function saveGridConfig(companyId: string, columns: string[]): void {
  if (typeof window === 'undefined') return;
  const key = `gridConfig_${companyId}`;
  localStorage.setItem(key, JSON.stringify(columns));
}

export function resetGridConfig(companyId: string): void {
  if (typeof window === 'undefined') return;
  const key = `gridConfig_${companyId}`;
  localStorage.removeItem(key);
}
