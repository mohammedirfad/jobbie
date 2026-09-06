import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// ─── Connection config ────────────────────────────────────────────────────────
// Render injects DATABASE_URL (Internal) automatically when you link a database
// to a web service. Fall back to individual DB_* vars for local dev.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required for Render managed Postgres
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'hirenest_db',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
  process.exit(-1);
});

// ─── Verify the pool can actually connect (called once at startup) ─────────────
export const testConnection = async (): Promise<void> => {
  const client = await pool.connect(); // throws if DB is unreachable
  client.release();
  console.log('✅ Database connection verified');
};

export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (!isProd) {
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
  }
  return res;
};

export const getClient = () => pool.connect();

export default pool;
