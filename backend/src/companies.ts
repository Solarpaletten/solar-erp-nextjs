import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router: Router = Router();
const prisma = new PrismaClient();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching companies stats...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL value:', process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));
    
    const companies = await prisma.companies.findMany({
      where: { is_active: true },
      include: {
        _count: { select: { clients: true } }
      }
    });

    console.log(`✅ Found ${companies.length} companies`);

    res.json({
      success: true,
      companies: companies.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        is_active: c.is_active,
        created_at: c.created_at,
        clients_count: c._count.clients
      }))
    });
  } catch (error) {
    console.error('❌ Companies stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch companies',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code required' });
    }
    const user = await prisma.users.findFirst();
    if (!user) {
      return res.status(500).json({ error: 'No user' });
    }
    const company = await prisma.companies.create({
      data: {
        name, code,
        description: description || null,
        owner_id: user.id,
        is_active: true,
        legal_entity_type: 'LLC',
        director_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : 'Admin'
      }
    });
    res.status(201).json({ success: true, company });
  } catch (error) {
    console.error('❌ Create company error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
