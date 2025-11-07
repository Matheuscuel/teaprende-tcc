const express = require("express")
const { authMiddleware, isAdmin } = require("../middleware/auth")
const { check, validationResult } = require("express-validator")

const router = express.Router()

// Middleware de autenticaÃ§Ã£o para todas as rotas
router.use(authMiddleware)

// Rota para listar todos os jogos
router.get("/", async (req, res) => {
  try {
    const db = req.db

    const result = await db.query(
      "SELECT id, slug, title, description, level, category, image_url, created_at FROM games ORDER BY title",
    )

    res.json(result.rows)
  } catch (err) {
    console.error("Erro ao listar jogos:", err)
    res.status(500).json({ message: "Erro ao listar jogos" })
  }
})

// Rota para obter detalhes de um jogo especÃ­fico
router.get("/:id", async (req, res) => {
  try {
    const db = req.db
    const gameId = req.params.id

    const result = await db.query(
      "SELECT id, slug, title, description, level, category, image_url, instructions, created_at FROM games WHERE id = $1",
      [gameId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Jogo nÃ£o encontrado" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error("Erro ao obter detalhes do jogo:", err)
    res.status(500).json({ message: "Erro ao obter detalhes do jogo" })
  }
})

// Rota para adicionar um novo jogo (apenas para terapeutas e professores)
router.post(
  "/",
  isAdmin,
  [
    check("title", "TÃ­tulo Ã© obrigatÃ³rio").not().isEmpty(),
    check("description", "DescriÃ§Ã£o Ã© obrigatÃ³ria").not().isEmpty(),
    check("level", "NÃ­vel Ã© obrigatÃ³rio").isIn(["Iniciante", "IntermediÃ¡rio", "AvanÃ§ado"]),
    check("category", "Categoria Ã© obrigatÃ³ria").not().isEmpty(),
  ],
  async (req, res) => {
    // Verificar erros de validaÃ§Ã£o
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description, level, category, imageUrl, instructions } = req.body

    try {
      const db = req.db

      const result = await db.query(
        "INSERT INTO games (title, description, level, category, image_url, instructions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [title, description, level, category, imageUrl || null, instructions || null],
      )

      res.status(201).json({
        message: "Jogo adicionado com sucesso",
        gameId: result.rows[0].id,
      })
    } catch (err) {
      console.error("Erro ao adicionar jogo:", err)
      res.status(500).json({ message: "Erro ao adicionar jogo" })
    }
  },
)

// Rota para atualizar um jogo (apenas para terapeutas e professores)
router.put(
  "/:id",
  isAdmin,
  [
    check("title", "TÃ­tulo Ã© obrigatÃ³rio").not().isEmpty(),
    check("description", "DescriÃ§Ã£o Ã© obrigatÃ³ria").not().isEmpty(),
    check("level", "NÃ­vel Ã© obrigatÃ³rio").isIn(["Iniciante", "IntermediÃ¡rio", "AvanÃ§ado"]),
    check("category", "Categoria Ã© obrigatÃ³ria").not().isEmpty(),
  ],
  async (req, res) => {
    // Verificar erros de validaÃ§Ã£o
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description, level, category, imageUrl, instructions } = req.body
    const gameId = req.params.id

    try {
      const db = req.db

      const result = await db.query(
        "UPDATE games SET title = $1, description = $2, level = $3, category = $4, image_url = $5, instructions = $6 WHERE id = $7 RETURNING id, title, description, level, category, image_url, instructions",
        [title, description, level, category, imageUrl || null, instructions || null, gameId],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Jogo nÃ£o encontrado" })
      }

      res.json(result.rows[0])
    } catch (err) {
      console.error("Erro ao atualizar jogo:", err)
      res.status(500).json({ message: "Erro ao atualizar jogo" })
    }
  },
)

// Rota para registrar o progresso de uma crianÃ§a em um jogo
router.post(
  "/progress",
  [
    check("gameId", "ID do jogo Ã© obrigatÃ³rio").not().isEmpty(),
    check("childId", "ID da crianÃ§a Ã© obrigatÃ³rio").not().isEmpty(),
    check("score", "PontuaÃ§Ã£o Ã© obrigatÃ³ria").isInt({ min: 0, max: 100 }),
  ],
  async (req, res) => {
    // Verificar erros de validaÃ§Ã£o
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { gameId, childId, score, timeSpent, notes } = req.body

    try {
      const db = req.db

      // Verificar se o usuÃ¡rio tem acesso a esta crianÃ§a
      let hasAccess = false

      if (req.userRole === "responsavel") {
        const result = await db.query("SELECT * FROM children WHERE id = $1 AND parent_id = $2", [childId, req.userId])
        hasAccess = result.rows.length > 0
      } else if (req.userRole === "terapeuta" || req.userRole === "professor") {
        const result = await db.query("SELECT * FROM child_professional WHERE child_id = $1 AND professional_id = $2", [
          childId,
          req.userId,
        ])
        hasAccess = result.rows.length > 0
      } else if (req.userRole === "crianca") {
        // Se o usuÃ¡rio for uma crianÃ§a, verificar se Ã© a prÃ³pria crianÃ§a
        hasAccess = req.userId === childId
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "Acesso negado" })
      }

      // Verificar se o jogo existe
      const gameResult = await db.query("SELECT * FROM games WHERE id = $1", [gameId])

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ message: "Jogo nÃ£o encontrado" })
      }

      // Verificar se a crianÃ§a existe
      const childResult = await db.query("SELECT * FROM children WHERE id = $1", [childId])

      if (childResult.rows.length === 0) {
        return res.status(404).json({ message: "CrianÃ§a nÃ£o encontrada" })
      }

      // Registrar o progresso
      const result = await db.query(
        "INSERT INTO game_progress (game_id, child_id, score, time_spent, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [gameId, childId, score, timeSpent || null, notes || null],
      )

      res.status(201).json({
        message: "Progresso registrado com sucesso",
        progressId: result.rows[0].id,
      })
    } catch (err) {
      console.error("Erro ao registrar progresso:", err)
      res.status(500).json({ message: "Erro ao registrar progresso" })
    }
  },
)

// Rota para obter atividades recentes
router.get("/recent-activities", async (req, res) => {
  try {
    const db = req.db

    let query
    let params

    if (req.userRole === "responsavel") {
      // ResponsÃ¡veis veem apenas atividades de suas prÃ³prias crianÃ§as
      query = `
        SELECT gp.id, c.name as child_name, g.name as game_name, gp.score, gp.created_at as date
        FROM game_progress gp
        JOIN children c ON gp.child_id = c.id
        JOIN games g ON gp.game_id = g.id
        WHERE c.parent_id = $1
        ORDER BY gp.created_at DESC
        LIMIT 10
      `
      params = [req.userId]
    } else if (req.userRole === "terapeuta" || req.userRole === "professor") {
      // Terapeutas e professores veem atividades de crianÃ§as associadas a eles
      query = `
        SELECT gp.id, c.name as child_name, g.name as game_name, gp.score, gp.created_at as date
        FROM game_progress gp
        JOIN children c ON gp.child_id = c.id
        JOIN games g ON gp.game_id = g.id
        JOIN child_professional cp ON c.id = cp.child_id
        WHERE cp.professional_id = $1
        ORDER BY gp.created_at DESC
        LIMIT 10
      `
      params = [req.userId]
    } else if (req.userRole === "crianca") {
      // CrianÃ§as veem apenas suas prÃ³prias atividades
      query = `
        SELECT gp.id, c.name as child_name, g.name as game_name, gp.score, gp.created_at as date
        FROM game_progress gp
        JOIN children c ON gp.child_id = c.id
        JOIN games g ON gp.game_id = g.id
        WHERE gp.child_id = $1
        ORDER BY gp.created_at DESC
        LIMIT 10
      `
      params = [req.userId]
    } else {
      return res.status(403).json({ message: "Acesso negado" })
    }

    const result = await db.query(query, params)

    res.json(result.rows)
  } catch (err) {
    console.error("Erro ao obter atividades recentes:", err)
    res.status(500).json({ message: "Erro ao obter atividades recentes" })
  }
})

module.exports = router


