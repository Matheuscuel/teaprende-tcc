const pool = require('../db');

// Função para criar usuário
const createUser = async (name, email, password) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, password]
  );
  return result.rows[0];
};

// Função para listar todos os usuários
const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  return result.rows;
};

// Exporta corretamente em objeto
module.exports = {
  createUser,
  getAllUsers,
};