const db = require("../database/db");

exports.list = async (req, res) => {
  try {
    const rows = await db("skills").select("*").where({ active: true }).orderBy("id", "desc");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, category = null, description = null, active = true } = req.body || {};
    if (!name) return res.status(400).json({ error: "name is required" });
    const [id] = await db("skills").insert({ name, category, description, active }).returning("id");
    const created = await db("skills").where({ id: (id?.id ?? id) }).first();
    res.status(201).json(created);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, category, description, active } = req.body || {};
    const count = await db("skills").where({ id: req.params.id }).update({ name, category, description, active, updated_at: db.fn.now() });
    if (!count) return res.status(404).json({ error: "Skill not found" });
    const updated = await db("skills").where({ id: req.params.id }).first();
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const count = await db("skills").where({ id: req.params.id }).update({ active: false, updated_at: db.fn.now() });
    if (!count) return res.status(404).json({ error: "Skill not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// List child skill levels
exports.listByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const rows = await db("child_skills AS cs")
      .select("cs.*", "s.name AS skill_name", "s.category")
      .join("skills AS s", "s.id", "cs.skill_id")
      .where("cs.child_id", childId)
      .orderBy("s.name", "asc");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Set/Upsert level for child skill
exports.setLevel = async (req, res) => {
  try {
    const { childId, skillId } = req.params;
    const { level = 0, evidence_json = null } = req.body || {};
    await db("child_skills")
      .insert({ child_id: childId, skill_id: skillId, level, evidence_json })
      .onConflict(["child_id","skill_id"])
      .merge({ level, evidence_json, updated_at: db.fn.now() });
    const row = await db("child_skills").where({ child_id: childId, skill_id: skillId }).first();
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
