const express = require("express");
const router = express.Router();

let auth = (req, res, next) => next();
try {
  const mod = require("../middleware/auth");
  auth =
    (typeof mod === "function" && mod) ||
    (typeof mod?.auth === "function" && mod.auth) ||
    (typeof mod?.authenticate === "function" && mod.authenticate) ||
    (typeof mod?.default === "function" && mod.default) ||
    auth;
} catch (_) {}

router.use(auth);

const ctrl = require("../controllers/gameplayController");

// atribuições
router.post("/assign/:childId/:slug", ctrl.assign);
router.get("/assigned/:childId", ctrl.listAssigned);

// sessões de jogo
router.post("/session", ctrl.recordSession);

module.exports = router;
