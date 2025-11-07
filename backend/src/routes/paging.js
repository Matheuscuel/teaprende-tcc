"use strict";
const express = require("express");
const router  = express.Router();
const { requireAuth } = require("../middlewares/auth.js");
function pgInt(v, d){ const n = parseInt(v||"",10); return Number.isFinite(n) ? n : d; }

router.get("/children-paged", requireAuth, async (req, res, next) => {
  const page = Math.max(1, pgInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(1, pgInt(req.query.limit, 10)));
  const offset = (page-1)*limit;
  try {
    const total = (await req.db.query("SELECT COUNT(*)::int AS c FROM children")).rows[0].c;
    const { rows } = await req.db.query("SELECT * FROM children ORDER BY id DESC LIMIT $1 OFFSET $2", [limit, offset]);
    res.json({ data: rows, total, page, pageSize: limit });
  } catch (e) { next(e); }
});

router.get("/games-paged", requireAuth, async (req, res, next) => {
  const page = Math.max(1, pgInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(1, pgInt(req.query.limit, 10)));
  const offset = (page-1)*limit;
  try {
    const total = (await req.db.query("SELECT COUNT(*)::int AS c FROM games")).rows[0].c;
    const { rows } = await req.db.query("SELECT * FROM games ORDER BY id DESC LIMIT $1 OFFSET $2", [limit, offset]);
    res.json({ data: rows, total, page, pageSize: limit });
  } catch (e) { next(e); }
});

module.exports = router;
