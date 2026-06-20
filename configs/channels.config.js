/**
 * Website 4 – Channels index configuration.
 */
module.exports = {
    name: "channels",
    baseUrl: process.env.CHANNELS_BASE_URL || "https://www.xvideos.com",
    listPath: process.env.CHANNELS_LIST_PATH || "/channels-index",

    headers: {
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.xvideos.com/",
    },

    selectors: {
        item: ".thumb-block",
        title: {
            selector: ".profile-name",
            attr: "text",
        },
        img: {
            fromScript: {
                imgRegex: '<img[^>]+src="([^"]+)"',
                dataVideosRegex: "data-videos='([^']+)'",
            },
        },
        url: {
            selector: ".thumb a",
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
