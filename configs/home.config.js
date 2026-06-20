/**
 * Website 1 – Home listing configuration (xvideos best page).
 * Change selectors here when the target site HTML changes.
 */
module.exports = {
    name: "home",
    baseUrl: process.env.HOME_BASE_URL || "https://www.xvideos.com",
    listPath: process.env.HOME_LIST_PATH || "/best/2026-05",

    headers: {
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    },

    /** How to locate each list item in the HTML */
    selectors: {
        item: ".thumb-block",
        title: {
            selector: ".thumb-under .title a",
            attr: "text",
        },
        img: {
            selector: ".thumb img",
            attrs: ["data-src", "src"],
        },
        url: {
            selector: ".title a[href*='/video.'], .thumb a.thumb-link",
            attr: "href",
            absolute: true,
        },
    },

    /** Pagination: page 1 = base path, page 2+ = /listPath/{page-1} */
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
