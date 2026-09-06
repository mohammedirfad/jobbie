import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import categoryRoutes from './routes/categoryRoutes';
import applicationRoutes from './routes/applicationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { initDatabase } from './db/initDb';
import { query } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allowed origins (checked in order):
//   1. Exact match against CORS_ORIGIN env var
//   2. Any *.vercel.app subdomain  (covers all preview + production Vercel deployments)
//   3. Any localhost:* port        (local dev)
//   4. No-origin requests          (Postman, curl, mobile apps)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // no-origin: allow
      if (origin === CORS_ORIGIN) return callback(null, true); // exact match
      if (/^https:\/\/[^.]+\.vercel\.app$/.test(origin)) return callback(null, true); // any *.vercel.app
      if (!isProd && origin.startsWith('http://localhost:')) return callback(null, true); // local dev
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Security & utility middleware ────────────────────────────────────────────
app.use(helmet());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: isProd ? parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') : 60_000,
  max:      isProd ? parseInt(process.env.RATE_LIMIT_MAX        || '100')   : 2000,
  skip:     () => !isProd,
  message:  { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const authLimiter = rateLimit({
  windowMs: isProd ? 15 * 60 * 1000 : 60_000,
  max:      isProd ? 20              : 500,
  skip:     () => !isProd,
  message:  { success: false, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
});

app.use('/api', limiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Health check (plain + DB ping) ──────────────────────────────────────────
app.get('/health', async (_req, res) => {
  res.json({
    success: true,
    message: 'HireNest API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({
      success: true,
      message: 'HireNest API is running',
      db: 'connected',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Database unreachable',
      db: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin',        dashboardRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Verify DB connection, run migrations, seed — crashes loudly if DB is down
    await initDatabase();
  } catch (err) {
    console.error('❌ Database init failed — server will not start:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 HireNest API running on http://localhost:${PORT}`);
    console.log(`📄 Health:      http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 CORS origin: ${CORS_ORIGIN}\n`);
  });
};

startServer();

export default app;
