const { extractVideoEid } = require("../utils/helpers");

/**
 * Related videos configuration.
 * Profile/channel URLs: scrape page HTML.
 * Video URLs: use xvideos related JSON/HTML APIs (main page often has empty #related-videos).
 */
module.exports = {
    name: "related",
    baseUrl:
        process.env.RELATED_BASE_URL ||
        process.env.HOME_BASE_URL ||
        "https://www.xvideos.com",

    headers: {
        Accept:
            "application/json, text/javascript, */*; q=0.01, text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        Referer: process.env.RELATED_REFERER || "https://www.xvideos.com/",
    },

    selectors: {
        item: ".thumb-block",
        title: {
            selector: ".thumb-under .title a, .title a",
            attr: "text",
        },
        img: {
            selector: ".thumb img",
            attrs: ["data-src", "src"],
        },
        url: {
            selector: ".title a[href*='/video.'], a[href*='/video.']",
            attr: "href",
            absolute: true,
        },
    },

    jsonMapping: {
        title: "t",
        titleFallback: "tf",
        img: "i",
        imgFallback: "il",
        imgFallback2: "if",
        urlBuilder: "xvideos-json",
        urlIdField: "eid",
        urlPathField: "u",
    },

    pagination: {
        itemsField: "videos",
    },

    /**
     * Build fetch strategies for related content (tried in order).
     * @param {string} parentUrl
     */
    resolveTarget(parentUrl) {
        const parsed = new URL(parentUrl);
        const origin = parsed.origin;
        const eid = extractVideoEid(parentUrl);

        if (eid) {
            return {
                referer: parsed.href,
                strategies: [
                    {
                        type: "html-script",
                        url: parsed.href,
                    },
                    {
                        type: "json",
                        url: `${origin}/video-api/web/iid/${eid}/related?page=0`,
                        itemsField: "videos",
                    },
                    {
                        type: "json",
                        url: `${origin}/video-api/web/video/iid/${eid}/related?page=0`,
                        itemsField: "videos",
                    },
                    {
                        type: "html",
                        url: `${origin}/video.related/${eid}/0`,
                    },
                    {
                        type: "html",
                        url: parsed.href,
                        containerSelector:
                            "#related-videos, #video-related, .related-videos",
                    },
                ],
            };
        }

        return {
            referer: parsed.href,
            strategies: [
                {
                    type: "html",
                    url: parsed.href,
                    containerSelector: null,
                },
            ],
        };
    },

    responseType: "related",
};
