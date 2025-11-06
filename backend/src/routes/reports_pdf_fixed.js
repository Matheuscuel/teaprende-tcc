const express = require(express);
const router = express.Router();
const { requireAuth } = require(../middlewares/auth);
const db = require(../database/db);
const PDFDocument = require(pdfkit);

// GET /api/reports/pdf-fixed/:childId?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get(/pdf-fixed/:childId, requireAuth, async (req, res) => {
  try {
    const childId = parseInt(req.params.childId, 10);
    const { from, to } = req.query || {};
    if (!Number.isInteger(childId)) {
      return res.status(400).json({ error: invalid