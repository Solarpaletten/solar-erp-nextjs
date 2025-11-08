import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function deleteOldAdmin() {
  try {
    const deleted = await prisma.users.delete({
      where: { email: 'admin@solar-erp.com' }
    });
    
    console.log('✅ Old admin deleted:', deleted.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOldAdmin();
