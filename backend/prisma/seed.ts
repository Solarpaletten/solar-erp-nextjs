import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@solar-erp.com' },
    update: {},
    create: {
      email: 'admin@solar-erp.com',
      passwordHash: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // 2. Create demo company
  const company = await prisma.company.upsert({
    where: { taxId: 'DE999888777' },
    update: {},
    create: {
      name: 'Solar Demo GmbH',
      legalName: 'Solar Demo Solutions GmbH',
      taxId: 'DE999888777',
      email: 'info@solar-demo.com',
      phone: '+49 30 12345678',
      address: 'Sonnenstraße 123',
      city: 'Berlin',
      country: 'DE',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Demo company:', company.name);

  // 3. Link admin to company
  await prisma.companyUser.upsert({
    where: {
      userId_companyId: {
        userId: admin.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      companyId: company.id,
      role: 'OWNER',
    },
  });
  console.log('✅ Admin linked as OWNER');

  // 4. Create clients
  const clients = [
    {
      name: 'ACME Solar Ltd',
      email: 'contact@acme-solar.com',
      type: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'BrightSun GmbH',
      email: 'info@brightsun.de',
      type: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
    },
    {
      name: 'SolarTech Supplies',
      email: 'sales@solartech.com',
      type: 'SUPPLIER' as const,
      status: 'ACTIVE' as const,
    },
  ];

  for (const client of clients) {
    await prisma.client.create({
      data: {
        ...client,
        companyId: company.id,
        createdById: admin.id,
      },
    });
    console.log('✅ Client:', client.name);
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('📋 Login credentials:');
  console.log('   Email: admin@solar-erp.com');
  console.log('   Password: Admin123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
