const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/skillsController");

router.use(auth);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// por criança
router.get("/child/:childId", ctrl.listByChild);
router.put("/child/:childId/:skillId", ctrl.setLevel);

module.exports = router;
