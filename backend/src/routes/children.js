const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/childrenController");

router.get("/mine", ctrl.listMine);

module.exports = router;
