// backend/src/routes/children.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");

// Papéis do sistema
const ROLES = {
  TERAPEUTA: "terapeuta",
  PROFESSOR: "professor",
  RESPONSAVEL: "responsavel",
  CRIANCA: "crianca",
};

// Quem pode acessar endpoints de crianças (cada ação ainda checa granularmente):
const ALLOWED_ROLES = new Set([ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL]);

// Permissão contextual por criança:
// - terapeuta/professor: pode
// - responsável: somente se for o owner (children.owner_id)
function canManageChild(userRole, userId, childRow) {
  if (!userRole) return false;
  if (userRole === ROLES.TERAPEUTA || userRole === ROLES.PROFESSOR) return true;
  if (userRole === ROLES.RESPONSAVEL && childRow && Number(childRow.owner_id) === Number(userId)) return true;
  return false;
}

/**
 * POST /api/children
 * Cadastrar criança.
 * body: { name, birth_date?, user_id?, owner_id?, notes? }
 * - RESPONSAVEL: força owner_id = req.userId (ignora owner_id do body). user_id (terapeuta/prof) opcional.
 * - TERAPEUTA/PROFESSOR: exige owner_id no body; user_id pode ser omitido.
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const { name, birth_date, user_id, owner_id, notes } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name é obrigatório" });
    }

    let ownerIdToSave = null;
    let therapistIdToSave = null;

    if (userRole === ROLES.RESPONSAVEL) {
      // Responsável sempre é o owner
      ownerIdToSave = Number(userId);
      therapistIdToSave = Number.isInteger(Number(user_id)) ? Number(user_id) : null;
    } else {
      // Terapeuta/Professor devem indicar quem é o responsável (owner_id)
      if (!Number.isInteger(Number(owner_id))) {
        return res.status(400).json({ error: "owner_id (responsável) é obrigatório e deve ser inteiro" });
      }
      ownerIdToSave = Number(owner_id);
      therapistIdToSave = Number.isInteger(Number(user_id)) ? Number(user_id) : null;
    }

    const sql = `
      INSERT INTO children (name, birth_date, user_id, owner_id, created_at, notes)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING id, name, birth_date, user_id, owner_id, created_at, notes
    `;
    const params = [name.trim(), birth_date || null, therapistIdToSave, ownerIdToSave, notes || null];
    const result = await req.db.query(sql, params);

    return res.status(201).json({ child: result.rows[0] });
  } catch (err) {
    console.error("POST /api/children erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * POST /api/children/:id/games
 * Atribuir jogo para a criança. body: { game_id }
 * - Terapeuta/Professor podem sempre; Responsável somente se for owner da criança
 */
router.post("/:id/games", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const childId = Number(req.params.id);
    const { game_id } = req.body || {};
    const gameId = Number(game_id);

    if (!Number.isInteger(childId) || !Number.isInteger(gameId)) {
      return res.status(400).json({ error: "childId e game_id devem ser inteiros" });
    }

    // Carrega a criança
    const childRes = await req.db.query(
      "SELECT id, name, user_id, owner_id FROM children WHERE id = $1",
      [childId]
    );
    if (childRes.rowCount === 0) {
      return res.status(404).json({ error: "Criança não encontrada" });
    }
    const child = childRes.rows[0];

    // Permissão contextual
    if (!canManageChild(userRole, userId, child)) {
      return res.status(403).json({ error: "Sem permissão para gerenciar esta criança" });
    }

    // Verifica jogo
    const gameRes = await req.db.query("SELECT id FROM games WHERE id = $1", [gameId]);
    if (gameRes.rowCount === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    // Atribui (idempotente via UNIQUE(child_id, game_id)), preenchendo assigned_by (NOT NULL)
    const linkSql = `
      INSERT INTO children_games (child_id, game_id, assigned_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (child_id, game_id)
      DO UPDATE SET
        assigned_by = EXCLUDED.assigned_by,
        assigned_at = NOW(),
        active = TRUE
      RETURNING id, child_id, game_id, assigned_at, assigned_by, active
    `;
    const ins = await req.db.query(linkSql, [childId, gameId, userId]);

    let link = ins.rows[0] || null;
    if (!link) {
      const sel = await req.db.query(
        "SELECT id, child_id, game_id, assigned_at, assigned_by, active FROM children_games WHERE child_id=$1 AND game_id=$2",
        [childId, gameId]
      );
      link = sel.rows[0] || null;
    }

    return res.status(201).json({
      assigned: Boolean(link),
      link,
    });
  } catch (err) {
    console.error("POST /api/children/:id/games erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * GET /api/children
 * Lista crianças com paginação e busca por nome.
 * Query: ?q=...&page=1&pageSize=20
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const q = (req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    const whereParts = [];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      whereParts.push(`c.name ILIKE $${params.length}`);
    }

    // restrição por papel
    if (userRole === ROLES.RESPONSAVEL) {
      params.push(userId);
      whereParts.push(`c.owner_id = $${params.length}`);
    }

    const whereSQL = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const sql = `
      SELECT c.id, c.name, c.birth_date, c.user_id, c.owner_id, c.created_at, c.notes,
             u_owner.name AS owner_name, u_ther.name AS therapist_name
      FROM children c
      LEFT JOIN users u_owner ON u_owner.id = c.owner_id
      LEFT JOIN users u_ther  ON u_ther.id  = c.user_id
      ${whereSQL}
      ORDER BY c.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;
    const rows = await req.db.query(sql, params);

    // total para paginação
    const countSql = `SELECT COUNT(*)::int AS total FROM children c ${whereSQL}`;
    const countRes = await req.db.query(countSql, params);

    return res.json({
      page,
      pageSize,
      total: countRes.rows[0]?.total || 0,
      data: rows.rows,
    });
  } catch (err) {
    console.error("GET /api/children erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * GET /api/children/:id
 * Detalhe de uma criança.
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const childId = Number(req.params.id);
    if (!Number.isInteger(childId)) {
      return res.status(400).json({ error: "childId inválido" });
    }

    const sql = `
      SELECT c.id, c.name, c.birth_date, c.user_id, c.owner_id, c.created_at, c.notes,
             u_owner.name AS owner_name, u_ther.name AS therapist_name
      FROM children c
      LEFT JOIN users u_owner ON u_owner.id = c.owner_id
      LEFT JOIN users u_ther  ON u_ther.id  = c.user_id
      WHERE c.id = $1
    `;
    const resChild = await req.db.query(sql, [childId]);
    if (resChild.rowCount === 0) {
      return res.status(404).json({ error: "Criança não encontrada" });
    }
    const child = resChild.rows[0];

    if (!canManageChild(userRole, userId, child)) {
      return res.status(403).json({ error: "Sem permissão para ver esta criança" });
    }

    return res.json(child);
  } catch (err) {
    console.error("GET /api/children/:id erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * PUT /api/children/:id
 * body: { name?, birth_date?, user_id?, notes? }
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const childId = Number(req.params.id);
    if (!Number.isInteger(childId)) {
      return res.status(400).json({ error: "childId inválido" });
    }

    const childRes = await req.db.query("SELECT * FROM children WHERE id = $1", [childId]);
    if (childRes.rowCount === 0) {
      return res.status(404).json({ error: "Criança não encontrada" });
    }
    const child = childRes.rows[0];

    if (!canManageChild(userRole, userId, child)) {
      return res.status(403).json({ error: "Sem permissão para editar esta criança" });
    }

    const { name, birth_date, user_id, notes } = req.body || {};
    const fields = [];
    const params = [];
    let idx = 1;

    if (typeof name === "string" && name.trim()) {
      fields.push(`name = $${idx++}`); params.push(name.trim());
    }
    if (birth_date) {
      fields.push(`birth_date = $${idx++}`); params.push(birth_date);
    }
    if (Number.isInteger(Number(user_id)) || user_id === null) {
      fields.push(`user_id = $${idx++}`); params.push(user_id === null ? null : Number(user_id));
    }
    if (typeof notes === "string") {
      fields.push(`notes = $${idx++}`); params.push(notes);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nada para atualizar" });
    }

    const sql = `
      UPDATE children
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, name, birth_date, user_id, owner_id, created_at, notes
    `;
    params.push(childId);

    const upd = await req.db.query(sql, params);
    return res.json({ child: upd.rows[0] });
  } catch (err) {
    console.error("PUT /api/children/:id erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * DELETE /api/children/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const childId = Number(req.params.id);
    if (!Number.isInteger(childId)) {
      return res.status(400).json({ error: "childId inválido" });
    }

    const childRes = await req.db.query("SELECT * FROM children WHERE id = $1", [childId]);
    if (childRes.rowCount === 0) {
      return res.status(404).json({ error: "Criança não encontrada" });
    }
    const child = childRes.rows[0];

    if (!canManageChild(userRole, userId, child)) {
      return res.status(403).json({ error: "Sem permissão para remover esta criança" });
    }

    await req.db.query("DELETE FROM children WHERE id = $1", [childId]);
    return res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/children/:id erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * GET /api/children/:id/games
 * Lista jogos atribuídos à criança.
 */
router.get("/:id/games", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const childId = Number(req.params.id);
    if (!Number.isInteger(childId)) {
      return res.status(400).json({ error: "childId inválido" });
    }

    const childRes = await req.db.query(
      "SELECT id, name, user_id, owner_id FROM children WHERE id=$1",
      [childId]
    );
    if (childRes.rowCount === 0) {
      return res.status(404).json({ error: "Criança não encontrada" });
    }
    const child = childRes.rows[0];
    if (!canManageChild(userRole, userId, child)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const sql = `
      SELECT cg.id, cg.child_id, cg.game_id, cg.assigned_at, cg.assigned_by, cg.active,
             g.title, g.category, g.level
      FROM children_games cg
      JOIN games g ON g.id = cg.game_id
      WHERE cg.child_id = $1
      ORDER BY cg.assigned_at DESC
    `;
    const rs = await req.db.query(sql, [childId]);
    return res.json(rs.rows);
  } catch (err) {
    console.error("GET /api/children/:id/games erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * GET /api/children/:id/performance
 * Lista relatórios (desempenho) da criança a partir da tabela reports.
 * - Responsável só enxerga se for owner; terapeuta/professor podem ver.
 */
router.get("/:id/performance", authMiddleware, async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;
    if (!ALLOWED_ROLES.has(userRole)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const childId = Number(req.params.id);
    if (!Number.isInteger(childId)) {
      return res.status(400).json({ error: "childId inválido" });
    }

    const childRes = await req.db.query(
      "SELECT id, name, user_id, owner_id FROM children WHERE id = $1",
      [childId]
    );
    if (childRes.rowCount === 0) return res.status(404).json({ error: "Criança não encontrada" });
    const child = childRes.rows[0];

    if (!canManageChild(userRole, userId, child)) {
      return res.status(403).json({ error: "Sem permissão para ver o desempenho desta criança" });
    }

    // Resumo por jogo (usa a VIEW criada na migração)
    const sumSql = `
      SELECT v.*, g.title
      FROM v_child_performance v
      JOIN games g ON g.id = v.game_id
      WHERE v.child_id = $1
      ORDER BY v.last_play DESC NULLS LAST
    `;
    const summary = await req.db.query(sumSql, [childId]);

    return res.json({
      child: { id: child.id, name: child.name },
      summary: summary.rows
    });
  } catch (err) {
    console.error("GET /api/children/:id/performance erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});


module.exports = router;
