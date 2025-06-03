const pool = require('./db');

const test = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('🟢 Conectado com sucesso ao PostgreSQL:', res.rows[0]);
  } catch (err) {
    console.error('🔴 Erro na conexão com o PostgreSQL:', err.message);
  } finally {
    pool.end();
  }
};

test();