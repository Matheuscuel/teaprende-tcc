const express = require("express");
const router = express.Router();

// Middleware de autenticação que aceita demo-token
// O middleware principal já foi aplicado no server.js antes de montar este router
// Então aqui apenas garantimos que req.userId e req.userRole existam
const ensureAuth = (req, res, next) => {
  // Se já foi autenticado pelo middleware do server.js, apenas passa adiante
  if (req.userId && req.userRole) {
    return next();
  }
  // Caso contrário, tenta autenticação básica
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  
  if (token === 'demo-token') {
    req.userId = 999;
    req.userRole = 'admin';
    return next();
  }
  
  // Se não tem token, retorna erro (mas isso não deveria acontecer pois o middleware do server.js já bloqueia)
  return res.status(401).json({ error: true, message: "Token não fornecido" });
};

router.use(ensureAuth);

const ctrl = require("../controllers/rewardsController");

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

router.post("/award", ctrl.award);

module.exports = router;
