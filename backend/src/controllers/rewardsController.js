const db = require("../database/db");

exports.list = async (req, res) => {
  try {
    const rows = await db("rewards").select("*").where({ active: true }).orderBy("points", "asc");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, points = 0, icon = null, active = true } = req.body || {};
    if (!name) return res.status(400).json({ error: "name is required" });
    const [id] = await db("rewards").insert({ name, points, icon, active }).returning("id");
    const created = await db("rewards").where({ id: (id?.id ?? id) }).first();
    res.status(201).json(created);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, points, icon, active } = req.body || {};
    const count = await db("rewards").where({ id: req.params.id }).update({ name, points, icon, active, updated_at: db.fn.now() });
    if (!count) return res.status(404).json({ error: "Reward not found" });
    const updated = await db("rewards").where({ id: req.params.id }).first();
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const count = await db("rewards").where({ id: req.params.id }).update({ active: false, updated_at: db.fn.now() });
    if (!count) return res.status(404).json({ error: "Reward not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.award = async (req, res) => {
  try {
    const { child_id, reward_id, points_awarded = 0, reason = null } = req.body || {};
    if (!child_id || !reward_id) return res.status(400).json({ error: "child_id and reward_id are required" });
    const [id] = await db("child_rewards").insert({ child_id, reward_id, points_awarded, reason }).returning("id");
    const row = await db("child_rewards").where({ id: (id?.id ?? id) }).first();
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
