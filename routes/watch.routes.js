const express = require("express");
const { getWatch } = require("../controllers/watch.controller");

const router = express.Router();

/** GET /api/watch?url=<video-page-url> */
router.get("/", getWatch);

module.exports = router;
