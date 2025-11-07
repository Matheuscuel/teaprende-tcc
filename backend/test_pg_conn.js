require('dotenv').config({ path: 'C:\\Users\\MFCBR\\Documents\\Projects\\teaprende-tcc\\backend\\.env' });
const { Client } = require('pg');

function cfgFromEnv() {
  const ssl = process.env.PGSSL === 'true' ? { rejectUnauthorized:false } : false;
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return { connectionString: process.env.DATABASE_URL, ssl };
  }
  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: String(process.env.PGPASSWORD ?? ''),
    database: process.env.PGDATABASE || 'postgres',
    ssl,
  };
}

(async () => {
  const cfg = cfgFromEnv();
  console.log('→ Testando conexão PG com:', { ...cfg, password: '***' });
  const c = new Client(cfg);
  try {
    await c.connect();
    const r = await c.query('SELECT 1 as ok');
    console.log('✅ Conectado. SELECT 1 =', r.rows[0].ok);
    process.exit(0);
  } catch (e) {
    console.error('❌ Falhou:', e.message);
    process.exit(1);
  } finally {
    try { await c.end(); } catch {}
  }
})();