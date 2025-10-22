const db = require("../database/db");

exports.assign = async (req, res) => {
  try {
    const { childId, slug } = req.params;
    await db("child_assigned_games")
      .insert({ child_id: childId, slug })
      .onConflict(["child_id","slug"])
      .ignore();
    const rows = await db("child_assigned_games").where({ child_id: childId }).orderBy("slug","asc");
    res.status(201).json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.listAssigned = async (req, res) => {
  try {
    const { childId } = req.params;
    const rows = await db("child_assigned_games").where({ child_id: childId }).orderBy("slug","asc");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.recordSession = async (req, res) => {
  try {
    const { child_id, slug, attempts=0, matched_pairs=0, duration_seconds=0, score=0 } = req.body || {};
    if (!child_id || !slug) return res.status(400).json({ error: "child_id and slug are required" });
    const [id] = await db("game_sessions2").insert({ child_id, slug, attempts, matched_pairs, duration_seconds, score }).returning("id");
    const row = await db("game_sessions2").where({ id: (id?.id ?? id) }).first();
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
