/**
 * Website 2 – Models index configuration (pornstars-index).
 */
module.exports = {
    name: "models",
    baseUrl: process.env.MODELS_BASE_URL || "https://www.xvideos.com",
    listPath: process.env.MODELS_LIST_PATH || "/pornstars-index",

    headers: {
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.xvideos.com/",
    },

    selectors: {
        item: ".thumb-block",
        title: {
            selector: ".profile-name a",
            attr: "text",
        },
        img: {
            fromScript: {
                imgRegex: '<img[^>]+src="([^"]+)"',
                dataVideosRegex: "data-videos='([^']+)'",
            },
        },
        url: {
            selector: ".profile-name a",
            attr: "href",
            absolute: true,
        },
    },

    pagination: {
        type: "pathSuffix",
        startPage: 1,
        buildPath: (listPath, page) => {
            if (page <= 1) return listPath;
            return `${listPath}/${page - 1}`;
        },
    },

    responseType: "html",
};
