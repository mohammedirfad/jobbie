import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// ─── Resolve connection string ────────────────────────────────────────────────
// Accept the connection URL from any of these (in priority order):
//   1. DATABASE_URL          — Render auto-injects this when you link a DB
//   2. DB_HOST that looks like a full URL (common misconfiguration — people
//      paste the whole connection string into DB_HOST by mistake)
//   3. Individual DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD vars
const rawDbHost = process.env.DB_HOST || '';
const connectionString: string | undefined =
  process.env.DATABASE_URL ||
  (rawDbHost.startsWith('postgres') ? rawDbHost : undefined);

let poolConfig: PoolConfig;

if (connectionString) {
  console.log('🔌 DB: connecting via connection string (DATABASE_URL)');
  poolConfig = {
    connectionString,
    ssl: { rejectUnauthorized: false }, // required for Render managed Postgres
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  };
} else if (rawDbHost) {
  console.log(`🔌 DB: connecting via DB_HOST=${rawDbHost}`);
  poolConfig = {
    host:     rawDbHost,
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'hirenest_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: isProd ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  };
} else {
  console.warn('⚠️  DB: no DATABASE_URL or DB_HOST — using localhost (dev fallback)');
  poolConfig = {
    host:     'localhost',
    port:     5432,
    database: 'hirenest_db',
    user:     'postgres',
    password: '',
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  };
}

const pool = new Pool(poolConfig);

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
    const e = err as Error;
    console.error('DB query error:', e.message, '| query:', text.slice(0, 120));
    throw err;
  }
};

export const getClient = () => pool.connect();
export default pool;
