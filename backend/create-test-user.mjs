
import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const { PrismaClient } = pkg;

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔌 Connecting to database...');
    console.log('📊 DATABASE_URL found:', !!process.env.DATABASE_URL);
    
    const hashedPassword = await bcrypt.hash('pass123', 10);
    
    const user = await prisma.users.upsert({
      where: { email: 'solar@solar.com' },
      update: {},
      create: {
        email: 'solar@solar.com',
        username: 'solar',
        password_hash: hashedPassword,
        role: 'ADMIN',
        status: 'active',
        is_active: true,
        email_verified: true,
        onboarding_completed: true
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: solar@solar.com');
    console.log('🔑 Password: pass123');
    console.log('👤 User ID:', user.id);
    console.log('');
    console.log('🚀 Now you can login at: http://localhost:3000/itsolar/login');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();