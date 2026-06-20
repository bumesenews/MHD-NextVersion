const express = require("express");
const { getModels } = require("../controllers/models.controller");

const router = express.Router();

/** GET /api/models?page=1 */
router.get("/", getModels);

module.exports = router;
