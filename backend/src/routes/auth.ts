import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/itsolar/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Backend: Login attempt received');
    const { email, password } = req.body;
    console.log('📧 Backend: Login for:', email);

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Backend: User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Backend: Invalid password');
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('✅ Backend: Login successful for:', email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('❌ Backend: Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/itsolar/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        email,
        username,
        password_hash: hashedPassword,
        role: 'USER',
        status: 'active',
        is_active: true,
        email_verified: true,
        onboarding_completed: false
      }
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
