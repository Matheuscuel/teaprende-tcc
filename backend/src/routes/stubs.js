const express = require("express");
const router = express.Router();

// helper pra responder 200 sempre
const ok = (res, body = []) => res.status(200).json(body);

// ---- STUBS JÁ USADOS NA UI ----
router.get("/rewards",       (req,res) => ok(res, []));
router.get("/tasks",         (req,res) => ok(res, []));
router.get("/skills",        (req,res) => ok(res, []));
router.get("/skills/summary",(req,res) => ok(res, []));
// Lista básica de crianças (fallback quando rotas reais não estão disponíveis)
router.get("/children",      (req,res) => ok(res, []));

// Relatórios / filtros de período
router.get("/reports/progress", (req,res) => {
  const { childId, from, to } = req.query;
  return res.status(200).json({ childId, from, to, buckets: [] });
});
router.get("/reports/skills", (req,res) => {
  const { childId, from, to } = req.query;
  return res.status(200).json({ childId, from, to, skills: [] });
});
router.get("/reports/time", (req,res) => {
  const { childId, from, to } = req.query;
  return res.status(200).json({ childId, from, to, points: [] });
});
router.get("/reports/recommendations", (req,res) => ok(res, []));

// Série temporal (outras variações que a UI chama)
router.get("/usage/time", (req,res) => {
  const { childId, from, to } = req.query;
  return res.status(200).json({ childId, from, to, points: [] });
});
router.get("/time", (req,res) => {
  const { childId, from, to } = req.query;
  return res.status(200).json({ childId, from, to, points: [] });
});

// Health simples
router.get("/health", (req,res) => res.status(200).json({ status: "ok" }));

module.exports = router;
