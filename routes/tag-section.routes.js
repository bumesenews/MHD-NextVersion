const express = require("express");
const { getTagSection } = require("../controllers/tags.controller");

const router = express.Router();

/** GET /api/tag-section?url=<parent-url>&page=1 */
router.get("/", getTagSection);

module.exports = router;
