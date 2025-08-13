const express = require("express")
const { authMiddleware, isAdmin } = require("../middleware/auth")
const { check, validationResult } = require("express-validator")

const router = express.Router()

// Middleware de autenticação para todas as rotas
router.use(authMiddleware)

// Rota para obter o perfil do usuário atual
router.get("/me", async (req, res) => {
  try {
    const db = req.db

    const result = await db.query(
      "SELECT id, name, email, role, institution, specialization, created_at FROM users WHERE id = $1",
      [req.userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error("Erro ao obter perfil do usuário:", err)
    res.status(500).json({ message: "Erro ao obter perfil do usuário" })
  }
})

// Rota para atualizar o perfil do usuário
router.put(
  "/me",
  [check("name", "Nome é obrigatório").not().isEmpty(), check("email", "Por favor, inclua um email válido").isEmail()],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, institution, specialization } = req.body

    try {
      const db = req.db

      // Verificar se o email já está em uso por outro usuário
      const emailCheck = await db.query("SELECT * FROM users WHERE email = $1 AND id != $2", [email, req.userId])

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email já está em uso" })
      }

      // Atualizar o perfil do usuário
      const result = await db.query(
        "UPDATE users SET name = $1, email = $2, institution = $3, specialization = $4 WHERE id = $5 RETURNING id, name, email, role, institution, specialization",
        [name, email, institution || null, specialization || null, req.userId],
      )

      res.json(result.rows[0])
    } catch (err) {
      console.error("Erro ao atualizar perfil do usuário:", err)
      res.status(500).json({ message: "Erro ao atualizar perfil do usuário" })
    }
  },
)

// Rota para listar crianças associadas ao usuário atual
router.get("/children", async (req, res) => {
  try {
    const db = req.db

    let query
    let params

    if (req.userRole === "responsavel") {
      // Responsáveis veem apenas suas próprias crianças
      query = `
        SELECT c.id, c.name, c.age, c.gender, c.created_at,
               COALESCE(
                 (SELECT AVG(gp.score) FROM game_progress gp WHERE gp.child_id = c.id),
                 0
               ) as progress
        FROM children c
        WHERE c.parent_id = $1
        ORDER BY c.name
      `
      params = [req.userId]
    } else if (req.userRole === "terapeuta" || req.userRole === "professor") {
      // Terapeutas e professores veem todas as crianças associadas a eles
      query = `
        SELECT c.id, c.name, c.age, c.gender, c.created_at,
               COALESCE(
                 (SELECT AVG(gp.score) FROM game_progress gp WHERE gp.child_id = c.id),
                 0
               ) as progress
        FROM children c
        JOIN child_professional cp ON c.id = cp.child_id
        WHERE cp.professional_id = $1
        ORDER BY c.name
      `
      params = [req.userId]
    } else {
      return res.status(403).json({ message: "Acesso negado" })
    }

    const result = await db.query(query, params)

    // Formatar os dados para incluir a última atividade
    const children = await Promise.all(
      result.rows.map(async (child) => {
        const lastActivityResult = await db.query(
          `SELECT g.name as game_name, gp.created_at as date
         FROM game_progress gp
         JOIN games g ON gp.game_id = g.id
         WHERE gp.child_id = $1
         ORDER BY gp.created_at DESC
         LIMIT 1`,
          [child.id],
        )

        const lastActivity =
          lastActivityResult.rows.length > 0
            ? `${lastActivityResult.rows[0].game_name} em ${new Date(lastActivityResult.rows[0].date).toLocaleString()}`
            : "Nenhuma atividade registrada"

        return {
          ...child,
          progress: Math.round(child.progress),
          lastActivity: lastActivity,
        }
      }),
    )

    res.json(children)
  } catch (err) {
    console.error("Erro ao listar crianças:", err)
    res.status(500).json({ message: "Erro ao listar crianças" })
  }
})

// Rota para adicionar uma criança
router.post(
  "/children",
  [
    check("name", "Nome é obrigatório").not().isEmpty(),
    check("age", "Idade é obrigatória").isInt({ min: 1, max: 18 }),
    check("gender", "Gênero é obrigatório").isIn(["masculino", "feminino", "outro"]),
  ],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, age, gender, notes } = req.body

    try {
      const db = req.db

      // Iniciar uma transação
      await db.query("BEGIN")

      let childId

      if (req.userRole === "responsavel") {
        // Responsável adiciona uma criança como pai/mãe
        const result = await db.query(
          "INSERT INTO children (name, age, gender, notes, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [name, age, gender, notes || null, req.userId],
        )
        childId = result.rows[0].id
      } else if (req.userRole === "terapeuta" || req.userRole === "professor") {
        // Terapeuta ou professor adiciona uma criança e se associa a ela
        const result = await db.query(
          "INSERT INTO children (name, age, gender, notes) VALUES ($1, $2, $3, $4) RETURNING id",
          [name, age, gender, notes || null],
        )
        childId = result.rows[0].id

        // Associar o profissional à criança
        await db.query("INSERT INTO child_professional (child_id, professional_id) VALUES ($1, $2)", [
          childId,
          req.userId,
        ])
      } else {
        await db.query("ROLLBACK")
        return res.status(403).json({ message: "Acesso negado" })
      }

      // Confirmar a transação
      await db.query("COMMIT")

      res.status(201).json({
        message: "Criança adicionada com sucesso",
        childId,
      })
    } catch (err) {
      await db.query("ROLLBACK")
      console.error("Erro ao adicionar criança:", err)
      res.status(500).json({ message: "Erro ao adicionar criança" })
    }
  },
)

// Rota para obter detalhes de uma criança específica
router.get("/children/:id", async (req, res) => {
  try {
    const db = req.db
    const childId = req.params.id

    // Verificar se o usuário tem acesso a esta criança
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
    }

    if (!hasAccess) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    // Obter detalhes da criança
    const childResult = await db.query("SELECT id, name, age, gender, notes, created_at FROM children WHERE id = $1", [
      childId,
    ])

    if (childResult.rows.length === 0) {
      return res.status(404).json({ message: "Criança não encontrada" })
    }

    const child = childResult.rows[0]

    // Obter progresso médio
    const progressResult = await db.query("SELECT AVG(score) as average_score FROM game_progress WHERE child_id = $1", [
      childId,
    ])

    const averageProgress = progressResult.rows[0].average_score || 0

    // Obter profissionais associados
    const professionalsResult = await db.query(
      `SELECT u.id, u.name, u.role, u.institution, u.specialization
       FROM users u
       JOIN child_professional cp ON u.id = cp.professional_id
       WHERE cp.child_id = $1`,
      [childId],
    )

    // Obter atividades recentes
    const activitiesResult = await db.query(
      `SELECT gp.id, g.name as game_name, gp.score, gp.created_at
       FROM game_progress gp
       JOIN games g ON gp.game_id = g.id
       WHERE gp.child_id = $1
       ORDER BY gp.created_at DESC
       LIMIT 5`,
      [childId],
    )

    res.json({
      ...child,
      progress: Math.round(averageProgress),
      professionals: professionalsResult.rows,
      recentActivities: activitiesResult.rows,
    })
  } catch (err) {
    console.error("Erro ao obter detalhes da criança:", err)
    res.status(500).json({ message: "Erro ao obter detalhes da criança" })
  }
})

// Rota para atualizar informações de uma criança
router.put(
  "/children/:id",
  [
    check("name", "Nome é obrigatório").not().isEmpty(),
    check("age", "Idade é obrigatória").isInt({ min: 1, max: 18 }),
    check("gender", "Gênero é obrigatório").isIn(["masculino", "feminino", "outro"]),
  ],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, age, gender, notes } = req.body
    const childId = req.params.id

    try {
      const db = req.db

      // Verificar se o usuário tem acesso a esta criança
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
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "Acesso negado" })
      }

      // Atualizar informações da criança
      const result = await db.query(
        "UPDATE children SET name = $1, age = $2, gender = $3, notes = $4 WHERE id = $5 RETURNING id, name, age, gender, notes",
        [name, age, gender, notes || null, childId],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Criança não encontrada" })
      }

      res.json(result.rows[0])
    } catch (err) {
      console.error("Erro ao atualizar informações da criança:", err)
      res.status(500).json({ message: "Erro ao atualizar informações da criança" })
    }
  },
)

// Rota para associar um profissional a uma criança (apenas para terapeutas e professores)
router.post(
  "/children/:id/professionals",
  isAdmin,
  [check("professionalId", "ID do profissional é obrigatório").not().isEmpty()],
  async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { professionalId } = req.body
    const childId = req.params.id

    try {
      const db = req.db

      // Verificar se o profissional existe e é um terapeuta ou professor
      const professionalResult = await db.query("SELECT * FROM users WHERE id = $1 AND (role = $2 OR role = $3)", [
        professionalId,
        "terapeuta",
        "professor",
      ])

      if (professionalResult.rows.length === 0) {
        return res.status(404).json({ message: "Profissional não encontrado ou não é um terapeuta/professor" })
      }

      // Verificar se a criança existe
      const childResult = await db.query("SELECT * FROM children WHERE id = $1", [childId])

      if (childResult.rows.length === 0) {
        return res.status(404).json({ message: "Criança não encontrada" })
      }

      // Verificar se a associação já existe
      const existingResult = await db.query(
        "SELECT * FROM child_professional WHERE child_id = $1 AND professional_id = $2",
        [childId, professionalId],
      )

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ message: "Profissional já está associado a esta criança" })
      }

      // Criar a associação
      await db.query("INSERT INTO child_professional (child_id, professional_id) VALUES ($1, $2)", [
        childId,
        professionalId,
      ])

      res.status(201).json({
        message: "Profissional associado com sucesso",
      })
    } catch (err) {
      console.error("Erro ao associar profissional:", err)
      res.status(500).json({ message: "Erro ao associar profissional" })
    }
  },
)

module.exports = router
// LISTAR todos os usuários (apenas terapeuta/professor)
router.get("/", isAdmin, async (req, res) => {
  try {
    const db = req.db;
    const q = await db.query(
      `SELECT id, name, email, role, institution, specialization, created_at
         FROM users
        ORDER BY created_at DESC`
    );
    return res.json(q.rows);
  } catch (e) {
    console.error("Erro GET /users:", e);
    return res.status(500).json({ message: "Erro ao listar usuários" });
  }
});

// EXCLUIR usuário (apenas terapeuta/professor) com salvaguardas
router.delete("/:id", isAdmin, async (req, res) => {
  const targetId = req.params.id;

  // 1) Impedir excluir a si mesmo
  if (req.userId === targetId) {
    return res.status(400).json({ message: "Você não pode excluir a si mesmo." });
  }

  try {
    const db = req.db;

    // 2) Verificar existência
    const u = await db.query(`SELECT id, role FROM users WHERE id = $1`, [targetId]);
    if (!u.rows.length) return res.status(404).json({ message: "Usuário não encontrado" });
    const target = u.rows[0];

    // 3) Impedir excluir o último “admin” (terapeuta/professor)
    if (target.role === "terapeuta" || target.role === "professor") {
      const c = await db.query(
        `SELECT COUNT(*)::int AS n
           FROM users
          WHERE role IN ('terapeuta','professor')`
      );
      if (c.rows[0].n <= 1) {
        return res.status(400).json({ message: "Não é possível remover o último administrador." });
      }
    }

    // 4) Deletar
    await db.query(`DELETE FROM users WHERE id = $1`, [targetId]);
    return res.status(204).send();
  } catch (e) {
    console.error("Erro DELETE /users/:id:", e);
    return res.status(500).json({ message: "Erro ao excluir usuário" });
  }
});


