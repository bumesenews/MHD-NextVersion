const cheerio = require("cheerio");
const { extractField } = require("../utils/extract-field");
const { mapJsonVideoItem } = require("../utils/extract-video");

/**
 * Generic HTML parser – reads item/title/img/url from config selectors.
 */
class ParserService {
    /**
     * Parse HTML list page into [{ title, img, url }].
     * @param {string} html
     * @param {object} config
     * @returns {Array<{ title: string, img: string|null, url: string }>}
     */
    parseHtmlList(html, config) {
        const $ = cheerio.load(html);
        const { selectors, baseUrl, itemFilter } = config;
        const items = [];
        const seen = new Set();

        $(selectors.item).each((_, el) => {
            const element = $(el);

            // For flat anchor lists (tags), href is on the item itself
            if (itemFilter && selectors.item.startsWith("a")) {
                const href = element.attr("href");
                if (!itemFilter(href) || seen.has(href)) return;
                seen.add(href);
            }

            const title = extractField($, element, selectors.title, baseUrl);
            const img = selectors.img
                ? extractField($, element, selectors.img, baseUrl)
                : null;
            const url = extractField($, element, selectors.url, baseUrl);

            if (title && url) {
                const key = url;
                if (seen.has(key)) return;
                seen.add(key);
                items.push({ title, img: img || null, url });
            }
        });

        return items;
    }

    /**
     * Parse JSON API page into [{ title, img, url }].
     * @param {object} json
     * @param {object} config
     * @param {string} [baseUrlOverride] origin from parent URL
     * @returns {Array<{ title: string, img: string|null, url: string }>}
     */
    parseJsonList(json, config, baseUrlOverride) {
        const { pagination, jsonMapping } = config;
        const baseUrl = baseUrlOverride || config.baseUrl;
        const rawItems = json[pagination.itemsField] || [];
        const items = [];

        for (const raw of rawItems) {
            const mapped = mapJsonVideoItem(raw, jsonMapping, baseUrl);
            if (mapped) items.push(mapped);
        }

        return items;
    }
}

module.exports = new ParserService();
