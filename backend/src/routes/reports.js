const express = require("express");
const { prisma } = require("../db");

const router = express.Router();

// --- helper: monta CSV com BOM p/ Excel ---
function toCsv(rows) {
  const header = [
    "id","created_at_iso","child_id","child_name",
    "game_id","game_title","skill_code","score","time_spent","notes"
  ];
  const lines = [header.join(",")];

  for (const r of rows) {
    const vals = [
      r.id,
      r.created_at_iso || "",
      r.child_id ?? "",
      r.child_name ?? "",
      r.game_id ?? "",
      r.game_title ?? "",
      r.skill_code ?? "",
      r.score ?? "",
      r.time_spent ?? "",
      (r.notes || "").replace(/"/g, '""'),
    ];
    const quoted = vals.map(v => `"${String(v)}"`);
    lines.push(quoted.join(","));
  }
  return lines.join("\n");
}

// GET /reports/export/csv?from=YYYY-MM-DD&to=YYYY-MM-DD&child_id=1&game_id=1
router.get("/export/csv", async (req, res, next) => {
  try {
    const { from, to, child_id, game_id } = req.query;

    let where = "WHERE 1=1";
    if (from)     where += ` AND gp.created_at >= '${new Date(from).toISOString()}'`;
    if (to)       where += ` AND gp.created_at <= '${new Date(to).toISOString()}'`;
    if (child_id) where += ` AND gp.child_id = ${Number(child_id)}`;
    if (game_id)  where += ` AND gp.game_id = ${Number(game_id)}`;

    const sql = `
      SELECT
        gp.id,
        gp.created_at,
        gp.child_id,
        COALESCE(c.name,'')   AS child_name,
        gp.game_id,
        COALESCE(g.title,'')  AS game_title,
        COALESCE(s.code,'')   AS skill_code,
        gp.score,
        gp.time_spent,
        COALESCE(gp.notes,'') AS notes
      FROM game_progress gp
      LEFT JOIN children c ON c.id = gp.child_id
      LEFT JOIN games    g ON g.id = gp.game_id
      LEFT JOIN skills   s ON s.id = g.skill_id
      ${where}
      ORDER BY gp.created_at DESC
    `;
    const rows = await prisma.$queryRawUnsafe(sql);

    const payload = rows.map(r => ({
      ...r,
      created_at_iso: r.created_at ? new Date(r.created_at).toISOString() : ""
    }));

    const csv = toCsv(payload);

    // headers p/ download e Excel (UTF-8 + BOM)
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    const nameParts = [];
    if (child_id) nameParts.push(`child${child_id}`);
    if (game_id)  nameParts.push(`game${game_id}`);
    const base = nameParts.length ? nameParts.join("_") : "all";
    res.setHeader("Content-Disposition", `attachment; filename="progress_${base}.csv"`);

    res.send("\uFEFF" + csv);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
