/**
 * Website 3 – Tags index configuration.
 */
module.exports = {
    name: "tags",
    baseUrl: process.env.TAGS_BASE_URL || "https://www.xvideos.com",
    listPath: process.env.TAGS_LIST_PATH || "/tags",

    headers: {
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.xvideos.com/",
    },

    /** Tags are flat anchor links, not thumb cards */
    selectors: {
        item: "a[href^='/tags/']",
        title: {
            attr: "text",
            transform: (text) => text.replace(/\s[\d,]+$/, "").trim(),
        },
        img: null,
        url: {
            attr: "href",
            absolute: true,
        },
    },

    /** Filter out A–Z index links and the root /tags link */
    itemFilter: (href) => {
        if (!href || href === "/tags") return false;
        return !href.match(/^\/tags\/([a-z]|09)$/i);
    },

    pagination: {
        type: "none",
    },

    responseType: "html",
};
