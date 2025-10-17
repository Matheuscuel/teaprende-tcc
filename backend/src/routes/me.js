const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { requireAuth } = require("../middlewares/auth");

// perfil logado
router.get("/me", requireAuth, async (req, res) => {
  const u = await db("users").select("id","name","email","role").where({ id: req.user.sub }).first();
  res.json(u);
});

// crianças associadas ao usuário logado
router.get("/me/children", requireAuth, async (req, res) => {
  const rows = await db("children as c")
    .join("user_children as uc", "c.id", "uc.child_id")
    .where("uc.user_id", req.user.sub)
    .select("c.id","c.name","c.created_at");
  res.json(rows);
});

module.exports = router;
