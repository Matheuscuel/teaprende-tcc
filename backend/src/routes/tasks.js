const express = require("express");
const router = express.Router();

// tenta resolver o middleware de auth em diferentes formatos de export
let auth = (req, res, next) => next();
try {
  const mod = require("../middleware/auth");
  auth =
    (typeof mod === "function" && mod) ||
    (typeof mod?.auth === "function" && mod.auth) ||
    (typeof mod?.authenticate === "function" && mod.authenticate) ||
    (typeof mod?.default === "function" && mod.default) ||
    auth;
} catch (_) {
  // sem auth por enquanto (evita derrubar o servidor)
}

router.use(auth);

const ctrl = require("../controllers/tasksController");

router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

router.post("/:id/assign/:childId", ctrl.assign);
router.put("/:id/status", ctrl.setStatus);

module.exports = router;
