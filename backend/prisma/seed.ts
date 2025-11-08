// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ✅ ИСПРАВЛЕНО: Используем правильное название модели users
  const adminPassword = await bcrypt.hash('pass123', 10);
  const admin = await prisma.users.upsert({
    where: { email: 'solar@solar.com' },
    update: {},
    create: {
      email: 'solar@solar.com',
      username: 'admin',  // ✅ Добавлено обязательное поле
      password_hash: adminPassword,  // ✅ Правильное название поля
      first_name: 'System',  // ✅ Правильное название поля
      last_name: 'solar',  // ✅ Правильное название поля
      role: 'ADMIN',  // ✅ Правильный enum
      status: 'active',  // ✅ Это строка, не enum
      is_active: true,  // ✅ Добавлено обязательное поле
      email_verified: true,  // ✅ Добавлено для удобства
    },
  });
  console.log('✅ Admin user:', admin.email);

  // ✅ ИСПРАВЛЕНО: Используем правильное название модели companies
  const company = await prisma.companies.upsert({
    where: { code: 'DEMO001' },  // ✅ Используем code вместо taxId
    update: {},
    create: {
      code: 'DEMO001',  // ✅ Обязательное поле
      name: 'Solar Demo GmbH',
      short_name: 'Demo',  // ✅ Добавлено
      legal_entity_type: 'GmbH',  // ✅ Обязательное поле
      director_name: 'Demo Director',  // ✅ Обязательное поле
      owner_id: admin.id,  // ✅ Правильная связь
      email: 'info@solar-demo.com',
      phone: '+49 30 12345678',
      legal_address: 'Sonnenstraße 123, Berlin',
      actual_address: 'Sonnenstraße 123, Berlin',
      tax_country: 'DE',  // ✅ По умолчанию UAE, но можно изменить
      base_currency: 'EUR',  // ✅ Изменено с AED на EUR для Германии
      is_active: true,
      setup_completed: true,
    },
  });
  console.log('✅ Demo company:', company.name);

  // ✅ ИСПРАВЛЕНО: Связываем admin с компанией через company_users
  await prisma.company_users.upsert({
    where: {
      company_id_user_id: {  // ✅ Правильный составной ключ
        company_id: company.id,
        user_id: admin.id,
      },
    },
    update: {},
    create: {
      company_id: company.id,
      user_id: admin.id,
      role: 'OWNER',  // ✅ Правильный enum
      is_active: true,
    },
  });
  console.log('✅ Admin linked as OWNER');

  // ✅ ИСПРАВЛЕНО: Создаем клиентов с правильными полями
  const clientsData = [
    {
      name: 'ACME Solar Ltd',
      email: 'contact@acme-solar.com',
      code: 'ACME001',
      role: 'CLIENT' as const,
    },
    {
      name: 'BrightSun GmbH',
      email: 'info@brightsun.de',
      code: 'BRIGHT001',
      role: 'CLIENT' as const,
    },
    {
      name: 'SolarTech Supplies',
      email: 'sales@solartech.com',
      code: 'SOLAR001',
      role: 'SUPPLIER' as const,
    },
  ];

  for (const clientData of clientsData) {
    await prisma.clients.create({
      data: {
        ...clientData,
        company_id: company.id,  // ✅ Правильное поле
        created_by: admin.id,  // ✅ Правильное поле
        is_active: true,
        is_juridical: true,
        is_foreigner: false,
        currency: 'EUR',
      },
    });
    console.log('✅ Client:', clientData.name);
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('📋 Login credentials:');
  console.log('   Email: solar@solar.com');
  console.log('   Password: pass123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });