const express = require("express");
const { getTags } = require("../controllers/tags.controller");

const router = express.Router();

/** GET /api/tags?page=1 */
router.get("/", getTags);

module.exports = router;
