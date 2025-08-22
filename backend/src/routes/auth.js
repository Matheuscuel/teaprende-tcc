const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post(
  "/register",
  [
    check("name", "Nome é obrigatório").not().isEmpty(),
    check("email", "Por favor, inclua um email válido").isEmail(),
    check("password", "Por favor, digite uma senha com 6 ou mais caracteres").isLength({ min: 6 }),
    check("role", "Tipo de usuário é obrigatório").isIn(["terapeuta", "professor", "responsavel", "crianca"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, institution, specialization } = req.body;

    try {
      const db = req.db;

      // Checagem case-insensitive para evitar conflito com ux_users_email (LOWER(email))
      const exists = await db.query("SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      if (exists.rowCount > 0) {
        return res.status(400).json({ message: "Usuário já existe" });
      }

      // Hash de senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert com password_hash
      try {
        const result = await db.query(
          `INSERT INTO users (name, email, password_hash, role, institution, specialization)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, name, email, role`,
          [name, email, hashedPassword, role, institution || null, specialization || null]
        );

        const user = result.rows[0];
        return res.status(201).json({
          message: "Usuário registrado com sucesso",
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
      } catch (e) {
        // 23505 = unique_violation (ex.: ux_users_email em LOWER(email))
        if (e.code === "23505") {
          return res.status(400).json({ message: "Usuário já existe" });
        }
        console.error("Erro ao registrar usuário (INSERT):", e.code, e.message);
        return res.status(500).json({ message: "Erro ao registrar usuário" });
      }
    } catch (err) {
      console.error("Erro ao registrar usuário:", err.message);
      return res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  }
);

/**
 * POST /api/auth/login
 */
router.post(
  "/login",
  [
    check("email", "Por favor, inclua um email válido").isEmail(),
    check("password", "Senha é obrigatória").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const db = req.db;

      // Busca case-insensitive para bater com o índice LOWER(email)
      const result = await db.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);

      if (result.rowCount === 0) {
        return res.status(400).json({ message: "Credenciais inválidas" });
      }

      const user = result.rows[0];

      // Confere senha
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Credenciais inválidas" });
      }

      // Gera token
      const payload = { id: user.id, role: user.role };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
        if (err) {
          console.error("Erro ao assinar JWT:", err);
          return res.status(500).json({ message: "Erro ao fazer login" });
        }

        return res.json({
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
      });
    } catch (err) {
      console.error("Erro ao fazer login:", err.message);
      return res.status(500).json({ message: "Erro ao fazer login" });
    }
  }
);

module.exports = router;
