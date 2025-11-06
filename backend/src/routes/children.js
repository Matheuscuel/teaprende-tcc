const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth");
const ctrl = require("../controllers/childrenController");

// Rota GET "/" para listar crianças baseado no papel do usuário
router.get("/", requireAuth, async (req, res) => {
  try {
    const db = req.db;
    const userId = req.userId;

    // Obter o papel do usuário
    const userResult = await db.query("SELECT role FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const userRole = userResult.rows[0].role;
    let query;
    let params;

    if (userRole === "admin") {
      // Admin vê todas as crianças
      query = `
        SELECT c.id, c.name, c.age, c.gender, c.created_at
        FROM children c
        ORDER BY c.name
      `;
      params = [];
    } else if (userRole === "responsavel") {
      // Responsáveis veem apenas suas próprias crianças
      query = `
        SELECT c.id, c.name, c.age, c.gender, c.created_at
        FROM children c
        JOIN user_children uc ON c.id = uc.child_id
        WHERE uc.user_id = $1
        ORDER BY c.name
      `;
      params = [userId];
    } else if (userRole === "terapeuta" || userRole === "professor") {
      // Terapeutas e professores veem todas as crianças associadas a eles
      query = `
        SELECT DISTINCT c.id, c.name, c.age, c.gender, c.created_at
        FROM children c
        JOIN user_children uc ON c.id = uc.child_id
        WHERE uc.user_id = $1
        ORDER BY c.name
      `;
      params = [userId];
    } else {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const result = await db.query(query, params);
    res.json({ children: result.rows });
  } catch (err) {
    console.error("Erro ao listar crianças:", err);
    res.status(500).json({ message: "Erro ao listar crianças" });
  }
});

// Protegido por JWT
router.get("/mine", requireAuth, ctrl.listMine);

module.exports = router;
