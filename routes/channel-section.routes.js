const express = require("express");
const { getChannelSection } = require("../controllers/channels.controller");

const router = express.Router();

/** GET /api/channel-section?url=<parent-url>&page=1 */
router.get("/", getChannelSection);

module.exports = router;
