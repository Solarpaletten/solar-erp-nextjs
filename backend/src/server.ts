import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import companiesRouter from './routes/companies';

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Solar ERP Backend API'
  });
});

app.get('/api/echo', (req: Request, res: Response) => {
  res.json({ 
    message: 'Solar ERP API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/itsolar/auth', authRouter);
app.use('/api/itsolar/account/companies', companiesRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

app.listen(PORT, () => {
  console.log('🚀 Solar ERP Backend API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server:  http://localhost:${PORT}`);
  console.log(`📊 Health:  http://localhost:${PORT}/api/health`);
  console.log(`🔧 Echo:    http://localhost:${PORT}/api/echo`);
  console.log('🗄️  Database: PostgreSQL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
