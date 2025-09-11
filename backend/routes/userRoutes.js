const express = require("express");
const { createUser, getAllUsers } = require("../models/userModel");

const router = express.Router();

/** GET /api/users */
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers(req.db); // â¬…ï¸ passa o pool injetado
    res.json(users);
  } catch (err) {
    console.error("GET /api/users erro:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

/** POST /api/users */
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email e password sÃ£o obrigatÃ³rios" });
    }
    const newUser = await createUser(req.db, { name, email, password, role });
    res.status(201).json(newUser);
  } catch (err) {
    // trata UNIQUE(email)
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email jÃ¡ cadastrado" });
    }
    console.error("POST /api/users erro:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;

