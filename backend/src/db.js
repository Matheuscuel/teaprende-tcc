require('dotenv').config();
const { Pool } = require('pg');

function buildPgConfig() {
  const ssl = process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false;
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return { connectionString: process.env.DATABASE_URL, ssl };
  }
  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: String(process.env.PGPASSWORD ?? ''),
    database: process.env.PGDATABASE || 'teaprende',
    ssl,
  };
}

const pool = new Pool(buildPgConfig());
module.exports = { pool, buildPgConfig };