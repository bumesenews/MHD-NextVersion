const scraperService = require("../services/scraper.service");
const channelsConfig = require("../configs/channels.config");
const channelSectionConfig = require("../configs/channel-section.config");
const { validateScrapeUrl } = require("../utils/security");

async function getChannels(req, res, next) {
    try {
        const data = await scraperService.scrapeList(
            channelsConfig,
            req.query.page
        );
        res.json(data);
    } catch (error) {
        next(error);
    }
}

async function getChannelSection(req, res, next) {
    try {
        const { page } = req.query;
        const check = validateScrapeUrl(req.query.url);

        if (!check.valid) {
            return res.status(400).json({
                error: "Bad Request",
                message: check.error || "Query param 'url' (parent channel URL) is required.",
            });
        }

        const data = await scraperService.scrapeSection(
            channelSectionConfig,
            check.url,
            page
        );
        res.json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = { getChannels, getChannelSection };
