import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// ─── Log which connection method we're using ──────────────────────────────────
if (process.env.DATABASE_URL) {
  console.log('🔌 DB: using DATABASE_URL (Render linked database)');
} else if (process.env.DB_HOST) {
  console.log(`🔌 DB: using DB_HOST=${process.env.DB_HOST} DB_NAME=${process.env.DB_NAME}`);
} else {
  console.warn('⚠️  DB: no DATABASE_URL or DB_HOST set — falling back to localhost (will fail in prod!)');
}

// ─── Pool config ──────────────────────────────────────────────────────────────
// Render injects DATABASE_URL automatically when you link a Postgres database
// to your web service ("Add from Database" in the dashboard).
// Individual DB_* vars work too (for local dev or manual config).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'hirenest_db',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    });

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err.message);
});

// ─── Verify connectivity (called once at startup) ─────────────────────────────
export const testConnection = async (): Promise<void> => {
  const client = await pool.connect();
  client.release();
  console.log('✅ Database connection verified');
};

// ─── Query helper ─────────────────────────────────────────────────────────────
export const query = async (text: string, params?: unknown[]) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    if (!isProd) {
      console.log('query', { text: text.slice(0, 80), ms: Date.now() - start, rows: res.rowCount });
    }
    return res;
  } catch (err: unknown) {
    // Always log full DB errors so they appear in Render logs
    const e = err as Error;
    console.error('DB query error:', e.message, '| query:', text.slice(0, 120));
    throw err;
  }
};

export const getClient = () => pool.connect();
export default pool;
