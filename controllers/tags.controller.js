const scraperService = require("../services/scraper.service");
const tagsConfig = require("../configs/tags.config");
const tagSectionConfig = require("../configs/tag-section.config");
const { validateScrapeUrl } = require("../utils/security");

async function getTags(req, res, next) {
    try {
        const data = await scraperService.scrapeList(tagsConfig, req.query.page);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

async function getTagSection(req, res, next) {
    try {
        const { page } = req.query;
        const check = validateScrapeUrl(req.query.url);

        if (!check.valid) {
            return res.status(400).json({
                error: "Bad Request",
                message: check.error || "Query param 'url' (parent tag URL) is required.",
            });
        }

        const data = await scraperService.scrapeSection(
            tagSectionConfig,
            check.url,
            page
        );
        res.json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = { getTags, getTagSection };
