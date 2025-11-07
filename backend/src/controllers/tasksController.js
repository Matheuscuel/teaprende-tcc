const db = require("../database/db");

exports.list = async (req, res) => {
  try {
    const rows = await db("tasks").select("*").where({ active: true }).orderBy("id", "desc");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const row = await db("tasks").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { title, type, difficulty = 1, payload_json = null, active = true } = req.body || {};
    if (!title || !type) return res.status(400).json({ error: "title and type are required" });
    const [id] = await db("tasks").insert({ title, type, difficulty, payload_json, active }).returning("id");
    const created = await db("tasks").where({ id: (id?.id ?? id) }).first();
    res.status(201).json(created);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const { title, type, difficulty, payload_json, active } = req.body || {};
    const count = await db("tasks").where({ id: req.params.id }).update({ title, type, difficulty, payload_json, active, updated_at: db.fn.now() });
    if (!count) return res.status(404).json({ error: "Task not found" });
    const updated = await db("tasks").where({ id: req.params.id }).first();
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    // soft delete
    const count = await db("tasks").where({ id: req.params.id }).update({ active: false, updated_at: db.fn.now() });
    if (!count) return res.status(404).json({ error: "Task not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Assign task to child
exports.assign = async (req, res) => {
  try {
    const { childId, id } = req.params; // id = taskId
    await db("child_tasks")
      .insert({ child_id: childId, task_id: id, status: "assigned" })
      .onConflict(["child_id","task_id"])
      .ignore();
    const row = await db("child_tasks").where({ child_id: childId, task_id: id }).first();
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Update status/score of a child task
exports.setStatus = async (req, res) => {
  try {
    const { id } = req.params; // taskId
    const { child_id, status, score = null, completed = false } = req.body || {};
    if (!child_id || !status) return res.status(400).json({ error: "child_id and status are required" });

    const payload = { status, score, updated_at: db.fn.now() };
    if (completed) payload.completed_at = db.fn.now();

    await db("child_tasks")
      .insert({ child_id, task_id: id, ...payload })
      .onConflict(["child_id","task_id"])
      .merge(payload);

    const row = await db("child_tasks").where({ child_id, task_id: id }).first();
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
