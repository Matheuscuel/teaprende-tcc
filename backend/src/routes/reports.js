const express = require("express")
const { authMiddleware } = require("../middleware/auth")

const router = express.Router()

// Middleware de autenticação para todas as rotas
router.use(authMiddleware)

// Rota para obter o progresso de uma criança ao longo do tempo
router.get("/progress/:childId", async (req, res) => {
  const childId = req.params.childId
  const period = req.query.period || "month" // Opções: week, month, quarter, year

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
    } else if (req.userRole === "crianca") {
      // Se o usuário for uma criança, verificar se é a própria criança
      hasAccess = req.userId === childId
    }

    if (!hasAccess) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    // Determinar o intervalo de datas com base no período
    let dateInterval
    switch (period) {
      case "week":
        dateInterval = "interval '1 week'"
        break
      case "month":
        dateInterval = "interval '1 month'"
        break
      case "quarter":
        dateInterval = "interval '3 months'"
        break
      case "year":
        dateInterval = "interval '1 year'"
        break
      default:
        dateInterval = "interval '1 month'"
    }

    // Obter os jogos que a criança jogou no período
    const gamesResult = await db.query(
      `SELECT DISTINCT g.id, g.title as name
       FROM games g
       JOIN game_progress gp ON g.id = gp.game_id
       WHERE gp.child_id = $1
       AND gp.created_at >= NOW() - ${dateInterval}
       ORDER BY g.title`,
      [childId],
    )

    // Para cada jogo, obter o progresso ao longo do tempo
    const progressData = await Promise.all(
      gamesResult.rows.map(async (game) => {
        const progressResult = await db.query(
          `SELECT gp.score, gp.created_at as date
         FROM game_progress gp
         WHERE gp.child_id = $1
         AND gp.game_id = $2
         AND gp.created_at >= NOW() - ${dateInterval}
         ORDER BY gp.created_at`,
          [childId, game.id],
        )

        return {
          gameId: game.id,
          gameName: game.name,
          scores: progressResult.rows.map((row) => row.score),
          dates: progressResult.rows.map((row) => row.date),
        }
      }),
    )

    res.json(progressData)
  } catch (err) {
    console.error("Erro ao obter progresso:", err)
    res.status(500).json({ message: "Erro ao obter progresso" })
  }
})

// Rota para obter o desenvolvimento de habilidades de uma criança
router.get("/skills/:childId", async (req, res) => {
  const childId = req.params.childId

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
    } else if (req.userRole === "crianca") {
      // Se o usuário for uma criança, verificar se é a própria criança
      hasAccess = req.userId === childId
    }

    if (!hasAccess) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    // Obter as categorias de jogos (habilidades)
    const categoriesResult = await db.query(
      `SELECT DISTINCT g.category
       FROM games g
       JOIN game_progress gp ON g.id = gp.game_id
       WHERE gp.child_id = $1
       ORDER BY g.category`,
      [childId],
    )

    // Para cada categoria, calcular a pontuação média
    const skillsData = await Promise.all(
      categoriesResult.rows.map(async (category) => {
        const scoreResult = await db.query(
          `SELECT AVG(gp.score) as average_score
         FROM game_progress gp
         JOIN games g ON gp.game_id = g.id
         WHERE gp.child_id = $1
         AND g.category = $2`,
          [childId, category.category],
        )

        return {
          skill: category.category,
          score: Math.round(scoreResult.rows[0].average_score || 0),
        }
      }),
    )

    res.json(skillsData)
  } catch (err) {
    console.error("Erro ao obter habilidades:", err)
    res.status(500).json({ message: "Erro ao obter habilidades" })
  }
})

// Rota para obter o tempo dedicado às atividades
router.get("/time-spent/:childId", async (req, res) => {
  const childId = req.params.childId
  const period = req.query.period || "month" // Opções: week, month, quarter, year

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
    } else if (req.userRole === "crianca") {
      // Se o usuário for uma criança, verificar se é a própria criança
      hasAccess = req.userId === childId
    }

    if (!hasAccess) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    // Determinar o intervalo de datas com base no período
    let dateInterval
    switch (period) {
      case "week":
        dateInterval = "interval '1 week'"
        break
      case "month":
        dateInterval = "interval '1 month'"
        break
      case "quarter":
        dateInterval = "interval '3 months'"
        break
      case "year":
        dateInterval = "interval '1 year'"
        break
      default:
        dateInterval = "interval '1 month'"
    }

    // Obter o tempo gasto em cada jogo
    const timeSpentResult = await db.query(
      `SELECT g.title as game_name, SUM(gp.time_spent) as total_time
       FROM game_progress gp
       JOIN games g ON gp.game_id = g.id
       WHERE gp.child_id = $1
       AND gp.created_at >= NOW() - ${dateInterval}
       AND gp.time_spent IS NOT NULL
       GROUP BY g.title
       ORDER BY total_time DESC
       LIMIT 10`,
      [childId],
    )

    // Formatar os dados para o frontend
    const timeSpentData = timeSpentResult.rows.map((row) => ({
      gameName: row.game_name,
      timeSpent: row.total_time, // em segundos
    }))

    res.json(timeSpentData)
  } catch (err) {
    console.error("Erro ao obter tempo gasto:", err)
    res.status(500).json({ message: "Erro ao obter tempo gasto" })
  }
})

// Rota para obter recomendações personalizadas
router.get("/recommendations/:childId", async (req, res) => {
  const childId = req.params.childId

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
    } else if (req.userRole === "crianca") {
      // Se o usuário for uma criança, verificar se é a própria criança
      hasAccess = req.userId === childId
    }

    if (!hasAccess) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    // Obter as habilidades com menor pontuação
    const weakSkillsResult = await db.query(
      `SELECT g.category, AVG(gp.score) as average_score
       FROM game_progress gp
       JOIN games g ON gp.game_id = g.id
       WHERE gp.child_id = $1
       GROUP BY g.category
       ORDER BY average_score
       LIMIT 2`,
      [childId],
    )

    // Obter jogos recomendados para as habilidades fracas
    const recommendedGames = []

    for (const skill of weakSkillsResult.rows) {
      // Obter jogos da categoria que a criança ainda não jogou ou jogou pouco
      const gamesResult = await db.query(
        `SELECT g.id, g.title, g.description, g.level, g.category, g.image_url
         FROM games g
         LEFT JOIN (
           SELECT game_id, COUNT(*) as play_count
           FROM game_progress
           WHERE child_id = $1
           GROUP BY game_id
         ) pc ON g.id = pc.game_id
         WHERE g.category = $2
         ORDER BY COALESCE(pc.play_count, 0), g.level
         LIMIT 2`,
        [childId, skill.category],
      )

      recommendedGames.push(
        ...gamesResult.rows.map((game) => ({
          ...game,
          reason: `Recomendado para melhorar ${skill.category}`,
        })),
      )
    }

    // Obter jogos populares que a criança ainda não jogou
    const popularGamesResult = await db.query(
      `SELECT g.id, g.title, g.description, g.level, g.category, g.image_url
       FROM games g
       LEFT JOIN (
         SELECT game_id
         FROM game_progress
         WHERE child_id = $1
       ) played ON g.id = played.game_id
       WHERE played.game_id IS NULL
       ORDER BY (
         SELECT COUNT(*)
         FROM game_progress
         WHERE game_id = g.id
       ) DESC
       LIMIT 2`,
      [childId],
    )

    recommendedGames.push(
      ...popularGamesResult.rows.map((game) => ({
        ...game,
        reason: "Jogo popular que você ainda não experimentou",
      })),
    )

    res.json(recommendedGames)
  } catch (err) {
    console.error("Erro ao obter recomendações:", err)
    res.status(500).json({ message: "Erro ao obter recomendações" })
  }
})

module.exports = router

