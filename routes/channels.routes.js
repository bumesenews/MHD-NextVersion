const express = require("express");
const { getChannels } = require("../controllers/channels.controller");

const router = express.Router();

/** GET /api/channels?page=1 */
router.get("/", getChannels);

module.exports = router;
