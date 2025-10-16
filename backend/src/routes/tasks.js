const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/tasksController");

router.use(auth); // protege tudo

router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// relacionamentos
router.post("/:id/assign/:childId", ctrl.assign);
router.put("/:id/status", ctrl.setStatus);

module.exports = router;
