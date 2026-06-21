const express = require("express");
const { getRelated } = require("../controllers/related.controller");

const router = express.Router();

/** GET /api/related?url=<parent-url> */
router.get("/", getRelated);

module.exports = router;
