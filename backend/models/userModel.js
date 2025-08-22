const bcrypt = require("bcrypt");

const ALLOWED_ROLES = new Set(["responsavel", "professor", "terapeuta", "crianca"]);

async function getAllUsers(db) {
  const sql = `
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY id ASC
  `;
  const { rows } = await db.query(sql);
  return rows;
}

async function createUser(db, { name, email, password, role }) {
  const finalRole = ALLOWED_ROLES.has(String(role || "").toLowerCase())
    ? String(role).toLowerCase()
    : "responsavel";

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);

  const sql = `
    INSERT INTO users (name, email, password, role, created_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING id, name, email, role, created_at
  `;
  const params = [name.trim(), email.trim().toLowerCase(), hash, finalRole];

  const { rows } = await db.query(sql, params);
  return rows[0];
}

module.exports = {
  getAllUsers,
  createUser,
};
