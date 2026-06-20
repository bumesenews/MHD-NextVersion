const express = require("express");
const { getModelSection } = require("../controllers/models.controller");

const router = express.Router();

/** GET /api/model-section?url=<parent-url>&page=1 */
router.get("/", getModelSection);

module.exports = router;
