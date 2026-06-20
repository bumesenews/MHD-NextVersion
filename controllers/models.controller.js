const scraperService = require("../services/scraper.service");
const modelsConfig = require("../configs/models.config");
const modelSectionConfig = require("../configs/model-section.config");
const { validateScrapeUrl } = require("../utils/security");

async function getModels(req, res, next) {
    try {
        const data = await scraperService.scrapeList(modelsConfig, req.query.page);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

async function getModelSection(req, res, next) {
    try {
        const { page } = req.query;
        const check = validateScrapeUrl(req.query.url);

        if (!check.valid) {
            return res.status(400).json({
                error: "Bad Request",
                message: check.error || "Query param 'url' (parent profile URL) is required.",
            });
        }

        const data = await scraperService.scrapeSection(
            modelSectionConfig,
            check.url,
            page
        );
        res.json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = { getModels, getModelSection };
