const express = require("express");
const { getHome } = require("../controllers/home.controller");

const router = express.Router();

/** GET /api/home?page=1 */
router.get("/", getHome);

module.exports = router;
