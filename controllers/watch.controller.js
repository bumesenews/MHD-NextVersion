const watchService = require("../services/watch.service");
const watchConfig = require("../configs/watch.config");
const { validateScrapeUrl } = require("../utils/security");

async function getWatch(req, res, next) {
    try {
        const check = validateScrapeUrl(req.query.url);

        if (!check.valid) {
            return res.status(400).json({
                error: "Bad Request",
                message: check.error || "Query param 'url' (video page URL) is required.",
            });
        }

        const data = await watchService.extractStreams(watchConfig, check.url);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = { getWatch };
