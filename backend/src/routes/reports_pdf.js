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

const ctrl = require("../controllers/reportsPdfController");
router.get("/pdf/:childId", ctrl.childReportPdf); // GET /api/reports/pdf/:childId?from=YYYY-MM-DD&to=YYYY-MM-DD

module.exports = router;
