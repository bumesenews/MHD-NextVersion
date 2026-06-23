const express = require("express");
const { getMyanmar } = require("../controllers/myanmar.controller");

const router = express.Router();

/** GET /api/myanmar?page=1 */
router.get("/", getMyanmar);

module.exports = router;
