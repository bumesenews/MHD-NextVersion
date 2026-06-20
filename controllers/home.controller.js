const scraperService = require("../services/scraper.service");
const homeConfig = require("../configs/home.config");

async function getHome(req, res, next) {
    try {
        const data = await scraperService.scrapeList(homeConfig, req.query.page);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = { getHome };
