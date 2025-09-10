const express = require("express");
const { login } = require("../src/controllers/authController");

const router = express.Router();

router.post("/auth/login", login);

module.exports = router;
