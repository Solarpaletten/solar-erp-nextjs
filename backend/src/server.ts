import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Solar ERP Backend API'
  });
});

// Echo endpoint
app.get('/api/echo', (req: Request, res: Response) => {
  res.json({ 
    message: 'Solar ERP API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes placeholder
app.get('/api/itsolar/auth/login', (req: Request, res: Response) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

app.get('/api/itsolar/account/companies', (req: Request, res: Response) => {
  res.json({ message: 'Companies endpoint - to be implemented' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 Solar ERP Backend API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server:  http://localhost:${PORT}`);
  console.log(`📊 Health:  http://localhost:${PORT}/api/health`);
  console.log(`🔧 Echo:    http://localhost:${PORT}/api/echo`);
  console.log(`🗄️  Database: PostgreSQL`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
