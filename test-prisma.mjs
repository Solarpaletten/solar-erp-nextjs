import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Prisma connection...');
    
    // Простой тест подключения
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection OK:', result);
    
    // Тест таблицы companies
    const companies = await prisma.companies.findMany({
      take: 5
    });
    console.log('✅ Companies found:', companies.length);
    
    if (companies.length > 0) {
      console.log('Sample company:', companies[0]);
    }
    
  } catch (error) {
    console.error('❌ Prisma error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
