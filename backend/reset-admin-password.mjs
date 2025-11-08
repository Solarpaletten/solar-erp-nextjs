import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    // Новый пароль
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль админа
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@solar-erp.com' },
      data: { password: hashedPassword },
    });

    console.log('✅ Пароль админа сброшен!');
    console.log('📧 Email: admin@solar-erp.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('Теперь можешь войти с этими данными!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
