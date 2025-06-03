const express = require('express');
const { createUser, getAllUsers } = require('../models/userModel');

const router = express.Router();

// Rota GET - Listar usuários
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota POST - Criar novo usuário
router.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = await createUser(name, email, password);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
