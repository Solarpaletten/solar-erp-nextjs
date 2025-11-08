import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    
    // ✅ ИСПРАВЛЕНО: users вместо user
    await prisma.users.update({
      where: { email: 'admin@solar-erp.com' },
      data: { password_hash: hash }
    });
    
    console.log('✅ Пароль админа сброшен!');
    console.log('📧 Email: admin@solar-erp.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('🚀 Теперь можешь войти!');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
