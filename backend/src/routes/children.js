const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth");
const ctrl = require("../controllers/childrenController");

// Protegido por JWT
router.get("/mine", requireAuth, ctrl.listMine);

module.exports = router;
