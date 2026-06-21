const requestService = require("./request.service");
const cacheService = require("./cache.service");
const parserService = require("./parser.service");
const { extractRelatedFromHtml } = require("../utils/extract-video");
const { buildCacheKey } = require("../utils/cache-key");
const { parsePage } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * Generic configuration-driven scraper engine.
 * All list/section scraping flows through this service.
 */
class ScraperService {
    /**
     * Scrape a paginated index page (home, models, tags, channels).
     * @param {object} config
     * @param {number|string} page
     * @returns {Promise<Array<{ title, img, url }>>}
     */
    async scrapeList(config, page = 1) {
        const safePage = parsePage(page);
        const cacheKey = buildCacheKey(config.name, { page: safePage });

        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const targetUrl = this._buildListUrl(config, safePage);
        logger.info("Scraping list", { targetUrl, page: safePage });

        const { data } = await requestService.fetch(targetUrl, {
            headers: config.headers,
        });

        const items = parserService.parseHtmlList(data, config);
        cacheService.set(cacheKey, items);
        return items;
    }

    /**
     * Scrape a single section page from a parent URL sent by the Flutter app.
     * @param {object} config
     * @param {string} parentUrl
     * @param {number|string} page
     * @returns {Promise<Array<{ title, img, url }>>}
     */
    async scrapeSection(config, parentUrl, page = 1) {
        const safePage = parsePage(page);
        const cacheKey = buildCacheKey(config.name, {
            url: parentUrl,
            page: safePage,
        });

        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const parentParsed = new URL(parentUrl);
        const origin = parentParsed.origin;
        const sectionPath = config.parseParentUrl(parentUrl);
        const targetUrl = this._buildSectionUrl(config, sectionPath, safePage, origin);

        logger.info("Scraping section", {
            parentUrl,
            targetUrl,
            page: safePage,
        });

        let items;

        if (config.responseType === "json") {
            const { data } = await requestService.fetch(targetUrl, {
                headers: config.headers,
            });

            if (typeof data !== "object" || !Array.isArray(data?.[config.pagination.itemsField])) {
                throw new Error(
                    `Unexpected JSON response for ${config.name} page ${safePage}`
                );
            }

            items = parserService.parseJsonList(data, config, origin);
        } else {
            const { data } = await requestService.fetch(targetUrl, {
                headers: config.headers,
            });
            items = parserService.parseHtmlList(data, {
                ...config,
                baseUrl: origin,
            });
        }

        if (items.length > 0) {
            cacheService.set(cacheKey, items);
        }

        return items;
    }

    /**
     * Scrape related items from a parent URL (no pagination).
     * @param {object} config
     * @param {string} parentUrl
     * @returns {Promise<Array<{ title, img, url }>>}
     */
    async scrapeRelated(config, parentUrl) {
        const cacheKey = buildCacheKey(config.name, { url: parentUrl });

        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        const parentParsed = new URL(parentUrl);
        const origin = parentParsed.origin;
        const plan = config.resolveTarget(parentUrl);

        let items = [];

        for (const strategy of plan.strategies) {
            try {
                const { data } = await requestService.fetch(strategy.url, {
                    headers: {
                        ...config.headers,
                        Referer: plan.referer,
                    },
                });

                if (strategy.type === "html-script" && typeof data === "string") {
                    items = extractRelatedFromHtml(
                        data,
                        config.jsonMapping,
                        origin
                    );
                } else if (strategy.type === "json" && data && typeof data === "object") {
                    const field =
                        strategy.itemsField || config.pagination.itemsField;
                    const rawItems =
                        data[field] || data.related || data.data || [];

                    if (Array.isArray(rawItems) && rawItems.length) {
                        items = parserService.parseJsonList(
                            { [field]: rawItems },
                            config,
                            origin
                        );
                    }
                } else if (typeof data === "string") {
                    items = parserService.parseHtmlList(data, {
                        ...config,
                        baseUrl: origin,
                        containerSelector:
                            strategy.containerSelector !== undefined
                                ? strategy.containerSelector
                                : config.containerSelector,
                    });
                }

                if (items.length > 0) {
                    logger.info("Related scrape succeeded", {
                        parentUrl,
                        strategy: strategy.url,
                        count: items.length,
                    });
                    break;
                }
            } catch (error) {
                logger.warn("Related strategy failed", {
                    parentUrl,
                    strategy: strategy.url,
                    message: error.message,
                });
            }
        }

        if (items.length > 0) {
            cacheService.set(cacheKey, items);
        }

        return items;
    }

    /**
     * Build full URL for index/list endpoints.
     * @private
     */
    _buildListUrl(config, page) {
        const base = config.baseUrl.replace(/\/$/, "");
        const pagination = config.pagination || { type: "none" };

        if (pagination.type === "none") {
            return `${base}${config.listPath}`;
        }

        const path = pagination.buildPath(config.listPath, page);
        return `${base}${path}`;
    }

    /**
     * Build full URL for section endpoints.
     * @private
     */
    _buildSectionUrl(config, sectionPath, page, origin) {
        const base = (origin || config.baseUrl).replace(/\/$/, "");
        const pagination = config.pagination;

        if (pagination.type === "jsonApi") {
            const path = pagination.buildPath(
                sectionPath,
                page,
                pagination.sort
            );
            return `${base}${path}`;
        }

        const path = pagination.buildPath(sectionPath, page);
        return `${base}${path}`;
    }
}

module.exports = new ScraperService();
