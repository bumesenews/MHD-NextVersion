const scraperService = require("../services/scraper.service");
const relatedConfig = require("../configs/related.config");
const { validateScrapeUrl } = require("../utils/security");

async function getRelated(req, res, next) {
    try {
        const check = validateScrapeUrl(req.query.url);

        if (!check.valid) {
            return res.status(400).json({
                error: "Bad Request",
                message: check.error || "Query param 'url' (parent page URL) is required.",
            });
        }

        const data = await scraperService.scrapeRelated(relatedConfig, check.url);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = { getRelated };
