const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { check, validationResult } = require("express-validator")

const router = express.Router()

// Rota de registro
router.post(
  "/register",
  [
    check("name", "Nome é obrigatório").not().isEmpty(),
    check("email", "Por favor, inclua um email válido").isEmail(),
    check("password", "Por favor, digite uma senha com 6 ou mais caracteres").isLength({ min: 6 }),
    check("role", "Tipo de usuário é obrigatório").isIn(["terapeuta", "professor", "responsavel", "crianca"]),
  ],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, role, institution, specialization } = req.body

    try {
      const db = req.db

      // Verificar se o usuário já existe
      const userExists = await db.query("SELECT * FROM users WHERE email = $1", [email])

      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "Usuário já existe" })
      }

      // Criptografar a senha
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Inserir o usuário no banco de dados
      const result = await db.query(
        "INSERT INTO users (name, email, password, role, institution, specialization) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role",
        [name, email, hashedPassword, role, institution || null, specialization || null],
      )

      const user = result.rows[0]

      res.status(201).json({
        message: "Usuário registrado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (err) {
      console.error("Erro ao registrar usuário:", err)
      res.status(500).json({ message: "Erro ao registrar usuário" })
    }
  },
)

// Rota de login
router.post(
  "/login",
  [check("email", "Por favor, inclua um email válido").isEmail(), check("password", "Senha é obrigatória").exists()],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const db = req.db

      // Verificar se o usuário existe
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email])

      if (result.rows.length === 0) {
        return res.status(400).json({ message: "Credenciais inválidas" })
      }

      const user = result.rows[0]

      // Verificar a senha
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({ message: "Credenciais inválidas" })
      }

      // Gerar token JWT
      const payload = {
        id: user.id,
        role: user.role,
      }

      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
        if (err) throw err

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        })
      })
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      res.status(500).json({ message: "Erro ao fazer login" })
    }
  },
)

module.exports = router

