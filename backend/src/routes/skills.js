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

const ctrl = require("../controllers/skillsController");

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

router.get("/child/:childId", ctrl.listByChild);
router.put("/child/:childId/:skillId", ctrl.setLevel);

module.exports = router;
