const express = require("express");
const router  = express.Router();

const ctrl = require("../controllers/reports.js");
const { requireAuth } = require("../middlewares/auth.js");
const { requireRole, authorizeChildAccess, populateChildId } = require("../middlewares/childAccess.js");

const ALLOWED = ["therapist","teacher","guardian","admin"];
const guards = [requireAuth, requireRole(ALLOWED), authorizeChildAccess, populateChildId];

router.get("/pdf/:childId",             guards, ctrl.pdf);
router.get("/progress/:childId",        guards, ctrl.progress);
router.get("/skills/:childId",          guards, ctrl.skills);
router.get("/time-spent/:childId",      guards, ctrl.timeSpent);
router.get("/recommendations/:childId", guards, ctrl.recommendations);

module.exports = router;