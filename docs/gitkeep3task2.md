leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % chmod +x fix-task2.sh 
leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % ./fix-task2.sh
🔧 SOLAR ERP FIX — Task 2
=========================

═══════════════════════════════════════
FIX 1: ПРОВЕРКА tsconfig.json
═══════════════════════════════════════
✅ tsconfig.json OK

═══════════════════════════════════════
FIX 2: СОЗДАНИЕ НЕДОСТАЮЩИХ ФАЙЛОВ
═══════════════════════════════════════
📁 Создаю lib/db.ts...
✅ lib/db.ts создан
📁 Создаю styles/clients-table.css...
✅ styles/clients-table.css создан
✅ lib/rate-limit.ts существует
✅ lib/auth.ts существует

═══════════════════════════════════════
FIX 3: ИСПРАВЛЕНИЕ ИМПОРТА В layout.tsx
═══════════════════════════════════════
✅ Импорт styles в layout.tsx OK

═══════════════════════════════════════
FIX 4: ПРОВЕРКА columnsConfig
═══════════════════════════════════════
✅ config/clients/columnsConfig.ts существует

═══════════════════════════════════════
FIX 5: ПРОВЕРКА GridConfigModal
═══════════════════════════════════════
✅ Скопирован из components/company/clients

═══════════════════════════════════════
FIX 6: ОБНОВЛЕНИЕ ИМПОРТОВ
═══════════════════════════════════════
🔄 Исправляю импорты...
✅ Импорты обновлены

═══════════════════════════════════════
📋 SUMMARY
═══════════════════════════════════════

Созданы файлы:
  ✅ lib/db.ts
  ✅ lib/auth.ts
  ✅ lib/rate-limit.ts
  ✅ styles/clients-table.css

Следующие шаги:
  1. Проверь tsconfig.json:
     "@/*": ["./*"]  (НЕ "./src/*")

  2. Запусти сборку:
     rm -rf .next && pnpm build

  3. Если есть ещё ошибки — покажи их мне

leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % cat tsconfig.json 
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs % rm -rf .next && pnpm build

> solar-erp-nextjs@2.0.0 build /Users/leanid/Documents/ITproject/solar-erp-nextjs
> prisma generate && next build

Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.19.0) to ./node_modules/.pnpm/@prisma+client@6.19.0_prisma@6.19.0_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client in 89ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints

[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
▲ Next.js 16.1.1 (Turbopack)
- Environments: .env.local

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
✓ Compiled successfully in 1884.8ms
  Running TypeScript  ..Failed to compile.

./app/company/[companyId]/clients/page.tsx:361:61
Type error: Type '{ value: string; label: string; }' is not assignable to type 'Key | null | undefined'.

  359 |                         <select value={filters[col.key] || ''} onChange={e => setFilters(p => ({ ...p, [col.key]: e.target.value }))} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white">
  360 |                           <option value="">Все</option>
> 361 |                           {col.enumOptions.map(o => <option key={o} value={o}>{o}</option>)}
      |                                                             ^
  362 |                         </select>
  363 |                       ) : col.filterable && col.type === 'boolean' ? (
  364 |                         <select value={filters[col.key] || ''} onChange={e => setFilters(p => ({ ...p, [col.key]: e.target.value }))} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white">
Next.js build worker exited with code: 1 and signal: null
 ELIFECYCLE  Command failed with exit code 1.
leanid@MacBook-Pro-LeanidHamburg solar-erp-nextjs %   
task2
