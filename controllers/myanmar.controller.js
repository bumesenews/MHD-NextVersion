const scraperService = require("../services/scraper.service");
const myanmarConfig = require("../configs/myanmar.config");

async function getMyanmar(req, res, next) {
    try {
        const data = await scraperService.scrapeList(
            myanmarConfig,
            req.query.page
        );
        res.json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = { getMyanmar };
